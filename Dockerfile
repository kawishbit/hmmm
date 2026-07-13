# syntax=docker/dockerfile:1
# Multi-stage: build static Hmmm, serve with nginx.
# Supports self-hosting while the same repo still deploys to Vercel as static dist/.

# ---- build ----
FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Install deps first for better layer caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN bun run build

# ---- runtime ----
FROM nginx:1.27-alpine AS runtime

# Remove default site and drop our static files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
