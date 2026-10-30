# Base de datos

PostgreSQL en Supabase, con un esquema por servicio:

| Esquema | Tablas | Dueño |
|---|---|---|
| `rutas` | `rutas`, `paradas`, `buses`, `viajes` | Servicio de Rutas y Viajes |
| `reservas` | `reservas` | Servicio de Reservas |

`reservas.viaje_id` y `reservas.parada_id` no son llaves foráneas hacia `rutas`. El Servicio de Reservas los valida llamando a la API de Rutas, nunca leyendo sus tablas.

## Reglas que garantiza la base de datos

- `viajes.ocupados` nunca es negativo. La API lo sube con `UPDATE ... WHERE ocupados < capacidad`, que es atómico.
- Un estudiante solo puede tener una reserva **activa** por viaje. Si la cancela, puede volver a reservar.
- El código estudiantil debe tener entre 4 y 12 dígitos.
- Una reserva cancelada siempre tiene `cancelado_en`.

## Cómo aplicarla

**Desde el panel de Supabase:** en *SQL Editor*, ejecutar en este orden:

1. `migrations/20261029000001_esquema_rutas.sql`
2. `migrations/20261029000002_esquema_reservas.sql`
3. `migrations/20261030000001_mapa_de_rutas.sql` (coordenadas de las paradas y recorrido de cada ruta)
4. `seed.sql` (datos de prueba, ya con coordenadas y recorridos)

En una base que ya tiene los datos de prueba, basta con ejecutar la migración 3: agrega las columnas y llena las coordenadas y los recorridos.

Las coordenadas vienen de OpenStreetMap (Nominatim) y los recorridos se calcularon con OSRM sobre la red vial de Ocaña.

**Con la CLI de Supabase:**

```bash
supabase link --project-ref <ref-del-proyecto>
supabase db push
psql "<cadena-de-conexión>" -f supabase/seed.sql
```

Los datos de prueba crean 2 rutas, 3 buses y 5 viajes diarios durante 7 días a partir de la fecha en que se ejecuta. El bus `UFP-103` tiene solo 3 cupos, para mostrar en la demo un viaje lleno.
