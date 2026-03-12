FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# 利用 Docker 缓存层，如果 package.json 没有变化，则不会重新安装node modules
RUN npm install
# 复制项目文件到工作目录
COPY . .
# 构建应用
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

# 设置容器启动时执行的默认命令
CMD [ "node","dist/app.js" ]