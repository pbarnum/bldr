# Build image
FROM node:14.17 as builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

CMD [ "yarn", "dev" ]

# Release image
FROM node:14.17 as release

WORKDIR /app

COPY --from=builder /app/public /app/public
COPY --from=builder /app/server /app/server

CMD [ "yarn", "server" ]
