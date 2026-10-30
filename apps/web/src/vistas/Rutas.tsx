import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Ruta, Viaje } from '../api/tipos'
import { Banda } from '../componentes/Banda'
import { Aviso, Boton } from '../componentes/base'
import { MapaRuta } from '../componentes/MapaRuta'
import { estadoDe } from '../lib/dia'
import { useAhora, useRutas, useViajes } from '../lib/datos'
import { fechaEnColombia } from '../lib/tiempo'

const formatoKm = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export function Rutas({ onVolver }: { onVolver: () => void }) {
  const ahora = useAhora()
  const [rutas, recargar] = useRutas()
  const [viajes] = useViajes(fechaEnColombia(ahora))

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
          <h1 className="text-lg font-bold">Rutas</h1>
          <p className="text-sm font-semibold">Recorridos hacia la sede El Algodonal</p>
        </div>
      </Banda>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 pt-5 pb-12 lg:px-12">
        {rutas.estado === 'cargando' && <span aria-busy aria-label="Cargando rutas" className="h-72 animate-pulse rounded-bloque bg-sutil" />}
        {rutas.estado === 'error' && (
          <div className="flex flex-col gap-3">
            <Aviso tipo="error" titulo="No se pudieron cargar las rutas">{rutas.mensaje}</Aviso>
            <Boton tipo="secundario" onClick={recargar}>Intentar de nuevo</Boton>
          </div>
        )}
        {rutas.estado === 'listo' &&
          rutas.datos.map((r) => (
            <FichaRuta
              key={r.id}
              ruta={r}
              salidas={viajes.estado === 'listo' ? viajes.datos.filter((v) => v.ruta.id === r.id) : null}
              ahora={ahora}
              onReservar={onVolver}
            />
          ))}
      </main>
    </div>
  )
}

function FichaRuta({ ruta, salidas, ahora, onReservar }: { ruta: Ruta; salidas: Viaje[] | null; ahora: Date; onReservar: () => void }) {
  const [elegida, setElegida] = useState<number | null>(null)
  const datos = [
    ruta.distanciaM && `${formatoKm.format(ruta.distanciaM / 1000)} km`,
    ruta.duracionMin && `unos ${ruta.duracionMin} min`,
    `${ruta.paradas.length} paradas`,
  ].filter(Boolean)

  return (
    <article aria-labelledby={`ruta-${ruta.id}`} className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_22rem] lg:gap-8">
      <header className="flex flex-col gap-0.5 lg:col-span-2">
        <h2 id={`ruta-${ruta.id}`} className="text-hora font-extrabold tracking-[-0.02em]">
          {ruta.nombre}
        </h2>
        <p className="text-sm text-tinta-2">{[ruta.descripcion, datos.join(' · ')].filter(Boolean).join(' · ')}</p>
      </header>

      {ruta.trazado ? (
        <MapaRuta ruta={ruta} paradaElegida={elegida} onElegirParada={setElegida} acercarAElegida className="h-72 lg:h-[28rem]" />
      ) : (
        <p className="rounded-bloque bg-sutil p-4 text-sm text-tinta-2">Esta ruta todavía no tiene su recorrido en el mapa.</p>
      )}

      <div className="flex flex-col gap-6">
        <section aria-label={`Paradas de ${ruta.nombre}`} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">Paradas</h3>
            {elegida !== null && (
              <button className="-my-3 inline-block py-3 text-sm font-semibold text-rojo-oscuro underline underline-offset-3" onClick={() => setElegida(null)}>
                Ver todo el recorrido
              </button>
            )}
          </div>
          {/* Las paradas en orden, como la columna de horas del horario: tocar una la muestra en el mapa. */}
          <ol className="relative flex flex-col">
            <li aria-hidden className="pointer-events-none absolute top-5 bottom-5 left-[0.9375rem] w-0.5 bg-rojo-relleno" />
            {ruta.paradas.map((p, i) => {
              const esta = p.id === elegida
              const destino = i === ruta.paradas.length - 1
              return (
                <li key={p.id}>
                  <button
                    onClick={() => setElegida(esta ? null : p.id)}
                    aria-pressed={esta}
                    className={`presionable relative flex min-h-11 w-full items-center gap-3 rounded-control py-1.5 pr-3 text-left transition-colors duration-150 ${esta ? 'bg-rojo-tinte' : 'hover:bg-sutil'}`}
                  >
                    <span
                      className={`grid size-8 shrink-0 place-items-center text-etiqueta font-bold ${destino ? 'rounded-lg' : 'rounded-full'} ${
                        esta ? 'bg-rojo text-papel' : 'bg-papel text-rojo-oscuro ring-[2.5px] ring-rojo ring-inset'
                      }`}
                    >
                      {destino ? 'U' : p.orden}
                    </span>
                    <span className={`font-semibold ${esta ? 'text-rojo-oscuro' : ''}`}>{p.nombre}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-label={`Salidas de hoy de ${ruta.nombre}`} className="flex flex-col gap-2">
          <h3 className="font-semibold">Salidas de hoy</h3>
          {salidas === null ? (
            <span className="h-10 animate-pulse rounded-control bg-sutil" />
          ) : salidas.length === 0 ? (
            <p className="text-sm text-tinta-2">Hoy no hay salidas por esta ruta.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {salidas.map((v) => {
                const estado = estadoDe(v, ahora)
                const texto = estado === 'salio' ? 'salió' : estado === 'lleno' ? 'lleno' : `${v.disponibles} libres`
                return (
                  <li
                    key={v.id}
                    className={`rounded-control px-3 py-2 text-sm ${estado === 'salio' ? 'rayado text-apagada' : 'bg-rojo-suave text-tinta'}`}
                  >
                    <span className={`font-extrabold ${estado === 'salio' ? 'line-through' : ''}`}>{v.horaSalida}</span> · {texto}
                  </li>
                )
              })}
            </ul>
          )}
          <Boton tipo="secundario" onClick={onReservar} className="mt-2">
            Reservar en esta ruta
          </Boton>
        </section>
      </div>
    </article>
  )
}
