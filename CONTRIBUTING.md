# 贡献指南

感谢你对 API Hub 的关注！

## 如何贡献

1. Fork 本仓库
2. 创建你的功能分支：`git checkout -b feature/my-feature`
3. 提交改动：`git commit -am 'feat: add some feature'`
4. 推送分支：`git push origin feature/my-feature`
5. 提交 Pull Request

## 提交前请检查

- 运行 `npm test` 通过语法检查
- 本地启动后能正常访问后台和调用 `/v1/chat/completions`
- 保持现有代码风格
- 不要提交 `data/` 目录下的 JSON 文件

## 代码风格

- 使用 2 个空格缩进
- 函数和变量使用 camelCase
- 优先保持模块边界清晰
- 避免引入不必要的依赖

## 报告问题

请使用 GitHub Issues，并尽量提供：

- 问题描述
- 复现步骤
- 环境信息（Node.js 版本、操作系统）
- 相关日志或截图
