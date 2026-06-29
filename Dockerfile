# Base image with Bun for installing dependencies and building
FROM oven/bun:1 AS base

# 1. Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files (maintaining monorepo structure)
COPY package.json bun.lock ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/web/prisma ./apps/web/prisma
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

# 3. Production runner stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root user for security
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid 1001 nextjs

# Copy public static files
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy the Next.js standalone output and static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy Prisma schema and migrations for runtime migrations
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma

# Copy Prisma Client from builder (Next.js standalone already traces and copies it correctly)

USER nextjs
EXPOSE 3000

# Run migrations then start the standalone server
CMD ["sh", "-c", "cd apps/web && bunx prisma migrate deploy && bun run server.js"]
