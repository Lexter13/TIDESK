#!/bin/sh
# Arranque del contenedor de la API TIDESK (Dokploy).
set -e

# Binarios de npm: los del workspace (prisma) y los hoisteados en la raíz (tsx)
export PATH="/app/apps/api/node_modules/.bin:/app/node_modules/.bin:$PATH"

# 1) Esquema de la base de datos.
#    El proyecto no usa migraciones: sincroniza con `prisma db push`.
#    Se ejecuta SIN --accept-data-loss: si un cambio pudiera borrar datos, falla y no toca nada.
if [ "${DB_PUSH_ON_START:-true}" = "true" ]; then
  echo "[tidesk] Sincronizando el esquema (prisma db push)..."
  prisma db push --skip-generate
fi

# 2) Datos iniciales: solo si se pide (DB_SEED_IF_EMPTY=true) Y la base no tiene usuarios.
#    ATENCION: prisma/seed.ts borra tickets y datos relacionados al comenzar, y crea usuarios
#    de demostración con contraseñas conocidas. Por eso nunca se ejecuta contra una base con usuarios.
if [ "${DB_SEED_IF_EMPTY:-false}" = "true" ]; then
  if node docker/db-vacia.js; then
    echo "[tidesk] Base de datos vacía: ejecutando el seed inicial..."
    tsx prisma/seed.ts
  else
    echo "[tidesk] La base ya tiene usuarios (o no se pudo comprobar): se omite el seed."
  fi
fi

echo "[tidesk] Iniciando la API en el puerto ${PORT:-4000}..."
exec node dist/main
