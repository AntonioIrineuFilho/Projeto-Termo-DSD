FROM node:24-bullseye AS dependencies

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

###################################

FROM node:24-bullseye AS build

WORKDIR /app

RUN npm install -g pnpm

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN pnpm build

###################################

FROM node:24-alpine AS run

WORKDIR /app

RUN npm install -g pnpm

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

EXPOSE 3002

CMD [ "pnpm", "start" ]