#!/usr/bin/env bash
echo "[+] Limpiando imágenes Docker huérfanas..."
docker image prune -f
