import postgres from 'postgres'
import type { Cupos, RepositorioRutas, ResultadoCupo, Ruta, Viaje, ViajeDetalle } from './modelo.js'

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
    (select json_agg(
       json_build_object('id', p.id::int, 'nombre', p.nombre, 'orden', p.orden, 'latitud', p.latitud, 'longitud', p.longitud)
       order by p.orden)
     from rutas.paradas p where p.ruta_id = r.id),
    '[]'
  )
`

export function crearRepositorioPostgres(url: string): RepositorioRutas {
  // Configuración para el Transaction pooler de Supabase:
  // - prepare: false, porque el pooler no mantiene sentencias preparadas entre transacciones.
  // - max_pipeline: 1, porque el pooler puede mandar a otra conexión de Postgres las consultas
  //   que llegan seguidas por el mismo socket. Con varias en vuelo, algunas quedaban a medias
  //   sosteniendo el candado de la fila y bloqueaban a las demás.
  const sql = postgres(url, { prepare: false, max: 5, max_pipeline: 1 })

  // El UPDATE con la condición en el WHERE es una sola operación atómica: si dos
  // solicitudes compiten por el último cupo, Postgres bloquea la fila y la segunda
  // vuelve a evaluar la condición con el valor ya actualizado, así que no cambia nada.
  const moverCupo = async (viajeId: number, actualizado: Promise<Cupos[]>): Promise<ResultadoCupo> => {
    const [cupos] = await actualizado
    if (cupos) return { estado: 'ok', cupos }

    const [existe] = await sql`select 1 from rutas.viajes where id = ${viajeId}`
    return existe ? { estado: 'sin-cambio' } : { estado: 'no-existe' }
  }

  return {
    async listarRutas() {
      return sql<Ruta[]>`
        select r.id::int as id, r.nombre, r.descripcion, ${paradasDeRuta(sql)} as paradas,
               r.trazado, r.distancia_m as "distanciaM", r.duracion_min as "duracionMin"
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

    ocuparCupo(viajeId) {
      return moverCupo(viajeId, sql<Cupos[]>`
        update rutas.viajes v
        set ocupados = v.ocupados + 1
        from rutas.buses b
        where v.id = ${viajeId} and b.id = v.bus_id and v.ocupados < b.capacidad
        returning v.id::int as id, v.ocupados, b.capacidad - v.ocupados as disponibles
      `)
    },

    liberarCupo(viajeId) {
      return moverCupo(viajeId, sql<Cupos[]>`
        update rutas.viajes v
        set ocupados = v.ocupados - 1
        from rutas.buses b
        where v.id = ${viajeId} and b.id = v.bus_id and v.ocupados > 0
        returning v.id::int as id, v.ocupados, b.capacidad - v.ocupados as disponibles
      `)
    },
  }
}
