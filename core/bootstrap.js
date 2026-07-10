/**
 * 应用启动装配
 */

const express = require('express');
const path = require('path');
const corsMiddleware = require('../middleware/cors');
const bodyParser = require('../middleware/bodyParser');
const errorHandler = require('../middleware/errorHandler');
const mountRoutes = require('./router');

function createApp() {
  const app = express();

  // 隐藏框架信息，减少信息泄露
  app.disable('x-powered-by');

  app.use(corsMiddleware);
  app.use(bodyParser);
  app.use(express.static(path.join(__dirname, '../public')));

  mountRoutes(app);

  app.use(errorHandler);

  return app;
}

module.exports = createApp;
