# --- Build stage ---
FROM public.ecr.aws/docker/library/node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM public.ecr.aws/docker/library/nginx:1.25-alpine

# Copy production build to Nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Healthcheck
HEALTHCHECK CMD wget -qO- http://localhost:80/ > /dev/null 2>&1 || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
