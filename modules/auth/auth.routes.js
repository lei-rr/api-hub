/**
 * 管理员认证路由
 */

const express = require('express');
const authService = require('./auth.service');
const adminService = require('./admin.service');
const adminMiddleware = require('./admin.middleware');
const { AppError } = require('../../shared/errors');

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

router.get('/admin', adminMiddleware, (req, res) => {
  const config = adminService.getConfig();
  res.json({ data: config });
});

router.put('/admin', adminMiddleware, (req, res, next) => {
  try {
    const config = adminService.update(req.body);
    res.json({ data: config });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
