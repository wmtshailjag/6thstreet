FROM node:lts-alpine

ENV NODE_ENV=development \
    SERVER_PORT=3000

RUN apk add libsass --update-cache; \
    mkdir -p /app

COPY . /app

WORKDIR /app

RUN npm i npm -g; \
    npm install; \
    npm install --g lerna; \
    lerna bootstrap; \
    npm rebuild node-sass; \
    npm run build; \
    npm run image-opt

EXPOSE 3000
CMD ["node", "app.js"]

