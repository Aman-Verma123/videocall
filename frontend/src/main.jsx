import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

import process from "process"
import { Buffer } from "buffer"

window.global = window;
window.process = process;
window.Buffer = Buffer;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)