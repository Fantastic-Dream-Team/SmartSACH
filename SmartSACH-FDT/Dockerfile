# ==========================================
# ETAPA 1: Compilación de la App con Vite
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiamos de manera relativa (ya que Render está situado dentro de Frontend)
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código
COPY . .

# Compilamos el proyecto (Vite generará la carpeta 'dist')
RUN npm run build

# ==========================================
# ETAPA 2: Servidor de Producción con Nginx
# ==========================================
FROM nginx:alpine

# Copiamos la compilación al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración obligatoria para evitar errores 404 al recargar páginas en React
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