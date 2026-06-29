import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/space-grotesk' // kendi-barındıran (offline) değişken font
import '@fontsource/tulpen-one' // marka başlığı (WITB?) — Tulpen One, offline/bundled
import { App } from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
