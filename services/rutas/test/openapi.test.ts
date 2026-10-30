import { describe, expect, it } from 'vitest'
import { crearApp } from '../src/crear-app.js'
import { documentoOpenApi } from '../src/openapi.js'
import { CLAVE_PRUEBA, crearRepositorioMemoria } from './repositorio-memoria.js'

const app = crearApp(crearRepositorioMemoria(), { claveInterna: CLAVE_PRUEBA })

// Rutas reales de la app, en formato OpenAPI (/viajes/:id → /viajes/{id}), sin middlewares ni la documentación misma.
const endpoints = app.routes
  .filter((r) => r.method !== 'ALL' && !r.path.startsWith('/docs') && r.path !== '/')
  .map((r) => `${r.method.toLowerCase()} ${r.path.replace(/:(\w+)/g, '{$1}').replace(/(.)\/$/, '$1')}`)

const documentados = Object.entries(documentoOpenApi.paths).flatMap(([ruta, metodos]) =>
  Object.keys(metodos).map((m) => `${m} ${ruta}`),
)

describe('documentación OpenAPI', () => {
  it('documenta cada endpoint de la app y nada más', () => {
    expect([...new Set(endpoints)].sort()).toEqual(documentados.sort())
  })

  it('se sirve en /docs/openapi.json', async () => {
    const res = await app.request('/docs/openapi.json')

    expect(res.status).toBe(200)
    expect((await res.json()).info.title).toBe('RutaU · Servicio de Rutas y Viajes')
  })

  it('muestra la referencia interactiva en /docs', async () => {
    const res = await app.request('/docs')

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('RutaU · Servicio de Rutas y Viajes')
  })

  it('redirige la raíz a la documentación', async () => {
    const res = await app.request('/')

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/docs')
  })
})
