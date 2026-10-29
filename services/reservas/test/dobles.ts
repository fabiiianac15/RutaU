import { randomUUID } from 'node:crypto'
import { RutasNoDisponible, type ClienteRutas, type ViajeRutas } from '../src/cliente-rutas.js'
import type { RepositorioReservas, Reserva } from '../src/modelo.js'

// 29 de octubre de 2026, 10:00 a. m. en Colombia.
export const AHORA = new Date('2026-10-29T10:00:00-05:00')

export const viajeTarde: ViajeRutas = {
  id: 3,
  ruta: { id: 1, nombre: 'Ruta Centro' },
  fecha: '2026-10-29',
  horaSalida: '17:00',
  disponibles: 2,
  paradas: [
    { id: 1, nombre: 'Parque 29 de Mayo', orden: 1 },
    { id: 3, nombre: 'Sede El Algodonal', orden: 2 },
  ],
}

export const viajeQueYaSalio: ViajeRutas = { ...viajeTarde, id: 1, horaSalida: '06:00' }

// Servicio de Rutas falso: guarda los cupos en memoria y registra cada llamada.
export function crearRutasFalso(viajes: ViajeRutas[] = [viajeTarde, viajeQueYaSalio]) {
  const cupos = new Map(viajes.map((v) => [v.id, { ocupados: 0, capacidad: v.disponibles }]))
  const llamadas: string[] = []
  const estado = { caido: false }

  const siEstaArriba = () => {
    if (estado.caido) throw new RutasNoDisponible('fetch failed')
  }

  const cliente: ClienteRutas = {
    async disponible() {
      return !estado.caido
    },
    async obtenerViaje(id) {
      siEstaArriba()
      const viaje = viajes.find((v) => v.id === id)
      const c = cupos.get(id)
      return viaje && c ? { ...viaje, disponibles: c.capacidad - c.ocupados } : null
    },
    async ocuparCupo(id) {
      llamadas.push(`ocupar ${id}`)
      siEstaArriba()
      const c = cupos.get(id)
      if (!c) return 'no-existe'
      if (c.ocupados >= c.capacidad) return 'lleno'
      c.ocupados++
      return 'ok'
    },
    async liberarCupo(id) {
      llamadas.push(`liberar ${id}`)
      siEstaArriba()
      const c = cupos.get(id)
      if (!c) return 'no-existe'
      if (c.ocupados === 0) return 'sin-ocupados'
      c.ocupados--
      return 'ok'
    },
  }

  return { cliente, cupos, llamadas, estado }
}

export function crearRepositorioMemoria() {
  const reservas: Reserva[] = []
  const fallas = { alCrear: false }

  const repo: RepositorioReservas = {
    async crear(datos) {
      if (fallas.alCrear) throw new Error('la base de datos no responde')
      const duplicada = reservas.some(
        (r) => r.codigoEstudiante === datos.codigoEstudiante && r.viajeId === datos.viajeId && r.estado === 'activa',
      )
      if (duplicada) return 'duplicada'
      const reserva: Reserva = { id: randomUUID(), ...datos, estado: 'activa', creadoEn: new Date().toISOString(), canceladoEn: null }
      reservas.push(reserva)
      return { ...reserva }
    },
    async obtener(id) {
      const r = reservas.find((r) => r.id === id)
      return r ? { ...r } : null
    },
    async tieneActiva(codigo, viajeId) {
      return reservas.some((r) => r.codigoEstudiante === codigo && r.viajeId === viajeId && r.estado === 'activa')
    },
    async listarPorCodigo(codigo) {
      return reservas.filter((r) => r.codigoEstudiante === codigo).map((r) => ({ ...r }))
    },
    async cancelar(id) {
      const r = reservas.find((r) => r.id === id && r.estado === 'activa')
      if (!r) return null
      r.estado = 'cancelada'
      r.canceladoEn = new Date().toISOString()
      return { ...r }
    },
    async reactivar(id) {
      const r = reservas.find((r) => r.id === id)
      if (r) Object.assign(r, { estado: 'activa', canceladoEn: null })
    },
  }

  return { repo, reservas, fallas }
}
