import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { delayedFetch } from './core/delayed-fetch'
import { createContainer } from './di/container'
import './styles/tokens.css'
import './styles/global.css'

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Root element #root not found')
}

const apiDelayMs = import.meta.env.DEV ? Number(import.meta.env.VITE_API_DELAY_MS ?? 0) : 0
const config = apiDelayMs > 0 ? { fetchFunction: delayedFetch(apiDelayMs) } : {}

createRoot(container).render(
  <StrictMode>
    <App container={createContainer(config)} />
  </StrictMode>,
)
