// Пререндер: подставляет HTML приложения в dist/index.html (контент виден до JS, лучше LCP/SEO).
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const html = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!html.includes('<!--app-html-->')) throw new Error('В dist/index.html нет маркера <!--app-html-->')
let out = html.replace('<!--app-html-->', render())

// Скрипт приложения запускается после первого кадра: текст первого экрана рисуется из HTML,
// гидрация не задерживает FCP/LCP. Файл уже скачивается заранее через modulepreload.
const tag = out.match(/<script type="module" crossorigin src="([^"]+)"><\/script>/)
if (!tag) throw new Error('Не найден тег модульного скрипта в dist/index.html')
out = out
  .replace(tag[0], `<link rel="modulepreload" crossorigin href="${tag[1]}">`)
  .replace(
    '</body>',
    `<script>requestAnimationFrame(function(){setTimeout(function(){var s=document.createElement('script');s.type='module';s.crossOrigin='';s.src='${tag[1]}';document.body.appendChild(s)},0)})</script>\n  </body>`,
  )
await writeFile(path.join(dist, 'index.html'), out)
await rm(ssrDir, { recursive: true, force: true })
console.log(`prerender: dist/index.html — ${(out.length / 1024).toFixed(1)} КБ HTML`)
