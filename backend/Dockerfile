FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=4000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY uploads ./uploads

RUN mkdir -p uploads/products && chown -R node:node /app

USER node

EXPOSE 4000

CMD ["npm", "start"]
