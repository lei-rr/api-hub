/**
 * 通用 JSON 文件仓库
 * 文件不存在时自动创建默认空内容
 */

const fs = require('fs');
const path = require('path');

function create(filePath, defaultValue = []) {
  function ensureFile() {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf8');
    }
  }

  function read() {
    ensureFile();
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.error(`Failed to parse ${filePath}:`, err.message);
      return defaultValue;
    }
  }

  function write(data) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  return { read, write };
}

module.exports = { create };
