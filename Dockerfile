FROM node:20-alpine

RUN apk add --no-cache vips-dev

WORKDIR /app

ARG NODE_ENV=production
COPY package.json package-lock.json ./

RUN if [ "$NODE_ENV" = "development" ]; then \
      npm install; \
    else \
      npm ci --omit=dev; \
    fi
RUN npm cache clean --force

COPY dist ./dist

EXPOSE 80

CMD ["node", "dist/index.js"]
