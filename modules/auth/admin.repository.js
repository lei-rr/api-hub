/**
 * 管理员配置仓库
 * 账号、密码、Token 保存在 data/admin.json
 */

const config = require('../../config/app.config');
const { create } = require('../../shared/jsonRepository');

module.exports = create(config.files.admin, {
  username: 'admin',
  password: 'admin',
  token: 'hub-guolei-token'
});
