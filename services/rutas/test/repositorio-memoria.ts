import type { RepositorioRutas, ResultadoCupo, Ruta, ViajeDetalle } from '../src/modelo.js'

export const CLAVE_PRUEBA = 'clave-de-prueba'

export const rutaCentro: Ruta = {
  id: 1,
  nombre: 'Ruta Centro',
  descripcion: 'Centro de Ocaña hacia la sede El Algodonal',
  paradas: [
    { id: 1, nombre: 'Parque 29 de Mayo', orden: 1, latitud: 8.235412, longitud: -73.353856 },
    { id: 2, nombre: 'Sede El Algodonal', orden: 2, latitud: 8.2352, longitud: -73.32209 },
  ],
  trazado: { type: 'LineString', coordinates: [[-73.35402, 8.23499], [-73.32209, 8.2352]] },
  distanciaM: 10741,
  duracionMin: 18,
}

export const viajeManana: ViajeDetalle = {
  id: 10,
  ruta: { id: 1, nombre: 'Ruta Centro' },
  bus: { placa: 'UFP-101', capacidad: 40 },
  fecha: '2026-10-29',
  horaSalida: '06:00',
  ocupados: 5,
  disponibles: 35,
  paradas: rutaCentro.paradas,
}

// Cada repositorio tiene su propia copia de los viajes, así una prueba que ocupa cupos no afecta a otra.
export function crearRepositorioMemoria(viajesIniciales: ViajeDetalle[] = [viajeManana]): RepositorioRutas {
  const rutas = [rutaCentro]
  const viajes = structuredClone(viajesIniciales)

  const moverCupo = (viajeId: number, delta: 1 | -1): ResultadoCupo => {
    const viaje = viajes.find((v) => v.id === viajeId)
    if (!viaje) return { estado: 'no-existe' }

    const ocupados = viaje.ocupados + delta
    if (ocupados < 0 || ocupados > viaje.bus.capacidad) return { estado: 'sin-cambio' }

    viaje.ocupados = ocupados
    viaje.disponibles = viaje.bus.capacidad - ocupados
    return { estado: 'ok', cupos: { id: viaje.id, ocupados, disponibles: viaje.disponibles } }
  }

  return {
    async listarRutas() {
      return rutas
    },
    async listarViajes(fecha) {
      return viajes.filter((v) => v.fecha === fecha).map(({ paradas, ...viaje }) => viaje)
    },
    async obtenerViaje(id) {
      return viajes.find((v) => v.id === id) ?? null
    },
    async ocuparCupo(viajeId) {
      return moverCupo(viajeId, 1)
    },
    async liberarCupo(viajeId) {
      return moverCupo(viajeId, -1)
    },
  }
}
