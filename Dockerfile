FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY backend/src ./src
COPY backend/uploads ./uploads

RUN mkdir -p uploads/products && chown -R node:node /app

USER node

CMD ["npm", "start"]
