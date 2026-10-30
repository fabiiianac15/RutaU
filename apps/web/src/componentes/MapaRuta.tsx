import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Parada, Ruta } from '../api/tipos'

// Teselas de OpenStreetMap (gratis, sin clave). En estilos.css se pasan a grises para que
// el único color fuerte sea el recorrido rojo, como en el resto de RutaU.
const TESELAS = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

type ConCoordenadas = Parada & { latitud: number; longitud: number }
const tieneCoordenadas = (p: Parada): p is ConCoordenadas => p.latitud != null && p.longitud != null

// Paradas numeradas como en la columna de horas; la elegida, rellena de rojo;
// el destino (la sede El Algodonal), con la celda "U" de la marca.
function icono(parada: Parada, elegida: boolean, destino: boolean) {
  const clase = destino ? 'marcador marcador-destino' : `marcador${elegida ? ' marcador-elegido' : ''}`
  const contenido = destino ? 'U' : String(parada.orden)
  const tam = destino ? 30 : elegida ? 30 : 24
  return L.divIcon({
    className: '',
    html: `<span class="${clase}${destino && elegida ? ' marcador-elegido' : ''}">${contenido}</span>`,
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam / 2],
  })
}

// Encuadra el recorrido completo, o acerca a la parada elegida cuando se pide.
// Si el contenedor cambia de tamaño (la hoja entra animada, se gira el celular),
// Leaflet vuelve a medir y a encuadrar; si no, el mapa queda descentrado.
function Encuadre({ limites, foco, margen }: { limites: L.LatLngBounds; foco: ConCoordenadas | null; margen: number }) {
  const mapa = useMap()
  useEffect(() => {
    const encuadrar = (animar: boolean) => {
      mapa.invalidateSize()
      if (foco) mapa.flyTo([foco.latitud, foco.longitud], 16, { animate: animar, duration: 0.6 })
      else mapa.fitBounds(limites, { padding: [margen, margen], animate: false })
    }
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    encuadrar(!reducir)
    const obs = new ResizeObserver(() => encuadrar(false))
    obs.observe(mapa.getContainer())
    return () => obs.disconnect()
  }, [mapa, limites, foco, margen])
  return null
}

interface Props {
  ruta: Ruta
  paradaElegida?: number | null
  onElegirParada?: (id: number) => void
  // Acercar el mapa a la parada elegida (vista Rutas); en la hoja se muestra el recorrido entero.
  acercarAElegida?: boolean
  // Compacto: para la hoja del viaje; sin arrastre ni zoom, solo tocar paradas.
  compacto?: boolean
  className?: string
}

export function MapaRuta({ ruta, paradaElegida = null, onElegirParada, acercarAElegida = false, compacto = false, className = '' }: Props) {
  const paradas = ruta.paradas.filter(tieneCoordenadas)
  const recorrido = useMemo<[number, number][]>(
    () => (ruta.trazado?.coordinates ?? []).map(([lng, lat]) => [lat, lng]),
    [ruta.trazado],
  )
  const limites = useMemo(
    () => L.latLngBounds([...recorrido, ...paradas.map((p): [number, number] => [p.latitud, p.longitud])]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recorrido, ruta.id],
  )

  if (paradas.length === 0) return null
  const ultima = paradas.at(-1)!
  const foco = acercarAElegida ? (paradas.find((p) => p.id === paradaElegida) ?? null) : null

  return (
    <div className={`mapa-rutau isolate overflow-hidden rounded-bloque ring-1 ring-grilla ${className}`}>
      <MapContainer
        bounds={limites}
        boundsOptions={{ padding: [compacto ? 14 : 28, compacto ? 14 : 28] }}
        zoomSnap={0.25}
        className="size-full"
        zoomControl={!compacto}
        dragging={!compacto}
        touchZoom={!compacto}
        doubleClickZoom={!compacto}
        scrollWheelZoom={false}
        attributionControl
      >
        <TileLayer url={TESELAS} attribution={ATRIBUCION} maxZoom={19} />
        {recorrido.length > 1 && (
          <>
            <Polyline positions={recorrido} pathOptions={{ color: '#ffffff', weight: 9, opacity: 1, interactive: false }} />
            <Polyline positions={recorrido} pathOptions={{ color: '#c71122', weight: 5, opacity: 1, interactive: false }} />
          </>
        )}
        {paradas.map((p) => {
          const elegida = p.id === paradaElegida
          return (
            <Marker
              key={p.id}
              position={[p.latitud, p.longitud]}
              icon={icono(p, elegida, p.id === ultima.id)}
              title={`Parada ${p.orden}: ${p.nombre}`}
              alt={`Parada ${p.orden}: ${p.nombre}`}
              zIndexOffset={elegida ? 1000 : 0}
              eventHandlers={onElegirParada ? { click: () => onElegirParada(p.id) } : undefined}
            >
              {elegida && (
                <Tooltip permanent direction="top" offset={[0, -16]} className="etiqueta-parada">
                  {p.nombre}
                </Tooltip>
              )}
            </Marker>
          )
        })}
        <Encuadre limites={limites} foco={foco} margen={compacto ? 14 : 28} />
      </MapContainer>
    </div>
  )
}
