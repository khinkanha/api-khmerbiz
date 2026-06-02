FROM node:20-alpine

WORKDIR /app

ARG NODE_ENV=production
COPY package.json ./

RUN if [ "$NODE_ENV" = "development" ]; then \
      npm install --include=optional; \
    else \
      npm ci --omit=dev && npm install --include=optional sharp@0.33.5; \
    fi
RUN npm cache clean --force

COPY dist ./dist

EXPOSE 80

CMD ["node", "dist/index.js"]
