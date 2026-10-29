import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import { crearRepositorioMemoria, rutaCentro, viajeManana } from './repositorio-memoria.js'

const app = crearApp(crearRepositorioMemoria())

describe('GET /rutas', () => {
  it('lista las rutas con sus paradas', async () => {
    const res = await app.request('/rutas')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([rutaCentro])
  })
})

describe('GET /viajes', () => {
  it('lista los viajes de la fecha pedida sin las paradas', async () => {
    const res = await app.request('/viajes?fecha=2026-10-29')
    const { paradas, ...esperado } = viajeManana

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([esperado])
  })

  it('responde una lista vacía si no hay viajes ese día', async () => {
    const res = await app.request('/viajes?fecha=2030-01-01')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([])
  })

  it('rechaza una fecha mal escrita', async () => {
    const res = await app.request('/viajes?fecha=29-10-2026')

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'La fecha debe tener el formato AAAA-MM-DD' })
  })
})

describe('GET /viajes/:id', () => {
  it('devuelve el viaje con las paradas de su ruta', async () => {
    const res = await app.request('/viajes/10')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(viajeManana)
  })

  it('responde 404 si el viaje no existe', async () => {
    const res = await app.request('/viajes/999')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'El viaje no existe' })
  })

  it('responde 400 si el id no es un número', async () => {
    const res = await app.request('/viajes/abc')

    expect(res.status).toBe(400)
  })
})
