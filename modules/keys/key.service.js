/**
 * 密钥业务逻辑
 */

const { uuid, now } = require('../../shared/utils');
const { NotFoundError, ValidationError } = require('../../shared/errors');
const keyModel = require('./key.model');
const keyRepository = require('./key.repository');

function list() {
  return keyRepository.read();
}

function getById(id) {
  const key = list().find(k => k.id === id);
  if (!key) throw new NotFoundError(`Key ${id} not found`);
  return key;
}

function create(data) {
  const errors = keyModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const keys = list();
  const key = keyModel.create({
    ...data,
    id: uuid(),
    createdAt: now()
  });

  if (key.isDefault) {
    keys.forEach(k => {
      if (k.channelId === key.channelId) k.isDefault = false;
    });
  }

  keys.push(key);
  keyRepository.write(keys);
  return key;
}

function update(id, data) {
  const errors = keyModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const keys = list();
  const index = keys.findIndex(k => k.id === id);
  if (index === -1) throw new NotFoundError(`Key ${id} not found`);

  const updated = keyModel.create({
    ...keys[index],
    ...data,
    id: keys[index].id,
    createdAt: keys[index].createdAt
  });

  if (updated.isDefault) {
    keys.forEach(k => {
      if (k.channelId === updated.channelId && k.id !== updated.id) {
        k.isDefault = false;
      }
    });
  }

  keys[index] = updated;
  keyRepository.write(keys);
  return updated;
}

function remove(id) {
  const keys = list();
  const index = keys.findIndex(k => k.id === id);
  if (index === -1) throw new NotFoundError(`Key ${id} not found`);
  keys.splice(index, 1);
  keyRepository.write(keys);
}

function listByChannel(channelId) {
  return list().filter(k => k.channelId === channelId);
}

function getDefaultForChannel(channelId) {
  const keys = listByChannel(channelId).filter(k => k.enabled);
  return keys.find(k => k.isDefault) || keys[0] || null;
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  listByChannel,
  getDefaultForChannel
};
