# QuickWish backend — production container image.
#
# Provider-neutral: the same image runs on Render, Railway, Fly.io, Cloud Run or
# any other container host. The app binds to $PORT, so the platform decides it.
# Docs are copied into the image because /api/v1/connector/openapi.json reads
# them from disk at runtime.

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=5000
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY docs ./docs
USER node
EXPOSE 5000
CMD ["node", "dist/index.js"]
