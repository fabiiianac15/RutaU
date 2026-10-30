import { describe, expect, it } from 'vitest'
import { nombreCorto } from './HojaViaje'

describe('nombreCorto', () => {
  it.each([
    ['Parque 29 de Mayo', 'Parque 29'],
    ['Hospital Emiro Quintero Cañizares', 'Hospital'],
    ['Sede El Algodonal', 'Algodonal'],
    ['Terminal de Transportes', 'Terminal'],
    ['Avenida Circunvalar · La Paz', 'La Paz'],
  ])('%s → %s', (nombre, corto) => {
    expect(nombreCorto(nombre)).toBe(corto)
  })
})
