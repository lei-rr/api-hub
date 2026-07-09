/**
 * 渠道业务逻辑
 */

const axios = require('axios');
const { uuid, now } = require('../../shared/utils');
const { NotFoundError, ValidationError, AppError } = require('../../shared/errors');
const channelModel = require('./channel.model');
const channelRepository = require('./channel.repository');
const keyService = require('../keys/key.service');
const channelCache = require('./channel.cache');

function list() {
  return channelRepository.read();
}

function getById(id) {
  const channel = list().find(c => c.id === id);
  if (!channel) throw new NotFoundError(`Channel ${id} not found`);
  return channel;
}

function create(data) {
  const errors = channelModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const channels = list();
  const channel = channelModel.create({
    ...data,
    id: uuid(),
    createdAt: now()
  });
  channels.push(channel);
  channelRepository.write(channels);
  return channel;
}

function update(id, data) {
  const errors = channelModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const channels = list();
  const index = channels.findIndex(c => c.id === id);
  if (index === -1) throw new NotFoundError(`Channel ${id} not found`);

  channels[index] = channelModel.create({
    ...channels[index],
    ...data,
    id: channels[index].id,
    createdAt: channels[index].createdAt
  });
  channelRepository.write(channels);
  return channels[index];
}

function remove(id) {
  const channels = list();
  const index = channels.findIndex(c => c.id === id);
  if (index === -1) throw new NotFoundError(`Channel ${id} not found`);
  channels.splice(index, 1);
  channelRepository.write(channels);
}

async function fetchUpstreamModels(id, force = false) {
  const channel = getById(id);

  if (!force) {
    const cached = channelCache.get(id);
    if (cached) return cached;
  }

  const key = keyService.getDefaultForChannel(channel.id);
  if (!key) {
    throw new AppError(`No key configured for channel ${channel.name}`, 404, 'NOT_FOUND');
  }

  const upstreamUrl = channel.baseUrl.replace(/\/$/, '') + '/models';

  try {
    const response = await axios.get(upstreamUrl, {
      headers: {
        'Authorization': `Bearer ${key.value}`,
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    const models = response.data.data || response.data || [];
    const normalized = models.map(m => ({
      id: m.id,
      object: m.object || 'model',
      owned_by: m.owned_by || ''
    }));
    channelCache.set(id, normalized);
    return normalized;
  } catch (err) {
    console.error('Fetch upstream models error:', err.message);
    throw new AppError(`Failed to fetch upstream models: ${err.message}`, 502, 'UPSTREAM_ERROR');
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  fetchUpstreamModels
};
