import type { ReactNode } from 'react'

export function Marca() {
  return (
    <span className="flex items-center gap-0.5 text-[1.375rem] leading-none font-extrabold tracking-[-0.01em] text-papel">
      Ruta
      <span className="rounded-md bg-papel px-1.5 py-0.5 text-rojo">U</span>
    </span>
  )
}

// La banda roja de la UFPSO: marca arriba y, abajo, lo que cada vista necesite (pestañas de día, título).
export function Banda({ accion, children }: { accion?: ReactNode; children?: ReactNode }) {
  return (
    <header className="sobre-rojo bg-rojo pt-[max(0.875rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 lg:px-12">
        <Marca />
        {accion}
      </div>
      {children}
    </header>
  )
}

export function PestanasDia({
  dias,
  activo,
  onCambiar,
}: {
  dias: { fecha: string; etiqueta: string }[]
  activo: string
  onCambiar: (fecha: string) => void
}) {
  return (
    <div role="tablist" aria-label="Día del viaje" className="mx-auto mt-3.5 flex max-w-6xl px-4 lg:gap-1 lg:px-12">
      {dias.map((d) => {
        const esActivo = d.fecha === activo
        return (
          <button
            key={d.fecha}
            role="tab"
            aria-selected={esActivo}
            onClick={() => onCambiar(d.fecha)}
            className={`min-h-11 flex-1 rounded-t-xl px-2 pt-2.5 pb-3 text-sm font-semibold transition-colors duration-150 lg:w-44 lg:flex-none ${
              esActivo ? 'bg-papel text-rojo' : 'text-papel hover:bg-rojo-oscuro'
            }`}
          >
            {d.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
