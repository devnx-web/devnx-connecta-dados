# syntax=docker/dockerfile:1.7

FROM node:20.19.0-bookworm AS webapp-builder

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git jq openssl xxd \
  && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN corepack enable && corepack prepare pnpm@8.6.12 --activate

COPY airbyte-webapp/package.json airbyte-webapp/pnpm-lock.yaml airbyte-webapp/.npmrc ./airbyte-webapp/
COPY airbyte-webapp/scripts/install-githooks.sh ./airbyte-webapp/scripts/install-githooks.sh

WORKDIR /app/airbyte-webapp

ENV HUSKY=0

RUN pnpm install --frozen-lockfile

WORKDIR /app

COPY airbyte-connector-builder-resources ./airbyte-connector-builder-resources
COPY airbyte-api ./airbyte-api
COPY airbyte-commons-auth ./airbyte-commons-auth
COPY airbyte-webapp ./airbyte-webapp

WORKDIR /app/airbyte-webapp
RUN pnpm run generate-client
RUN bash -lc '. ./scripts/calculate-source-hash.sh && pnpm exec vite build'

FROM airbyte/airbyte-base-nginx-image:3.3 AS runtime

ENV AILIV_API_URL=http://host.docker.internal:8002

EXPOSE 8080

COPY --from=webapp-builder --chown=nginx:nginx /app/airbyte-webapp/build/app /usr/share/nginx/html
COPY --chown=nginx:nginx airbyte-webapp/bin/nginx/default.conf.template /etc/nginx/templates/default.conf.template

USER root

RUN <<EOF
find /usr/share/nginx/html -type d -exec chmod 755 '{}' \; -o -type f -exec chmod 644 '{}' \;
EOF

USER nginx:nginx
