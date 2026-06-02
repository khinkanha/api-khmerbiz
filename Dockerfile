FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY dist ./dist

EXPOSE 80

CMD ["node", "dist/index.js"]
