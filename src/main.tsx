import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// В продакшене HTML уже отрендерен при сборке (scripts/prerender.mjs) — гидрируем.
if (root.firstElementChild) {
  window.__GL_HYDRATING__ = true
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
