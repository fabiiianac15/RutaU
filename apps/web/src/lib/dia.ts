import type { Viaje } from '../api/tipos'
import { instanteDeSalida, minutos } from './tiempo'

export type EstadoViaje = 'salio' | 'lleno' | 'pocos' | 'disponible'

// "Pocos" son los últimos cupos: 10 % del bus o menos, y nunca menos de 2.
export const umbralPocos = (capacidad: number) => Math.max(2, Math.ceil(capacidad * 0.1))

export function estadoDe(viaje: Viaje, ahora: Date): EstadoViaje {
  if (instanteDeSalida(viaje.fecha, viaje.horaSalida) <= ahora.getTime()) return 'salio'
  if (viaje.disponibles <= 0) return 'lleno'
  if (viaje.disponibles <= umbralPocos(viaje.bus.capacidad)) return 'pocos'
  return 'disponible'
}

// Lo que el bloque dice debajo de la hora; nunca solo color.
export function detalleDe(viaje: Viaje, estado: EstadoViaje) {
  const ruta = viaje.ruta.nombre.replace(/^Ruta /, '')
  switch (estado) {
    case 'salio':
      return `Salió · ${ruta}`
    case 'lleno':
      return `Lleno · ${ruta}`
    case 'pocos':
      return `Quedan ${viaje.disponibles} · ${ruta}`
    default:
      return viaje.disponibles === viaje.bus.capacidad
        ? `${viaje.disponibles} libres · ${ruta}`
        : `${viaje.disponibles} libres de ${viaje.bus.capacidad} · ${ruta}`
  }
}

// Ocupación en una escala fija de cuartos, redondeada al más cercano para no exagerar:
// el bloque lleno es solo el bus lleno, y un bus con poca gente muestra una franja delgada.
export const FRANJA = 0.08

export function nivelOcupacion(viaje: Viaje) {
  if (viaje.disponibles <= 0) return 1
  if (viaje.ocupados <= 0) return 0
  const cuarto = Math.round((viaje.ocupados / viaje.bus.capacidad) * 4) / 4
  return Math.min(0.75, Math.max(FRANJA, cuarto))
}

export type Fila =
  | { tipo: 'grupo'; hora: string; viajes: Viaje[] }
  | { tipo: 'hueco'; desde: string; hasta: string }
  | { tipo: 'ahora'; hora: string }

const dosDigitos = (n: number) => String(n).padStart(2, '0')

// Arma la grilla del día como un horario de clases: una fila por hora con viajes,
// las horas vacías comprimidas en una sola línea y la marca de "ahora" en su lugar.
// horaAhora es null cuando el día mostrado no es hoy.
export function filasDelDia(viajes: Viaje[], horaAhora: string | null): Fila[] {
  const porHora = new Map<number, Viaje[]>()
  for (const v of [...viajes].sort((a, b) => minutos(a.horaSalida) - minutos(b.horaSalida))) {
    const h = Math.floor(minutos(v.horaSalida) / 60)
    porHora.set(h, [...(porHora.get(h) ?? []), v])
  }

  const filas: Fila[] = []
  let ahoraPuesta = horaAhora === null
  let anterior: number | null = null

  for (const [h, grupo] of porHora) {
    if (anterior !== null && h - anterior >= 2) {
      filas.push({ tipo: 'hueco', desde: `${dosDigitos(anterior + 1)}:00`, hasta: `${dosDigitos(h)}:00` })
    }
    if (!ahoraPuesta && minutos(horaAhora!) < minutos(grupo[0]!.horaSalida)) {
      filas.push({ tipo: 'ahora', hora: horaAhora! })
      ahoraPuesta = true
    }
    filas.push({ tipo: 'grupo', hora: `${dosDigitos(h)}:00`, viajes: grupo })
    anterior = h
  }

  if (!ahoraPuesta) filas.push({ tipo: 'ahora', hora: horaAhora! })
  return filas
}
