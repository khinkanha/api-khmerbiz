# Multi-stage build for CapRover
# Stage 1: Run security tests
FROM node:20-alpine AS test

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY jest.config.js ./
COPY .env.test ./
COPY src ./src
COPY tests ./tests

RUN npm test

# Stage 2: Build TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 3: Production image (smaller, no dev dependencies)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 80

CMD ["node", "dist/index.js"]
