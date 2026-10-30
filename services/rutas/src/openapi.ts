import { z } from 'zod'
import { consultaViajes } from './validacion.js'

// Documento OpenAPI del Servicio de Rutas y Viajes. Los parámetros que la API valida con Zod
// se convierten desde los mismos esquemas, así la documentación no se separa del código.
// test/openapi.test.ts comprueba que cada endpoint de la app esté documentado.

const { $schema, ...esquemaFecha } = z.toJSONSchema(consultaViajes.shape.fecha.unwrap()) as Record<string, unknown>

const error = (descripcion: string, ejemplo: string) => ({
  description: descripcion,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { error: ejemplo } } },
})

const json = (ref: string, descripcion: string, ejemplo?: unknown) => ({
  description: descripcion,
  content: { 'application/json': { schema: { $ref: `#/components/schemas/${ref}` }, ...(ejemplo ? { example: ejemplo } : {}) } },
})

const idViaje = {
  name: 'id',
  in: 'path',
  required: true,
  description: 'Id del viaje',
  schema: { type: 'integer', minimum: 1 },
  example: 8,
}

const viajeEjemplo = {
  id: 8,
  ruta: { id: 1, nombre: 'Ruta Centro' },
  bus: { placa: 'UFP-103', capacidad: 3 },
  fecha: '2026-10-30',
  horaSalida: '17:00',
  ocupados: 1,
  disponibles: 2,
}

const paradasEjemplo = [
  { id: 1, nombre: 'Parque 29 de Mayo', orden: 1, latitud: 8.235412, longitud: -73.353856 },
  { id: 2, nombre: 'Hospital Emiro Quintero Cañizares', orden: 2, latitud: 8.254306, longitud: -73.358398 },
  { id: 3, nombre: 'Sede El Algodonal', orden: 3, latitud: 8.2352, longitud: -73.32209 },
]

export const documentoOpenApi = {
  openapi: '3.1.0',
  info: {
    title: 'RutaU · Servicio de Rutas y Viajes',
    version: '1.0.0',
    description: [
      'API principal de **RutaU**, el sistema de reserva de cupos del bus universitario de la UFPSO entre Ocaña y la sede El Algodonal.',
      '',
      'Es la única dueña de los cupos: gestiona rutas, paradas, buses y viajes, y ocupa o libera cupos con una operación atómica (`UPDATE … WHERE ocupados < capacidad`), así dos estudiantes nunca se quedan con el mismo último cupo.',
      '',
      'Los endpoints de **Interno** solo los llama el Servicio de Reservas y exigen la clave interna (botón *Authorize*).',
    ].join('\n'),
  },
  tags: [
    { name: 'Rutas', description: 'Rutas y sus paradas en orden.' },
    { name: 'Viajes', description: 'Viajes programados con sus cupos disponibles.' },
    { name: 'Interno', description: 'Ocupar y liberar cupos. Solo para el Servicio de Reservas.' },
    { name: 'Salud', description: 'Estado del servicio.' },
  ],
  paths: {
    '/rutas': {
      get: {
        tags: ['Rutas'],
        summary: 'Listar rutas',
        description: 'Rutas activas con sus paradas en orden, la ubicación de cada parada y el recorrido por las calles (GeoJSON), para dibujarlas en un mapa.',
        responses: {
          200: {
            description: 'Rutas activas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Ruta' } },
                example: [
                  {
                    id: 1,
                    nombre: 'Ruta Centro',
                    descripcion: 'Centro de Ocaña hacia la sede El Algodonal',
                    paradas: paradasEjemplo,
                    trazado: { type: 'LineString', coordinates: [[-73.35402, 8.23499], [-73.35355, 8.2348], [-73.32209, 8.2352]] },
                    distanciaM: 10741,
                    duracionMin: 18,
                  },
                ],
              },
            },
          },
        },
      },
    },
    '/viajes': {
      get: {
        tags: ['Viajes'],
        summary: 'Viajes del día',
        description: 'Viajes de una fecha con sus cupos disponibles, ordenados por hora. Sin `fecha` usa el día de hoy en Colombia (UTC-5).',
        parameters: [
          { name: 'fecha', in: 'query', required: false, description: 'Fecha en formato AAAA-MM-DD', schema: esquemaFecha, example: '2026-10-30' },
        ],
        responses: {
          200: {
            description: 'Viajes del día',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Viaje' } }, example: [viajeEjemplo] } },
          },
          400: error('La fecha no tiene el formato AAAA-MM-DD', 'La fecha debe tener el formato AAAA-MM-DD'),
        },
      },
    },
    '/viajes/{id}': {
      get: {
        tags: ['Viajes'],
        summary: 'Detalle de un viaje',
        description: 'Un viaje con las paradas de su ruta. El Servicio de Reservas lo usa para validar que la parada pertenece al viaje.',
        parameters: [idViaje],
        responses: {
          200: json('ViajeDetalle', 'El viaje con sus paradas', { ...viajeEjemplo, paradas: paradasEjemplo }),
          400: error('El id no es un número', 'El id debe ser un número'),
          404: error('El viaje no existe', 'El viaje no existe'),
        },
      },
    },
    '/viajes/{id}/ocupar': {
      post: {
        tags: ['Interno'],
        summary: 'Ocupar un cupo',
        description: 'Ocupa un cupo con una sola operación atómica. Si el bus está lleno no cambia nada y responde 409.',
        security: [{ claveInterna: [] }],
        parameters: [idViaje],
        responses: {
          200: json('Cupos', 'Cupo ocupado', { id: 8, ocupados: 2, disponibles: 1 }),
          401: error('Falta la clave interna o es incorrecta', 'Este endpoint es solo para servicios internos'),
          404: error('El viaje no existe', 'El viaje no existe'),
          409: error('El bus está lleno', 'El viaje no tiene cupos disponibles'),
        },
      },
    },
    '/viajes/{id}/liberar': {
      post: {
        tags: ['Interno'],
        summary: 'Liberar un cupo',
        description: 'Devuelve un cupo cuando se cancela una reserva, o como compensación si guardar la reserva falló.',
        security: [{ claveInterna: [] }],
        parameters: [idViaje],
        responses: {
          200: json('Cupos', 'Cupo liberado', { id: 8, ocupados: 0, disponibles: 3 }),
          401: error('Falta la clave interna o es incorrecta', 'Este endpoint es solo para servicios internos'),
          404: error('El viaje no existe', 'El viaje no existe'),
          409: error('El viaje no tiene cupos ocupados', 'El viaje no tiene cupos ocupados'),
        },
      },
    },
    '/salud': {
      get: {
        tags: ['Salud'],
        summary: 'Estado del servicio',
        responses: { 200: json('Salud', 'El servicio está activo', { servicio: 'rutas', estado: 'ok' }) },
      },
    },
  },
  components: {
    securitySchemes: {
      claveInterna: {
        type: 'http',
        scheme: 'bearer',
        description: 'Clave compartida entre Rutas y Reservas (variable CLAVE_INTERNA).',
      },
    },
    schemas: {
      Parada: {
        type: 'object',
        required: ['id', 'nombre', 'orden'],
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          orden: { type: 'integer', description: 'Posición de la parada en la ruta, desde 1' },
          latitud: { type: ['number', 'null'], description: 'Latitud (WGS84), de OpenStreetMap' },
          longitud: { type: ['number', 'null'], description: 'Longitud (WGS84), de OpenStreetMap' },
        },
      },
      Ruta: {
        type: 'object',
        required: ['id', 'nombre', 'descripcion', 'paradas', 'trazado', 'distanciaM', 'duracionMin'],
        properties: {
          id: { type: 'integer' },
          nombre: { type: 'string' },
          descripcion: { type: ['string', 'null'] },
          paradas: { type: 'array', items: { $ref: '#/components/schemas/Parada' } },
          trazado: {
            description: 'Recorrido por las calles como GeoJSON LineString; cada punto es [longitud, latitud]',
            oneOf: [
              {
                type: 'object',
                properties: {
                  type: { const: 'LineString' },
                  coordinates: { type: 'array', items: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 } },
                },
              },
              { type: 'null' },
            ],
          },
          distanciaM: { type: ['integer', 'null'], description: 'Largo del recorrido en metros' },
          duracionMin: { type: ['integer', 'null'], description: 'Duración aproximada del recorrido en minutos' },
        },
      },
      Viaje: {
        type: 'object',
        required: ['id', 'ruta', 'bus', 'fecha', 'horaSalida', 'ocupados', 'disponibles'],
        properties: {
          id: { type: 'integer' },
          ruta: { type: 'object', properties: { id: { type: 'integer' }, nombre: { type: 'string' } } },
          bus: { type: 'object', properties: { placa: { type: 'string' }, capacidad: { type: 'integer' } } },
          fecha: { type: 'string', format: 'date' },
          horaSalida: { type: 'string', description: 'Hora de salida HH:MM, hora de Colombia', example: '17:00' },
          ocupados: { type: 'integer' },
          disponibles: { type: 'integer' },
        },
      },
      ViajeDetalle: {
        allOf: [
          { $ref: '#/components/schemas/Viaje' },
          { type: 'object', properties: { paradas: { type: 'array', items: { $ref: '#/components/schemas/Parada' } } } },
        ],
      },
      Cupos: {
        type: 'object',
        required: ['id', 'ocupados', 'disponibles'],
        properties: { id: { type: 'integer' }, ocupados: { type: 'integer' }, disponibles: { type: 'integer' } },
      },
      Salud: {
        type: 'object',
        properties: { servicio: { type: 'string' }, estado: { type: 'string' } },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: { error: { type: 'string', description: 'Mensaje para mostrarle al estudiante' } },
      },
    },
  },
}
