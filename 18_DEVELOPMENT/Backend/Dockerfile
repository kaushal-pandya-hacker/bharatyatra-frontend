# Multi-stage Dockerfile for NestJS Backend
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 5000
CMD ["node", "dist/main"]
