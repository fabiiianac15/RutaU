import { useEffect, useMemo, useRef, useState } from 'react'
import { api, ErrorApi } from '../api/cliente'
import type { Viaje } from '../api/tipos'
import { Banda, PestanasDia } from '../componentes/Banda'
import { Aviso, Boton } from '../componentes/base'
import { GrillaCargando, GrillaDia } from '../componentes/GrillaDia'
import { HojaViaje, type Resultado } from '../componentes/HojaViaje'
import { estadoDe, filasDelDia } from '../lib/dia'
import { useAhora, useReservas, useRutas, useViajes } from '../lib/datos'
import { useEstudiante, type Estudiante } from '../lib/estudiante'
import { vibrarExito } from '../lib/vibrar'
import { etiquetaDia, fechaEnColombia, horaEnColombia, minutos, sumarDias } from '../lib/tiempo'

export function Hoy({ accionBanda, onVerReservas }: { accionBanda?: React.ReactNode; onVerReservas?: () => void }) {
  const ahora = useAhora()
  const hoy = fechaEnColombia(ahora)
  const [fecha, setFecha] = useState(hoy)
  const [elegidoId, setElegidoId] = useState<number | null>(null)
  const [resultado, setResultado] = useState<Resultado>(null)
  const [reservando, setReservando] = useState(false)
  // En el celular la hoja se puede contraer a su encabezado para ver todo el horario.
  const [hojaAbierta, setHojaAbierta] = useState(true)
  const [estudiante, guardarEstudiante] = useEstudiante()

  const [viajes, recargarViajes] = useViajes(fecha)
  const [rutas] = useRutas()
  const [reservas, recargarReservas] = useReservas(estudiante?.codigo ?? null)

  const dias = [0, 1, 2].map((n) => {
    const f = sumarDias(hoy, n)
    return { fecha: f, etiqueta: etiquetaDia(f, hoy) }
  })

  const lista = viajes.estado === 'listo' ? viajes.datos : []
  const estado = (v: Viaje) => estadoDe(v, ahora)

  const tusParadas = useMemo(() => {
    const m = new Map<number, string>()
    if (reservas.estado === 'listo') {
      for (const r of reservas.datos) if (r.estado === 'activa' && r.parada) m.set(r.viajeId, r.parada.nombre)
    }
    return m
  }, [reservas])

  // Sin elección del estudiante, se muestra el próximo viaje que todavía tiene cupo:
  // la pregunta "¿tengo cupo en mi bus?" se responde sin tocar nada.
  const elegido =
    lista.find((v) => v.id === elegidoId && estado(v) !== 'salio') ??
    lista.find((v) => tusParadas.has(v.id) && estado(v) !== 'salio') ??
    lista.find((v) => estado(v) === 'disponible' || estado(v) === 'pocos') ??
    null

  const alternativa = elegido
    ? (lista
        .filter((v) => v.id !== elegido.id && (estado(v) === 'disponible' || estado(v) === 'pocos'))
        .sort(
          (a, b) =>
            Math.abs(minutos(a.horaSalida) - minutos(elegido.horaSalida)) -
            Math.abs(minutos(b.horaSalida) - minutos(elegido.horaSalida)),
        )[0] ?? null)
    : null

  const rutaElegida = rutas.estado === 'listo' && elegido ? rutas.datos.find((r) => r.id === elegido.ruta.id) : undefined
  const paradas = rutaElegida?.paradas ?? []

  const elegir = (v: Viaje) => {
    setElegidoId(v.id)
    setResultado(null)
    setHojaAbierta(true)
  }

  // En el celular, el bloque elegido se desplaza para que la hoja no lo tape
  // (cada bloque tiene scroll-margin-bottom igual al alto de la hoja).
  useEffect(() => {
    if (elegidoId === null) return
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelector(`[data-bloque="${elegidoId}"]`)?.scrollIntoView({ block: 'nearest', behavior: reducir ? 'auto' : 'smooth' })
  }, [elegidoId])

  const cambiarDia = (f: string) => {
    setFecha(f)
    setElegidoId(null)
    setResultado(null)
  }

  async function reservar(paradaId: number, e: Estudiante) {
    if (!elegido) return
    setReservando(true)
    setResultado(null)
    try {
      const reserva = await api.reservar({ codigoEstudiante: e.codigo, nombre: e.nombre, viajeId: elegido.id, paradaId })
      guardarEstudiante(e)
      setElegidoId(elegido.id)
      setResultado({ tipo: 'reservado', parada: reserva.parada?.nombre ?? '' })
      void vibrarExito()
    } catch (err) {
      const mensaje = err instanceof ErrorApi ? err.message : 'Algo salió mal. Intenta de nuevo.'
      const sinCupos = err instanceof ErrorApi && err.status === 409 && /cupos/i.test(mensaje)
      setResultado({ tipo: 'error', mensaje, sinCupos })
    } finally {
      setReservando(false)
      recargarViajes()
      recargarReservas()
    }
  }

  // En el celular la hoja tapa el final de la grilla; se reserva ese espacio abajo.
  const hoja = useRef<HTMLElement>(null)
  const [altoHoja, setAltoHoja] = useState(0)
  useEffect(() => {
    if (!hoja.current) return
    const obs = new ResizeObserver(([e]) => setAltoHoja(e?.borderBoxSize[0]?.blockSize ?? 0))
    obs.observe(hoja.current)
    return () => obs.disconnect()
  }, [elegido !== null])

  return (
    <div className="flex min-h-dvh flex-col">
      <Banda accion={accionBanda}>
        <PestanasDia dias={dias} activo={fecha} onCambiar={cambiarDia} />
      </Banda>

      <main className="mx-auto w-full max-w-6xl flex-1 lg:grid lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-10 lg:px-12">
        <section
          aria-label="Horario del día"
          className="px-4 pt-3 lg:px-0 lg:pt-6 lg:pb-12"
          style={{ paddingBottom: `calc(${altoHoja}px + 1.5rem)`, ['--alto-hoja' as string]: `${altoHoja}px` }}
        >
          {viajes.estado === 'cargando' && <GrillaCargando />}
          {viajes.estado === 'error' && (
            <div className="flex flex-col gap-3 pt-4">
              <Aviso tipo="error" titulo="No se pudieron cargar los viajes">
                {viajes.mensaje}
              </Aviso>
              <Boton tipo="secundario" onClick={recargarViajes}>
                Intentar de nuevo
              </Boton>
            </div>
          )}
          {viajes.estado === 'listo' &&
            (lista.length === 0 ? (
              <p className="pt-8 text-center text-tinta-2">No hay viajes programados para este día.</p>
            ) : (
              <GrillaDia
                filas={filasDelDia(lista, fecha === hoy ? horaEnColombia(ahora) : null)}
                estadoDe={estado}
                seleccionado={elegido?.id ?? null}
                tusParadas={tusParadas}
                recienReservado={resultado?.tipo === 'reservado' ? (elegido?.id ?? null) : null}
                onElegir={elegir}
              />
            ))}
        </section>

        {viajes.estado === 'listo' && (
          <aside
            ref={hoja}
            aria-label="Viaje elegido"
            className="hoja fixed inset-x-0 bottom-0 z-10 max-h-[78dvh] overflow-y-auto rounded-t-hoja border-t border-grilla bg-papel px-4 pt-2.5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_18px_rgb(0_0_0/0.08)] lg:sticky lg:top-6 lg:mt-6 lg:max-h-none lg:rounded-hoja lg:border-0 lg:p-6 lg:shadow-[0_8px_24px_rgb(0_0_0/0.08)]"
          >
            <button
              type="button"
              onClick={() => setHojaAbierta((a) => !a)}
              aria-expanded={hojaAbierta}
              aria-label={hojaAbierta ? 'Contraer el detalle del viaje' : 'Mostrar el detalle del viaje'}
              className="mx-auto -mt-2.5 mb-1 flex h-7 w-16 items-center justify-center lg:hidden"
            >
              <span aria-hidden className="block h-1 w-10 rounded-full bg-grilla" />
            </button>
            {elegido ? (
              <HojaViaje
                key={elegido.id}
                compacta={!hojaAbierta}
                viaje={elegido}
                estado={estado(elegido)}
                paradas={paradas}
                ruta={rutaElegida}
                tuParada={tusParadas.get(elegido.id) ?? (resultado?.tipo === 'reservado' ? resultado.parada : undefined)}
                estudiante={estudiante}
                resultado={resultado}
                alternativa={alternativa}
                reservando={reservando}
                onReservar={reservar}
                onElegirOtro={elegir}
                onVerReservas={onVerReservas}
              />
            ) : (
              <SinViajes
                fecha={fecha}
                hoy={hoy}
                hayViajes={lista.length > 0}
                onSiguiente={() => cambiarDia(sumarDias(fecha, 1))}
              />
            )}
          </aside>
        )}
      </main>
    </div>
  )
}

function SinViajes({ fecha, hoy, hayViajes, onSiguiente }: { fecha: string; hoy: string; hayViajes: boolean; onSiguiente: () => void }) {
  const manana = etiquetaDia(sumarDias(fecha, 1), hoy, true)
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg font-bold">{hayViajes ? 'No quedan viajes con cupo este día' : 'Este día no hay buses'}</h2>
      <p className="text-sm text-tinta-2">Puedes reservar desde ya para {manana.toLowerCase()}.</p>
      <Boton tipo="secundario" onClick={onSiguiente}>
        Ver {manana.toLowerCase()}
      </Boton>
    </div>
  )
}
