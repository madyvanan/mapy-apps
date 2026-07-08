FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM node:22-alpine AS runner

RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline
COPY --from=builder /app/dist ./dist
USER nodeuser

EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
