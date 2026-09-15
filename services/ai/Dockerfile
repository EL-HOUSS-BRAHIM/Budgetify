# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
COPY services/ai/package.json ./services/ai/
RUN npm ci --workspace services/ai

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY services/ai/package.json ./services/ai/package.json
COPY services/ai/src ./services/ai/src
COPY services/ai/tsconfig.json ./services/ai/tsconfig.json

# Never run as root; the service handles user JWTs.
USER node
EXPOSE 8787
CMD ["node", "--import", "tsx", "services/ai/src/server.ts"]
