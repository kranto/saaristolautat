FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG APP_ENV=production
ARG UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
ARG UMAMI_WEBSITE_ID=6d0b3cd2-13e7-4bb4-9bb0-99b9e57ad936
ENV VITE_APP_ENV=${APP_ENV}
ENV VITE_UMAMI_SCRIPT_URL=${UMAMI_SCRIPT_URL}
ENV VITE_UMAMI_WEBSITE_ID=${UMAMI_WEBSITE_ID}
RUN npm run build

FROM nginx:1.28-alpine

COPY docker/site.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

