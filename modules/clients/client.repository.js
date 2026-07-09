/**
 * 客户端数据仓库
 */

const config = require('../../config/app.config');
const { create } = require('../../shared/jsonRepository');

module.exports = create(config.files.clients);
