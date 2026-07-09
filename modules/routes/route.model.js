/**
 * 路由规则数据模型
 * 客户端 + 客户端模型名 → 渠道 + 上游模型
 */

function validate(data) {
  const errors = [];

  if (!data.clientId || typeof data.clientId !== 'string') {
    errors.push('clientId is required');
  }

  if (!data.channelId || typeof data.channelId !== 'string') {
    errors.push('channelId is required');
  }

  if (!data.clientModel || typeof data.clientModel !== 'string') {
    errors.push('clientModel is required');
  }

  if (!data.upstreamModel || typeof data.upstreamModel !== 'string') {
    errors.push('upstreamModel is required');
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    clientId: data.clientId || '',
    channelId: data.channelId || '',
    clientModel: data.clientModel || '',
    upstreamModel: data.upstreamModel || '',
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
