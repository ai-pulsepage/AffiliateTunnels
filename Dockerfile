# AffiliateTunnels - Single service (API + static client)
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/
RUN npm install --production=false

# Copy source
COPY . .

# Build client
RUN cd client && npm run build

# Production
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=base /app/package.json ./
COPY --from=base /app/start.js ./
COPY --from=base /app/server ./server
COPY --from=base /app/shared ./shared
COPY --from=base /app/client/dist ./client/dist
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "start.js"]
