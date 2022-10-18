ARG NODE_IMAGE=node:16

FROM $NODE_IMAGE AS base
# RUN apk --no-cache add dumb-ini
RUN apt update && apt install wget

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
# RUN chown node:node /usr/src/app
# mkdir -p /usr/src/app &&
RUN usermod -u 502 node
USER node
WORKDIR /usr/src/app
RUN mkdir tmp

# Stage 2
FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

# Stage 3
FROM dependencies AS build
RUN node ace build --production --ignore-ts-errors

# last stage
FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV NODE_OPTIONS=--max_old_space_size=512
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/build .
EXPOSE 3333
CMD ["node", "server.js"]
