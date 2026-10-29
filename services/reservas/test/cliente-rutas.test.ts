import { describe, expect, it } from 'vitest'
import { crearClienteRutas, RutasNoDisponible } from '../src/cliente-rutas.js'

interface Llamada {
  url: string
  method: string
  authorization: string | null
}

// fetch falso: registra cada llamada y responde con el estado indicado.
function fetchFalso(status: number, cuerpo: unknown = {}) {
  const llamadas: Llamada[] = []
  const fn = (async (url: string, init: RequestInit = {}) => {
    llamadas.push({
      url,
      method: init.method ?? 'GET',
      authorization: new Headers(init.headers).get('Authorization'),
    })
    return new Response(JSON.stringify(cuerpo), { status })
  }) as typeof fetch
  return { fn, llamadas }
}

const cliente = (fetch: typeof globalThis.fetch) =>
  crearClienteRutas({ url: 'http://rutas.test/', claveInterna: 'secreta', fetch })

describe('obtenerViaje', () => {
  it('pide el viaje a Rutas y devuelve su cuerpo', async () => {
    const viaje = { id: 3, paradas: [] }
    const { fn, llamadas } = fetchFalso(200, viaje)

    expect(await cliente(fn).obtenerViaje(3)).toEqual(viaje)
    expect(llamadas).toEqual([{ url: 'http://rutas.test/viajes/3', method: 'GET', authorization: null }])
  })

  it('devuelve null si Rutas responde 404', async () => {
    expect(await cliente(fetchFalso(404).fn).obtenerViaje(3)).toBeNull()
  })

  it('lanza RutasNoDisponible si Rutas falla', async () => {
    await expect(cliente(fetchFalso(500).fn).obtenerViaje(3)).rejects.toThrow(RutasNoDisponible)
  })
})

describe('ocuparCupo', () => {
  it('envía la clave interna', async () => {
    const { fn, llamadas } = fetchFalso(200)

    expect(await cliente(fn).ocuparCupo(3)).toBe('ok')
    expect(llamadas).toEqual([{ url: 'http://rutas.test/viajes/3/ocupar', method: 'POST', authorization: 'Bearer secreta' }])
  })

  it('traduce 409 a "lleno" y 404 a "no-existe"', async () => {
    expect(await cliente(fetchFalso(409).fn).ocuparCupo(3)).toBe('lleno')
    expect(await cliente(fetchFalso(404).fn).ocuparCupo(3)).toBe('no-existe')
  })

  it('lanza RutasNoDisponible si la clave interna es rechazada', async () => {
    await expect(cliente(fetchFalso(401).fn).ocuparCupo(3)).rejects.toThrow('respondió 401 en /viajes/3/ocupar')
  })
})

describe('liberarCupo', () => {
  it('traduce las respuestas de Rutas', async () => {
    expect(await cliente(fetchFalso(200).fn).liberarCupo(3)).toBe('ok')
    expect(await cliente(fetchFalso(409).fn).liberarCupo(3)).toBe('sin-ocupados')
    expect(await cliente(fetchFalso(404).fn).liberarCupo(3)).toBe('no-existe')
  })
})

describe('cuando Rutas no responde', () => {
  const caido = (async () => {
    throw new TypeError('fetch failed')
  }) as typeof fetch

  it('lanza RutasNoDisponible', async () => {
    await expect(cliente(caido).ocuparCupo(3)).rejects.toThrow(RutasNoDisponible)
  })

  it('disponible() devuelve false sin lanzar', async () => {
    expect(await cliente(caido).disponible()).toBe(false)
  })

  it('corta la solicitud cuando pasa el tiempo límite', async () => {
    const lento = ((_url: string, init: RequestInit) =>
      new Promise((_, rechazar) => init.signal?.addEventListener('abort', () => rechazar(init.signal?.reason)))) as typeof fetch

    const rapido = crearClienteRutas({ url: 'http://rutas.test', claveInterna: 'secreta', timeoutMs: 20, fetch: lento })

    await expect(rapido.obtenerViaje(3)).rejects.toThrow(RutasNoDisponible)
  })
})
