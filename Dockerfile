FROM node:16-alpine as front-build

WORKDIR /opt/auth-frontend
COPY . .
RUN apk add git && \
    yarn && \
    yarn lint && \
    yarn test && \
    yarn build

FROM nginx

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=front-build /opt/auth-frontend/dist /opt/auth-frontend/dist
EXPOSE 5000
