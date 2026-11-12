# Etapa 1: Build y verificación de tipos (CI)
FROM node:20-alpine AS builder
WORKDIR /app
COPY servidor/package*.json ./
RUN npm install
COPY servidor/ ./
RUN npm run build

# Etapa 2: Servidor web de producción
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
