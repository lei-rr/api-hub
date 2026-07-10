/**
 * 路由规则业务逻辑
 * 客户端 + 客户端模型名 → 多个目标（上游 + 上游模型）
 */

const { uuid, now } = require('../../shared/utils');
const { NotFoundError, ValidationError } = require('../../shared/errors');
const routeModel = require('./route.model');
const routeRepository = require('./route.repository');

const routeState = new Map();

function list() {
  return routeRepository.read();
}

function getById(id) {
  const route = list().find(r => r.id === id);
  if (!route) throw new NotFoundError(`Route ${id} not found`);
  return route;
}

function create(data) {
  const errors = routeModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const routes = list();
  const exists = routes.find(r =>
    r.clientId === data.clientId && r.clientModel === data.clientModel
  );
  if (exists) {
    throw new ValidationError(`Route for this client and model already exists`);
  }

  const route = routeModel.create({
    ...data,
    id: uuid(),
    currentIndex: 0,
    createdAt: now()
  });
  routes.push(route);
  routeRepository.write(routes);
  return route;
}

function update(id, data) {
  const errors = routeModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const routes = list();
  const index = routes.findIndex(r => r.id === id);
  if (index === -1) throw new NotFoundError(`Route ${id} not found`);

  const duplicate = routes.find(r =>
    r.clientId === data.clientId &&
    r.clientModel === data.clientModel &&
    r.id !== id
  );
  if (duplicate) {
    throw new ValidationError(`Route for this client and model already exists`);
  }

  routes[index] = routeModel.create({
    ...routes[index],
    ...data,
    id: routes[index].id,
    createdAt: routes[index].createdAt
  });
  routeRepository.write(routes);
  return routes[index];
}

function remove(id) {
  const routes = list();
  const index = routes.findIndex(r => r.id === id);
  if (index === -1) throw new NotFoundError(`Route ${id} not found`);
  routes.splice(index, 1);
  routeRepository.write(routes);
  routeState.delete(id);
}

function listByClient(clientId) {
  return list().filter(r => r.clientId === clientId);
}

function listByUpstream(upstreamId) {
  return list().filter(r =>
    r.targets.some(t => t.upstreamId === upstreamId)
  );
}

function getByClientModel(clientId, clientModel) {
  return list().find(r =>
    r.clientId === clientId &&
    r.clientModel === clientModel &&
    r.enabled
  ) || null;
}

function selectTarget(route) {
  const targets = route.targets.filter(t => t.enabled !== false);
  if (targets.length === 0) return null;

  if (route.strategy === 'random') {
    return targets[Math.floor(Math.random() * targets.length)];
  }

  // round-robin
  let index = routeState.get(route.id) || 0;
  const target = targets[index % targets.length];
  index = (index + 1) % targets.length;
  routeState.set(route.id, index);
  return target;
}

function getAllClientModels() {
  return list()
    .filter(r => r.enabled)
    .map(r => ({
      id: r.clientModel,
      object: 'model',
      clientId: r.clientId
    }));
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listByClient,
  listByUpstream,
  getByClientModel,
  selectTarget,
  getAllClientModels
};
