FROM node:24-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json .
COPY pnpm-*.yaml .
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:24-alpine AS deployer

WORKDIR /app

ENV DATABASE_MIGRATIONS=/app/drizzle
ENV NODE_ENV=production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY --from=builder /app/build build
COPY --from=builder /app/drizzle drizzle/
COPY --from=builder /app/drizzle.config.ts .
COPY --from=builder /app/package.json .
COPY --from=builder /app/entrypoint.sh .
COPY --from=builder /app/pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install --prod --frozen-lockfile
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]