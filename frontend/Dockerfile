# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . ./

# Build the application (no API URL needed - Caddy handles routing)
RUN npm run build

# Production stage - serve with Caddy
FROM caddy:2.10.2-alpine

# Install ca-certificates for HTTPS
RUN apk add --no-cache ca-certificates

# Copy static files, verify Caddyfile formatting
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt --overwrite /etc/caddy/Caddyfile

# Expose ports (3000 for app, 3001 for health)
EXPOSE 3000 3001

# Run as non-root user
USER 1001