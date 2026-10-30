import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { api, ErrorApi } from '../api/cliente'
import type { Reserva } from '../api/tipos'
import { Banda } from '../componentes/Banda'
import { Aviso, Boton, Campo } from '../componentes/base'
import { useAhora, useReservas } from '../lib/datos'
import { codigoValido, useEstudiante } from '../lib/estudiante'
import { semanaDe } from '../lib/semana'
import { etiquetaDia, fechaEnColombia } from '../lib/tiempo'

export function MisReservas({ onVolver }: { onVolver: () => void }) {
  const ahora = useAhora()
  const hoy = fechaEnColombia(ahora)
  const [estudiante, guardarEstudiante] = useEstudiante()
  const codigo = estudiante?.codigo ?? null
  const [reservas, recargar] = useReservas(codigo)
  const [aviso, setAviso] = useState<{ tipo: 'exito' | 'error'; titulo: string; texto: string } | null>(null)

  const nombre = reservas.estado === 'listo' ? (reservas.datos[0]?.nombre ?? estudiante?.nombre) : estudiante?.nombre

  // Si se buscó solo con el código, el nombre sale de sus reservas y se recuerda para reservar después.
  useEffect(() => {
    if (estudiante && !estudiante.nombre && nombre) guardarEstudiante({ codigo: estudiante.codigo, nombre })
  }, [estudiante, nombre, guardarEstudiante])

  async function cancelar(r: Reserva) {
    setAviso(null)
    try {
      await api.cancelar(r.id)
      setAviso({
        tipo: 'exito',
        titulo: 'Cancelaste tu reserva',
        texto: `El cupo del bus de las ${r.viaje?.horaSalida} quedó libre para otro estudiante.`,
      })
    } catch (e) {
      setAviso({ tipo: 'error', titulo: 'No se pudo cancelar', texto: e instanceof ErrorApi ? e.message : 'Intenta de nuevo.' })
    } finally {
      recargar()
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Banda
        accion={
          <button
            onClick={onVolver}
            className="presionable flex items-center gap-1.5 rounded-control bg-papel px-3.5 py-2.5 text-sm font-semibold text-rojo transition-colors duration-150 hover:bg-rojo-tinte"
          >
            <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden />
            Viajes
          </button>
        }
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 pt-4 pb-5 text-papel lg:px-12">
          <h1 className="text-lg font-bold">Mis reservas</h1>
          {codigo && (
            <p className="text-sm font-semibold">
              {nombre ? `${nombre} · ` : ''}código {codigo} ·{' '}
              <button className="-my-3 inline-block py-3 underline underline-offset-3" onClick={() => guardarEstudiante(null)}>
                Cambiar
              </button>
            </p>
          )}
        </div>
      </Banda>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-5 pb-10 lg:px-12">
        {!codigo && <PedirCodigo onBuscar={(c) => guardarEstudiante({ codigo: c, nombre: '' })} />}

        {codigo && reservas.estado === 'cargando' && (
          <div aria-busy aria-label="Cargando reservas" className="flex flex-col gap-3">
            <span className="h-40 animate-pulse rounded-bloque bg-sutil" />
            <span className="h-24 animate-pulse rounded-bloque bg-sutil" />
          </div>
        )}

        {codigo && reservas.estado === 'error' && (
          <div className="flex flex-col gap-3">
            <Aviso tipo="error" titulo="No se pudieron cargar tus reservas">{reservas.mensaje}</Aviso>
            <Boton tipo="secundario" onClick={recargar}>Intentar de nuevo</Boton>
          </div>
        )}

        {codigo && reservas.estado === 'listo' && (
          <Contenido reservas={reservas.datos} ahora={ahora} hoy={hoy} aviso={aviso} onCancelar={cancelar} onVolver={onVolver} />
        )}
      </main>
    </div>
  )
}

function Contenido({
  reservas,
  ahora,
  hoy,
  aviso,
  onCancelar,
  onVolver,
}: {
  reservas: Reserva[]
  ahora: Date
  hoy: string
  aviso: { tipo: 'exito' | 'error'; titulo: string; texto: string } | null
  onCancelar: (r: Reserva) => Promise<void>
  onVolver: () => void
}) {
  const semana = semanaDe(reservas, ahora)
  const [elegidaId, setElegidaId] = useState<string | null>(null)
  // Sin elección, el panel muestra la próxima reserva activa.
  const elegida = semana.activas.find((r) => r.id === elegidaId) ?? semana.activas[0] ?? null

  if (semana.dias.length === 0 && semana.anteriores.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="font-semibold">Todavía no tienes reservas.</p>
        <p className="text-sm text-tinta-2">Reserva tu cupo y aparecerá aquí, en tu horario de la semana.</p>
        <Boton tipo="secundario" onClick={onVolver}>Ver viajes</Boton>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-10">
      <section aria-label="Tu horario" className="flex flex-col gap-3">
        {semana.dias.length > 0 ? (
          <>
            <HorarioSemana semana={semana} hoy={hoy} elegida={elegida?.id ?? null} onElegir={(r) => setElegidaId(r.id)} />
            {semana.activas.length > 1 && <p className="text-sm text-apagada">Toca una reserva para ver su detalle o cancelarla.</p>}
          </>
        ) : (
          <p className="text-tinta-2">No tienes viajes reservados por venir.</p>
        )}
      </section>

      <section aria-label="Detalle" className="flex flex-col gap-5 lg:sticky lg:top-6">
        {aviso && (
          <Aviso tipo={aviso.tipo} titulo={aviso.titulo}>
            {aviso.texto}
          </Aviso>
        )}

        {elegida && <PanelReserva key={elegida.id} reserva={elegida} hoy={hoy} onCancelar={() => onCancelar(elegida)} />}

        {semana.canceladas.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Canceladas</h2>
            <ul className="flex flex-col divide-y divide-grilla">
              {semana.canceladas.map((r) => (
                <li key={r.id} className="py-2.5 text-sm text-tinta-2">
                  <span className="font-semibold line-through">{cuando(r, hoy)}</span> · {r.viaje?.ruta.nombre}
                </li>
              ))}
            </ul>
          </div>
        )}

        {semana.anteriores.length > 0 && (
          <details>
            <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-tinta-2">
              Viajes anteriores ({semana.anteriores.length})
            </summary>
            <ul className="flex flex-col divide-y divide-grilla">
              {semana.anteriores.map((r) => (
                <li key={r.id} className="py-2.5 text-sm text-apagada">
                  {r.viaje ? `${cuando(r, hoy)} · ${r.viaje.ruta.nombre}` : 'Viaje que ya no existe'}
                  {r.estado === 'cancelada' && ' · cancelada'}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  )
}

const cuando = (r: Reserva, hoy: string) => (r.viaje ? `${etiquetaDia(r.viaje.fecha, hoy)} ${r.viaje.horaSalida}` : '')

// Tu semana como el horario de clases: una columna por día, una fila por hora.
// Tus reservas son bloques que se tocan para verlas o cancelarlas ahí mismo.
function HorarioSemana({
  semana,
  hoy,
  elegida,
  onElegir,
}: {
  semana: ReturnType<typeof semanaDe>
  hoy: string
  elegida: string | null
  onElegir: (r: Reserva) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 py-1 lg:mx-0 lg:px-0">
      {/* Columnas fijas: caben tres días en un celular; con más, la tabla se desplaza de lado. */}
      <table
        className="w-full table-fixed border-separate border-spacing-x-2 border-spacing-y-0"
        style={{ minWidth: `${3 + semana.dias.length * 6.75}rem` }}
      >
        <thead>
          <tr>
            <th scope="col" className="w-12">
              <span className="sr-only">Hora</span>
            </th>
            {semana.dias.map((d) => (
              <th key={d} scope="col" className={`pb-3 text-left text-sm font-semibold ${d === hoy ? 'text-rojo' : 'text-tinta-2'}`}>
                {etiquetaDia(d, hoy)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {semana.horas.map((h) => (
            <tr key={h}>
              <th scope="row" className="border-r border-grilla pt-2 pb-3 text-left align-top text-etiqueta font-bold text-apagada">
                {h}
              </th>
              {semana.dias.map((d) => (
                <td key={d} className="border-t border-grilla pt-2 pb-3 align-top">
                  <div className="flex flex-col gap-2">
                    {(semana.celdas.get(`${d}|${h}`) ?? []).map((r) => (
                      <CeldaReserva key={r.id} reserva={r} elegida={r.id === elegida} onElegir={() => onElegir(r)} />
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CeldaReserva({ reserva, elegida, onElegir }: { reserva: Reserva; elegida: boolean; onElegir: () => void }) {
  if (reserva.estado === 'cancelada') {
    return (
      <div className="flex min-h-15.5 flex-col rounded-bloque border-[1.5px] border-dashed border-grilla px-3 py-2 text-apagada">
        <span className="text-hora-bloque font-extrabold tracking-[-0.01em] line-through">{reserva.viaje?.horaSalida}</span>
        <span className="text-sm font-semibold">Cancelada</span>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={onElegir}
      aria-pressed={elegida}
      aria-label={`Reserva de las ${reserva.viaje?.horaSalida}, sube en ${reserva.parada?.nombre}`}
      className={`presionable flex min-h-15.5 w-full flex-col items-start rounded-bloque bg-rojo px-3 py-2 text-left text-papel ${
        elegida ? 'shadow-[0_0_0_2px_var(--color-papel),0_0_0_4px_var(--color-tinta)]' : ''
      }`}
    >
      <span className="flex items-center gap-1.5">
        <span className="text-hora-bloque font-extrabold tracking-[-0.01em]">{reserva.viaje?.horaSalida}</span>
        <span className="grid size-4.5 place-items-center rounded-full bg-papel text-rojo">
          <Check className="size-3.5" strokeWidth={3.2} aria-hidden />
        </span>
      </span>
      <span className="line-clamp-2 text-sm font-semibold">{reserva.parada?.nombre}</span>
    </button>
  )
}

// Detalle de la reserva tocada en el horario. Cancelar pide una segunda confirmación
// en el mismo lugar, sin ventana emergente.
function PanelReserva({ reserva, hoy, onCancelar }: { reserva: Reserva; hoy: string; onCancelar: () => Promise<void> }) {
  const [paso, setPaso] = useState<'normal' | 'confirmando' | 'cancelando'>('normal')

  return (
    <article className="flex flex-col gap-3 border-t-2 border-rojo pt-4">
      <div>
        <h2 className="text-lg font-bold">
          {cuando(reserva, hoy)} · {reserva.viaje?.ruta.nombre}
        </h2>
        <p className="text-sm text-tinta-2">Subes en {reserva.parada?.nombre ?? 'la parada que elegiste'}</p>
      </div>
      {paso === 'normal' ? (
        <Boton tipo="peligro" onClick={() => setPaso('confirmando')}>
          Cancelar esta reserva
        </Boton>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-rojo-oscuro">¿Cancelar? Tu cupo quedará libre para otro estudiante.</p>
          <div className="grid grid-cols-2 gap-2">
            <Boton tipo="secundario" disabled={paso === 'cancelando'} onClick={() => setPaso('normal')}>
              No, mantener
            </Boton>
            <Boton
              cargando={paso === 'cancelando'}
              onClick={async () => {
                setPaso('cancelando')
                await onCancelar()
              }}
            >
              Sí, cancelar
            </Boton>
          </div>
        </div>
      )}
    </article>
  )
}

function PedirCodigo({ onBuscar }: { onBuscar: (codigo: string) => void }) {
  const [codigo, setCodigo] = useState('')
  const [intentado, setIntentado] = useState(false)
  const [tocado, setTocado] = useState(false)
  const enviar = (e: FormEvent) => {
    e.preventDefault()
    setIntentado(true)
    if (codigoValido(codigo)) onBuscar(codigo)
  }
  return (
    <form onSubmit={enviar} noValidate className="mx-auto flex max-w-md flex-col gap-4">
      <p className="text-tinta-2">Escribe tu código estudiantil para ver tus reservas.</p>
      <Campo
        etiqueta="Código estudiantil"
        inputMode="numeric"
        autoComplete="off"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
        ayuda="El de tu carné, solo números"
        onBlur={() => setTocado(true)}
        error={(intentado || tocado) && !codigoValido(codigo) ? 'Debe tener entre 4 y 12 dígitos' : undefined}
        maxLength={12}
      />
      <Boton type="submit">Ver mis reservas</Boton>
    </form>
  )
}
