import { useCallback, useState } from 'react'

// El código y el nombre se recuerdan en este celular para no pedirlos en cada reserva.
// localStorage puede fallar (modo privado, almacenamiento bloqueado), así que todo va en try/catch.
const CLAVE = 'rutau.estudiante'

export interface Estudiante {
  codigo: string
  nombre: string
}

function leer(): Estudiante | null {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? 'null')
    return guardado?.codigo ? guardado : null
  } catch {
    return null
  }
}

export function useEstudiante() {
  const [estudiante, setEstudiante] = useState<Estudiante | null>(leer)

  const guardar = useCallback((e: Estudiante | null) => {
    setEstudiante(e)
    try {
      if (e) localStorage.setItem(CLAVE, JSON.stringify(e))
      else localStorage.removeItem(CLAVE)
    } catch {
      // Sin almacenamiento solo se pierde la comodidad de no volver a escribirlo.
    }
  }, [])

  return [estudiante, guardar] as const
}

export const codigoValido = (codigo: string) => /^[0-9]{4,12}$/.test(codigo)
