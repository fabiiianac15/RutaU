# RutaU

Sistema de reserva de cupos para el transporte universitario de la UFPSO, entre Ocaña y la sede El Algodonal. Proyecto de la asignatura Arquitectura Orientada a Servicios.

El estudiante consulta las rutas, paradas y horarios del día, ve cuántos cupos quedan en cada viaje y reserva el suyo con su código estudiantil. Al cancelar, el cupo vuelve a quedar libre.

## Arquitectura

| Componente | Carpeta | Responsabilidad |
|---|---|---|
| Frontend | `apps/web` | Interfaz del estudiante (React + Vite) |
| Servicio de Rutas y Viajes | `services/rutas` | Rutas, paradas, buses, viajes y cupos ocupados |
| Servicio de Reservas | `services/reservas` | Reservas de cada estudiante y su estado |

- Los servicios se comunican por HTTP con JSON. Reservas conoce la URL de Rutas por una variable de entorno.
- La base de datos es PostgreSQL en Supabase, con un esquema por servicio (`rutas` y `reservas`). Ningún servicio lee las tablas del otro.
- El frontend y las dos APIs se despliegan en Vercel.

La propuesta completa está en [`docs/propuesta-rutau.docx`](docs/propuesta-rutau.docx).

## Requisitos

- Node.js 22 o superior (ver `.nvmrc`)
- npm 10 o superior

## En producción

| | URL |
|---|---|
| Web | https://rutau-web.vercel.app |
| Servicio de Rutas | https://rutau-rutas.vercel.app/salud |
| Servicio de Reservas | https://rutau-reservas.vercel.app/salud |

Las dos APIs corren en Vercel en la región Portland (`pdx1`), cerca de la base de datos de Supabase en Oregon, y solo aceptan peticiones del navegador (CORS) desde la web.

### En el celular

- **Instalar desde el navegador (PWA):** abre https://rutau-web.vercel.app y elige *Agregar a la pantalla de inicio* (Android) o *Compartir → Agregar a inicio* (iPhone).
- **APK de Android:** la compila GitHub Actions en cada push que toque `apps/web` (`.github/workflows/apk.yml`) y la publica en la release [`apk`](https://github.com/fabiiianac15/RutaU/releases/tag/apk). Descarga `RutaU.apk` en el celular y permite instalar apps de esa fuente. Es una APK de prueba firmada con una clave de depuración: para actualizarla, desinstala la versión anterior.

La APK es la misma web empaquetada con [Capacitor](https://capacitorjs.com) (`apps/web/capacitor.config.ts`, proyecto nativo en `apps/web/android`). Sus peticiones a las APIs salen por la red nativa de Android (CapacitorHttp) y vibra al confirmar una reserva.

### Desplegar

Con `npx vercel login` hecho, cada carpeta enlazada (`npx vercel link`) y los secretos `DATABASE_URL` y `CLAVE_INTERNA` cargados en `rutau-rutas` y `rutau-reservas`:

```bash
bash scripts/desplegar.sh
```

El script despliega Rutas, luego Reservas con la URL de Rutas, luego la web con las URLs de ambas, y por último limita CORS a la URL de la web.

## Desarrollo local

```bash
npm install
cp services/rutas/.env.example services/rutas/.env        # poner DATABASE_URL y CLAVE_INTERNA
cp services/reservas/.env.example services/reservas/.env  # misma DATABASE_URL y CLAVE_INTERNA
cp apps/web/.env.example apps/web/.env

npm run dev:rutas      # http://localhost:3001
npm run dev:reservas   # http://localhost:3002
npm run dev:web        # http://localhost:5173
```

Cada comando va en su propia terminal. `npm test` corre las pruebas de todo el monorepo.

## Integrantes

Fabián José Acosta Acosta, Charis Merieth Conrado Cantillo, Joseph Smith Mamian Bayona, Juan Diego Trigos Benavides, Kevin Alejandro Díaz Franco y Héctor Augusto Alfonso Castilla.
