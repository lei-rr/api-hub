/**
 * 路由解析中间件
 * 根据 req.client 和请求体中的 model，解析出：
 * route / target / upstream / key / upstreamModel
 * 结果挂载到 req.routeContext
 */

const { NotFoundError, ValidationError } = require('../../shared/errors');
const upstreamService = require('../upstreams/upstream.service');
const routeService = require('./route.service');

function routeMiddleware(req, res, next) {
  try {
    const client = req.client;
    if (!client) {
      throw new ValidationError('Authentication required before routing');
    }

    const body = req.body || {};
    const clientModel = body.model;
    if (!clientModel) {
      throw new ValidationError('Missing model in request body');
    }

    const route = routeService.getByClientModel(client.id, clientModel);
    if (!route) {
      throw new NotFoundError(`No route for client ${client.name} model ${clientModel}`);
    }

    const target = routeService.selectTarget(route);
    if (!target) {
      throw new NotFoundError('No available target for this route');
    }

    const upstream = upstreamService.getById(target.upstreamId);
    if (!upstream || !upstream.enabled) {
      throw new NotFoundError('Upstream not found or disabled');
    }

    const key = upstreamService.getDefaultKey(upstream);
    if (!key || !key.enabled) {
      throw new NotFoundError(`No available key for upstream ${upstream.name}`);
    }

    req.routeContext = {
      client,
      route,
      target,
      upstream,
      key,
      upstreamModel: target.upstreamModel
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = routeMiddleware;
