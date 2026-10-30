import type { CapacitorConfig } from '@capacitor/cli'

// La APK de Android es la misma web (dist/) dentro de una app nativa.
const config: CapacitorConfig = {
  appId: 'co.edu.ufpso.rutau',
  appName: 'RutaU',
  webDir: 'dist',
  backgroundColor: '#ffffff',
  plugins: {
    // Dentro de la APK la app no corre en rutau-web.vercel.app, así que el CORS de las APIs
    // la rechazaría. Con CapacitorHttp las peticiones salen por la red nativa de Android,
    // donde CORS no aplica; en el navegador todo sigue igual.
    CapacitorHttp: { enabled: true },
    // Íconos claros en la barra de estado, sobre la banda roja. Android 15+ dibuja la app
    // de borde a borde y la banda ya respeta env(safe-area-inset-top).
    StatusBar: { style: 'DARK', backgroundColor: '#c71122' },
  },
}

export default config
