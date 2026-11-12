FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000
USER node

# create the table if needed, then start the API
CMD ["sh", "-c", "node src/migrate.js && node src/server.js"]