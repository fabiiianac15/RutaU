-- Datos de prueba. Los viajes se generan desde hoy y por 7 días,
-- así la demo siempre tiene viajes en el día actual.

insert into rutas.rutas (nombre, descripcion) values
  ('Ruta Centro',  'Centro de Ocaña hacia la sede El Algodonal'),
  ('Ruta Terminal', 'Terminal de Transportes hacia la sede El Algodonal');

insert into rutas.paradas (ruta_id, nombre, orden)
select r.id, p.nombre, p.orden
from rutas.rutas r
join (values
  ('Ruta Centro',   'Parque 29 de Mayo',              1),
  ('Ruta Centro',   'Hospital Emiro Quintero Cañizares', 2),
  ('Ruta Centro',   'Sede El Algodonal',              3),
  ('Ruta Terminal', 'Terminal de Transportes',        1),
  ('Ruta Terminal', 'Glorieta de la Avenida Circunvalar', 2),
  ('Ruta Terminal', 'Sede El Algodonal',              3)
) as p (ruta, nombre, orden) on p.ruta = r.nombre;

-- El bus de 3 cupos sirve para mostrar en la demo un viaje lleno.
insert into rutas.buses (placa, capacidad) values
  ('UFP-101', 40),
  ('UFP-102', 30),
  ('UFP-103', 3);

insert into rutas.viajes (ruta_id, bus_id, fecha, hora_salida)
select r.id, b.id, current_date + d, h.hora::time
from (values
  ('Ruta Centro',   'UFP-101', '06:00'),
  ('Ruta Centro',   'UFP-101', '12:30'),
  ('Ruta Centro',   'UFP-103', '17:00'),
  ('Ruta Terminal', 'UFP-102', '06:15'),
  ('Ruta Terminal', 'UFP-102', '13:00')
) as h (ruta, placa, hora)
join rutas.rutas r on r.nombre = h.ruta
join rutas.buses b on b.placa = h.placa
cross join generate_series(0, 6) as d;
