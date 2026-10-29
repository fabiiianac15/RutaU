import { describe, expect, it } from 'vitest'
import type { Viaje } from '../api/tipos'
import { detalleDe, estadoDe, filasDelDia } from './dia'

const viaje = (id: number, hora: string, disponibles = 40, capacidad = 40, ruta = 'Ruta Centro'): Viaje => ({
  id,
  ruta: { id: 1, nombre: ruta },
  bus: { placa: 'UFP-101', capacidad },
  fecha: '2026-10-29',
  horaSalida: hora,
  ocupados: capacidad - disponibles,
  disponibles,
})

const a = (hora: string) => new Date(`2026-10-29T${hora}:00-05:00`)

describe('estadoDe', () => {
  it('marca como salido un viaje cuya hora ya pasó en Colombia', () => {
    expect(estadoDe(viaje(1, '06:00'), a('10:42'))).toBe('salio')
  })

  it('distingue lleno, pocos y disponible', () => {
    expect(estadoDe(viaje(1, '17:00', 0, 3), a('10:42'))).toBe('lleno')
    expect(estadoDe(viaje(1, '17:00', 2, 3), a('10:42'))).toBe('pocos')
    expect(estadoDe(viaje(1, '17:00', 4, 40), a('10:42'))).toBe('pocos')
    expect(estadoDe(viaje(1, '17:00', 5, 40), a('10:42'))).toBe('disponible')
  })
})

describe('detalleDe', () => {
  it('dice el estado con palabras, no solo con color', () => {
    expect(detalleDe(viaje(1, '12:30'), 'disponible')).toBe('40 libres · Centro')
    expect(detalleDe(viaje(1, '13:00', 24, 30, 'Ruta Terminal'), 'disponible')).toBe('24 de 30 · Terminal')
    expect(detalleDe(viaje(1, '17:00', 2, 3), 'pocos')).toBe('Quedan 2 · Centro')
    expect(detalleDe(viaje(1, '06:00'), 'salio')).toBe('Salió · Centro')
  })
})

describe('filasDelDia', () => {
  const dia = [viaje(5, '17:00'), viaje(1, '06:00'), viaje(3, '12:30'), viaje(2, '06:15'), viaje(4, '13:00')]

  it('agrupa por hora, comprime las horas vacías y pone la línea de ahora', () => {
    expect(filasDelDia(dia, '10:42')).toEqual([
      { tipo: 'grupo', hora: '06:00', viajes: [dia[1], dia[3]] },
      { tipo: 'hueco', desde: '07:00', hasta: '12:00' },
      { tipo: 'ahora', hora: '10:42' },
      { tipo: 'grupo', hora: '12:00', viajes: [dia[2]] },
      { tipo: 'grupo', hora: '13:00', viajes: [dia[4]] },
      { tipo: 'hueco', desde: '14:00', hasta: '17:00' },
      { tipo: 'grupo', hora: '17:00', viajes: [dia[0]] },
    ])
  })

  it('pone la línea de ahora dentro de la hora si el grupo aún no sale', () => {
    const filas = filasDelDia([viaje(1, '12:30'), viaje(2, '12:45')], '12:10')
    expect(filas.map((f) => f.tipo)).toEqual(['ahora', 'grupo'])
  })

  it('pone la línea de ahora al final si ya salieron todos', () => {
    const filas = filasDelDia([viaje(1, '06:00')], '20:00')
    expect(filas.map((f) => f.tipo)).toEqual(['grupo', 'ahora'])
  })

  it('no pone línea de ahora en otros días', () => {
    expect(filasDelDia(dia, null).some((f) => f.tipo === 'ahora')).toBe(false)
  })

  it('devuelve solo la línea de ahora si no hay viajes', () => {
    expect(filasDelDia([], '10:00')).toEqual([{ tipo: 'ahora', hora: '10:00' }])
  })
})
