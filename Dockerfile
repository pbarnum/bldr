# Build image
FROM node:14.17

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "server" ]
