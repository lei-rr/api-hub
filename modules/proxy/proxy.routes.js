/**
 * OpenAI 兼容中转路由
 * 先认证（req.client），再解析路由（req.routeContext），最后转发
 */

const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const routeMiddleware = require('../routes/route.middleware');
const proxyService = require('./proxy.service');

const router = express.Router();

router.use(authMiddleware);
router.use(routeMiddleware);

router.all('*', (req, res) => {
  proxyService.forward(req, res, req.routeContext);
});

module.exports = router;
