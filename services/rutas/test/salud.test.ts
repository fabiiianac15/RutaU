import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import { CLAVE_PRUEBA, crearRepositorioMemoria } from './repositorio-memoria.js'

const app = crearApp(crearRepositorioMemoria(), { claveInterna: CLAVE_PRUEBA })

describe('GET /salud', () => {
  it('responde que el servicio está activo', async () => {
    const res = await app.request('/salud')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ servicio: 'rutas', estado: 'ok' })
  })
})

describe('rutas desconocidas', () => {
  it('responde 404 en JSON', async () => {
    const res = await app.request('/no-existe')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Recurso no encontrado' })
  })
})
