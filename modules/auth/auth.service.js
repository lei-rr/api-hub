/**
 * 鉴权服务
 * 只负责识别“当前请求是谁发起的”，不处理路由选择
 */

const { ValidationError, AppError } = require('../../shared/errors');
const clientService = require('../clients/client.service');
const adminService = require('./admin.service');

function extractApiKey(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

function extractAdminToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Admin ')) return null;
  return auth.slice(6).trim();
}

function resolveClient(req) {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    throw new ValidationError('Missing Authorization header');
  }

  const client = clientService.getByApiKey(apiKey);
  if (!client) {
    throw new ValidationError('Client not found or disabled');
  }

  return client;
}

function login(username, password) {
  const admin = adminService.getConfig();
  if (username !== admin.username || password !== admin.password) {
    throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
  }
  return { token: admin.token };
}

function verifyAdmin(token) {
  const admin = adminService.getConfig();
  return token === admin.token;
}

module.exports = {
  extractApiKey,
  extractAdminToken,
  resolveClient,
  login,
  verifyAdmin
};
