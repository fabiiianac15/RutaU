// Cliente HTTP del Servicio de Rutas y Viajes. Es la única forma en que Reservas
// conoce los viajes y los cupos: nunca lee las tablas del esquema rutas.

export interface ParadaRutas {
  id: number
  nombre: string
  orden: number
}

export interface ViajeRutas {
  id: number
  ruta: { id: number; nombre: string }
  fecha: string
  horaSalida: string
  disponibles: number
  paradas: ParadaRutas[]
}

export type ResultadoOcupar = 'ok' | 'lleno' | 'no-existe'
export type ResultadoLiberar = 'ok' | 'sin-ocupados' | 'no-existe'

export interface ClienteRutas {
  disponible(): Promise<boolean>
  obtenerViaje(id: number): Promise<ViajeRutas | null>
  ocuparCupo(viajeId: number): Promise<ResultadoOcupar>
  liberarCupo(viajeId: number): Promise<ResultadoLiberar>
}

// Rutas no respondió, tardó demasiado o respondió algo inesperado.
export class RutasNoDisponible extends Error {
  constructor(detalle: string) {
    super(`El servicio de Rutas no está disponible: ${detalle}`)
    this.name = 'RutasNoDisponible'
  }
}

interface OpcionesCliente {
  url: string
  claveInterna: string
  timeoutMs?: number
  fetch?: typeof fetch
}

export function crearClienteRutas({ url, claveInterna, timeoutMs = 5000, fetch: fetchFn = fetch }: OpcionesCliente): ClienteRutas {
  const base = url.replace(/\/+$/, '')

  const pedir = async (ruta: string, init: RequestInit = {}) => {
    try {
      return await fetchFn(`${base}${ruta}`, { ...init, signal: AbortSignal.timeout(timeoutMs) })
    } catch (err) {
      throw new RutasNoDisponible(err instanceof Error ? err.message : String(err))
    }
  }

  const postInterno = (ruta: string) =>
    pedir(ruta, { method: 'POST', headers: { Authorization: `Bearer ${claveInterna}` } })

  const inesperada = (res: Response, ruta: string) => new RutasNoDisponible(`respondió ${res.status} en ${ruta}`)

  return {
    async disponible() {
      try {
        return (await pedir('/salud')).ok
      } catch {
        return false
      }
    },

    async obtenerViaje(id) {
      const ruta = `/viajes/${id}`
      const res = await pedir(ruta)
      if (res.status === 404) return null
      if (!res.ok) throw inesperada(res, ruta)
      return (await res.json()) as ViajeRutas
    },

    async ocuparCupo(viajeId) {
      const ruta = `/viajes/${viajeId}/ocupar`
      const res = await postInterno(ruta)
      if (res.ok) return 'ok'
      if (res.status === 409) return 'lleno'
      if (res.status === 404) return 'no-existe'
      throw inesperada(res, ruta)
    },

    async liberarCupo(viajeId) {
      const ruta = `/viajes/${viajeId}/liberar`
      const res = await postInterno(ruta)
      if (res.ok) return 'ok'
      if (res.status === 409) return 'sin-ocupados'
      if (res.status === 404) return 'no-existe'
      throw inesperada(res, ruta)
    },
  }
}
