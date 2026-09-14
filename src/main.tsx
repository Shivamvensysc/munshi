import './polyfills'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AppToaster from './components/ui/AppToaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <AppToaster />
    </BrowserRouter>
  </StrictMode>,
)
