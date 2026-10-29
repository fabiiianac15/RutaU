import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './estilos.css'
import { Hoy } from './vistas/Hoy'

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <Hoy />
  </StrictMode>,
)
