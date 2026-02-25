# AffiliateTunnels - Optimized for Railway
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (layer cached when package.json files don't change)
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm install

# Copy source and build client
COPY . .
RUN cd client && npm run build

# Prune devDependencies for a leaner production image
RUN npm prune --omit=dev

# Production — lean image
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/start.js ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "start.js"]
