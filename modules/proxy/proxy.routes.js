/**
 * OpenAI 兼容中转路由
 */

const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const proxyService = require('./proxy.service');

const router = express.Router();

router.use(authMiddleware);

router.all('*', (req, res) => {
  proxyService.forward(req, res, req.context);
});

module.exports = router;
