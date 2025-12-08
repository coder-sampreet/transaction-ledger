# -----------------------------
# SINGLE-STAGE DOCKERFILE
# -----------------------------
FROM node:24-bullseye

# Set working directory
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (production but includes prisma + generated)
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript
RUN pnpm build

# Prisma: deploy migrations inside container
RUN pnpm prisma migrate deploy

ENV NODE_ENV=development
ENV PORT=8000

EXPOSE 8000

CMD ["pnpm", "start"]
