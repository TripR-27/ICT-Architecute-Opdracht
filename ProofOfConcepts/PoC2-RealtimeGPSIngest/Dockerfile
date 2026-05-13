
FROM node:18-alpine AS builder

WORKDIR /app
COPY app/package*.json ./

RUN npm install

COPY app/ .

RUN npm run build


FROM node:18-alpine

WORKDIR /app

COPY app/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/index.js"]
