#!/usr/bin/env bash
set -e

ENV=$1
PORT=$2
WS_PORT=$3
IMAGE_TAG="picopark:latest"
CONTAINER_NAME="picopark-${ENV}"
BACKUP_IMAGE="picopark:${ENV}-backup"

echo "=== Iniciando despliegue de PicoPark en [$ENV] (Web: $PORT | WS: $WS_PORT) ==="

if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
  docker commit "$CONTAINER_NAME" "$BACKUP_IMAGE" > /dev/null || true
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p "${PORT}:80" \
  -p "${WS_PORT}:3000" \
  "$IMAGE_TAG"

echo "✅ Despliegue en [$ENV] completado con rotación de logs activa."
