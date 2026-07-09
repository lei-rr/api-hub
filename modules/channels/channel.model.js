/**
 * 渠道数据模型
 */

function validate(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }

  if (!data.baseUrl || typeof data.baseUrl !== 'string') {
    errors.push('baseUrl is required');
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    name: data.name || '',
    baseUrl: data.baseUrl || '',
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
