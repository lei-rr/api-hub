# 安全策略

## 报告安全漏洞

如果你发现了安全漏洞，请不要公开提交 Issue，请通过以下方式私下联系维护者：

- GitHub: [@lei-rr](https://github.com/lei-rr)

请在报告中包含：

- 漏洞描述
- 复现步骤
- 可能的影响范围
- 建议的修复方案（如果有）

## 安全实践

- 管理员账号密码保存在本地 `data/admin.json`，请勿将该文件提交到 Git
- 上游 API 密钥保存在 `data/upstreams.json`，同样属于敏感数据
- 生产环境建议通过反向代理（Nginx/Caddy）启用 HTTPS
- 首次部署后请立即修改默认管理员密码
