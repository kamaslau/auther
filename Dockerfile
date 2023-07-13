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
# 依赖项:生产环境
FROM deps AS deps-prod
RUN pnpm i --production


# ======
# 运行时
FROM deps AS final
COPY --from=deps-prod ${APP_PATH}/node_modules ./node_modules
COPY src ./src
COPY .env ./
EXPOSE 3000
CMD pnpm start
