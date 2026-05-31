import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Apply the persisted theme before first paint to avoid a flash of the wrong mode.
try {
    const stored = localStorage.getItem('theme-storage')
    if (stored && JSON.parse(stored)?.state?.theme === 'dark') {
        document.documentElement.classList.add('dark')
    }
} catch { /* ignore */ }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)