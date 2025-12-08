FROM node:24-bullseye

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Test DB connection passed from docker-compose
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm prisma generate

# Run tests
CMD ["pnpm", "test"]
