import { Scalar } from '@scalar/hono-api-reference'

// Tema de la documentación con la identidad de RutaU (ver apps/web/DESIGN.md):
// banda roja UFPSO, papel blanco, tinta y Atkinson Hyperlegible Next.
const tema = `
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;600;700;800&family=Atkinson+Hyperlegible+Mono:wght@400;600&display=swap');

.light-mode, .dark-mode {
  --scalar-font: 'Atkinson Hyperlegible Next', system-ui, sans-serif;
  --scalar-font-code: 'Atkinson Hyperlegible Mono', ui-monospace, monospace;
  --scalar-color-1: #202124;
  --scalar-color-2: #3c4043;
  --scalar-color-3: #5f6368;
  --scalar-color-accent: #c71122;
  --scalar-background-1: #ffffff;
  --scalar-background-2: #f1f3f4;
  --scalar-background-3: #e8eaed;
  --scalar-background-accent: #fbeff0;
  --scalar-border-color: #dadce0;
  --scalar-radius: 8px;
  --scalar-radius-lg: 10px;
  --scalar-radius-xl: 16px;

  --scalar-color-green: #137333;
  --scalar-color-red: #c71122;
  --scalar-color-yellow: #9a6700;
  --scalar-color-blue: #1a5fb4;
  --scalar-color-orange: #b0520a;
  --scalar-color-purple: #6f3fb0;

  --scalar-button-1: #c71122;
  --scalar-button-1-hover: #9e0d1b;
  --scalar-button-1-color: #ffffff;

  --scalar-sidebar-background-1: #ffffff;
  --scalar-sidebar-color-1: #202124;
  --scalar-sidebar-color-2: #3c4043;
  --scalar-sidebar-color-active: #9e0d1b;
  --scalar-sidebar-item-hover-background: #f1f3f4;
  --scalar-sidebar-item-hover-color: #202124;
  --scalar-sidebar-item-active-background: #fbeff0;
  --scalar-sidebar-border-color: #dadce0;
  --scalar-sidebar-search-background: #ffffff;
  --scalar-sidebar-search-color: #5f6368;
  --scalar-sidebar-search-border-color: #dadce0;
}

/* La banda roja de RutaU arriba, como en la web. */
body::before {
  content: '';
  position: fixed;
  inset: 0 0 auto 0;
  height: 6px;
  background: #c71122;
  z-index: 1000;
}

.sidebar-heading-type { font-weight: 700; }
.t-doc__sidebar .sidebar-search { box-shadow: none; }
code, pre { font-variant-numeric: tabular-nums; }
::selection { background: #ebc0c5; color: #202124; }
`

// Sirve la referencia interactiva en /docs y el documento en /docs/openapi.json.
// El servidor se toma de la petición, así los ejemplos y "Probar solicitud" apuntan
// a donde esté corriendo la API (localhost o Vercel).
export function endpointsDocumentacion(titulo: string, documento: object) {
  return Scalar.serve({
    document: (c) => ({ ...documento, servers: [{ url: new URL(c.req.url).origin, description: 'Este servidor' }] }),
    documentPath: '/openapi.json',
    pageTitle: titulo,
    theme: 'none',
    customCss: tema,
    withDefaultFonts: false,
    forceDarkModeState: 'light',
    hideDarkModeToggle: true,
    hideClientButton: true,
    defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
    localization: { locale: 'es' },
    telemetry: false,
    showDeveloperTools: 'never',
    agent: { disabled: true },
    favicon: 'https://rutau-web.vercel.app/icono.svg',
  })
}
