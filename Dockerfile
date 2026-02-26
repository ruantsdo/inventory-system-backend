FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development

COPY prisma ./prisma
RUN npm run db:generate

EXPOSE 3333
CMD ["npm", "run", "dev"]

FROM base AS builder
COPY . .
RUN npm run db:generate
RUN npm run build

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 3333
CMD ["node", "dist/server.js"]
