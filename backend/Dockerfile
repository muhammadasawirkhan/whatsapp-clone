FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Clean production install
RUN npm ci --only=production

COPY . .

# Back4app injects its own PORT variable at runtime
CMD ["node", "server.js"]