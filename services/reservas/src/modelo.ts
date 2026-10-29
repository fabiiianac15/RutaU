export type EstadoReserva = 'activa' | 'cancelada'

// Una reserva tal como la guarda este servicio. viajeId y paradaId son ids del Servicio de Rutas.
export interface Reserva {
  id: string
  codigoEstudiante: string
  nombre: string
  viajeId: number
  paradaId: number
  estado: EstadoReserva
  creadoEn: string
  canceladoEn: string | null
}

export type DatosReserva = Pick<Reserva, 'codigoEstudiante' | 'nombre' | 'viajeId' | 'paradaId'>

// Acceso a datos del servicio. La app recibe una implementación,
// así las pruebas pueden usar una en memoria en vez de Supabase.
export interface RepositorioReservas {
  // Devuelve "duplicada" si el estudiante ya tiene una reserva activa en ese viaje.
  crear(datos: DatosReserva): Promise<Reserva | 'duplicada'>
  obtener(id: string): Promise<Reserva | null>
  tieneActiva(codigoEstudiante: string, viajeId: number): Promise<boolean>
  listarPorCodigo(codigoEstudiante: string): Promise<Reserva[]>
  // Solo cambia reservas activas; devuelve null si la reserva no estaba activa.
  cancelar(id: string): Promise<Reserva | null>
  // Deshace una cancelación cuando no se pudo devolver el cupo en Rutas.
  reactivar(id: string): Promise<void>
}
