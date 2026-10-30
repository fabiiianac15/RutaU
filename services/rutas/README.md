# Servicio de Rutas y Viajes

API principal de RutaU. Gestiona las rutas, sus paradas, los buses y los viajes programados, y es la única que controla los cupos ocupados de cada viaje.

Hecha con [Hono](https://hono.dev) y TypeScript.

## Desarrollo local

```bash
cp services/rutas/.env.example services/rutas/.env
npm run dev:rutas
```

En `.env` hay que poner la `DATABASE_URL` del proyecto de Supabase y una `CLAVE_INTERNA` (`openssl rand -hex 32`). El servicio queda en `http://localhost:3001`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio |
| GET | `/rutas` | Rutas activas con sus paradas en orden, la ubicación de cada parada y el recorrido por las calles (GeoJSON) |
| GET | `/viajes?fecha=AAAA-MM-DD` | Viajes del día con cupos disponibles. Sin `fecha`, usa el día de hoy en Colombia |
| GET | `/viajes/{id}` | Detalle de un viaje, con las paradas de su ruta |
| POST | `/viajes/{id}/ocupar` | **Interno.** Ocupa un cupo. Responde 409 si el bus está lleno |
| POST | `/viajes/{id}/liberar` | **Interno.** Devuelve un cupo. Responde 409 si no hay cupos ocupados |

Los errores siempre responden `{ "error": "mensaje" }`: 400 si la solicitud es inválida, 401 si falta la clave interna, 404 si el recurso no existe y 409 si no se pudo mover el cupo.

### Endpoints internos

`ocupar` y `liberar` solo los llama el Servicio de Reservas. Exigen el encabezado `Authorization: Bearer <CLAVE_INTERNA>`; sin él cualquiera podría llenar un bus. Responden los cupos actualizados:

```json
{ "id": 3, "ocupados": 1, "disponibles": 2 }
```

Ocupar es un solo `UPDATE ... WHERE ocupados < capacidad`. Si dos solicitudes compiten por el último cupo, Postgres las ordena con el candado de la fila y la segunda no encuentra cupo, así que nunca se sobrevende.

### Prueba de concurrencia

Con el servicio corriendo, lanza muchas solicitudes de ocupar al mismo tiempo sobre un viaje y al final libera lo que ocupó:

```bash
npm run prueba:concurrencia -w @rutau/rutas -- <viajeId> 20
```

Con el bus `UFP-103` (3 cupos) el resultado esperado es 3 respuestas 200 y 17 respuestas 409.

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
  clave-interna.ts         Middleware que protege los endpoints internos
  validacion.ts            Validaciones compartidas
  local.ts                 Servidor Node para desarrollo local
  endpoints/               Un archivo por grupo de endpoints
scripts/                   Prueba de concurrencia contra el servicio corriendo
test/                      Pruebas con Vitest y un repositorio en memoria
```

Las pruebas no necesitan base de datos: usan `test/repositorio-memoria.ts`.
