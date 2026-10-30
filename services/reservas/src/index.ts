import { Hono } from 'hono'
import { crearApp } from './crear-app.js'
import { crearClienteRutas } from './cliente-rutas.js'
import { crearRepositorioPostgres } from './repositorio-postgres.js'

const variable = (nombre: string) => {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`)
  return valor
}

const repo = crearRepositorioPostgres(variable('DATABASE_URL'))
const rutas = crearClienteRutas({ url: variable('RUTAS_URL'), claveInterna: variable('CLAVE_INTERNA') })

// Entrada del servicio. Vercel busca la app en este archivo y exige que importe hono directamente.
export default crearApp({ repo, rutas }, new Hono())
