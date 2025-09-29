# --- Build stage ---
# Use buildkit cache for npm
# Requires DOCKER_BUILDKIT=1
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first to leverage cache
COPY package.json package-lock.json ./

# Use npm cache to speed up installs
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy rest of the source code
COPY . .

# Build production assets
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.25-alpine

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

# Healthcheck
HEALTHCHECK CMD wget -qO- http://localhost:80/ > /dev/null 2>&1 || exit 1

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
