# Build stage
FROM node:22-slim AS build

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript
COPY . ./
RUN npm run build

# Production stage
FROM node:22-slim AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=build /app/dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port (OpenShift will override this)
EXPOSE 3001

# Start the application using your package.json start script
CMD ["npm", "start"]
