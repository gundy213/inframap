## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app/backend

# Copy backend package and tsconfig into build dir
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
RUN npm ci --only=production || true

# Copy backend source and build
COPY backend/. ./
RUN npm install --silent
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./
RUN npm ci --only=production || true

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
