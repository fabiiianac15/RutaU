import { Hono } from 'hono'
import type { ClienteRutas } from '../cliente-rutas.js'

// Además del estado propio, informa si Reservas puede hablar con Rutas,
// porque sin Rutas no se puede crear ni cancelar una reserva.
export function endpointsSalud(rutas: ClienteRutas) {
  const app = new Hono()

  app.get('/', async (c) => {
    const rutasDisponible = await rutas.disponible()
    return c.json(
      { servicio: 'reservas', estado: rutasDisponible ? 'ok' : 'degradado', dependencias: { rutas: rutasDisponible ? 'ok' : 'no-disponible' } },
      rutasDisponible ? 200 : 503,
    )
  })

  return app
}
