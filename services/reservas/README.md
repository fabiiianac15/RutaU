# Servicio de Reservas

API complementaria de RutaU. Registra qué estudiante reservó qué viaje, en qué parada sube y si la reserva está activa o cancelada.

No sabe nada de cupos: para crear o cancelar una reserva le pregunta al Servicio de Rutas por HTTP. Nunca lee las tablas del esquema `rutas`.

Hecha con [Hono](https://hono.dev) y TypeScript.

## Desarrollo local

Necesita el Servicio de Rutas corriendo.

```bash
cp services/reservas/.env.example services/reservas/.env
npm run dev:rutas      # en una terminal
npm run dev:reservas   # en otra
```

En `.env` van la `DATABASE_URL` de Supabase y la misma `CLAVE_INTERNA` del Servicio de Rutas. El servicio queda en `http://localhost:3002`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio y de su dependencia, el Servicio de Rutas |
| POST | `/reservas` | Crear una reserva |
| GET | `/reservas?codigo=` | Reservas de un estudiante, de la más reciente a la más antigua |
| DELETE | `/reservas/{id}` | Cancelar una reserva |

`/salud` responde 200 con `"estado": "ok"` si Rutas responde, y 503 con `"estado": "degradado"` si no.

### Crear una reserva

```json
POST /reservas
{ "codigoEstudiante": "192345", "nombre": "Ana Pérez", "viajeId": 8, "paradaId": 1 }
```

1. Pide el viaje a Rutas (`GET /viajes/{id}`) y comprueba que la parada sea de su ruta y que el viaje no haya salido.
2. Comprueba que el estudiante no tenga ya una reserva activa en ese viaje.
3. Pide a Rutas que ocupe el cupo (`POST /viajes/{id}/ocupar`). Si Rutas responde 409, la reserva se rechaza con "sin cupos".
4. Solo entonces guarda la reserva. Si guardar falla, le pide a Rutas que libere el cupo, para no dejarlo ocupado sin dueño.

Responde **201** con la reserva y el detalle del viaje y la parada:

```json
{
  "id": "38c1e05d-3caf-4863-856c-3d45f1610314",
  "codigoEstudiante": "192345",
  "nombre": "Ana Pérez",
  "viajeId": 8,
  "paradaId": 1,
  "estado": "activa",
  "creadoEn": "2026-10-29T23:13:38.537393+00:00",
  "canceladoEn": null,
  "viaje": { "id": 8, "ruta": { "id": 1, "nombre": "Ruta Centro" }, "fecha": "2026-10-30", "horaSalida": "17:00" },
  "parada": { "id": 1, "nombre": "Parque 29 de Mayo", "orden": 1 }
}
```

`GET /reservas?codigo=` responde una lista con la misma forma. Consulta a Rutas una vez por viaje distinto, no por reserva.

### Cancelar una reserva

Marca la reserva como cancelada y luego pide a Rutas que libere el cupo. Si Rutas no responde, deshace la cancelación y responde 502, así la reserva y el cupo nunca quedan en desacuerdo.

### Errores

Todos responden `{ "error": "mensaje" }`.

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, o la parada no pertenece a la ruta del viaje |
| 404 | El viaje o la reserva no existen |
| 409 | Viaje lleno, reserva repetida, viaje que ya salió o reserva ya cancelada |
| 502 | El Servicio de Rutas no responde, tarda más de 5 segundos o rechaza la clave interna |

## Comunicación con Rutas

`src/cliente-rutas.ts` es el único lugar que conoce la API de Rutas:

| Método del cliente | Llama a | Devuelve |
|---|---|---|
| `obtenerViaje(id)` | `GET /viajes/{id}` | El viaje con sus paradas, o `null` si no existe |
| `ocuparCupo(id)` | `POST /viajes/{id}/ocupar` | `ok`, `lleno` o `no-existe` |
| `liberarCupo(id)` | `POST /viajes/{id}/liberar` | `ok`, `sin-ocupados` o `no-existe` |
| `disponible()` | `GET /salud` | `true` si Rutas responde |

`ocupar` y `liberar` se envían con `Authorization: Bearer <CLAVE_INTERNA>`.

## Estructura

```
src/
  index.ts                 Entrada en Vercel: crea la app con Postgres y el cliente de Rutas
  crear-app.ts             App de Hono: middlewares, endpoints y manejo de errores
  modelo.ts                Tipos y la interfaz RepositorioReservas
  repositorio-postgres.ts  Consultas al esquema reservas de Supabase
  cliente-rutas.ts         Cliente HTTP del Servicio de Rutas
  validacion.ts            Esquemas de validación de las solicitudes
  local.ts                 Servidor Node para desarrollo local
  endpoints/               Un archivo por grupo de endpoints
test/                      Pruebas con Vitest, con Rutas y la base de datos simulados en memoria
```
