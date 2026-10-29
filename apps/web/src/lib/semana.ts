import type { Reserva } from '../api/tipos'
import { instanteDeSalida, minutos } from './tiempo'

export interface Semana {
  // Días con alguna reserva por venir, en orden: son las columnas del horario.
  dias: string[]
  // Horas en punto que tienen alguna reserva: son las filas del horario.
  horas: string[]
  // Reserva de cada celda, por "fecha|HH:00".
  celdas: Map<string, Reserva[]>
  activas: Reserva[]
  canceladas: Reserva[]
  // Viajes que ya salieron, o que Rutas ya no tiene.
  anteriores: Reserva[]
}

const horaEnPunto = (hora: string) => `${String(Math.floor(minutos(hora) / 60)).padStart(2, '0')}:00`
const salida = (r: Reserva) => (r.viaje ? instanteDeSalida(r.viaje.fecha, r.viaje.horaSalida) : 0)

// Ordena las reservas del estudiante como su horario de la semana: lo que viene
// va en la grilla (activas y canceladas, porque nada desaparece) y lo pasado queda aparte.
export function semanaDe(reservas: Reserva[], ahora: Date): Semana {
  const porVenir = reservas.filter((r) => r.viaje && salida(r) > ahora.getTime()).sort((a, b) => salida(a) - salida(b))
  const anteriores = reservas.filter((r) => !porVenir.includes(r)).sort((a, b) => salida(b) - salida(a))

  const celdas = new Map<string, Reserva[]>()
  for (const r of porVenir) {
    const clave = `${r.viaje!.fecha}|${horaEnPunto(r.viaje!.horaSalida)}`
    celdas.set(clave, [...(celdas.get(clave) ?? []), r])
  }

  return {
    dias: [...new Set(porVenir.map((r) => r.viaje!.fecha))],
    horas: [...new Set(porVenir.map((r) => horaEnPunto(r.viaje!.horaSalida)))].sort(),
    celdas,
    activas: porVenir.filter((r) => r.estado === 'activa'),
    canceladas: porVenir.filter((r) => r.estado === 'cancelada'),
    anteriores,
  }
}
