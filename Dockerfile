# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/
# https://docs.docker.com/engine/reference/builder/

FROM node:11-alpine

WORKDIR /usr/src/app

COPY . .

# see https://pkgs.alpinelinux.org
RUN apk --no-cache add linux-headers eudev-dev libusb-dev \
  && apk --no-cache --virtual .gyp add python make g++ \
  && yarn \
  && yarn cache clean \
  && apk del .gyp

EXPOSE 8000

# TODO mount /config dir from host
# https://docs.docker.com/storage/bind-mounts/

CMD ["yarn", "start:prod"]
