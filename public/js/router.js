/**
 * Vue Router 配置
 */

const { createRouter, createWebHashHistory } = VueRouter;

const routes = [
  { path: '/login', component: LoginPage, meta: { public: true } },
  {
    path: '/',
    component: AppLayout,
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: DashboardView, meta: { title: '控制台' } },
      { path: 'test', component: ChatPanel, meta: { title: '中转测试' } },
      { path: 'channels', component: ChannelManager, meta: { title: '渠道' } },
      { path: 'keys', component: KeyManager, meta: { title: '密钥' } },
      { path: 'clients', component: ClientManager, meta: { title: '客户端' } },
      { path: 'routes', component: RouteManager, meta: { title: '路由规则' } }
    ]
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(async (to) => {
  if (to.meta?.public) return true;

  const token = localStorage.getItem('adminToken');
  if (!token) return '/login';

  try {
    await authApi.me();
    return true;
  } catch {
    localStorage.removeItem('adminToken');
    return '/login';
  }
});
