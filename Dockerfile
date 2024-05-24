FROM node:lts-slim AS base
ENV APP_PATH=/root/app
WORKDIR ${APP_PATH}
# [Optional]Config PRC mirror for NPM
RUN npm set registry https://registry.npmmirror.com/
RUN npm add -g pnpm@latest


# ======
# 依赖项基底
FROM base AS deps
COPY package.json pnpm-lock.yaml ./


# ======
# 依赖项:开发环境（可构建）
FROM deps as deps-dev
RUN pnpm i


# ======
# 依赖项:生产环境
FROM deps AS deps-prod
RUN pnpm i --production


# ======
# 构建器
FROM deps AS builder
COPY --from=deps-dev ${APP_PATH}/node_modules ./node_modules
COPY src ./src
COPY types ./types
# COPY .env ./
COPY .env.production ./.env
COPY tsconfig.json ./
RUN pnpm build


# ======
# 运行时
FROM deps AS final
COPY --from=deps-prod ${APP_PATH}/node_modules ./node_modules
COPY public ./public
COPY --from=builder ${APP_PATH}/dist ./dist
COPY --from=builder ${APP_PATH}/.env ./
EXPOSE 3000
CMD pnpm start
