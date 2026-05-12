FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY Backend/package*.json ./Backend/

WORKDIR /app/Backend
RUN npm ci --omit=dev

WORKDIR /app
COPY Backend ./Backend
COPY Frontend ./Frontend
RUN chown -R node:node /app

WORKDIR /app/Backend

USER node

EXPOSE 10000

CMD ["node", "src/server.js"]
