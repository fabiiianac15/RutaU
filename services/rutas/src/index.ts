import { crearApp } from './crear-app.js'
import { crearRepositorioPostgres } from './repositorio-postgres.js'

// Entrada del servicio. Vercel detecta este archivo y sirve la app exportada.
const url = process.env.DATABASE_URL
if (!url) throw new Error('Falta la variable de entorno DATABASE_URL')

export default crearApp(crearRepositorioPostgres(url))
