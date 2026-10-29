import postgres from 'postgres'
import type { DatosReserva, RepositorioReservas, Reserva } from './modelo.js'

// Los ids bigint se convierten a int y las fechas a texto ISO 8601 (to_json),
// así llegan como números y strings en vez de strings y objetos Date.
const columnas = (sql: postgres.Sql) => sql`
  id,
  codigo_estudiante as "codigoEstudiante",
  nombre,
  viaje_id::int as "viajeId",
  parada_id::int as "paradaId",
  estado,
  to_json(creado_en) #>> '{}' as "creadoEn",
  to_json(cancelado_en) #>> '{}' as "canceladoEn"
`

// Código de Postgres para una violación de índice único (reservas_activa_unica_idx).
const VIOLACION_UNICA = '23505'

export function crearRepositorioPostgres(url: string): RepositorioReservas {
  // Misma configuración que el Servicio de Rutas para el Transaction pooler de Supabase:
  // sin sentencias preparadas y una sola consulta en vuelo por conexión.
  const sql = postgres(url, { prepare: false, max: 5, max_pipeline: 1 })

  return {
    async crear(datos: DatosReserva) {
      try {
        const [reserva] = await sql<Reserva[]>`
          insert into reservas.reservas (codigo_estudiante, nombre, viaje_id, parada_id)
          values (${datos.codigoEstudiante}, ${datos.nombre}, ${datos.viajeId}, ${datos.paradaId})
          returning ${columnas(sql)}
        `
        return reserva!
      } catch (err) {
        if (err instanceof postgres.PostgresError && err.code === VIOLACION_UNICA) return 'duplicada'
        throw err
      }
    },

    async obtener(id) {
      const [reserva] = await sql<Reserva[]>`select ${columnas(sql)} from reservas.reservas where id = ${id}`
      return reserva ?? null
    },

    async tieneActiva(codigoEstudiante, viajeId) {
      const [fila] = await sql`
        select 1 from reservas.reservas
        where codigo_estudiante = ${codigoEstudiante} and viaje_id = ${viajeId} and estado = 'activa'
      `
      return Boolean(fila)
    },

    async listarPorCodigo(codigoEstudiante) {
      return sql<Reserva[]>`
        select ${columnas(sql)} from reservas.reservas
        where codigo_estudiante = ${codigoEstudiante}
        order by creado_en desc
      `
    },

    async cancelar(id) {
      const [reserva] = await sql<Reserva[]>`
        update reservas.reservas
        set estado = 'cancelada', cancelado_en = now()
        where id = ${id} and estado = 'activa'
        returning ${columnas(sql)}
      `
      return reserva ?? null
    },

    async reactivar(id) {
      await sql`update reservas.reservas set estado = 'activa', cancelado_en = null where id = ${id}`
    },
  }
}
