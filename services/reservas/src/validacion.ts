import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'

const codigoEstudiante = z
  .string({ error: 'El código estudiantil es obligatorio' })
  .regex(/^[0-9]{4,12}$/, { error: 'El código estudiantil debe tener entre 4 y 12 dígitos' })

const idDeRutas = (campo: string) =>
  z.number({ error: `${campo} debe ser un número` }).int({ error: `${campo} debe ser un número entero` }).positive({ error: `${campo} debe ser positivo` })

export const cuerpoReserva = z.object({
  codigoEstudiante,
  nombre: z
    .string({ error: 'El nombre es obligatorio' })
    .trim()
    .min(1, { error: 'El nombre es obligatorio' })
    .max(100, { error: 'El nombre no puede tener más de 100 caracteres' }),
  viajeId: idDeRutas('viajeId'),
  paradaId: idDeRutas('paradaId'),
})

export const consultaReservas = z.object({ codigo: codigoEstudiante })

export const parametroId = z.object({ id: z.uuid({ error: 'El id de la reserva no es válido' }) })

// Responde 400 con el primer mensaje de validación, en el mismo formato { error } del resto de la API.
export const alFallar = (resultado: { success: boolean; error?: { issues: { message: string }[] } }) => {
  if (!resultado.success) {
    throw new HTTPException(400, { message: resultado.error?.issues[0]?.message ?? 'Solicitud inválida' })
  }
}
