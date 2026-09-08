# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
COPY services/ai/package.json ./services/ai/
RUN npm ci --omit=dev --workspace services/ai

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY services/ai ./services/ai

# Never run as root; the service handles user JWTs.
USER node
EXPOSE 8787
CMD ["node", "--experimental-strip-types", "services/ai/src/server.ts"]
