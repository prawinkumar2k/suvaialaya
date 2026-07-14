# ================================
# Stage 1: Build the application
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10

# Copy package manifests first (better layer caching)
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDeps needed to build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the React frontend + Express server bundle
RUN pnpm build

# ================================
# Stage 2: Lean production image
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@10

# Copy only what is needed for production
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built client assets
COPY --from=builder /app/dist ./dist

# Copy the built server bundle
COPY --from=builder /app/dist ./dist

# Expose the application port
EXPOSE 8080

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Start the production server
CMD ["node", "dist/server/node-build.mjs"]
