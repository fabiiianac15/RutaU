import { useEffect, useState } from 'react'
import { Hoy } from './vistas/Hoy'
import { MisReservas } from './vistas/MisReservas'

// Dos vistas no necesitan un router: el hash de la URL basta y deja que el botón
// "atrás" del celular funcione.
const MIS_RESERVAS = '#/mis-reservas'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const alCambiar = () => {
      setHash(window.location.hash)
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])
  return hash
}

export function App() {
  const hash = useHash()
  const irA = (destino: string) => {
    window.location.hash = destino
  }

  if (hash === MIS_RESERVAS) return <MisReservas onVolver={() => irA('')} />

  return (
    <Hoy
      onVerReservas={() => irA(MIS_RESERVAS)}
      accionBanda={
        <a
          href={MIS_RESERVAS}
          className="presionable rounded-control bg-papel px-3.5 py-2.5 text-sm font-semibold text-rojo transition-colors duration-150 hover:bg-rojo-tinte"
        >
          Mis reservas
        </a>
      }
    />
  )
}
