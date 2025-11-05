FROM node:24-alpine

WORKDIR /app
COPY package.json /app/
COPY ./src /app/src/
COPY tsconfig.json /app/
COPY ./public /app/public/
RUN yarn install --legacy-peer-deps
RUN yarn build

CMD ["yarn", "start"]