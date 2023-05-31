FROM alpine
RUN apk --no-cache add nodejs yarn --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --production

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
