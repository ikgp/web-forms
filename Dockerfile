# SPDX-FileCopyrightText: 2024 The Nirvati Developers
#
# SPDX-License-Identifier: AGPL-3.0-or-later

ARG BUILD_TYPE=Beta

FROM node:22 AS build

WORKDIR /build
COPY . .

RUN yarn install

RUN yarn nuxi build

FROM cgr.dev/chainguard/node:latest

WORKDIR /app
COPY --from=build --chown=node:node /build/.output .

EXPOSE 3000
CMD [ "./server/index.mjs" ]
