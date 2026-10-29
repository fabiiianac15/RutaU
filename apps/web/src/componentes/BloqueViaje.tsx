import { Check } from 'lucide-react'
import type { Viaje } from '../api/tipos'
import { detalleDe, type EstadoViaje } from '../lib/dia'

interface Props {
  viaje: Viaje
  estado: EstadoViaje
  seleccionado: boolean
  // Parada donde sube el estudiante si este viaje es suyo.
  tuParada?: string
  onElegir: () => void
}

// Un viaje dentro de la grilla, como una clase en el horario. El relleno de abajo
// es la ocupación del bus en una escala fija (ocupados / capacidad).
export function BloqueViaje({ viaje, estado, seleccionado, tuParada, onElegir }: Props) {
  const tuyo = tuParada !== undefined
  const salio = estado === 'salio'
  const ocupacion = viaje.ocupados / viaje.bus.capacidad
  const detalle = tuyo ? `Tu cupo · ${tuParada}` : detalleDe(viaje, estado)

  // Si es tuyo, el rojo lo pone la capa "pintar" de abajo, que sube como si el bus se llenara contigo.
  // Un viaje lleno sigue oscuro aunque esté seleccionado: el halo marca la selección, no el color.
  const fondo = tuyo
    ? 'bg-rojo-relleno text-papel'
    : estado === 'lleno'
      ? 'bg-tinta-2 text-papel'
      : seleccionado
        ? 'bg-rojo text-papel'
        : salio
          ? 'rayado text-apagada'
          : 'bg-rojo-suave text-tinta hover:bg-rojo-relleno/60'

  return (
    <button
      type="button"
      onClick={onElegir}
      disabled={salio}
      aria-pressed={seleccionado}
      aria-label={`${viaje.horaSalida}, ${viaje.ruta.nombre}. ${detalle}`}
      data-bloque={viaje.id}
      className={`presionable relative isolate flex min-h-15.5 w-full flex-col items-start overflow-hidden rounded-bloque px-3 py-2 text-left transition-colors duration-150 disabled:cursor-default ${fondo} ${
        seleccionado ? 'shadow-[0_0_0_3px_var(--color-papel),0_0_0_5px_var(--color-rojo)]' : ''
      }`}
    >
      {(estado === 'disponible' || estado === 'pocos') && !tuyo && !seleccionado && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 bg-rojo-relleno transition-[height] duration-300 ease-(--ease-salida)"
          style={{ height: `${Math.round(ocupacion * 100)}%` }}
        />
      )}
      {tuyo && <span aria-hidden className="pintar absolute inset-0 -z-10 bg-rojo" />}
      <span className="flex items-center gap-1.5">
        <span className={`text-hora-bloque font-extrabold tracking-[-0.01em] ${salio ? 'line-through' : ''}`}>
          {viaje.horaSalida}
        </span>
        {tuyo && (
          <span className="grid size-4.5 place-items-center rounded-full bg-papel text-rojo">
            <Check className="size-3.5" strokeWidth={3.2} aria-hidden />
          </span>
        )}
      </span>
      <span className="text-sm font-semibold">{detalle}</span>
      {estado === 'pocos' && !tuyo && (
        <span className={`text-etiqueta font-bold tracking-[0.02em] ${seleccionado ? 'text-papel' : 'text-rojo-oscuro'}`}>
          Últimos cupos
        </span>
      )}
    </button>
  )
}
