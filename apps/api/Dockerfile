# ==============================================================
# TIDESK API  ·  NestJS 12 + Prisma 6 + PostgreSQL
# Imagen de producción pensada para Dokploy (Docker Swarm + Traefik).
#
# El CONTEXTO DE BUILD ES LA RAÍZ DEL REPOSITORIO: el proyecto es un monorepo npm
# (workspaces) y el único package-lock.json vigente es el de la raíz.
#
# Dokploy -> Application -> Provider (Git) -> Build Type: Dockerfile
#   Branch ................ main
#   Build Path ............ /   (NO /apps/api: Dokploy lo antepone al campo Docker File)
#   Docker File ........... /apps/api/Dockerfile
#   Docker Context Path ... .   (obligatorio: vacío = contexto apps/api y el build se detiene)
#   Domains ............... puerto del contenedor: 4000
#                           (API en /api/v1 · Swagger en /api/docs)
#   Advanced -> Volumes ... volumen tidesk-uploads -> /app/apps/api/uploads
#                           (adjuntos de los tickets; sin volumen se pierden al redesplegar)
#   Environment ........... variables de apps/api/.env.example
#                           (DATABASE_URL, JWT_SECRET, FRONTEND_URL, SMTP_*)
#
# Opciones de arranque (variables de entorno del contenedor):
#   DB_PUSH_ON_START=true    (por defecto) ejecuta `prisma db push` antes de iniciar.
#   DB_SEED_IF_EMPTY=false   (por defecto) si es true y no hay usuarios, ejecuta prisma/seed.ts.
#                            ATENCION: el seed crea usuarios de demostración con contraseñas
#                            conocidas; cámbielas apenas ingrese.
#
# Prueba local, desde la raíz del repositorio:
#   docker build -f apps/api/Dockerfile -t tidesk-api .
# ==============================================================

ARG NODE_VERSION=22

# --- base: Node (Debian slim) + OpenSSL, que Prisma necesita para elegir su motor ---
FROM node:${NODE_VERSION}-slim AS base
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# --- deps: instala el workspace apps/api con el package-lock.json de la raíz ---
FROM base AS deps
COPY package.json package-lock.json ./
# El lock describe los dos workspaces: `npm ci` necesita ambos manifiestos para validarlo.
# Se copian con comodín (package.jso[n]) para que, si el contexto no es la raíz del repo,
# el COPY no falle con un error críptico y el RUN siguiente explique qué hay que corregir.
COPY apps/api/package.jso[n] apps/api/
COPY apps/web/package.jso[n] apps/web/
RUN test -f apps/api/package.json && test -f apps/web/package.json || { \
      echo "ERROR: el contexto de build no es la raiz del repositorio (falta apps/api/package.json o apps/web/package.json)." >&2; \
      echo "En Dokploy: Build Path '/', Docker File '/apps/api/Dockerfile' y Docker Context Path '.'." >&2; \
      exit 1; }
RUN npm ci --workspace=apps/api --no-audit --no-fund

# --- build: genera el cliente de Prisma y compila NestJS (dist/) ---
FROM deps AS build
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npx prisma generate \
 && npm run build \
 && test -f dist/main.js

# --- runner: imagen final (usuario no root) ---
FROM base AS runner
ENV NODE_ENV=production \
    PORT=4000 \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1
WORKDIR /app/apps/api

COPY --from=build --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/apps/api/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/api/package.json ./package.json
COPY --from=build --chown=node:node /app/apps/api/dist ./dist
COPY --from=build --chown=node:node /app/apps/api/prisma ./prisma
COPY --chown=node:node apps/api/docker ./docker

# uploads/ es donde el código guarda los adjuntos (process.cwd()/uploads)
RUN sed -i 's/\r$//' docker/entrypoint.sh \
 && mkdir -p uploads \
 && chown node:node uploads

USER node
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4000)+'/api/v1').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "docker/entrypoint.sh"]
