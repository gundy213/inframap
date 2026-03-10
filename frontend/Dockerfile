## Combined Dockerfile - builds frontend + backend, serves both from one container
## nginx on port 8080 serves static assets and proxies /api to Node on port 3001

# Stage 1: build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --silent
COPY frontend/ .
RUN npm run build

# Stage 2: build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY backend ./backend
COPY shared ./shared
RUN npm install --silent
RUN npm run build --prefix ./backend

# Final stage: nginx + node + supervisord
FROM node:18-alpine
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/node_modules ./node_modules

# Frontend static files
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# nginx + supervisor config
COPY frontend/nginx/default.conf /etc/nginx/http.d/default.conf
COPY frontend/nginx/supervisord.conf /etc/supervisord.conf

ENV NODE_ENV=production
EXPOSE 8080
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
