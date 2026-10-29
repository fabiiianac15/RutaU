import { Hono } from 'hono'
import type { RepositorioRutas } from '../modelo.js'

export function endpointsRutas(repo: RepositorioRutas) {
  const app = new Hono()

  app.get('/', async (c) => c.json(await repo.listarRutas()))

  return app
}
