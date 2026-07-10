/**
 * 路由规则数据模型
 * 客户端 + 客户端模型名 → 多个目标（上游 + 上游模型）
 */

const MAX_MODEL_LENGTH = 128;
const MAX_TARGETS = 20;

function validate(data) {
  const errors = [];

  if (!data.clientId || typeof data.clientId !== 'string') {
    errors.push('clientId is required');
  }

  const clientModel = typeof data.clientModel === 'string' ? data.clientModel.trim() : '';
  if (!clientModel) {
    errors.push('clientModel is required');
  } else if (clientModel.length > MAX_MODEL_LENGTH) {
    errors.push(`clientModel must not exceed ${MAX_MODEL_LENGTH} characters`);
  }

  if (!Array.isArray(data.targets) || data.targets.length === 0) {
    errors.push('targets must be a non-empty array');
  } else if (data.targets.length > MAX_TARGETS) {
    errors.push(`targets must not exceed ${MAX_TARGETS}`);
  } else {
    data.targets.forEach((target, index) => {
      if (!target.upstreamId) errors.push(`targets[${index}].upstreamId is required`);

      const upstreamModel = typeof target.upstreamModel === 'string' ? target.upstreamModel.trim() : '';
      if (!upstreamModel) {
        errors.push(`targets[${index}].upstreamModel is required`);
      } else if (upstreamModel.length > MAX_MODEL_LENGTH) {
        errors.push(`targets[${index}].upstreamModel must not exceed ${MAX_MODEL_LENGTH} characters`);
      }
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
    clientModel: (data.clientModel || '').trim(),
    strategy: data.strategy || 'round-robin',
    currentIndex: data.currentIndex || 0,
    targets: Array.isArray(data.targets) ? data.targets.map(t => ({
      upstreamId: t.upstreamId || '',
      upstreamModel: (t.upstreamModel || '').trim(),
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
