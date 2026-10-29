import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createHash, timingSafeEqual } from 'node:crypto'

const huella = (texto: string) => createHash('sha256').update(texto).digest()

// Protege los endpoints que solo debe llamar otro servicio (Reservas).
// Espera el encabezado "Authorization: Bearer <clave>". Las huellas tienen siempre
// el mismo largo, así timingSafeEqual no revela nada de la clave por el tiempo de respuesta.
export function exigirClaveInterna(clave: string) {
  const esperada = huella(clave)

  return createMiddleware(async (c, next) => {
    const recibida = c.req.header('Authorization')?.replace(/^Bearer /, '') ?? ''
    if (!timingSafeEqual(huella(recibida), esperada)) {
      throw new HTTPException(401, { message: 'Este endpoint es solo para servicios internos' })
    }
    await next()
  })
}
