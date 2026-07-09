/**
 * 客户端数据模型
 */

function validate(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }

  if (!data.apiKey || typeof data.apiKey !== 'string') {
    errors.push('apiKey is required');
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    name: data.name || '',
    apiKey: data.apiKey || '',
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
