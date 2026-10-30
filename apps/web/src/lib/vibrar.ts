import { Haptics, NotificationType } from '@capacitor/haptics'

// Una vibración corta de "listo" cuando el cupo queda confirmado. En la APK usa la háptica
// nativa; en el navegador Haptics recurre a navigator.vibrate, y donde no exista no hace nada.
export async function vibrarExito() {
  try {
    await Haptics.notification({ type: NotificationType.Success })
  } catch {
    // Sin vibración no se pierde nada: el aviso en pantalla ya confirma la reserva.
  }
}
