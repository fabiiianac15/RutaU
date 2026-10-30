// Formas de las respuestas de los servicios (ver services/rutas/README.md y services/reservas/README.md).

export interface Parada {
  id: number
  nombre: string
  orden: number
  latitud?: number | null
  longitud?: number | null
}

// Recorrido de la ruta en GeoJSON: cada punto es [longitud, latitud].
export interface Trazado {
  type: 'LineString'
  coordinates: [number, number][]
}

export interface Ruta {
  id: number
  nombre: string
  descripcion: string | null
  paradas: Parada[]
  trazado?: Trazado | null
  distanciaM?: number | null
  duracionMin?: number | null
}

export interface Viaje {
  id: number
  ruta: { id: number; nombre: string }
  bus: { placa: string; capacidad: number }
  fecha: string
  horaSalida: string
  ocupados: number
  disponibles: number
}

export interface ViajeDetalle extends Viaje {
  paradas: Parada[]
}

export interface Reserva {
  id: string
  codigoEstudiante: string
  nombre: string
  viajeId: number
  paradaId: number
  estado: 'activa' | 'cancelada'
  creadoEn: string
  canceladoEn: string | null
  viaje: { id: number; ruta: { id: number; nombre: string }; fecha: string; horaSalida: string } | null
  parada: Parada | null
}
