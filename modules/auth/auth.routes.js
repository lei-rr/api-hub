/**
 * 管理员认证路由
 */

const express = require('express');
const authService = require('./auth.service');
const adminMiddleware = require('./admin.middleware');

const router = express.Router();

router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const result = authService.login(username, password);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/me', adminMiddleware, (req, res) => {
  res.json({ data: { authenticated: true } });
});

router.post('/logout', adminMiddleware, (req, res) => {
  res.json({ data: { ok: true } });
});

module.exports = router;
