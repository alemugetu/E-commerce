import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import ReactDOM from 'react-dom/client'
import ErrorBoundary from './components/common/ErrorBoundary.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
