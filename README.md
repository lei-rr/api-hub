# API Hub

OpenAI 兼容 API 中转与管理平台。支持四层路由：渠道 → 密钥 → 路由规则 → 客户端。

## 核心特性

- **OpenAI 兼容**：客户端使用标准 OpenAI SDK / ChatGPT Next Web / Lobechat 等直接对接
- **四层路由**：渠道（上游地址）、密钥、路由规则、客户端，互不耦合
- **灵活切换**：Codex 等客户端配置固定，后台随时切换渠道和模型，无需改动客户端
- **上游模型自动获取**：选择渠道后一键拉取上游可用模型
- **Web 管理后台**：基于 Vue 3 + Ant Design Vue + Vue Router，无需构建
- **登录鉴权**：后台管理接口受管理员 Token 保护

## 快速开始

```bash
npm install
npm start
```

访问：`http://localhost:3000`

默认管理员账号：`admin` / `guolei`

## 架构

```text
app.js                 # 入口
config/                # 配置
core/                  # 启动与路由挂载
middleware/            # Express 中间件
modules/               # 业务模块
  auth/                # 管理员登录 + 客户端鉴权
  channels/            # 上游渠道
  clients/             # 客户端
  keys/                # 渠道密钥
  proxy/               # OpenAI 兼容转发
  routes/              # 路由规则（客户端+模型 → 渠道+上游模型）
shared/                # 工具、错误类、通用 JSON 仓库
data/                  # JSON 数据文件
public/                # 前端静态资源
```

## 请求流程

```text
客户端请求 /v1/chat/completions
  Authorization: Bearer <clientKey>
  body.model: <clientModel>
        ↓
找到客户端 → 找到路由规则 → 拿到渠道和上游模型
        ↓
用渠道的密钥转发到上游
        ↓
返回上游响应
```

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | `3000` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `guolei` |
| `ADMIN_TOKEN` | 管理 Token | `hub-guolei-token` |

## 开发

```bash
npm run dev
```

使用 nodemon 热更新后端代码。
