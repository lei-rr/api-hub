/**
 * 路由规则管理 API
 */

const express = require('express');
const routeService = require('./route.service');

const router = express.Router();

router.get('/', (req, res) => {
  const { clientId, channelId } = req.query;
  let data;
  if (clientId) data = routeService.listByClient(clientId);
  else if (channelId) data = routeService.listByChannel(channelId);
  else data = routeService.list();
  res.json({ data });
});

router.get('/:id', (req, res) => {
  res.json({ data: routeService.getById(req.params.id) });
});

router.post('/', (req, res) => {
  const route = routeService.create(req.body);
  res.status(201).json({ data: route });
});

router.put('/:id', (req, res) => {
  const route = routeService.update(req.params.id, req.body);
  res.json({ data: route });
});

router.delete('/:id', (req, res) => {
  routeService.remove(req.params.id);
  res.status(204).end();
});

module.exports = router;
