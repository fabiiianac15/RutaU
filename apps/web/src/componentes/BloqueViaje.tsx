import { Check } from 'lucide-react'
import type { Viaje } from '../api/tipos'
import { detalleDe, nivelOcupacion, type EstadoViaje } from '../lib/dia'

interface Props {
  viaje: Viaje
  estado: EstadoViaje
  seleccionado: boolean
  // Parada donde sube el estudiante si este viaje es suyo.
  tuParada?: string
  // El viaje que se acaba de reservar en esta visita: solo él se pinta con animación.
  recienReservado?: boolean
  onElegir: () => void
}

// Un viaje dentro de la grilla, como una clase en el horario.
// Rojo sólido significa una sola cosa: tienes cupo. Elegir un viaje solo le pone un anillo de tinta.
export function BloqueViaje({ viaje, estado, seleccionado, tuParada, recienReservado = false, onElegir }: Props) {
  const tuyo = tuParada !== undefined
  const salio = estado === 'salio'
  const detalle = tuyo ? `Tu cupo · ${tuParada}` : detalleDe(viaje, estado)
  const pintado = tuyo && !recienReservado

  const fondo = pintado ? 'bg-rojo text-papel' : salio ? 'rayado text-apagada' : 'bg-rojo-suave text-tinta hover:bg-rojo-relleno/50'

  return (
    <button
      type="button"
      onClick={onElegir}
      disabled={salio}
      aria-pressed={seleccionado}
      aria-label={`${viaje.horaSalida}, ${viaje.ruta.nombre}. ${detalle}`}
      data-bloque={viaje.id}
      className={`presionable relative isolate flex min-h-15.5 scroll-mt-4 scroll-mb-[calc(var(--alto-hoja,0px)+1rem)] w-full flex-col items-start overflow-hidden rounded-bloque px-3 py-2 text-left transition-colors duration-150 disabled:cursor-default ${fondo} ${
        seleccionado ? 'shadow-[0_0_0_2px_var(--color-papel),0_0_0_4px_var(--color-tinta)]' : ''
      }`}
    >
      {!salio && !pintado && (
        // Ocupación en una escala fija (franja, ¼, ½, ¾): solo el bus lleno es el bloque lleno.
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 bg-rojo-ocupado transition-[height] duration-300 ease-(--ease-salida)"
          style={{ height: `${nivelOcupacion(viaje) * 100}%` }}
        />
      )}
      {tuyo && recienReservado && <span aria-hidden className="pintar absolute inset-0 -z-10 bg-rojo" />}
      <span className={`flex flex-col items-start ${recienReservado ? 'pintar-texto' : ''}`}>
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
        {estado === 'pocos' && !tuyo && <span className="text-etiqueta font-bold text-rojo-oscuro">Últimos cupos</span>}
      </span>
    </button>
  )
}
