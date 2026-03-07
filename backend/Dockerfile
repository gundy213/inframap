## Backend Dockerfile - multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app

# Copy entire workspace structure
COPY package*.json ./
COPY backend ./backend
COPY shared ./shared

# Install dependencies at root (workspace)
RUN npm install --silent

# Build backend (outputs to backend/dist)
RUN npm run build --prefix ./backend

# Runtime stage
FROM node:18-alpine
WORKDIR /app
# Copy compiled backend and root workspace node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/server.js"]
