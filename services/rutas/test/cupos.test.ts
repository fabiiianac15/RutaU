import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import { CLAVE_PRUEBA, crearRepositorioMemoria, viajeManana } from './repositorio-memoria.js'

const busDeDosCupos = { ...viajeManana, bus: { placa: 'UFP-103', capacidad: 2 }, ocupados: 0, disponibles: 2 }

const nuevaApp = () => crearApp(crearRepositorioMemoria([busDeDosCupos]), { claveInterna: CLAVE_PRUEBA })

const post = (app: ReturnType<typeof nuevaApp>, ruta: string, clave = CLAVE_PRUEBA) =>
  app.request(ruta, { method: 'POST', headers: { Authorization: `Bearer ${clave}` } })

describe('POST /viajes/:id/ocupar', () => {
  it('ocupa un cupo y devuelve los cupos actualizados', async () => {
    const res = await post(nuevaApp(), '/viajes/10/ocupar')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 10, ocupados: 1, disponibles: 1 })
  })

  it('responde 409 cuando el bus ya está lleno', async () => {
    const app = nuevaApp()
    await post(app, '/viajes/10/ocupar')
    await post(app, '/viajes/10/ocupar')

    const res = await post(app, '/viajes/10/ocupar')

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'El viaje no tiene cupos disponibles' })
  })

  it('responde 404 si el viaje no existe', async () => {
    const res = await post(nuevaApp(), '/viajes/999/ocupar')

    expect(res.status).toBe(404)
  })
})

describe('POST /viajes/:id/liberar', () => {
  it('devuelve un cupo ocupado', async () => {
    const app = nuevaApp()
    await post(app, '/viajes/10/ocupar')

    const res = await post(app, '/viajes/10/liberar')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ id: 10, ocupados: 0, disponibles: 2 })
  })

  it('responde 409 si no hay cupos ocupados', async () => {
    const res = await post(nuevaApp(), '/viajes/10/liberar')

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'El viaje no tiene cupos ocupados' })
  })
})

describe('clave interna', () => {
  it('rechaza ocupar sin clave', async () => {
    const res = await nuevaApp().request('/viajes/10/ocupar', { method: 'POST' })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Este endpoint es solo para servicios internos' })
  })

  it('rechaza liberar con una clave equivocada', async () => {
    const res = await post(nuevaApp(), '/viajes/10/liberar', 'otra-clave')

    expect(res.status).toBe(401)
  })

  it('no cambia los cupos cuando rechaza la solicitud', async () => {
    const app = nuevaApp()
    await app.request('/viajes/10/ocupar', { method: 'POST' })

    const viaje = await (await app.request('/viajes/10')).json()

    expect(viaje.ocupados).toBe(0)
  })
})
