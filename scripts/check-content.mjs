// Перечисляет незаполненные плейсхолдеры {{...}} в src/content/*.ts и public/*.html.
// С флагом --strict завершает с ошибкой (используется в npm run build:release).
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const targets = [
  { dir: 'src/content', ext: '.ts', skip: ['placeholders.ts'] },
  { dir: 'public', ext: '.html', skip: [] },
]
const found = new Map()
for (const t of targets) {
  for (const f of await readdir(path.join(root, t.dir))) {
    if (!f.endsWith(t.ext) || t.skip.includes(f)) continue
    const lines = (await readFile(path.join(root, t.dir, f), 'utf8')).split('\n')
    lines.forEach((line, i) => {
      const trimmed = line.trim()
      if (t.ext === '.ts' && (trimmed.startsWith('*') || trimmed.startsWith('//'))) return
      for (const m of line.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)) {
        if (!found.has(m[1])) found.set(m[1], `${t.dir}/${f}:${i + 1}`)
      }
    })
  }
}
if (found.size === 0) {
  console.log('check:content — все плейсхолдеры заполнены')
} else {
  console.log(`check:content — не заполнено ${found.size}:`)
  for (const [k, where] of found) console.log(`  {{${k}}}  ${where}`)
  if (process.argv.includes('--strict')) process.exit(1)
}
