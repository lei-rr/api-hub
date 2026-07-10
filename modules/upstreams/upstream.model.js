/**
 * 上游数据模型
 * 一个上游 = baseUrl + 一组密钥
 */

function validate(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('name is required');
  }

  if (!data.baseUrl || typeof data.baseUrl !== 'string') {
    errors.push('baseUrl is required');
  }

  if (data.keys && Array.isArray(data.keys)) {
    data.keys.forEach((key, index) => {
      if (!key.value || typeof key.value !== 'string') {
        errors.push(`keys[${index}].value is required`);
      }
    });
  }

  return errors;
}

function createKey(data) {
  return {
    id: data.id || '',
    name: data.name || '',
    value: data.value || '',
    isDefault: data.isDefault === true,
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

function create(data) {
  return {
    id: data.id || '',
    name: data.name || '',
    baseUrl: data.baseUrl || '',
    enabled: data.enabled !== false,
    keys: Array.isArray(data.keys)
      ? data.keys.map(createKey)
      : [],
    createdAt: data.createdAt || ''
  };
}

module.exports = {
  validate,
  create,
  createKey
};
