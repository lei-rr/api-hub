/**
 * 客户端业务逻辑
 */

const { uuid, now } = require('../../shared/utils');
const { NotFoundError, ValidationError } = require('../../shared/errors');
const clientModel = require('./client.model');
const clientRepository = require('./client.repository');

function list() {
  return clientRepository.read();
}

function getById(id) {
  const client = list().find(c => c.id === id);
  if (!client) throw new NotFoundError(`Client ${id} not found`);
  return client;
}

function getByApiKey(apiKey) {
  return list().find(c => c.apiKey === apiKey && c.enabled) || null;
}

function create(data) {
  const errors = clientModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const clients = list();
  const exists = clients.find(c => c.apiKey === data.apiKey);
  if (exists) {
    throw new ValidationError(`API Key "${data.apiKey}" already exists`);
  }

  const client = clientModel.create({
    ...data,
    id: uuid(),
    createdAt: now()
  });
  clients.push(client);
  clientRepository.write(clients);
  return client;
}

function update(id, data) {
  const errors = clientModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const clients = list();
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) throw new NotFoundError(`Client ${id} not found`);

  const duplicate = clients.find(c => c.apiKey === data.apiKey && c.id !== id);
  if (duplicate) {
    throw new ValidationError(`API Key "${data.apiKey}" already exists`);
  }

  clients[index] = clientModel.create({
    ...clients[index],
    ...data,
    id: clients[index].id,
    createdAt: clients[index].createdAt
  });
  clientRepository.write(clients);
  return clients[index];
}

function remove(id) {
  const clients = list();
  const index = clients.findIndex(c => c.id === id);
  if (index === -1) throw new NotFoundError(`Client ${id} not found`);
  clients.splice(index, 1);
  clientRepository.write(clients);
}

module.exports = {
  list,
  getById,
  getByApiKey,
  create,
  update,
  remove
};
