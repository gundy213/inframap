## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY ./backend/package*.json ./
RUN npm ci --only=production || true

# Copy source and build
COPY . .
WORKDIR /app
RUN npm install --silent
RUN npm run build --prefix ./backend

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./
RUN npm ci --only=production --prefix ./ || true

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
