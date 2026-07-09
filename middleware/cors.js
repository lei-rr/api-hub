const config = require('../config/app.config');

function corsMiddleware(req, res, next) {
  res.header('Access-Control-Allow-Origin', config.cors.origin);
  res.header('Access-Control-Allow-Methods', config.cors.methods.join(','));
  res.header('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(','));

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

module.exports = corsMiddleware;
