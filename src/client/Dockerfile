# Development
FROM node:14-alpine3.14 AS builder

RUN apk upgrade && apk add python3 make

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ./src/ui/package.json ./src/ui/yarn.lock ./
RUN yarn install

COPY [^src/api]* .

RUN yarn build

# Production
FROM nginx:1.21.4-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
