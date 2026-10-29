import { crearApp } from './crear-app.js'
import { crearClienteRutas } from './cliente-rutas.js'

// Entrada del servicio. Vercel detecta este archivo y sirve la app exportada.
const variable = (nombre: string) => {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`)
  return valor
}

const rutas = crearClienteRutas({ url: variable('RUTAS_URL'), claveInterna: variable('CLAVE_INTERNA') })

export default crearApp({ rutas })
