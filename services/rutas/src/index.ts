import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { salud } from './endpoints/salud.js'

// Entrada del servicio. Vercel detecta este archivo y sirve la app exportada.
const app = new Hono()

const origenes = (process.env.ORIGENES_PERMITIDOS ?? '*').split(',').map((o) => o.trim())

app.use(logger())
app.use(cors({ origin: origenes.includes('*') ? '*' : origenes }))

app.route('/salud', salud)

app.notFound((c) => c.json({ error: 'Recurso no encontrado' }, 404))

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status)
  }
  console.error(err)
  return c.json({ error: 'Error interno del servidor' }, 500)
})

export default app
