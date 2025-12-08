FROM node:24-slim AS dependencies

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

###################################

FROM node:24-slim AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY --from=dependencies /app/node_modules node_modules
COPY package.json pnpm-lock.yaml ./

COPY . .

ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_WS_LOBBY_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_WS_LOBBY_URL=${VITE_WS_LOBBY_URL}

RUN pnpm build

###################################

FROM node:24-slim AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY --from=dependencies /app/node_modules node_modules
COPY --from=builder /app/dist dist
COPY package.json pnpm-lock.yaml ./

EXPOSE 4173

CMD [ "pnpm", "preview" ]