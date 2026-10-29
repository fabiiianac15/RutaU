import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { useId } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

type TipoBoton = 'primario' | 'secundario' | 'peligro'

const estilosBoton: Record<TipoBoton, string> = {
  primario: 'bg-rojo text-papel hover:bg-rojo-oscuro',
  secundario: 'bg-papel text-tinta ring-[1.5px] ring-inset ring-grilla hover:bg-sutil',
  peligro: 'bg-papel text-rojo-oscuro ring-[1.5px] ring-inset ring-rojo hover:bg-rojo-tinte',
}

export function Boton({
  tipo = 'primario',
  cargando = false,
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tipo?: TipoBoton; cargando?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || cargando}
      aria-busy={cargando || undefined}
      className={`presionable flex h-13 w-full items-center justify-center gap-2 rounded-control px-4 text-base font-extrabold transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-rayado disabled:text-apagada disabled:ring-0 ${estilosBoton[tipo]} ${className}`}
    >
      {cargando && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      )}
      {children}
    </button>
  )
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { etiqueta: string; ayuda?: string; error?: string }) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-describedby={idAyuda}
        aria-invalid={error ? true : undefined}
        {...props}
        className="h-12 rounded-control bg-papel px-4 text-base ring-[1.5px] ring-inset ring-grilla transition-shadow duration-150 outline-none placeholder:text-apagada focus:ring-2 focus:ring-tinta aria-invalid:ring-2 aria-invalid:ring-rojo"
      />
      <p id={idAyuda} className={`text-sm ${error ? 'text-rojo-oscuro' : 'text-apagada'}`}>
        {error ?? ayuda}
      </p>
    </div>
  )
}

export function Aviso({ tipo, titulo, children }: { tipo: 'exito' | 'error'; titulo: string; children?: ReactNode }) {
  const Icono = tipo === 'exito' ? CheckCircle2 : AlertCircle
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 rounded-control px-4 py-3 ${tipo === 'exito' ? 'bg-exito-suave' : 'bg-rojo-tinte'}`}
    >
      <Icono
        className={`mt-0.5 size-5.5 shrink-0 ${tipo === 'exito' ? 'text-exito' : 'text-rojo'}`}
        strokeWidth={2.4}
        aria-hidden
      />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className={`font-semibold ${tipo === 'exito' ? 'text-exito' : 'text-rojo-oscuro'}`}>{titulo}</p>
        {children && <div className="text-sm text-tinta">{children}</div>}
      </div>
    </div>
  )
}
