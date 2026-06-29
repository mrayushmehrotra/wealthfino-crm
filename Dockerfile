# Base image with Bun for installing dependencies and building
FROM oven/bun:1 AS base

# 1. Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files (maintaining monorepo structure)
COPY package.json bun.lock ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies using Bun
RUN bun install --frozen-lockfile

# 2. Builder stage
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules

# Copy the rest of the application code
COPY . .

# Generate Prisma client and run the build
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/web && bunx prisma generate
RUN bun run build

# 3. Production runner stage (using Node.js Alpine for minimal size & maximum compatibility with Next.js standalone)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set permissions for prerender cache
RUN mkdir -p apps/web/.next && chown nextjs:nodejs apps/web/.next

# Copy public static files
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy the Next.js standalone output and static assets
# Note: Next.js standalone traces all dependencies, including Prisma Client
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

# The standalone server preserves the monorepo structure
CMD ["node", "apps/web/server.js"]
