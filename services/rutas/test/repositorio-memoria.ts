import type { RepositorioRutas, Ruta, ViajeDetalle } from '../src/modelo.js'

export const rutaCentro: Ruta = {
  id: 1,
  nombre: 'Ruta Centro',
  descripcion: 'Centro de Ocaña hacia la sede El Algodonal',
  paradas: [
    { id: 1, nombre: 'Parque 29 de Mayo', orden: 1 },
    { id: 2, nombre: 'Sede El Algodonal', orden: 2 },
  ],
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

export function crearRepositorioMemoria(): RepositorioRutas {
  const rutas = [rutaCentro]
  const viajes = [viajeManana]

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
  }
}
