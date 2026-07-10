/**
 * 路由解析中间件
 * 根据 req.client 和请求体中的 model，解析出：
 * route / target / channel / key / upstreamModel
 * 结果挂载到 req.routeContext
 */

const { NotFoundError, ValidationError } = require('../../shared/errors');
const channelService = require('../channels/channel.service');
const keyService = require('../keys/key.service');
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

    const channel = channelService.getById(target.channelId);
    if (!channel || !channel.enabled) {
      throw new NotFoundError('Channel not found or disabled');
    }

    const key = keyService.getDefaultForChannel(channel.id);
    if (!key || !key.enabled) {
      throw new NotFoundError(`No available key for channel ${channel.name}`);
    }

    req.routeContext = {
      client,
      route,
      target,
      channel,
      key,
      upstreamModel: target.upstreamModel
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = routeMiddleware;
