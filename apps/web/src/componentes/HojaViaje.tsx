import { useState, type FormEvent, type ReactNode } from 'react'
import type { Parada, Viaje } from '../api/tipos'
import type { EstadoViaje } from '../lib/dia'
import { codigoValido, type Estudiante } from '../lib/estudiante'
import { Aviso, Boton, Campo } from './base'

export type Resultado =
  | { tipo: 'reservado'; parada: string }
  | { tipo: 'error'; mensaje: string; sinCupos: boolean }
  | null

interface Props {
  viaje: Viaje
  estado: EstadoViaje
  paradas: Parada[]
  // Parada reservada si el viaje ya es del estudiante.
  tuParada?: string
  estudiante: Estudiante | null
  resultado: Resultado
  // Otro viaje del día con cupos, para ofrecerlo cuando este está lleno.
  alternativa: Viaje | null
  reservando: boolean
  onReservar: (paradaId: number, estudiante: Estudiante) => void
  onElegirOtro: (v: Viaje) => void
  onVerReservas?: () => void
}

export function HojaViaje(props: Props) {
  const { viaje, estado, paradas, tuParada, estudiante, resultado, alternativa, reservando } = props
  const [paradaId, setParadaId] = useState<number | null>(paradas[0]?.id ?? null)
  // Primero se elige la parada; los datos solo se piden si este celular no conoce al estudiante.
  const [paso, setPaso] = useState<'parada' | 'datos'>('parada')
  const lleno = estado === 'lleno' || (resultado?.tipo === 'error' && resultado.sinCupos)
  // Si solo se conoce el código (se buscó en Mis reservas), igual hay que pedir el nombre.
  const conocido = estudiante?.nombre ? estudiante : null

  const encabezado = (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-baseline gap-2.5">
          <span className="text-hora font-extrabold tracking-[-0.02em]">{viaje.horaSalida}</span>
          <span className="text-lg font-bold">{viaje.ruta.nombre}</span>
        </h2>
        <p className={`shrink-0 font-semibold ${lleno ? 'text-tinta-2' : 'text-rojo'}`}>
          {lleno ? 'Lleno' : `${viaje.disponibles} libres`}
        </p>
      </div>
      <p className="text-sm text-apagada">
        Bus {viaje.bus.placa} · {viaje.ocupados} de {viaje.bus.capacidad} ocupados
      </p>
    </div>
  )

  let cuerpo: ReactNode
  if (tuParada !== undefined) {
    cuerpo = (
      <>
        {resultado?.tipo === 'reservado' ? (
          <Aviso tipo="exito" titulo="Listo, tienes cupo">
            Bus de las {viaje.horaSalida} · sube en {resultado.parada}.
          </Aviso>
        ) : (
          <p className="text-sm text-tinta-2">Ya tienes cupo en este viaje. Subes en {tuParada}.</p>
        )}
        {props.onVerReservas && (
          <Boton tipo="secundario" onClick={props.onVerReservas}>
            Ver mis reservas
          </Boton>
        )}
      </>
    )
  } else if (lleno) {
    cuerpo = (
      <>
        <Aviso tipo="error" titulo="Este bus ya se llenó">
          Nadie más puede reservar en él.
          {alternativa && ` El de las ${alternativa.horaSalida} por ${alternativa.ruta.nombre} todavía tiene ${alternativa.disponibles} cupos.`}
        </Aviso>
        {alternativa && (
          <Boton tipo="secundario" onClick={() => props.onElegirOtro(alternativa)}>
            Ver el de las {alternativa.horaSalida}
          </Boton>
        )}
      </>
    )
  } else if (paso === 'datos') {
    cuerpo = (
      <FormularioDatos
        paradaNombre={paradas.find((p) => p.id === paradaId)?.nombre}
        inicial={estudiante}
        reservando={reservando}
        error={resultado?.tipo === 'error' ? resultado.mensaje : null}
        onVolver={() => setPaso('parada')}
        onConfirmar={(e) => paradaId && props.onReservar(paradaId, e)}
      />
    )
  } else {
    cuerpo = (
      <>
        <SelectorParada paradas={paradas} elegida={paradaId} onElegir={setParadaId} />
        {resultado?.tipo === 'error' && <Aviso tipo="error" titulo="No pudimos reservar">{resultado.mensaje}</Aviso>}
        <Boton
          cargando={reservando}
          disabled={!paradaId}
          onClick={() => {
            if (!paradaId) return
            if (conocido) props.onReservar(paradaId, conocido)
            else setPaso('datos')
          }}
        >
          Reservar mi cupo
        </Boton>
        {conocido && (
          <p className="text-sm text-apagada">
            A nombre de {conocido.nombre} · {conocido.codigo}.{' '}
            <button className="font-semibold text-rojo-oscuro underline underline-offset-3" onClick={() => setPaso('datos')}>
              No soy yo
            </button>
          </p>
        )}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {encabezado}
      {cuerpo}
    </div>
  )
}

// "Parque 29 de Mayo" → "Parque 29", "Sede El Algodonal" → "Algodonal", "Hospital Emiro…" → "Hospital".
export function nombreCorto(nombre: string) {
  const palabras = nombre.split(' ').filter((p) => !['de', 'del', 'la', 'el', 'El', 'La'].includes(p))
  if (palabras[0] === 'Sede') return palabras.at(-1) ?? nombre
  if (palabras[0] === 'Parque') return palabras.slice(0, 2).join(' ')
  return palabras[0] ?? nombre
}

// Control segmentado: las paradas en una fila con su nombre corto, y el nombre completo
// de la elegida debajo. Ocupa una línea en vez de tres y deja ver más horario.
function SelectorParada({ paradas, elegida, onElegir }: { paradas: Parada[]; elegida: number | null; onElegir: (id: number) => void }) {
  const actual = paradas.find((p) => p.id === elegida)
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold">¿Dónde subes?</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-sutil p-1">
        {paradas.map((p) => {
          const esta = p.id === elegida
          return (
            <label
              key={p.id}
              className={`presionable relative flex min-h-11 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-sm font-semibold transition-colors duration-150 has-focus-visible:outline-3 has-focus-visible:outline-tinta ${
                esta ? 'bg-papel text-rojo-oscuro shadow-[0_1px_3px_rgb(0_0_0/0.12)] ring-2 ring-rojo ring-inset' : 'text-tinta-2 hover:bg-papel/60'
              }`}
            >
              <input
                type="radio"
                name="parada"
                value={p.id}
                checked={esta}
                onChange={() => onElegir(p.id)}
                aria-label={p.nombre}
                className="sr-only"
              />
              {nombreCorto(p.nombre)}
            </label>
          )
        })}
      </div>
      {actual && (
        <p className="text-sm text-tinta-2">
          Subes en <span className="font-semibold text-tinta">{actual.nombre}</span> · parada {actual.orden} de {paradas.length}
        </p>
      )}
    </fieldset>
  )
}

function FormularioDatos({
  paradaNombre,
  inicial,
  reservando,
  error,
  onVolver,
  onConfirmar,
}: {
  paradaNombre?: string
  inicial: Estudiante | null
  reservando: boolean
  error: string | null
  onVolver: () => void
  onConfirmar: (e: Estudiante) => void
}) {
  const [codigo, setCodigo] = useState(inicial?.codigo ?? '')
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [intentado, setIntentado] = useState(false)

  const errorCodigo = intentado && !codigoValido(codigo) ? 'Debe tener entre 4 y 12 dígitos' : undefined
  const errorNombre = intentado && !nombre.trim() ? 'Escribe tu nombre' : undefined

  const enviar = (ev: FormEvent) => {
    ev.preventDefault()
    setIntentado(true)
    if (codigoValido(codigo) && nombre.trim()) onConfirmar({ codigo, nombre: nombre.trim() })
  }

  return (
    <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
      {paradaNombre && <p className="text-sm font-semibold text-rojo-oscuro">Subes en {paradaNombre}</p>}
      <Campo
        etiqueta="Código estudiantil"
        inputMode="numeric"
        autoComplete="off"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
        ayuda="El de tu carné, solo números"
        error={errorCodigo}
        maxLength={12}
      />
      <Campo
        etiqueta="Nombre"
        autoComplete="name"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        ayuda="Así te reconoce el conductor"
        error={errorNombre}
        maxLength={100}
      />
      {error && <Aviso tipo="error" titulo="No pudimos reservar">{error}</Aviso>}
      <Boton type="submit" cargando={reservando}>
        Confirmar reserva
      </Boton>
      <p className="text-sm text-apagada">
        Guardamos tu código en este celular para la próxima vez.{' '}
        <button type="button" className="font-semibold text-rojo-oscuro underline underline-offset-3" onClick={onVolver}>
          Cambiar parada
        </button>
      </p>
    </form>
  )
}
