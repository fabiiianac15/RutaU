import { Hono } from 'hono'

export const salud = new Hono()

salud.get('/', (c) => c.json({ servicio: 'rutas', estado: 'ok' }))
