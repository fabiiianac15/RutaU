export interface Parada {
  id: number
  nombre: string
  orden: number
}

export interface Ruta {
  id: number
  nombre: string
  descripcion: string | null
  paradas: Parada[]
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

// Acceso a datos del servicio. La app recibe una implementación,
// así las pruebas pueden usar una en memoria en vez de Supabase.
export interface RepositorioRutas {
  listarRutas(): Promise<Ruta[]>
  listarViajes(fecha: string): Promise<Viaje[]>
  obtenerViaje(id: number): Promise<ViajeDetalle | null>
}
