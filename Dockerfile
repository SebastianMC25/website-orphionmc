# ==========================================
# OrphionMC Production Dockerfile
# ==========================================
FROM node:20-bookworm-slim

# Working directory
WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies (skipping dev dependencies in production)
RUN npm install --omit=dev && \
    cd server && npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Environment Defaults
ENV NODE_ENV=production
ENV PORT=3000
ENV DOMAIN=orphionmc.net

# Expose HTTP port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/', (r) => process.exit(r.statusCode === 200 || r.statusCode === 304 ? 0 : 1))"

# Start the multitask server
CMD ["node", "server/server.js"]
