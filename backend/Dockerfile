FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=4000
EXPOSE 4000

# Roda o seed (idempotente) e sobe o servidor
CMD ["sh", "-c", "node seed.js && node server.js"]
