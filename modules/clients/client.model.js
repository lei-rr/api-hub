/**
 * 客户端数据模型
 */

const MAX_NAME_LENGTH = 100;
const MAX_API_KEY_LENGTH = 256;

function validate(data) {
  const errors = [];

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    errors.push('name is required');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`name must not exceed ${MAX_NAME_LENGTH} characters`);
  }

  const apiKey = typeof data.apiKey === 'string' ? data.apiKey.trim() : '';
  if (!apiKey) {
    errors.push('apiKey is required');
  } else if (apiKey.length > MAX_API_KEY_LENGTH) {
    errors.push(`apiKey must not exceed ${MAX_API_KEY_LENGTH} characters`);
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    name: (data.name || '').trim(),
    apiKey: (data.apiKey || '').trim(),
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
