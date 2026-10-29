// Lanza muchas solicitudes de ocupar cupo al mismo tiempo sobre un viaje y muestra
// que nunca se ocupan más cupos que la capacidad del bus. Al final libera los cupos tomados.
//
// Uso: npm run prueba:concurrencia -w @rutau/rutas -- <viajeId> [solicitudes]
// Requiere el servicio corriendo (npm run dev:rutas) y CLAVE_INTERNA en el .env.

const [viajeId, total = '10'] = process.argv.slice(2)
const base = process.env.RUTAS_URL ?? `http://localhost:${process.env.PORT ?? 3001}`
const clave = process.env.CLAVE_INTERNA

if (!viajeId || !clave) {
  console.error('Uso: prueba-concurrencia <viajeId> [solicitudes]  (y CLAVE_INTERNA en el .env)')
  process.exit(1)
}

const post = (accion: 'ocupar' | 'liberar') =>
  fetch(`${base}/viajes/${viajeId}/${accion}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${clave}` },
  })

const antes = await (await fetch(`${base}/viajes/${viajeId}`)).json()
console.log(`Viaje ${viajeId}: bus ${antes.bus.placa}, ${antes.disponibles} de ${antes.bus.capacidad} cupos libres`)
console.log(`Enviando ${total} solicitudes de ocupar al mismo tiempo...`)

const respuestas = await Promise.all(Array.from({ length: Number(total) }, () => post('ocupar')))
const ocupados = respuestas.filter((r) => r.status === 200).length
const rechazados = respuestas.filter((r) => r.status === 409).length

console.log(`  200 (cupo ocupado): ${ocupados}`)
console.log(`  409 (sin cupos):    ${rechazados}`)

const despues = await (await fetch(`${base}/viajes/${viajeId}`)).json()
console.log(`Ocupados ahora: ${despues.ocupados} de ${despues.bus.capacidad}`)
console.log(despues.ocupados <= despues.bus.capacidad ? '✓ No se sobrevendió ningún cupo' : '✗ Se sobrevendieron cupos')

await Promise.all(Array.from({ length: ocupados }, () => post('liberar')))
console.log(`Liberados los ${ocupados} cupos de la prueba.`)
