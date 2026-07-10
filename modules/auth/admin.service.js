/**
 * 管理员配置服务
 * 从 data/admin.json 读取/写入账号密码 Token
 */

const { ValidationError } = require('../../shared/errors');
const adminRepository = require('./admin.repository');

function getConfig() {
  return adminRepository.read();
}

function validate(data) {
  const errors = [];
  if (!data.username || typeof data.username !== 'string') {
    errors.push('username is required');
  }
  if (!data.password || typeof data.password !== 'string') {
    errors.push('password is required');
  }
  if (!data.token || typeof data.token !== 'string') {
    errors.push('token is required');
  }
  return errors;
}

function update(data) {
  const errors = validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const config = {
    username: data.username,
    password: data.password,
    token: data.token
  };
  adminRepository.write(config);
  return config;
}

module.exports = {
  getConfig,
  update
};
