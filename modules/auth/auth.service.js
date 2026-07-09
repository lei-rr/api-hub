/**
 * 鉴权服务
 */

const { NotFoundError, ValidationError, AppError } = require('../../shared/errors');
const config = require('../../config/app.config');
const clientService = require('../clients/client.service');
const channelService = require('../channels/channel.service');
const routeService = require('../routes/route.service');
const keyService = require('../keys/key.service');

const ADMIN_TOKEN = config.admin.token;

function extractApiKey(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

function extractAdminToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Admin ')) return null;
  return auth.slice(6).trim();
}

function login(username, password) {
  if (username !== config.admin.username || password !== config.admin.password) {
    throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
  }
  return { token: ADMIN_TOKEN };
}

function verifyAdmin(token) {
  return token === ADMIN_TOKEN;
}

function resolveContext(req) {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    throw new ValidationError('Missing Authorization header');
  }

  const client = clientService.getByApiKey(apiKey);
  if (!client) {
    throw new NotFoundError('Client not found or disabled');
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

  const channel = channelService.getById(route.channelId);
  if (!channel || !channel.enabled) {
    throw new NotFoundError('Channel not found or disabled');
  }

  const key = keyService.getDefaultForChannel(channel.id);
  if (!key || !key.enabled) {
    throw new NotFoundError(`No available key for channel ${channel.name}`);
  }

  return {
    client,
    route,
    channel,
    key
  };
}

module.exports = {
  extractApiKey,
  extractAdminToken,
  login,
  verifyAdmin,
  resolveContext
};
