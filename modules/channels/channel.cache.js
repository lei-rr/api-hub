/**
 * 上游模型列表缓存
 * 避免频繁请求上游 /v1/models
 */

const cache = new Map();
const TTL = 5 * 60 * 1000; // 5 分钟

function get(channelId) {
  const item = cache.get(channelId);
  if (!item) return null;
  if (Date.now() - item.timestamp > TTL) {
    cache.delete(channelId);
    return null;
  }
  return item.data;
}

function set(channelId, data) {
  cache.set(channelId, {
    data,
    timestamp: Date.now()
  });
}

function clear(channelId) {
  if (channelId) {
    cache.delete(channelId);
  } else {
    cache.clear();
  }
}

module.exports = {
  get,
  set,
  clear
};
