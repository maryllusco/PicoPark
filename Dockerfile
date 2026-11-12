# Etapa 1: Build del frontend con Bun baseline (compatible con VMs sin AVX2)
FROM debian:bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates \
    && curl -fsSL https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-baseline.zip -o /tmp/bun.zip \
    && unzip /tmp/bun.zip -d /tmp \
    && mv /tmp/bun-linux-x64-baseline/bun /usr/local/bin/bun \
    && chmod +x /usr/local/bin/bun \
    && rm -rf /tmp/bun* /var/lib/apt/lists/*

COPY servidor/package.json servidor/bun.lock* ./
RUN bun install
COPY servidor/ ./
RUN bun run build

# Etapa 2: Nginx (Frontend) + Bun baseline (Servidor WebSocket en puerto 3000)
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends nginx ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/bin/bun /usr/local/bin/bun
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

RUN printf 'server {\n  listen 80 default_server;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/sites-available/default

EXPOSE 80 3000
CMD ["sh", "-c", "bun /app/src/server.js & nginx -g 'daemon off;'"]
