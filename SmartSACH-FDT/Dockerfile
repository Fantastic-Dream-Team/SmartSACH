# ==========================================
# ETAPA 1: Compilación de la App con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# 1. Copiamos los archivos de configuración desde la subcarpeta Frontend
COPY Frontend/package*.json ./

# 2. Instalamos todas las dependencias dentro del contenedor
RUN npm install

# 3. Copiamos todo el código fuente de la subcarpeta Frontend al contenedor
COPY ../Frontend/ .

# 4. Compilamos el proyecto. Vite generará los estáticos en /app/dist
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiamos el resultado de la compilación al directorio público de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración personalizada de Nginx para evitar pantallas blancas o errores 404 con React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]