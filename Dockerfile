FROM node:22-alpine as node_base
RUN corepack enable
WORKDIR /opt/app


FROM node_base as build
COPY . .
RUN yarn install
RUN yarn run build
RUN yarn run tsc drizzle.config.ts

FROM node_base as prod_dependencies
COPY package.json yarn.lock ./
RUN yarn workspaces focus --production
RUN yarn install

FROM prod_dependencies as app
COPY --from=build /opt/app/dist ./dist
EXPOSE 3000
ENTRYPOINT [ "yarn", "run", "start:prod" ]




FROM node_base as migrations
COPY migrations ./migrations
COPY --from=build /opt/app/drizzle.config.js ./
# not really good
# TODO figure out how to use versions from yarn.lock
RUN yarn add drizzle-kit drizzle-orm pg
ENTRYPOINT [ "yarn", "run", "drizzle-kit", "migrate" ]
