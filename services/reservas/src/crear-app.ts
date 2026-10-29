import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import { RutasNoDisponible, type ClienteRutas } from './cliente-rutas.js'
import { endpointsSalud } from './endpoints/salud.js'

export interface Dependencias {
  rutas: ClienteRutas
}

export function crearApp({ rutas }: Dependencias) {
  const app = new Hono()

  const origenes = (process.env.ORIGENES_PERMITIDOS ?? '*').split(',').map((o) => o.trim())

  app.use(logger())
  app.use(cors({ origin: origenes.includes('*') ? '*' : origenes }))

  app.route('/salud', endpointsSalud(rutas))

  app.notFound((c) => c.json({ error: 'Recurso no encontrado' }, 404))

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status)
    }
    if (err instanceof RutasNoDisponible) {
      console.error(err.message)
      return c.json({ error: 'El servicio de Rutas no está disponible, intenta de nuevo en un momento' }, 502)
    }
    console.error(err)
    return c.json({ error: 'Error interno del servidor' }, 500)
  })

  return app
}
