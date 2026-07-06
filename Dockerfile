FROM node:26-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /app

RUN npm install --global pnpm@11.3.0


FROM base AS build

RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN DATABASE_URL="postgresql://build:build@localhost:5432/build" pnpm db:generate
RUN pnpm build


FROM base AS prod-deps

RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod


FROM base AS runtime

RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

ENV NODE_ENV="production"

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/app/generated ./app/generated
COPY --from=build /app/app/assets/fonts ./app/assets/fonts
COPY package.json ./

EXPOSE 1791

CMD ["node", "node_modules/@react-router/serve/bin.cjs", "./build/server/index.js"]
