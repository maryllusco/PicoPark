#!/usr/bin/env bash
ENV=$1
PORT=$2
WS_PORT=$3
CONTAINER_NAME="picopark-${ENV}"
BACKUP_IMAGE="picopark:${ENV}-backup"

echo "⚠️ [FALLO DETECTADO] Ejecutando rollback automático en [$ENV]..."

docker stop "$CONTAINER_NAME" || true
docker rm -f "$CONTAINER_NAME" || true

if docker image inspect "$BACKUP_IMAGE" > /dev/null 2>&1; then
  echo "[+] Restaurando versión estable desde $BACKUP_IMAGE..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "${PORT}:80" \
    -p "${WS_PORT}:3000" \
    "$BACKUP_IMAGE"
  echo "✅ Rollback completado en [$ENV]."
else
  echo "❌ No existe imagen de respaldo previa ($BACKUP_IMAGE)."
  exit 1
fi
