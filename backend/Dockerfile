## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies (context is the backend folder)
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --only=production || true

# Copy source and build
COPY . .
RUN npm install --silent
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production || true

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
