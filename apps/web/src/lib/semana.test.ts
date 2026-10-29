import { describe, expect, it } from 'vitest'
import type { Reserva } from '../api/tipos'
import { semanaDe } from './semana'

let n = 0
const reserva = (fecha: string, hora: string, estado: Reserva['estado'] = 'activa', conViaje = true): Reserva => ({
  id: String(++n),
  codigoEstudiante: '192345',
  nombre: 'Ana Pérez',
  viajeId: n,
  paradaId: 1,
  estado,
  creadoEn: '2026-10-29T10:00:00Z',
  canceladoEn: estado === 'cancelada' ? '2026-10-29T11:00:00Z' : null,
  viaje: conViaje ? { id: n, ruta: { id: 1, nombre: 'Ruta Centro' }, fecha, horaSalida: hora } : null,
  parada: { id: 1, nombre: 'Parque 29 de Mayo', orden: 1 },
})

const ahora = new Date('2026-10-29T10:00:00-05:00')

describe('semanaDe', () => {
  const hoy1230 = reserva('2026-10-29', '12:30')
  const vie0615 = reserva('2026-10-30', '06:15')
  const vie1700 = reserva('2026-10-30', '17:00', 'cancelada')
  const hoy0600 = reserva('2026-10-29', '06:00')
  const sinViaje = reserva('2026-10-31', '06:00', 'activa', false)
  const semana = semanaDe([vie1700, hoy1230, sinViaje, vie0615, hoy0600], ahora)

  it('arma las columnas por día y las filas por hora en punto', () => {
    expect(semana.dias).toEqual(['2026-10-29', '2026-10-30'])
    expect(semana.horas).toEqual(['06:00', '12:00', '17:00'])
    expect(semana.celdas.get('2026-10-30|06:00')).toEqual([vie0615])
  })

  it('separa activas y canceladas por venir, en orden de salida', () => {
    expect(semana.activas).toEqual([hoy1230, vie0615])
    expect(semana.canceladas).toEqual([vie1700])
  })

  it('deja aparte los viajes que ya salieron y los que Rutas ya no tiene', () => {
    expect(semana.anteriores).toEqual([hoy0600, sinViaje])
  })

  it('responde vacío si no hay reservas', () => {
    expect(semanaDe([], ahora)).toMatchObject({ dias: [], horas: [], activas: [], canceladas: [], anteriores: [] })
  })
})
