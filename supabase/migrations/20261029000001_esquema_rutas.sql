-- Esquema del Servicio de Rutas y Viajes.
-- Solo la API de Rutas lee y escribe aquí. Es la única dueña de los cupos.

create schema if not exists rutas;

create table rutas.rutas (
  id          bigint generated always as identity primary key,
  nombre      text not null unique,
  descripcion text,
  activa      boolean not null default true,
  creado_en   timestamptz not null default now()
);

create table rutas.paradas (
  id      bigint generated always as identity primary key,
  ruta_id bigint not null references rutas.rutas (id) on delete cascade,
  nombre  text not null,
  orden   integer not null check (orden > 0),
  unique (ruta_id, orden)
);

create table rutas.buses (
  id        bigint generated always as identity primary key,
  placa     text not null unique,
  capacidad integer not null check (capacidad > 0)
);

-- Un viaje es una ruta recorrida por un bus en una fecha y hora.
-- "ocupados" solo cambia con UPDATE ... WHERE ocupados < capacidad,
-- así dos reservas simultáneas nunca toman el mismo último cupo.
create table rutas.viajes (
  id          bigint generated always as identity primary key,
  ruta_id     bigint not null references rutas.rutas (id),
  bus_id      bigint not null references rutas.buses (id),
  fecha       date not null,
  hora_salida time not null,
  ocupados    integer not null default 0 check (ocupados >= 0),
  unique (bus_id, fecha, hora_salida)
);

create index viajes_fecha_idx on rutas.viajes (fecha, hora_salida);
create index paradas_ruta_idx on rutas.paradas (ruta_id, orden);

-- El esquema no se expone por la API REST de Supabase; solo se accede con la conexión de la API.
revoke all on schema rutas from anon, authenticated;
