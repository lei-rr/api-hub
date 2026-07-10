/**
 * 上游管理路由
 */

const express = require('express');
const upstreamService = require('./upstream.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: upstreamService.list() });
});

router.get('/:id', (req, res) => {
  res.json({ data: upstreamService.getById(req.params.id) });
});

router.post('/', (req, res) => {
  const upstream = upstreamService.create(req.body);
  res.status(201).json({ data: upstream });
});

router.put('/:id', (req, res) => {
  const upstream = upstreamService.update(req.params.id, req.body);
  res.json({ data: upstream });
});

router.delete('/:id', (req, res) => {
  upstreamService.remove(req.params.id);
  res.status(204).end();
});

router.get('/:id/fetch-models', async (req, res, next) => {
  try {
    const models = await upstreamService.fetchUpstreamModels(req.params.id);
    res.json({ data: models });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
