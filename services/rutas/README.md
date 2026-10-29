# Servicio de Rutas y Viajes

API principal de RutaU. Gestiona las rutas, sus paradas, los buses y los viajes programados, y es la única que controla los cupos ocupados de cada viaje.

Hecha con [Hono](https://hono.dev) y TypeScript.

## Desarrollo local

```bash
cp services/rutas/.env.example services/rutas/.env
npm run dev:rutas
```

En `.env` hay que poner la `DATABASE_URL` del proyecto de Supabase. El servicio queda en `http://localhost:3001`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio |
| GET | `/rutas` | Rutas activas con sus paradas en orden |
| GET | `/viajes?fecha=AAAA-MM-DD` | Viajes del día con cupos disponibles. Sin `fecha`, usa el día de hoy en Colombia |
| GET | `/viajes/{id}` | Detalle de un viaje, con las paradas de su ruta |

Los errores siempre responden `{ "error": "mensaje" }`: 400 si la solicitud es inválida, 404 si el recurso no existe.

Ejemplo de viaje:

```json
{
  "id": 1,
  "ruta": { "id": 1, "nombre": "Ruta Centro" },
  "bus": { "placa": "UFP-101", "capacidad": 40 },
  "fecha": "2026-10-29",
  "horaSalida": "06:00",
  "ocupados": 0,
  "disponibles": 40
}
```

## Estructura

```
src/
  index.ts                 Entrada en Vercel: crea la app con el repositorio de Postgres
  crear-app.ts             App de Hono: middlewares, endpoints y manejo de errores
  modelo.ts                Tipos y la interfaz RepositorioRutas
  repositorio-postgres.ts  Consultas al esquema rutas de Supabase
  local.ts                 Servidor Node para desarrollo local
  endpoints/               Un archivo por grupo de endpoints
test/                      Pruebas con Vitest y un repositorio en memoria
```

Las pruebas no necesitan base de datos: usan `test/repositorio-memoria.ts`.
