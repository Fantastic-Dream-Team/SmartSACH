# ==========================================
# ETAPA 1: Compilación de la App con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# NOTA: Cambiamos las rutas para asegurarnos de copiar desde la carpeta Frontend
COPY Frontend/package*.json ./

# Instalamos todos los módulos de node
RUN npm install

# Copiamos todo el contenido de la carpeta Frontend al contenedor
COPY Frontend/ .

# Compilamos el proyecto con Vite
RUN npm run build

# ==========================================
# ETAPA 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiamos el resultado empaquetado por Vite (carpeta dist) al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración de Nginx adaptada para evitar errores 404 en React Router
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