# SPDX-FileCopyrightText: 2024 The Nirvati Developers
#
# SPDX-License-Identifier: AGPL-3.0-or-later

ARG BUILD_TYPE=Beta
ARG NEXTCLOUD_USER
ARG NEXTCLOUD_PW
ARG NEXTCLOUD_SERVER

FROM node:22 AS build

ARG NEXTCLOUD_USER
ARG NEXTCLOUD_PW
ARG NEXTCLOUD_SERVER

WORKDIR /build
COPY . .

RUN yarn install

RUN NEXTCLOUD_USER=$NEXTCLOUD_USER NEXTCLOUD_PW=$NEXTCLOUD_PW NEXTCLOUD_SERVER=$NEXTCLOUD_SERVER yarn nuxi build

FROM cgr.dev/chainguard/node:latest

WORKDIR /app
COPY --from=build --chown=node:node /build/.output .

EXPOSE 3000
CMD [ "./server/index.mjs" ]
