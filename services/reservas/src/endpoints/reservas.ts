import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { zValidator } from '@hono/zod-validator'
import type { ClienteRutas, ViajeRutas } from '../cliente-rutas.js'
import type { RepositorioReservas, Reserva } from '../modelo.js'
import { alFallar, consultaReservas, cuerpoReserva, parametroId } from '../validacion.js'

interface Dependencias {
  repo: RepositorioReservas
  rutas: ClienteRutas
  ahora: () => Date
}

// Colombia está en UTC-5 todo el año (no tiene horario de verano).
const yaSalio = (viaje: ViajeRutas, ahora: Date) =>
  Date.parse(`${viaje.fecha}T${viaje.horaSalida}:00-05:00`) <= ahora.getTime()

// La reserva junto con los datos del viaje y la parada que el frontend necesita mostrar.
// viaje y parada quedan en null si Rutas ya no tiene ese viaje.
const conDetalle = (reserva: Reserva, viaje: ViajeRutas | null) => ({
  ...reserva,
  viaje: viaje && { id: viaje.id, ruta: viaje.ruta, fecha: viaje.fecha, horaSalida: viaje.horaSalida },
  parada: viaje?.paradas.find((p) => p.id === reserva.paradaId) ?? null,
})

const conflicto = (mensaje: string) => new HTTPException(409, { message: mensaje })

export function endpointsReservas({ repo, rutas, ahora }: Dependencias) {
  const app = new Hono()

  // Crear: validar con Rutas → ocupar el cupo en Rutas → guardar la reserva.
  // Si guardar falla después de ocupar, se libera el cupo (compensación) para no dejarlo sin dueño.
  app.post('/', zValidator('json', cuerpoReserva, alFallar), async (c) => {
    const datos = c.req.valid('json')

    const viaje = await rutas.obtenerViaje(datos.viajeId)
    if (!viaje) throw new HTTPException(404, { message: 'El viaje no existe' })
    if (!viaje.paradas.some((p) => p.id === datos.paradaId)) {
      throw new HTTPException(400, { message: 'La parada no pertenece a la ruta de este viaje' })
    }
    if (yaSalio(viaje, ahora())) throw conflicto('Este viaje ya salió')

    // Evita ocupar y liberar un cupo en el caso común; el índice único cubre las carreras.
    if (await repo.tieneActiva(datos.codigoEstudiante, datos.viajeId)) {
      throw conflicto('Ya tienes una reserva activa en este viaje')
    }

    const cupo = await rutas.ocuparCupo(datos.viajeId)
    if (cupo === 'lleno') throw conflicto('El viaje ya no tiene cupos disponibles')
    if (cupo === 'no-existe') throw new HTTPException(404, { message: 'El viaje no existe' })

    let reserva: Reserva | 'duplicada'
    try {
      reserva = await repo.crear(datos)
    } catch (err) {
      await liberarSinFallar(rutas, datos.viajeId)
      throw err
    }
    if (reserva === 'duplicada') {
      await liberarSinFallar(rutas, datos.viajeId)
      throw conflicto('Ya tienes una reserva activa en este viaje')
    }

    return c.json(conDetalle(reserva, { ...viaje, disponibles: viaje.disponibles - 1 }), 201)
  })

  app.get('/', zValidator('query', consultaReservas, alFallar), async (c) => {
    const reservas = await repo.listarPorCodigo(c.req.valid('query').codigo)

    // Una consulta a Rutas por viaje distinto, no por reserva.
    const ids = [...new Set(reservas.map((r) => r.viajeId))]
    const viajes = new Map(await Promise.all(ids.map(async (id) => [id, await rutas.obtenerViaje(id)] as const)))

    return c.json(reservas.map((r) => conDetalle(r, viajes.get(r.viajeId) ?? null)))
  })

  // Cancelar: marcar la reserva como cancelada → liberar el cupo en Rutas.
  // Si Rutas no responde, se deshace la cancelación para que reserva y cupo sigan de acuerdo.
  app.delete('/:id', zValidator('param', parametroId, alFallar), async (c) => {
    const { id } = c.req.valid('param')

    const actual = await repo.obtener(id)
    if (!actual) throw new HTTPException(404, { message: 'La reserva no existe' })
    if (actual.estado === 'cancelada') throw conflicto('La reserva ya estaba cancelada')

    const viaje = await rutas.obtenerViaje(actual.viajeId)
    if (viaje && yaSalio(viaje, ahora())) throw conflicto('No puedes cancelar un viaje que ya salió')

    const cancelada = await repo.cancelar(id)
    if (!cancelada) throw conflicto('La reserva ya estaba cancelada')

    try {
      const resultado = await rutas.liberarCupo(actual.viajeId)
      if (resultado !== 'ok') console.warn(`Rutas respondió "${resultado}" al liberar el cupo de la reserva ${id}`)
    } catch (err) {
      await repo.reactivar(id)
      throw err
    }

    return c.json(conDetalle(cancelada, viaje))
  })

  return app
}

// La compensación no debe tapar el error original: si Rutas tampoco responde aquí,
// se registra para revisarlo a mano.
async function liberarSinFallar(rutas: ClienteRutas, viajeId: number) {
  try {
    await rutas.liberarCupo(viajeId)
  } catch (err) {
    console.error(`No se pudo liberar el cupo del viaje ${viajeId} tras un error al guardar la reserva`, err)
  }
}
