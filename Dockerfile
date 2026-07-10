FROM node:18-alpine

WORKDIR /app

# 先复制依赖文件并安装，利用 Docker 缓存层
COPY package*.json ./
RUN npm ci --omit=dev

# 复制应用代码
COPY . .

# 数据目录挂载点（运行时数据不存入镜像）
VOLUME ["/app/data"]

EXPOSE 2020

CMD ["node", "app.js"]
