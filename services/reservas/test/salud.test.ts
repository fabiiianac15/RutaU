import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import type { ClienteRutas } from '../src/cliente-rutas.js'

const clienteRutas = (disponible: boolean): ClienteRutas => ({
  disponible: async () => disponible,
  obtenerViaje: async () => null,
  ocuparCupo: async () => 'ok',
  liberarCupo: async () => 'ok',
})

describe('GET /salud', () => {
  it('responde ok cuando Rutas está disponible', async () => {
    const res = await crearApp({ rutas: clienteRutas(true) }).request('/salud')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ servicio: 'reservas', estado: 'ok', dependencias: { rutas: 'ok' } })
  })

  it('responde 503 cuando Rutas no está disponible', async () => {
    const res = await crearApp({ rutas: clienteRutas(false) }).request('/salud')

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ servicio: 'reservas', estado: 'degradado', dependencias: { rutas: 'no-disponible' } })
  })
})

describe('rutas desconocidas', () => {
  it('responde 404 en JSON', async () => {
    const res = await crearApp({ rutas: clienteRutas(true) }).request('/no-existe')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Recurso no encontrado' })
  })
})
