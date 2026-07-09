/**
 * 密钥数据模型
 */

function validate(data) {
  const errors = [];

  if (!data.channelId || typeof data.channelId !== 'string') {
    errors.push('channelId is required');
  }

  if (!data.value || typeof data.value !== 'string') {
    errors.push('value is required');
  }

  return errors;
}

function create(data) {
  return {
    id: data.id || '',
    channelId: data.channelId || '',
    name: data.name || '',
    value: data.value || '',
    isDefault: data.isDefault === true,
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create
};
