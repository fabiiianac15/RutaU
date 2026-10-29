import postgres from 'postgres'
import type { RepositorioRutas, Ruta, Viaje, ViajeDetalle } from './modelo.js'

// Los ids son bigint en la base de datos; se convierten a int para que lleguen como números.
const columnasViaje = (sql: postgres.Sql) => sql`
  v.id::int as id,
  json_build_object('id', r.id::int, 'nombre', r.nombre) as ruta,
  json_build_object('placa', b.placa, 'capacidad', b.capacidad) as bus,
  v.fecha::text as fecha,
  to_char(v.hora_salida, 'HH24:MI') as "horaSalida",
  v.ocupados,
  b.capacidad - v.ocupados as disponibles
`

const paradasDeRuta = (sql: postgres.Sql) => sql`
  coalesce(
    (select json_agg(json_build_object('id', p.id::int, 'nombre', p.nombre, 'orden', p.orden) order by p.orden)
     from rutas.paradas p where p.ruta_id = r.id),
    '[]'
  )
`

export function crearRepositorioPostgres(url: string): RepositorioRutas {
  // prepare: false es obligatorio con el Transaction pooler de Supabase.
  const sql = postgres(url, { prepare: false, max: 5 })

  return {
    async listarRutas() {
      return sql<Ruta[]>`
        select r.id::int as id, r.nombre, r.descripcion, ${paradasDeRuta(sql)} as paradas
        from rutas.rutas r
        where r.activa
        order by r.nombre
      `
    },

    async listarViajes(fecha) {
      return sql<Viaje[]>`
        select ${columnasViaje(sql)}
        from rutas.viajes v
        join rutas.rutas r on r.id = v.ruta_id
        join rutas.buses b on b.id = v.bus_id
        where v.fecha = ${fecha} and r.activa
        order by v.hora_salida, r.nombre
      `
    },

    async obtenerViaje(id) {
      const [viaje] = await sql<ViajeDetalle[]>`
        select ${columnasViaje(sql)}, ${paradasDeRuta(sql)} as paradas
        from rutas.viajes v
        join rutas.rutas r on r.id = v.ruta_id
        join rutas.buses b on b.id = v.bus_id
        where v.id = ${id}
      `
      return viaje ?? null
    },
  }
}
