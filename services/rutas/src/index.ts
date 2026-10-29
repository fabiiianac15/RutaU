import { crearApp } from './crear-app.js'
import { crearRepositorioPostgres } from './repositorio-postgres.js'

// Entrada del servicio. Vercel detecta este archivo y sirve la app exportada.
const variable = (nombre: string) => {
  const valor = process.env[nombre]
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`)
  return valor
}

const repo = crearRepositorioPostgres(variable('DATABASE_URL'))

export default crearApp(repo, { claveInterna: variable('CLAVE_INTERNA') })
