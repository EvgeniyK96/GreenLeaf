import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

/** Пререндер первого экрана и всего контента в HTML при сборке: текст виден до загрузки JS. */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
