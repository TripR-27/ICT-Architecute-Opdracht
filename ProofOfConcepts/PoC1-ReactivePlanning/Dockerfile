FROM node:22-alpine

WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app/ .

CMD ["npx", "ts-node", "index.ts"]
