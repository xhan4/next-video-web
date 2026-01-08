# 构建阶段
FROM node:20-alpine AS builder

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装 pnpm 并设置 pnpm 镜像源
RUN npm install -g pnpm@latest && pnpm config set registry https://registry.npmmirror.com/
# 将前端源码复制到 /next-video 目录中
WORKDIR /next-video

# 复制整个项目，除了 node_modules 和 dist 等目录
COPY package.json pnpm-lock.yaml ./

# 使用 pnpm 安装依赖
RUN pnpm install --frozen-lockfile

COPY . .

# 编译项目
RUN pnpm run build

# 部署阶段
FROM node:20-alpine AS runner

# 创建非root用户以提高安全性
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /next-video

# 复制构建产物（确保所有必要的文件都被复制）
COPY --from=builder --chown=nextjs:nodejs /next-video/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /next-video/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /next-video/public ./public

# 切换到非root用户
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]