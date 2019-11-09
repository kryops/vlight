# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
# https://docs.docker.com/engine/reference/builder/

FROM node:13-alpine

WORKDIR /usr/src/app

# see https://pkgs.alpinelinux.org
RUN apk --no-cache add linux-headers eudev-dev libusb-dev

COPY . .

RUN apk --no-cache --virtual .gyp add python make g++ git \
  && yarn \
  && yarn --prod --offline --ignore-scripts \
  && yarn cache clean \
  && apk del .gyp \
  && rm -rf .linaria-cache node_modules/.cache

EXPOSE 8000

CMD ["yarn", "start:prod"]
