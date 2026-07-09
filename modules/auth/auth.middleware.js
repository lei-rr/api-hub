/**
 * 鉴权中间件
 * 将解析出的四层上下文挂载到 req.context
 */

const authService = require('./auth.service');

function authMiddleware(req, res, next) {
  try {
    req.context = authService.resolveContext(req);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
