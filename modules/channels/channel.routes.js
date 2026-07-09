/**
 * 渠道管理路由
 */

const express = require('express');
const channelService = require('./channel.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: channelService.list() });
});

router.get('/:id', (req, res) => {
  res.json({ data: channelService.getById(req.params.id) });
});

router.post('/', (req, res) => {
  const channel = channelService.create(req.body);
  res.status(201).json({ data: channel });
});

router.put('/:id', (req, res) => {
  const channel = channelService.update(req.params.id, req.body);
  res.json({ data: channel });
});

router.delete('/:id', (req, res) => {
  channelService.remove(req.params.id);
  res.status(204).end();
});

router.get('/:id/fetch-models', async (req, res, next) => {
  try {
    const models = await channelService.fetchUpstreamModels(req.params.id);
    res.json({ data: models });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
