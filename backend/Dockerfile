FROM node:20

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY uploads ./uploads

RUN mkdir -p uploads/products

EXPOSE 8080

CMD ["npm", "start"]
