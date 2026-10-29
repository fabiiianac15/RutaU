import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import { RutasNoDisponible } from '../src/cliente-rutas.js'
import { AHORA, crearRepositorioMemoria, crearRutasFalso } from './dobles.js'

function preparar() {
  const rutas = crearRutasFalso()
  const bd = crearRepositorioMemoria()
  const app = crearApp({ repo: bd.repo, rutas: rutas.cliente, ahora: () => AHORA })

  const reservar = (cuerpo: object) =>
    app.request('/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
  const cancelar = (id: string) => app.request(`/reservas/${id}`, { method: 'DELETE' })

  return { app, rutas, bd, reservar, cancelar }
}

const ana = { codigoEstudiante: '192345', nombre: 'Ana Pérez', viajeId: 3, paradaId: 1 }
const luis = { ...ana, codigoEstudiante: '192346', nombre: 'Luis Gómez' }
const marta = { ...ana, codigoEstudiante: '192347', nombre: 'Marta Ruiz' }

describe('POST /reservas', () => {
  it('ocupa el cupo en Rutas y guarda la reserva con el detalle del viaje', async () => {
    const { reservar, rutas, bd } = preparar()

    const res = await reservar(ana)

    expect(res.status).toBe(201)
    expect(await res.json()).toMatchObject({
      codigoEstudiante: '192345',
      nombre: 'Ana Pérez',
      estado: 'activa',
      viaje: { id: 3, ruta: { id: 1, nombre: 'Ruta Centro' }, fecha: '2026-10-29', horaSalida: '17:00' },
      parada: { id: 1, nombre: 'Parque 29 de Mayo' },
    })
    expect(rutas.llamadas).toEqual(['ocupar 3'])
    expect(rutas.cupos.get(3)?.ocupados).toBe(1)
    expect(bd.reservas).toHaveLength(1)
  })

  it('responde 409 y no guarda nada cuando el viaje está lleno', async () => {
    const { reservar, bd } = preparar()
    await reservar(ana)
    await reservar(luis)

    const res = await reservar(marta)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'El viaje ya no tiene cupos disponibles' })
    expect(bd.reservas).toHaveLength(2)
  })

  it('no deja reservar dos veces el mismo viaje y no toca los cupos', async () => {
    const { reservar, rutas } = preparar()
    await reservar(ana)

    const res = await reservar(ana)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'Ya tienes una reserva activa en este viaje' })
    expect(rutas.llamadas).toEqual(['ocupar 3'])
  })

  it('responde 404 si el viaje no existe en Rutas', async () => {
    const { reservar, rutas } = preparar()

    const res = await reservar({ ...ana, viajeId: 99 })

    expect(res.status).toBe(404)
    expect(rutas.llamadas).toEqual([])
  })

  it('rechaza una parada que no es de la ruta del viaje', async () => {
    const { reservar, rutas } = preparar()

    const res = await reservar({ ...ana, paradaId: 4 })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'La parada no pertenece a la ruta de este viaje' })
    expect(rutas.llamadas).toEqual([])
  })

  it('rechaza un viaje que ya salió', async () => {
    const { reservar } = preparar()

    const res = await reservar({ ...ana, viajeId: 1 })

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'Este viaje ya salió' })
  })

  it('libera el cupo si falla guardar la reserva', async () => {
    const { reservar, rutas, bd } = preparar()
    bd.fallas.alCrear = true

    const res = await reservar(ana)

    expect(res.status).toBe(500)
    expect(rutas.llamadas).toEqual(['ocupar 3', 'liberar 3'])
    expect(rutas.cupos.get(3)?.ocupados).toBe(0)
  })

  it('responde 502 si Rutas no está disponible', async () => {
    const { reservar, rutas, bd } = preparar()
    rutas.estado.caido = true

    const res = await reservar(ana)

    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'El servicio de Rutas no está disponible, intenta de nuevo en un momento' })
    expect(bd.reservas).toHaveLength(0)
  })

  it.each([
    [{ ...ana, codigoEstudiante: 'abc' }, 'El código estudiantil debe tener entre 4 y 12 dígitos'],
    [{ ...ana, nombre: '   ' }, 'El nombre es obligatorio'],
    [{ ...ana, viajeId: '3' }, 'viajeId debe ser un número'],
    [{ codigoEstudiante: '192345', nombre: 'Ana', viajeId: 3 }, 'paradaId debe ser un número'],
  ])('valida el cuerpo: %j', async (cuerpo, mensaje) => {
    const { reservar } = preparar()

    const res = await reservar(cuerpo)

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: mensaje })
  })
})

describe('GET /reservas?codigo=', () => {
  it('lista las reservas del estudiante con el detalle del viaje', async () => {
    const { app, reservar } = preparar()
    await reservar(ana)
    await reservar(luis)

    const res = await app.request('/reservas?codigo=192345')
    const reservas = await res.json()

    expect(res.status).toBe(200)
    expect(reservas).toHaveLength(1)
    expect(reservas[0]).toMatchObject({ nombre: 'Ana Pérez', viaje: { horaSalida: '17:00' }, parada: { nombre: 'Parque 29 de Mayo' } })
  })

  it('responde una lista vacía si el estudiante no tiene reservas', async () => {
    const res = await preparar().app.request('/reservas?codigo=999999')

    expect(await res.json()).toEqual([])
  })

  it('exige un código válido', async () => {
    const res = await preparar().app.request('/reservas')

    expect(res.status).toBe(400)
  })
})

describe('DELETE /reservas/:id', () => {
  it('cancela la reserva y devuelve el cupo a Rutas', async () => {
    const { reservar, cancelar, rutas } = preparar()
    const { id } = await (await reservar(ana)).json()

    const res = await cancelar(id)

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ id, estado: 'cancelada' })
    expect(rutas.llamadas).toEqual(['ocupar 3', 'liberar 3'])
    expect(rutas.cupos.get(3)?.ocupados).toBe(0)
  })

  it('permite volver a reservar después de cancelar', async () => {
    const { reservar, cancelar } = preparar()
    const { id } = await (await reservar(ana)).json()
    await cancelar(id)

    const res = await reservar(ana)

    expect(res.status).toBe(201)
  })

  it('responde 409 si la reserva ya estaba cancelada', async () => {
    const { reservar, cancelar, rutas } = preparar()
    const { id } = await (await reservar(ana)).json()
    await cancelar(id)

    const res = await cancelar(id)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'La reserva ya estaba cancelada' })
    expect(rutas.llamadas).toEqual(['ocupar 3', 'liberar 3'])
  })

  it('responde 404 si la reserva no existe', async () => {
    const res = await preparar().cancelar('7d4c2f4e-8c1a-4d3b-9e2f-1a2b3c4d5e6f')

    expect(res.status).toBe(404)
  })

  it('responde 400 si el id no es un UUID', async () => {
    const res = await preparar().cancelar('123')

    expect(res.status).toBe(400)
  })

  it('deja la reserva activa si Rutas no puede liberar el cupo', async () => {
    const { reservar, cancelar, rutas, bd } = preparar()
    const { id } = await (await reservar(ana)).json()
    rutas.cliente.liberarCupo = async () => {
      throw new RutasNoDisponible('fetch failed')
    }

    const res = await cancelar(id)

    expect(res.status).toBe(502)
    expect(bd.reservas[0]?.estado).toBe('activa')
    expect(bd.reservas[0]?.canceladoEn).toBeNull()
  })

  it('no deja cancelar un viaje que ya salió', async () => {
    const { cancelar, bd, rutas } = preparar()
    const reserva = await bd.repo.crear({ ...ana, viajeId: 1 })
    if (reserva === 'duplicada') throw new Error('no debería pasar')

    const res = await cancelar(reserva.id)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'No puedes cancelar un viaje que ya salió' })
    expect(rutas.llamadas).toEqual([])
  })
})
