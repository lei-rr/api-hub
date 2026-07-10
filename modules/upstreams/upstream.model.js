/**
 * 上游数据模型
 * 一个上游 = baseUrl + 一组密钥
 */

const MAX_NAME_LENGTH = 100;
const MAX_URL_LENGTH = 512;
const MAX_KEY_VALUE_LENGTH = 512;
const MAX_KEY_NAME_LENGTH = 100;

function validate(data) {
  const errors = [];

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    errors.push('name is required');
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.push(`name must not exceed ${MAX_NAME_LENGTH} characters`);
  }

  const baseUrl = typeof data.baseUrl === 'string' ? data.baseUrl.trim() : '';
  if (!baseUrl) {
    errors.push('baseUrl is required');
  } else if (baseUrl.length > MAX_URL_LENGTH) {
    errors.push(`baseUrl must not exceed ${MAX_URL_LENGTH} characters`);
  }

  if (data.keys && Array.isArray(data.keys)) {
    data.keys.forEach((key, index) => {
      const value = typeof key.value === 'string' ? key.value.trim() : '';
      if (!value) {
        errors.push(`keys[${index}].value is required`);
      } else if (value.length > MAX_KEY_VALUE_LENGTH) {
        errors.push(`keys[${index}].value must not exceed ${MAX_KEY_VALUE_LENGTH} characters`);
      }

      const keyName = typeof key.name === 'string' ? key.name.trim() : '';
      if (keyName.length > MAX_KEY_NAME_LENGTH) {
        errors.push(`keys[${index}].name must not exceed ${MAX_KEY_NAME_LENGTH} characters`);
      }
    });
  }

  return errors;
}

function createKey(data) {
  return {
    id: data.id || '',
    name: (data.name || '').trim(),
    value: (data.value || '').trim(),
    isDefault: data.isDefault === true,
    enabled: data.enabled !== false,
    createdAt: data.createdAt || ''
  };
}

function create(data) {
  return {
    id: data.id || '',
    name: (data.name || '').trim(),
    baseUrl: (data.baseUrl || '').trim(),
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
