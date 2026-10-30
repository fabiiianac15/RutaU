import type { Reserva, Ruta, Viaje, ViajeDetalle } from './tipos'

const RUTAS_URL = import.meta.env.VITE_RUTAS_URL ?? 'http://localhost:3001'
const RESERVAS_URL = import.meta.env.VITE_RESERVAS_URL ?? 'http://localhost:3002'

// Error con el mensaje que mandó el servicio ({ "error": "..." }) y su código HTTP,
// para poder explicarle al estudiante qué pasó.
export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ErrorApi'
  }
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    throw new ErrorApi('Sin conexión. Revisa tu internet e intenta de nuevo.', 0)
  }
  const cuerpo = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ErrorApi(cuerpo?.error ?? 'Algo salió mal. Intenta de nuevo en un momento.', res.status)
  }
  return cuerpo as T
}

export const api = {
  rutas: () => pedir<Ruta[]>(`${RUTAS_URL}/rutas`),
  viajes: (fecha: string) => pedir<Viaje[]>(`${RUTAS_URL}/viajes?fecha=${fecha}`),
  viaje: (id: number) => pedir<ViajeDetalle>(`${RUTAS_URL}/viajes/${id}`),

  reservar: (datos: { codigoEstudiante: string; nombre: string; viajeId: number; paradaId: number }) =>
    pedir<Reserva>(`${RESERVAS_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    }),
  reservasDe: (codigo: string) => pedir<Reserva[]>(`${RESERVAS_URL}/reservas?codigo=${encodeURIComponent(codigo)}`),
  cancelar: (id: string) => pedir<Reserva>(`${RESERVAS_URL}/reservas/${id}`, { method: 'DELETE' }),
}
