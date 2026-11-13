# Etapa 1: Build del frontend con Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY servidor/package*.json ./
RUN npm install && npm install ws @types/ws
COPY servidor/ ./
RUN npm run build

# Etapa 2: Nginx (Frontend) + Node.js (Servidor WebSocket en puerto 3000)
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache nginx curl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/server.js ./src/server.js

RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/http.d/default.conf

EXPOSE 80 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ && curl -f http://localhost:3000/ || exit 1

CMD ["sh", "-c", "node /app/src/server.js & nginx -g 'daemon off;'"]
