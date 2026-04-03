# syntax=docker/dockerfile:1

# --- Builder ---
FROM node:25-alpine AS builder
WORKDIR /usr/src/app

ENV CI=1

# Install all deps including devDependencies (needed for remix build, tailwind, etc.)
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

# Ensure Rollup's Linux musl binary is present (optionalDependencies can be skipped on Alpine)
RUN yarn add -D @rollup/rollup-linux-x64-musl

COPY . .

# Build Remix for Node server target (buildConfig in remix.config.js)
ENV NODE_ENV=production
RUN yarn build


# --- Runner ---
FROM node:25-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=8080

# Non-root user
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/yarn.lock ./yarn.lock
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/build ./build
COPY --from=builder /usr/src/app/public ./public

USER app

EXPOSE 8080

# Start the Remix server build using remix-serve
CMD ["node_modules/.bin/remix-serve", "build/index.js"]


