/**
 * 上游模型列表缓存
 * 避免频繁请求上游 /v1/models
 */

const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 分钟

function get(upstreamId) {
  const item = cache.get(upstreamId);
  if (!item) return null;
  if (Date.now() - item.timestamp > TTL) {
    cache.delete(upstreamId);
    return null;
  }
  return item.data;
}

function set(upstreamId, data) {
  cache.set(upstreamId, {
    data,
    timestamp: Date.now()
  });
}

function clear(upstreamId) {
  if (upstreamId) {
    cache.delete(upstreamId);
  } else {
    cache.clear();
  }
}

module.exports = {
  get,
  set,
  clear
};
