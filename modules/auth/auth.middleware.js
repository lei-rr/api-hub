/**
 * 鉴权中间件
 * 仅把解析出的客户端对象挂载到 req.client
 * 路由解析交给 routes/route.middleware
 */

const authService = require('./auth.service');

function authMiddleware(req, res, next) {
  try {
    req.client = authService.resolveClient(req);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
