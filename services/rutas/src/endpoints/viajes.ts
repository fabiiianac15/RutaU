import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { RepositorioRutas } from '../modelo.js'

// La fecha por defecto es la de Colombia, no la del servidor (Vercel corre en UTC).
const hoyEnColombia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const consultaViajes = z.object({
  fecha: z.iso.date({ error: 'La fecha debe tener el formato AAAA-MM-DD' }).optional(),
})

const parametroId = z.object({
  id: z.coerce.number({ error: 'El id debe ser un número' }).int().positive(),
})

// Responde 400 con el primer mensaje de validación, en el mismo formato { error } del resto de la API.
const alFallar = (resultado: { success: boolean; error?: { issues: { message: string }[] } }) => {
  if (!resultado.success) {
    throw new HTTPException(400, { message: resultado.error?.issues[0]?.message ?? 'Solicitud inválida' })
  }
}

export function endpointsViajes(repo: RepositorioRutas) {
  const app = new Hono()

  app.get('/', zValidator('query', consultaViajes, alFallar), async (c) => {
    const { fecha = hoyEnColombia() } = c.req.valid('query')
    return c.json(await repo.listarViajes(fecha))
  })

  app.get('/:id', zValidator('param', parametroId, alFallar), async (c) => {
    const viaje = await repo.obtenerViaje(c.req.valid('param').id)
    if (!viaje) throw new HTTPException(404, { message: 'El viaje no existe' })
    return c.json(viaje)
  })

  return app
}
