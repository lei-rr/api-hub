/**
 * 客户端管理路由
 */

const express = require('express');
const clientService = require('./client.service');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: clientService.list() });
});

router.get('/:id', (req, res) => {
  res.json({ data: clientService.getById(req.params.id) });
});

router.post('/', (req, res) => {
  const client = clientService.create(req.body);
  res.status(201).json({ data: client });
});

router.put('/:id', (req, res) => {
  const client = clientService.update(req.params.id, req.body);
  res.json({ data: client });
});

router.delete('/:id', (req, res) => {
  clientService.remove(req.params.id);
  res.status(204).end();
});

module.exports = router;
