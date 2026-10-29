# Servicio de Rutas y Viajes

API principal de RutaU. Gestiona las rutas, sus paradas, los buses y los viajes programados, y es la única que controla los cupos ocupados de cada viaje.

Hecha con [Hono](https://hono.dev) y TypeScript.

## Desarrollo local

```bash
cp services/rutas/.env.example services/rutas/.env
npm run dev:rutas
```

El servicio queda en `http://localhost:3001`.

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio |

## Estructura

```
src/
  index.ts       App de Hono: middlewares, rutas y manejo de errores. Es la entrada en Vercel.
  local.ts       Servidor Node para desarrollo local
  endpoints/     Un archivo por grupo de endpoints
test/            Pruebas con Vitest
```
