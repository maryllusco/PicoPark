#!/usr/bin/env bash
set -e

ENV=$1        # 'staging' o 'production'
PORT=$2       # 3001 para staging, 3002 para production
WS_PORT=$3    # 3003 para staging, 3000 para production
IMAGE_TAG="picopark:latest"
CONTAINER_NAME="picopark-${ENV}"
BACKUP_IMAGE="picopark:${ENV}-backup"

echo "=== Iniciando despliegue de PicoPark en [$ENV] (Web: $PORT | WS: $WS_PORT) ==="

if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
  echo "[+] Guardando imagen de respaldo ($BACKUP_IMAGE)..."
  docker commit "$CONTAINER_NAME" "$BACKUP_IMAGE" > /dev/null || true
  echo "[+] Deteniendo y eliminando contenedor previo..."
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

echo "[+] Levantando nuevo contenedor $CONTAINER_NAME..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "${PORT}:80" \
  -p "${WS_PORT}:3000" \
  "$IMAGE_TAG"

echo "✅ Despliegue en [$ENV] completado."
