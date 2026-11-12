#!/usr/bin/env bash
set -e

ENV=$1      # 'staging' o 'production'
PORT=$2     # 3001 para staging, 3002 para production
IMAGE_TAG="picopark:latest"
CONTAINER_NAME="picopark-${ENV}"
BACKUP_IMAGE="picopark:${ENV}-backup"

echo "=== Iniciando despliegue de PicoPark en [$ENV] (Puerto $PORT) ==="

# 1. Backup rápido de la versión actual para permitir rollback
if docker ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}$"; then
  echo "[+] Guardando imagen de respaldo ($BACKUP_IMAGE)..."
  docker commit "$CONTAINER_NAME" "$BACKUP_IMAGE" > /dev/null || true
  echo "[+] Deteniendo y eliminando contenedor previo..."
  docker stop "$CONTAINER_NAME" || true
  docker rm "$CONTAINER_NAME" || true
fi

# 2. Levantar el nuevo contenedor (mapea puerto externo -> puerto 80 de Nginx)
echo "[+] Levantando nuevo contenedor $CONTAINER_NAME..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "${PORT}:80" \
  "$IMAGE_TAG"

echo "✅ Despliegue en [$ENV] completado."
