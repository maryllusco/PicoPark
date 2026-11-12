# Etapa 1: Build del frontend con Bun
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY servidor/package.json servidor/bun.lock* ./
RUN bun install
COPY servidor/ ./
RUN bun run build

# Etapa 2: Nginx (Frontend) + Bun (Servidor WebSocket en puerto 3000)
FROM oven/bun:1-alpine
RUN apk add --no-cache nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/src /app/src

RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/http.d/default.conf

EXPOSE 80 3000
CMD ["sh", "-c", "bun /app/src/server.js & nginx -g 'daemon off;'"]
