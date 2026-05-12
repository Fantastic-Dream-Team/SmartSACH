FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY SmartSACH-FDT/Backend/package*.json ./Backend/

WORKDIR /app/Backend
RUN npm ci --omit=dev

WORKDIR /app
COPY SmartSACH-FDT/Backend ./Backend
COPY SmartSACH-FDT/Frontend ./Frontend
RUN chown -R node:node /app

WORKDIR /app/Backend

USER node

EXPOSE 10000

CMD ["node", "src/server.js"]
