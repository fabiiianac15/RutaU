import type { Viaje } from '../api/tipos'
import type { EstadoViaje, Fila } from '../lib/dia'
import { BloqueViaje } from './BloqueViaje'

interface Props {
  filas: Fila[]
  estadoDe: (v: Viaje) => EstadoViaje
  seleccionado: number | null
  // viajeId → nombre de la parada, para los viajes que el estudiante ya reservó.
  tusParadas: Map<number, string>
  onElegir: (v: Viaje) => void
}

// El día como un horario de clases: columna de horas a la izquierda y los viajes
// como bloques a su hora. Las horas sin viajes se comprimen en una sola línea.
export function GrillaDia({ filas, estadoDe, seleccionado, tusParadas, onElegir }: Props) {
  return (
    <ol aria-label="Viajes del día" className="grid grid-cols-[3.25rem_1fr] gap-x-3 lg:grid-cols-[4.5rem_1fr] lg:gap-x-4">
      {filas.map((fila) => {
        if (fila.tipo === 'ahora') {
          return (
            <li key="ahora" aria-label={`Ahora son las ${fila.hora}`} className="col-span-2 grid grid-cols-subgrid items-center py-3">
              <span className="w-fit rounded-[5px] bg-tinta px-2 py-0.75 text-etiqueta font-bold text-papel">{fila.hora}</span>
              <span aria-hidden className="h-0.5 bg-tinta" />
            </li>
          )
        }
        if (fila.tipo === 'hueco') {
          return (
            <li key={`hueco-${fila.desde}`} className="col-start-2 py-2 text-sm text-apagada">
              Sin viajes de {fila.desde} a {fila.hasta}
            </li>
          )
        }
        const solo = fila.viajes.length === 1
        return (
          <li key={fila.hora} className="col-span-2 grid grid-cols-subgrid pt-2 pb-3">
            <span className="pt-0.5 text-etiqueta font-bold text-apagada">{fila.hora}</span>
            <div className="border-t border-grilla pt-2">
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] lg:gap-3">
                {fila.viajes.map((v) => (
                  <div key={v.id} className={solo ? 'col-span-full' : ''}>
                    <BloqueViaje
                      viaje={v}
                      estado={estadoDe(v)}
                      seleccionado={seleccionado === v.id}
                      tuParada={tusParadas.get(v.id)}
                      onElegir={() => onElegir(v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function GrillaCargando() {
  return (
    <div aria-busy className="grid grid-cols-[3.25rem_1fr] gap-x-3 gap-y-5 pt-3 lg:grid-cols-[4.5rem_1fr]" aria-label="Cargando viajes">
      {[0, 1, 2].map((i) => (
        <div key={i} className="col-span-2 grid grid-cols-subgrid">
          <span className="h-4 w-10 animate-pulse rounded bg-sutil" />
          <div className="grid grid-cols-2 gap-2">
            <span className="h-15.5 animate-pulse rounded-bloque bg-sutil" />
            {i !== 2 && <span className="h-15.5 animate-pulse rounded-bloque bg-sutil" />}
          </div>
        </div>
      ))}
    </div>
  )
}
