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

## Integrantes

Fabián José Acosta Acosta, Charis Merieth Conrado Cantillo, Joseph Smith Mamian Bayona, Juan Diego Trigos Benavides, Kevin Alejandro Díaz Franco y Héctor Augusto Alfonso Castilla.
