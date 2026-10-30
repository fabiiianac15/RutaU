import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

export const consultaViajes = z.object({
  fecha: z.iso.date({ error: 'La fecha debe tener el formato AAAA-MM-DD' }).optional(),
})

export const parametroId = z.object({
  id: z.coerce.number({ error: 'El id debe ser un número' }).int().positive(),
})

// Responde 400 con el primer mensaje de validación, en el mismo formato { error } del resto de la API.
export const alFallar = (resultado: { success: boolean; error?: { issues: { message: string }[] } }) => {
  if (!resultado.success) {
    throw new HTTPException(400, { message: resultado.error?.issues[0]?.message ?? 'Solicitud inválida' })
  }
}
