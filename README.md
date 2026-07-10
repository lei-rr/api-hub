# API Hub

<p align="center">
  <strong>OpenAI 兼容 API 中转与管理平台</strong><br>
  客户端 · 路由规则 · 上游渠道 · 密钥 —— 四模块解耦，支持一对多路由与负载策略。
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> ·
  <a href="#接口使用示例">接口示例</a> ·
  <a href="#架构说明">架构说明</a> ·
  <a href="#部署">部署</a> ·
  <a href="#环境变量">环境变量</a>
</p>

---

## 简介

API Hub 是一个面向个人/小团队的 OpenAI 兼容 API 代理网关。你在客户端里只需配置一个固定地址和固定模型名，后台即可随时切换上游渠道、模型或密钥，而无需改动任何客户端配置。

典型使用场景：

- 给 Codex / Cursor / ChatGPT Next Web / LobeChat 等客户端提供统一入口
- 多个上游渠道按轮询/随机策略负载
- 客户端看到的模型名与实际上游的模型名解耦
- 通过 Web 后台集中管理渠道、密钥、客户端和路由规则

## 核心特性

- **OpenAI 协议兼容**：完整转发 `/v1/*`，支持 `chat.completions`、`models`、`embeddings` 等
- **四模块解耦**：客户端、路由规则、渠道、密钥独立管理，互不污染
- **一对多路由**：一个客户端模型可映射到多个上游目标，支持 `round-robin` / `random`
- **模型名解耦**：客户端使用自定义模型名，后台映射到任意上游模型名
- **Web 管理后台**：基于 Vue 3 + Ant Design Vue + Vue Router，纯 CDN 引入，无需构建
- **登录鉴权**：管理后台与 API 分别使用 `Admin Token` 与 `Client API Key` 鉴权
- **直接 axios 转发**：不依赖 OpenAI SDK，避免额外头部被上游 WAF 拦截

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lei-rr/api-hub.git
cd api-hub
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

```bash
npm start
```

服务默认运行在 `http://localhost:3000`。

### 4. 访问后台

打开浏览器访问 `http://localhost:3000`，使用默认管理员账号登录：

- 用户名：`admin`
- 密码：`guolei`

### 5. 默认客户端调用

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer guolei" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

> 默认配置会把 `gpt-4o-mini` 转发到 `https://api.guolei.cc/v1`（请在 `data/channels.json` 中替换为你自己的上游地址和密钥）。

## 接口使用示例

### curl

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer <your-client-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }'
```

### Python (openai SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key="your-client-api-key",
    base_url="http://localhost:3000/v1"
)

res = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}]
)
print(res.choices[0].message.content)
```

### 流式输出

只需在请求体中加入 `"stream": true`，API Hub 会以 SSE 方式透传上游流。

## 架构说明

### 模块结构

```text
app.js                 # 入口
core/                  # 启动与路由挂载
middleware/            # Express 全局中间件
modules/               # 业务模块
  auth/                # 管理员登录 + 客户端认证
  channels/            # 上游渠道（baseUrl）
  clients/             # 客户端（apiKey）
  keys/                # 渠道密钥
  proxy/               # OpenAI 兼容转发
  routes/              # 路由规则（含 targets + strategy）
shared/                # 工具、错误类、通用 JSON 仓库
data/                  # JSON 数据文件
public/                # 前端静态资源（Vue 3 + Ant Design Vue）
```

### 请求处理流程

```text
客户端请求 /v1/chat/completions
  Authorization: Bearer <clientApiKey>
  body.model: <clientModel>
        ↓
auth.middleware          → 识别 req.client
        ↓
routes/route.middleware  → 选择 route → target → channel → key
        ↓
proxy.service            → 转发到上游渠道
        ↓
返回上游响应
```

### 实体关系

```text
Client（客户端）
  │ apiKey
  ▼
Route（路由规则）
  │ clientModel + strategy
  ▼
Target（目标）× N
  │ channelId + upstreamModel
  ▼
Channel（渠道） + Key（密钥）
  │ baseUrl + apiKey
  ▼
Upstream OpenAI API
```

- **Client**：使用 API Hub 的调用方，每个 Client 对应一个 `apiKey`
- **Route**：绑定 `clientId + clientModel`，决定请求应该走哪些 Target
- **Target**：路由目标，包含 `channelId` 和 `upstreamModel`
- **Channel**：上游 API 的 `baseUrl`
- **Key**：上游 API 的鉴权密钥，归属于某个 Channel

## 配置

所有业务数据保存在 `data/*.json`，启动时自动加载。你可以直接编辑 JSON 文件，也可以通过 Web 后台管理。

### 默认数据

- 管理员：`admin` / `guolei`
- 客户端 API Key：`guolei`
- 默认客户端模型：`gpt-4o-mini`

### 替换上游渠道

编辑 `data/channels.json` 和 `data/keys.json`，填入你自己的上游地址和密钥。

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| `PORT` | 服务端口 | `3000` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `guolei` |
| `ADMIN_TOKEN` | 管理 Token | `hub-guolei-token` |

你也可以直接修改 `config/app.config.js`。

## 部署

### 使用 systemd（Linux）

创建一个服务文件 `/etc/systemd/system/api-hub.service`：

```ini
[Unit]
Description=API Hub
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/api-hub
ExecStart=/usr/bin/node app.js
Restart=on-failure
Environment="PORT=3000"

[Install]
WantedBy=multi-user.target
```

然后：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now api-hub
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name hub.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 使用 Docker（可选）

项目当前为 Node.js 原生运行，Docker 支持后续补充，也欢迎 PR。

## 开发

```bash
# 热更新后端
npm run dev
```

前端采用 Vue 3 + Ant Design Vue 6 的 CDN 版本，文件位于 `public/`，修改后刷新浏览器即可生效，无需构建。

## 路线图

- [x] OpenAI 兼容代理
- [x] 客户端 / 渠道 / 密钥 / 路由 四模块
- [x] 一对多路由与轮询/随机策略
- [x] Web 管理后台
- [ ] 请求日志与用量统计
- [ ] 客户端额度限制
- [ ] Docker 一键部署
- [ ] 多语言支持

## 贡献

欢迎 Issue 和 PR。提交前请确保：

1. `node -c` 通过语法检查
2. 本地启动后能正常转发 `/v1/chat/completions`

## 许可证

[MIT](LICENSE)
