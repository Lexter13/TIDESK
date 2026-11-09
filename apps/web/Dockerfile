# ==============================================================
# TIDESK WEB  ·  Next.js 16 (salida standalone)
# Imagen de producción pensada para Dokploy (Docker Swarm + Traefik).
#
# El CONTEXTO DE BUILD ES LA RAÍZ DEL REPOSITORIO: el proyecto es un monorepo npm
# (workspaces) y el único package-lock.json vigente es el de la raíz.
#
# Dokploy -> Application -> Provider (Git) -> Build Type: Dockerfile
#   Branch ................ main
#   Build Path ............ /   (NO /apps/web: Dokploy lo antepone al campo Docker File)
#   Docker File ........... /apps/web/Dockerfile
#   Docker Context Path ... .   (obligatorio: vacío = contexto apps/web y el build se detiene)
#   NEXT_PUBLIC_API_URL ... URL pública de la API (termina en /api/v1). Por defecto se usa
#       https://api-tidesk.episundc.pe/api/v1. Para cambiarla va en Environment ->
#       Build-time Arguments (la tarjeta de abajo; Environment Settings es solo runtime).
#       Next.js la incrusta en el JavaScript del navegador al compilar: si cambia,
#       hay que volver a desplegar (no basta con reiniciar).
#   Domains ............... puerto del contenedor: 3000
#   En la API, FRONTEND_URL debe ser la URL pública de esta aplicación (CORS).
#
# Prueba local, desde la raíz del repositorio:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1 -t tidesk-web .
# ==============================================================

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# --- deps: instala el workspace apps/web con el package-lock.json de la raíz ---
FROM base AS deps
COPY package.json package-lock.json ./
# El lock describe los dos workspaces: `npm ci` necesita ambos manifiestos para validarlo.
# Se copian con comodín (package.jso[n]) para que, si el contexto no es la raíz del repo,
# el COPY no falle con un error críptico y el RUN siguiente explique qué hay que corregir.
COPY apps/api/package.jso[n] apps/api/
COPY apps/web/package.jso[n] apps/web/
RUN test -f apps/api/package.json && test -f apps/web/package.json || { \
      echo "ERROR: el contexto de build no es la raiz del repositorio (falta apps/api/package.json o apps/web/package.json)." >&2; \
      echo "En Dokploy: Build Path '/', Docker File '/apps/web/Dockerfile' y Docker Context Path '.'." >&2; \
      exit 1; }
RUN npm ci --workspace=apps/web --no-audit --no-fund

# --- build: next build con salida standalone ---
FROM deps AS build
# URL pública de la API. Next.js la incrusta en el JavaScript del navegador al compilar.
# Por defecto, la de producción de la UNDC; para otra, pasar el Build Time Argument.
ARG NEXT_PUBLIC_API_URL=https://api-tidesk.episundc.pe/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
RUN test -n "${NEXT_PUBLIC_API_URL}" || { \
      echo "ERROR: NEXT_PUBLIC_API_URL esta vacia (Dokploy -> Environment -> Build-time Arguments)." >&2; \
      exit 1; }
COPY apps/web apps/web
WORKDIR /app/apps/web
# NEXT_OUTPUT=standalone + outputFileTracingRoot (ver next.config.ts) dejan el servidor en
# .next/standalone/apps/web/server.js, porque las dependencias están hoisteadas en /node_modules.
RUN npm run build \
 && test -f .next/standalone/apps/web/server.js

# --- runner: imagen final (usuario no root, solo lo necesario para servir) ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/login').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
