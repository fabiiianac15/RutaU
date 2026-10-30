#!/usr/bin/env bash
# Despliega RutaU en Vercel en el orden correcto y conecta los servicios entre sí:
#   1. Rutas  →  2. Reservas (con la URL de Rutas)  →  3. Web (con las URLs de ambas APIs)
#   4. Vuelve a desplegar las APIs aceptando solo peticiones (CORS) desde la URL de la web.
#
# Requisitos: haber hecho `npx vercel login`, `npx vercel link` en cada carpeta, y tener
# DATABASE_URL y CLAVE_INTERNA cargadas en los proyectos rutau-rutas y rutau-reservas.
#
# Uso: bash scripts/desplegar.sh
set -euo pipefail
# Sin esto, un despliegue fallido dentro de $(...) no detiene el script.
shopt -s inherit_errexit
cd "$(dirname "$0")/.."

vercel() { npx --yes vercel@latest "$@"; }

# Reemplaza una variable de entorno de producción (no se usa para secretos).
poner_variable() {
  local carpeta=$1 nombre=$2 valor=$3
  (cd "$carpeta" && vercel env rm "$nombre" production --yes >/dev/null 2>&1 || true)
  (cd "$carpeta" && printf '%s' "$valor" | vercel env add "$nombre" production >/dev/null)
  echo "  $carpeta: $nombre=$valor"
}

# Despliega a producción e imprime el dominio público del proyecto (*.vercel.app),
# que no cambia entre despliegues, a diferencia de la URL de cada despliegue.
desplegar() {
  local carpeta=$1 url dominio
  url=$(cd "$carpeta" && vercel deploy --prod --yes | tail -1)
  dominio=$(cd "$carpeta" && vercel inspect "$url" 2>&1 | grep -oE 'https://[a-z0-9-]+\.vercel\.app' | grep -v -- '-git-' | awk '{ print length, $0 }' | sort -n | head -1 | cut -d' ' -f2)
  echo "${dominio:-$url}"
}

echo "1/4 Desplegando el Servicio de Rutas..."
RUTAS=$(desplegar services/rutas)
echo "  → $RUTAS"

echo "2/4 Desplegando el Servicio de Reservas..."
poner_variable services/reservas RUTAS_URL "$RUTAS"
RESERVAS=$(desplegar services/reservas)
echo "  → $RESERVAS"

echo "3/4 Desplegando la web..."
poner_variable apps/web VITE_RUTAS_URL "$RUTAS"
poner_variable apps/web VITE_RESERVAS_URL "$RESERVAS"
WEB=$(desplegar apps/web)
echo "  → $WEB"

echo "4/4 Limitando CORS a la web y redesplegando las APIs..."
poner_variable services/rutas ORIGENES_PERMITIDOS "$WEB"
poner_variable services/reservas ORIGENES_PERMITIDOS "$WEB"
desplegar services/rutas >/dev/null
desplegar services/reservas >/dev/null

echo
echo "Listo:"
echo "  Web:      $WEB"
echo "  Rutas:    $RUTAS/salud"
echo "  Reservas: $RESERVAS/salud"
curl -s "$RESERVAS/salud" && echo
