# ==========================================
# Stage 1: Dependency Installation
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10 --quiet

# Copy manifests only (maximize layer cache hit)
COPY package.json pnpm-lock.yaml ./

# Install ALL deps (dev included — needed for build)
RUN pnpm install --frozen-lockfile --prefer-offline

# ==========================================
# Stage 2: Build
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10 --quiet

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build React SPA + Express server bundle
RUN pnpm build

# ==========================================
# Stage 3: Production runner (minimal image)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:nodejs /app

RUN npm install -g pnpm@10 --quiet

# Copy manifests and install ONLY production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --prefer-offline

# Copy built artifacts
COPY --from=builder /app/dist ./dist

# Create logs directory with correct permissions
RUN chown -R appuser:nodejs /app/logs

# Install PM2 for Node.js clustering (must run as root)
RUN npm install -g pm2 --quiet

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Environment
ENV NODE_ENV=production
ENV PORT=8080

# Kubernetes health check support
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

# Graceful shutdown support (SIGTERM for K8s rolling updates)
STOPSIGNAL SIGTERM

CMD ["pm2-runtime", "start", "dist/server/node-build.mjs", "-i", "max", "--name", "suvaialaya-api"]
