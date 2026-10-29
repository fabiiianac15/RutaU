// Todo se calcula en hora de Colombia (UTC-5 todo el año, sin horario de verano),
// sin importar la zona horaria del celular.
const ZONA = 'America/Bogota'
const DESFASE = '-05:00'

export const fechaEnColombia = (fecha: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(fecha)

export const horaEnColombia = (fecha: Date) =>
  new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(fecha)

// Minutos desde la medianoche para una hora "HH:MM".
export const minutos = (hora: string) => {
  const [h = 0, m = 0] = hora.split(':').map(Number)
  return h * 60 + m
}

export const instanteDeSalida = (fecha: string, hora: string) => Date.parse(`${fecha}T${hora}:00${DESFASE}`)

export const sumarDias = (fecha: string, dias: number) => {
  const d = new Date(`${fecha}T12:00:00${DESFASE}`)
  d.setUTCDate(d.getUTCDate() + dias)
  return fechaEnColombia(d)
}

// "Hoy jue 29", "Vie 30", "Sáb 31"
export function etiquetaDia(fecha: string, hoy: string, larga = false) {
  const d = new Date(`${fecha}T12:00:00${DESFASE}`)
  const semana = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, weekday: larga ? 'long' : 'short' })
    .format(d)
    .replace('.', '')
  const dia = new Intl.DateTimeFormat('es-CO', { timeZone: ZONA, day: 'numeric' }).format(d)
  const nombre = `${semana.charAt(0).toUpperCase()}${semana.slice(1)} ${dia}`
  return fecha === hoy ? `Hoy ${nombre.charAt(0).toLowerCase()}${nombre.slice(1)}` : nombre
}
