import { serve } from '@hono/node-server'
import app from './index.js'

// Servidor para desarrollo local. En Vercel no se usa.
const port = Number(process.env.PORT ?? 3002)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Servicio de Reservas en http://localhost:${port}`)
})
