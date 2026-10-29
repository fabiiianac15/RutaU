import { useCallback, useEffect, useState } from 'react'
import { api, ErrorApi } from '../api/cliente'
import type { Reserva, Ruta, Viaje } from '../api/tipos'

export type Carga<T> = { estado: 'cargando' } | { estado: 'listo'; datos: T } | { estado: 'error'; mensaje: string }

// Carga datos de una API. Al cambiar la clave (otro día, otro código) vuelve a "cargando";
// al recargar con la misma clave conserva los datos visibles hasta que llegan los nuevos.
function useCarga<T>(clave: string | null, cargar: () => Promise<T>) {
  const [resultado, setResultado] = useState<{ clave: string; carga: Carga<T> } | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (clave === null) return
    let vigente = true
    cargar()
      .then((datos) => vigente && setResultado({ clave, carga: { estado: 'listo', datos } }))
      .catch((e) => {
        const mensaje = e instanceof ErrorApi ? e.message : 'Algo salió mal. Intenta de nuevo.'
        if (vigente) setResultado({ clave, carga: { estado: 'error', mensaje } })
      })
    return () => {
      vigente = false
    }
    // cargar cambia en cada render; la clave y la versión son las que deciden cuándo recargar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const carga: Carga<T> = resultado && resultado.clave === clave ? resultado.carga : { estado: 'cargando' }
  return [carga, recargar] as const
}

export const useViajes = (fecha: string) => useCarga<Viaje[]>(`viajes:${fecha}`, () => api.viajes(fecha))

export const useRutas = () => useCarga<Ruta[]>('rutas', () => api.rutas())

export const useReservas = (codigo: string | null) =>
  useCarga<Reserva[]>(codigo && `reservas:${codigo}`, () => api.reservasDe(codigo!))

// Hora actual, refrescada cada 30 segundos para mover la línea de "ahora".
export function useAhora() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return ahora
}
