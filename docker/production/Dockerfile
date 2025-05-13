ARG NODE_VERSION=20.0.0
FROM node:${NODE_VERSION}-alpine AS builder

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /workspace

# Copy package files for better caching
COPY package*.json ./

# Install dependencies and build
RUN npm ci && \
    npm cache clean --force && \
    chown -R appuser:appgroup /workspace

USER appuser
COPY --chown=appuser:appgroup . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS production
ENV NODE_ENV=production
ENV PORT=8000

# Create and use non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /workspace

# Copy package files and install production dependencies
COPY package*.json ecosystem.config.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force && \
    chown -R appuser:appgroup /workspace

USER appuser

# Copy built files from builder
COPY --from=builder --chown=appuser:appgroup /workspace/dist ./dist

EXPOSE ${PORT}
CMD ["npm", "run", "start:prod"]