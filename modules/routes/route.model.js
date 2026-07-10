/**
 * 路由规则数据模型
 * 客户端 + 客户端模型名 → 多个目标（上游 + 上游模型）
 */

function validate(data) {
  const errors = [];

  if (!data.clientId || typeof data.clientId !== 'string') {
    errors.push('clientId is required');
  }

  if (!data.clientModel || typeof data.clientModel !== 'string') {
    errors.push('clientModel is required');
  }

  if (!Array.isArray(data.targets) || data.targets.length === 0) {
    errors.push('targets must be a non-empty array');
  } else {
    data.targets.forEach((target, index) => {
      if (!target.upstreamId) errors.push(`targets[${index}].upstreamId is required`);
      if (!target.upstreamModel) errors.push(`targets[${index}].upstreamModel is required`);
    });
  }

  if (!data.strategy || !['round-robin', 'random'].includes(data.strategy)) {
    errors.push('strategy must be round-robin or random');
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    clientId: data.clientId || '',
    clientModel: data.clientModel || '',
    strategy: data.strategy || 'round-robin',
    currentIndex: data.currentIndex || 0,
    targets: Array.isArray(data.targets) ? data.targets.map(t => ({
      upstreamId: t.upstreamId || '',
      upstreamModel: t.upstreamModel || '',
      weight: typeof t.weight === 'number' ? t.weight : 1
    })) : [],
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
