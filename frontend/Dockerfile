## Frontend Dockerfile - build with Node and serve using nginx
FROM node:18-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install --silent
COPY frontend/ .
RUN npm run build

FROM nginx:stable-alpine
ENV PORT=8080
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx/default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
