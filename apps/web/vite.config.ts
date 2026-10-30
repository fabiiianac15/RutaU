import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // RutaU se instala en el celular desde el navegador ("Agregar a la pantalla de inicio").
    // Solo se guarda la app (HTML, estilos, fuentes, íconos); los cupos siempre se piden a la API,
    // porque un cupo guardado en caché podría ser falso.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icono.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'RutaU · Reserva tu cupo',
        short_name: 'RutaU',
        description: 'Reserva tu cupo en el bus universitario de la UFPSO entre Ocaña y la sede El Algodonal.',
        lang: 'es-CO',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#c71122',
        background_color: '#ffffff',
        categories: ['education', 'travel'],
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [{ name: 'Mis reservas', short_name: 'Mis reservas', url: '/#/mis-reservas' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
  },
})
