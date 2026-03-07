## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app

# Copy shared and backend so relative imports (../../shared) resolve correctly
COPY shared ./shared
COPY backend ./backend

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --silent

# Build backend from repo root to ensure proper workspace context
WORKDIR /app
RUN npm run build --prefix ./backend

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./
RUN npm install --omit=dev --silent || true

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
