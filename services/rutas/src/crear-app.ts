import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import type { RepositorioRutas } from './modelo.js'
import { salud } from './endpoints/salud.js'
import { endpointsRutas } from './endpoints/rutas.js'
import { endpointsViajes } from './endpoints/viajes.js'

export interface OpcionesApp {
  // Clave que deben enviar los servicios internos para ocupar o liberar cupos.
  claveInterna: string
}

// La instancia de Hono se puede pasar desde index.ts, que Vercel exige que importe hono.
export function crearApp(repo: RepositorioRutas, { claveInterna }: OpcionesApp, app = new Hono()) {
  const origenes = (process.env.ORIGENES_PERMITIDOS ?? '*').split(',').map((o) => o.trim())

  app.use(logger())
  app.use(cors({ origin: origenes.includes('*') ? '*' : origenes }))

  app.route('/salud', salud)
  app.route('/rutas', endpointsRutas(repo))
  app.route('/viajes', endpointsViajes(repo, claveInterna))

  app.notFound((c) => c.json({ error: 'Recurso no encontrado' }, 404))

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ error: err.message }, err.status)
    }
    console.error(err)
    return c.json({ error: 'Error interno del servidor' }, 500)
  })

  return app
}
