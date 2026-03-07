## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app

# Copy shared and backend so relative imports (../../shared) resolve correctly
COPY shared ./shared
COPY backend ./backend

# Install and build backend
WORKDIR /app/backend
RUN npm install --silent
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./
RUN npm install --only=production || true

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
