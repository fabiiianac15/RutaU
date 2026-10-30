import { z } from 'zod'
import { consultaReservas, cuerpoReserva, parametroId } from './validacion.js'

// Documento OpenAPI del Servicio de Reservas. El cuerpo y los parámetros se generan
// desde los mismos esquemas Zod que valida la API, así la documentación no se separa del código.
// test/openapi.test.ts comprueba que cada endpoint de la app esté documentado.

// Quita $schema y el máximo que Zod les pone a los enteros (Number.MAX_SAFE_INTEGER), que solo es ruido.
const esquema = (s: z.ZodType) => {
  const { $schema, ...resto } = z.toJSONSchema(s) as Record<string, unknown>
  return JSON.parse(JSON.stringify(resto).replaceAll(`,"maximum":${Number.MAX_SAFE_INTEGER}`, ''))
}

const error = (descripcion: string, ejemplo: string) => ({
  description: descripcion,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { error: ejemplo } } },
})

const reservaEjemplo = {
  id: '38c1e05d-3caf-4863-856c-3d45f1610314',
  codigoEstudiante: '192345',
  nombre: 'Ana Pérez',
  viajeId: 8,
  paradaId: 1,
  estado: 'activa',
  creadoEn: '2026-10-29T23:13:38.537393+00:00',
  canceladoEn: null,
  viaje: { id: 8, ruta: { id: 1, nombre: 'Ruta Centro' }, fecha: '2026-10-30', horaSalida: '17:00' },
  parada: { id: 1, nombre: 'Parque 29 de Mayo', orden: 1 },
}

const sinRutas = error(
  'El Servicio de Rutas no responde, tarda más de 5 segundos o rechaza la clave interna',
  'El servicio de Rutas no está disponible, intenta de nuevo en un momento',
)

export const documentoOpenApi = {
  openapi: '3.1.0',
  info: {
    title: 'RutaU · Servicio de Reservas',
    version: '1.0.0',
    description: [
      'API complementaria de **RutaU**. Registra qué estudiante reservó qué viaje, en qué parada sube y si la reserva está activa o cancelada.',
      '',
      'No sabe nada de cupos: para crear o cancelar una reserva le pregunta al **Servicio de Rutas** por HTTP.',
      '',
      '1. Valida el viaje y la parada con `GET /viajes/{id}` de Rutas.',
      '2. Ocupa el cupo con `POST /viajes/{id}/ocupar`. Si Rutas responde 409, la reserva se rechaza con "sin cupos".',
      '3. Solo entonces guarda la reserva. Si guardar falla, libera el cupo (compensación).',
      '',
      'Al cancelar, marca la reserva y libera el cupo; si Rutas no responde, deshace la cancelación y responde 502.',
    ].join('\n'),
  },
  tags: [
    { name: 'Reservas', description: 'Crear, consultar y cancelar reservas.' },
    { name: 'Salud', description: 'Estado del servicio y de su dependencia, el Servicio de Rutas.' },
  ],
  paths: {
    '/reservas': {
      post: {
        tags: ['Reservas'],
        summary: 'Crear una reserva',
        description: 'Valida el viaje y la parada con Rutas, ocupa el cupo y guarda la reserva.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: esquema(cuerpoReserva),
              example: { codigoEstudiante: '192345', nombre: 'Ana Pérez', viajeId: 8, paradaId: 1 },
            },
          },
        },
        responses: {
          201: {
            description: 'Reserva creada; el cupo quedó ocupado en Rutas',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Reserva' }, example: reservaEjemplo } },
          },
          400: error('Datos inválidos, o la parada no pertenece a la ruta del viaje', 'La parada no pertenece a la ruta de este viaje'),
          404: error('El viaje no existe en Rutas', 'El viaje no existe'),
          409: error('Viaje lleno, reserva repetida o viaje que ya salió', 'El viaje ya no tiene cupos disponibles'),
          502: sinRutas,
        },
      },
      get: {
        tags: ['Reservas'],
        summary: 'Reservas de un estudiante',
        description: 'Todas las reservas del código, de la más reciente a la más antigua, con el detalle del viaje y la parada que trae de Rutas.',
        parameters: [
          { name: 'codigo', in: 'query', required: true, description: 'Código estudiantil', schema: esquema(consultaReservas.shape.codigo), example: '192345' },
        ],
        responses: {
          200: {
            description: 'Reservas del estudiante',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Reserva' } },
                example: [reservaEjemplo],
              },
            },
          },
          400: error('El código no es válido', 'El código estudiantil debe tener entre 4 y 12 dígitos'),
          502: sinRutas,
        },
      },
    },
    '/reservas/{id}': {
      delete: {
        tags: ['Reservas'],
        summary: 'Cancelar una reserva',
        description: 'Marca la reserva como cancelada y le pide a Rutas que libere el cupo.',
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'Id de la reserva', schema: esquema(parametroId.shape.id), example: reservaEjemplo.id },
        ],
        responses: {
          200: {
            description: 'Reserva cancelada; el cupo volvió a quedar libre',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Reserva' },
                example: { ...reservaEjemplo, estado: 'cancelada', canceladoEn: '2026-10-29T23:20:00.000000+00:00' },
              },
            },
          },
          400: error('El id no es un UUID', 'El id de la reserva no es válido'),
          404: error('La reserva no existe', 'La reserva no existe'),
          409: error('La reserva ya estaba cancelada o el viaje ya salió', 'La reserva ya estaba cancelada'),
          502: sinRutas,
        },
      },
    },
    '/salud': {
      get: {
        tags: ['Salud'],
        summary: 'Estado del servicio',
        description: 'Responde 503 con estado "degradado" si el Servicio de Rutas no responde.',
        responses: {
          200: {
            description: 'Reservas y Rutas responden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Salud' },
                example: { servicio: 'reservas', estado: 'ok', dependencias: { rutas: 'ok' } },
              },
            },
          },
          503: {
            description: 'Rutas no responde',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Salud' },
                example: { servicio: 'reservas', estado: 'degradado', dependencias: { rutas: 'no-disponible' } },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Reserva: {
        type: 'object',
        required: ['id', 'codigoEstudiante', 'nombre', 'viajeId', 'paradaId', 'estado', 'creadoEn', 'canceladoEn', 'viaje', 'parada'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          codigoEstudiante: { type: 'string' },
          nombre: { type: 'string' },
          viajeId: { type: 'integer', description: 'Id del viaje en el Servicio de Rutas' },
          paradaId: { type: 'integer', description: 'Id de la parada en el Servicio de Rutas' },
          estado: { type: 'string', enum: ['activa', 'cancelada'] },
          creadoEn: { type: 'string', format: 'date-time' },
          canceladoEn: { type: ['string', 'null'], format: 'date-time' },
          viaje: {
            description: 'Detalle traído de Rutas; null si Rutas ya no tiene ese viaje',
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  ruta: { type: 'object', properties: { id: { type: 'integer' }, nombre: { type: 'string' } } },
                  fecha: { type: 'string', format: 'date' },
                  horaSalida: { type: 'string' },
                },
              },
              { type: 'null' },
            ],
          },
          parada: {
            oneOf: [
              { type: 'object', properties: { id: { type: 'integer' }, nombre: { type: 'string' }, orden: { type: 'integer' } } },
              { type: 'null' },
            ],
          },
        },
      },
      Salud: {
        type: 'object',
        properties: {
          servicio: { type: 'string' },
          estado: { type: 'string', enum: ['ok', 'degradado'] },
          dependencias: { type: 'object', properties: { rutas: { type: 'string', enum: ['ok', 'no-disponible'] } } },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string', description: 'Mensaje para mostrarle al estudiante' } },
      },
    },
  },
}
