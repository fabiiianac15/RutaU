-- Esquema del Servicio de Reservas.
-- Solo la API de Reservas lee y escribe aquí. viaje_id y parada_id apuntan a datos
-- del Servicio de Rutas, por eso no son llaves foráneas: se validan llamando a su API.

create schema if not exists reservas;

create table reservas.reservas (
  id                uuid primary key default gen_random_uuid(),
  codigo_estudiante text not null check (codigo_estudiante ~ '^[0-9]{4,12}$'),
  nombre            text not null check (length(trim(nombre)) > 0),
  viaje_id          bigint not null,
  parada_id         bigint not null,
  estado            text not null default 'activa' check (estado in ('activa', 'cancelada')),
  creado_en         timestamptz not null default now(),
  cancelado_en      timestamptz,
  check ((estado = 'cancelada') = (cancelado_en is not null))
);

-- Un estudiante no puede tener dos reservas activas en el mismo viaje.
create unique index reservas_activa_unica_idx
  on reservas.reservas (codigo_estudiante, viaje_id)
  where estado = 'activa';

create index reservas_codigo_idx on reservas.reservas (codigo_estudiante, creado_en desc);

revoke all on schema reservas from anon, authenticated;
