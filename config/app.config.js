const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  dataDir: path.join(__dirname, '../data'),
  files: {
    admin: path.join(__dirname, '../data/admin.json'),
    clients: path.join(__dirname, '../data/clients.json'),
    upstreams: path.join(__dirname, '../data/upstreams.json'),
    routes: path.join(__dirname, '../data/routes.json')
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
  }
};
