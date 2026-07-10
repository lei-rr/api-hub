/**
 * 统一路由挂载
 */

const authRoutes = require('../modules/auth/auth.routes');
const adminMiddleware = require('../modules/auth/admin.middleware');
const clientRoutes = require('../modules/clients/client.routes');
const upstreamRoutes = require('../modules/upstreams/upstream.routes');
const routeRoutes = require('../modules/routes/route.routes');
const routeService = require('../modules/routes/route.service');
const proxyRoutes = require('../modules/proxy/proxy.routes');

function mount(app) {
  app.use('/api/auth', authRoutes);

  app.use('/api/clients', adminMiddleware, clientRoutes);
  app.use('/api/upstreams', adminMiddleware, upstreamRoutes);
  app.use('/api/routes', adminMiddleware, routeRoutes);

  app.get('/v1/models', (req, res) => {
    res.json({
      object: 'list',
      data: routeService.getAllClientModels()
    });
  });

  app.use('/v1', proxyRoutes);
}

module.exports = mount;
