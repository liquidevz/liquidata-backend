# Unified Dockerfile for both production and local development

FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# In development, all deps are installed
# In production, only production deps are installed
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ]; then \
        npm install; \
    else \
        npm ci --only=production; \
    fi

# Copy app source
COPY . .

# Create uploads directory
RUN mkdir -p public/uploads/logos && \
    chmod -R 755 public/uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start command (will be overridden by docker-compose if needed)
CMD ["node", "server.js"]

