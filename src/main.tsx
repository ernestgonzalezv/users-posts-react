import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { createContainer } from './di/container'
import './styles/tokens.css'
import './styles/global.css'

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Root element #root not found')
}

createRoot(container).render(
  <StrictMode>
    <App container={createContainer()} />
  </StrictMode>,
)
