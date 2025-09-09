# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . ./
RUN npm run build

# Production stage - serve with Node.js
FROM node:22-slim

WORKDIR /app

# Install serve package for static files
RUN npm install -g serve@14

# Copy built application
COPY --from=build /app/dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Use non-root user
USER 1001

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
