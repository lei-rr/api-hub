const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  dataDir: path.join(__dirname, '../data'),
  files: {
    clients: path.join(__dirname, '../data/clients.json'),
    upstreams: path.join(__dirname, '../data/upstreams.json'),
    routes: path.join(__dirname, '../data/routes.json')
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'guolei',
    token: process.env.ADMIN_TOKEN || 'hub-guolei-token'
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  }
};
