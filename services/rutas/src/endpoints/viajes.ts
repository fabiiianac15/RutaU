import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'
import type { RepositorioRutas, ResultadoCupo } from '../modelo.js'
import { exigirClaveInterna } from '../clave-interna.js'
import { alFallar, consultaViajes, parametroId } from '../validacion.js'

// La fecha por defecto es la de Colombia, no la del servidor (Vercel corre en UTC).
const hoyEnColombia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const responderCupo = (resultado: ResultadoCupo, mensajeSinCambio: string) => {
  if (resultado.estado === 'no-existe') throw new HTTPException(404, { message: 'El viaje no existe' })
  if (resultado.estado === 'sin-cambio') throw new HTTPException(409, { message: mensajeSinCambio })
  return resultado.cupos
}

export function endpointsViajes(repo: RepositorioRutas, claveInterna: string) {
  const app = new Hono()
  const soloServicios = exigirClaveInterna(claveInterna)

  app.get('/', zValidator('query', consultaViajes, alFallar), async (c) => {
    const { fecha = hoyEnColombia() } = c.req.valid('query')
    return c.json(await repo.listarViajes(fecha))
  })

  app.get('/:id', zValidator('param', parametroId, alFallar), async (c) => {
    const viaje = await repo.obtenerViaje(c.req.valid('param').id)
    if (!viaje) throw new HTTPException(404, { message: 'El viaje no existe' })
    return c.json(viaje)
  })

  app.post('/:id/ocupar', soloServicios, zValidator('param', parametroId, alFallar), async (c) => {
    const resultado = await repo.ocuparCupo(c.req.valid('param').id)
    return c.json(responderCupo(resultado, 'El viaje no tiene cupos disponibles'))
  })

  app.post('/:id/liberar', soloServicios, zValidator('param', parametroId, alFallar), async (c) => {
    const resultado = await repo.liberarCupo(c.req.valid('param').id)
    return c.json(responderCupo(resultado, 'El viaje no tiene cupos ocupados'))
  })

  return app
}
