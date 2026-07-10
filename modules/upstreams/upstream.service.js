/**
 * 上游业务逻辑
 * 一个上游 = baseUrl + 一组密钥
 */

const axios = require('axios');
const { uuid, now } = require('../../shared/utils');
const { NotFoundError, ValidationError, AppError } = require('../../shared/errors');
const upstreamModel = require('./upstream.model');
const upstreamRepository = require('./upstream.repository');
const upstreamCache = require('./upstream.cache');

function list() {
  return upstreamRepository.read();
}

function getById(id) {
  const upstream = list().find(u => u.id === id);
  if (!upstream) throw new NotFoundError(`Upstream ${id} not found`);
  return upstream;
}

function normalizeKeys(keys) {
  const normalized = (keys || []).map(k => upstreamModel.createKey({
    ...k,
    id: k.id || uuid(),
    createdAt: k.createdAt || now()
  }));

  // 确保只有一个默认 key
  let hasDefault = false;
  normalized.forEach(k => {
    if (k.enabled && k.isDefault) {
      if (hasDefault) k.isDefault = false;
      hasDefault = true;
    }
  });

  return normalized;
}

function create(data) {
  const errors = upstreamModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const upstreams = list();
  const upstream = upstreamModel.create({
    ...data,
    id: uuid(),
    keys: normalizeKeys(data.keys),
    createdAt: now()
  });
  upstreams.push(upstream);
  upstreamRepository.write(upstreams);
  return upstream;
}

function update(id, data) {
  const errors = upstreamModel.validate(data);
  if (errors.length > 0) throw new ValidationError(errors.join('; '));

  const upstreams = list();
  const index = upstreams.findIndex(u => u.id === id);
  if (index === -1) throw new NotFoundError(`Upstream ${id} not found`);

  upstreams[index] = upstreamModel.create({
    ...upstreams[index],
    ...data,
    id: upstreams[index].id,
    keys: normalizeKeys(data.keys),
    createdAt: upstreams[index].createdAt
  });
  upstreamRepository.write(upstreams);
  upstreamCache.clear(id);
  return upstreams[index];
}

function remove(id) {
  const upstreams = list();
  const index = upstreams.findIndex(u => u.id === id);
  if (index === -1) throw new NotFoundError(`Upstream ${id} not found`);
  upstreams.splice(index, 1);
  upstreamRepository.write(upstreams);
  upstreamCache.clear(id);
}

function getDefaultKey(upstream) {
  const keys = upstream.keys.filter(k => k.enabled);
  return keys.find(k => k.isDefault) || keys[0] || null;
}

async function fetchUpstreamModels(id, force = false) {
  const upstream = getById(id);

  if (!force) {
    const cached = upstreamCache.get(id);
    if (cached) return cached;
  }

  const key = getDefaultKey(upstream);
  if (!key) {
    throw new AppError(`No key configured for upstream ${upstream.name}`, 404, 'NOT_FOUND');
  }

  const upstreamUrl = upstream.baseUrl.replace(/\/$/, '') + '/models';

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
    upstreamCache.set(id, normalized);
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
  getDefaultKey,
  fetchUpstreamModels
};
