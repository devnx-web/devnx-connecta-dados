ARG NGINX_IMAGE=airbyte/airbyte-base-nginx-image:3.3
FROM ${NGINX_IMAGE}

ARG BUILD_DIR=bin/build
ARG NGINX_CONFIG=bin/nginx/default.conf.template

ENV AILIV_API_URL=http://172.17.0.1:8002
ENV NGINX_RESOLVER=127.0.0.11

EXPOSE 8080

COPY --chown=nginx:nginx ${BUILD_DIR} /usr/share/nginx/html
COPY --chown=nginx:nginx ${NGINX_CONFIG} /etc/nginx/templates/default.conf.template

USER root

RUN <<EOF
find /usr/share/nginx/html -type d -exec chmod 755 '{}' \; -o -type f -exec chmod 644 '{}' \;
EOF

USER nginx:nginx
