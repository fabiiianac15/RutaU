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

En `.env`, `CLAVE_INTERNA` debe ser la misma del Servicio de Rutas. El servicio queda en `http://localhost:3002`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio y de su dependencia, el Servicio de Rutas |

`/salud` responde 200 con `"estado": "ok"` si Rutas responde, y 503 con `"estado": "degradado"` si no.

Si Rutas no responde, tarda más de 5 segundos o rechaza la clave interna, los endpoints responden **502** con `{ "error": "El servicio de Rutas no está disponible, intenta de nuevo en un momento" }`.

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
  index.ts          Entrada en Vercel: crea la app con el cliente de Rutas
  crear-app.ts      App de Hono: middlewares, endpoints y manejo de errores
  cliente-rutas.ts  Cliente HTTP del Servicio de Rutas
  local.ts          Servidor Node para desarrollo local
  endpoints/        Un archivo por grupo de endpoints
test/               Pruebas con Vitest; el cliente se prueba con un fetch falso
```
