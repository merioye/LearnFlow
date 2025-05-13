ARG NODE_VERSION=20.0.0
FROM node:${NODE_VERSION}-alpine
ENV PORT=8000

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /workspace

# Copy package files for better caching
COPY package*.json ./

# Install dependencies using npm ci for consistent builds
RUN npm ci && \
    npm cache clean --force && \
    chown -R appuser:appgroup /workspace

# Switch to non-root user
USER appuser

# Copy source code
COPY --chown=appuser:appgroup . .

EXPOSE ${PORT}
CMD ["npm", "run", "start:dev"]