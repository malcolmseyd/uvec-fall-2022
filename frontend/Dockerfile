# Production image, copy all the files and run next
FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
