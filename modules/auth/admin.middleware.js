/**
 * 管理员鉴权中间件
 * 保护后台管理 API
 */

const authService = require('./auth.service');
const { AppError } = require('../../shared/errors');

function adminMiddleware(req, res, next) {
  const token = authService.extractAdminToken(req);
  if (!token || !authService.verifyAdmin(token)) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }
  next();
}

module.exports = adminMiddleware;
