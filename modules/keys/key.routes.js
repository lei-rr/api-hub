/**
 * 密钥管理路由
 */

const express = require('express');
const keyService = require('./key.service');

const router = express.Router();

router.get('/', (req, res) => {
  const channelId = req.query.channelId;
  const data = channelId ? keyService.listByChannel(channelId) : keyService.list();
  res.json({ data });
});

router.get('/:id', (req, res) => {
  res.json({ data: keyService.getById(req.params.id) });
});

router.post('/', (req, res) => {
  const key = keyService.create(req.body);
  res.status(201).json({ data: key });
});

router.put('/:id', (req, res) => {
  const key = keyService.update(req.params.id, req.body);
  res.json({ data: key });
});

router.delete('/:id', (req, res) => {
  keyService.remove(req.params.id);
  res.status(204).end();
});

module.exports = router;
