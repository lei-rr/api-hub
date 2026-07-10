/**
 * 应用布局：顶部导航 + 内容区
 */

const AppLayout = {
  name: 'AppLayout',

  setup() {
    const route = VueRouter.useRoute();
    const router = VueRouter.useRouter();
    const store = useHubStore();

    const selectedKeys = Vue.computed(() => [route.path]);

    const menuItems = [
      { key: '/dashboard', label: '控制台' },
      { key: '/channels', label: '渠道' },
      { key: '/keys', label: '密钥' },
      { key: '/clients', label: '客户端' },
      { key: '/routes', label: '路由规则' },
      { key: '/test', label: '中转测试' }
    ];

    function logout() {
      localStorage.removeItem('adminToken');
      router.replace('/login');
    }

    Vue.onMounted(() => {
      store.loadAll();
    });

    return {
      route,
      router,
      selectedKeys,
      menuItems,
      logout
    };
  },

  template: `
    <a-layout style="min-height: 100vh; background: #fff;">
      <a-layout-header style="position: sticky; top: 0; z-index: 10; background: #fff; padding: 0; border-bottom: 1px solid #f0f0f0;">
        <div class="app-container app-header-inner">
          <div class="app-brand-nav">
            <router-link to="/dashboard" class="app-brand">
              <a-avatar shape="square" style="background: #1677ff;">H</a-avatar>
              <a-typography-text strong style="font-size: 16px;">API Hub</a-typography-text>
            </router-link>
            <a-menu
              class="app-menu"
              mode="horizontal"
              :selected-keys="selectedKeys"
              @click="({ key }) => router.push(key)"
            >
              <a-menu-item v-for="item in menuItems" :key="item.key">{{ item.label }}</a-menu-item>
            </a-menu>
          </div>
          <a-dropdown :trigger="['click']">
            <a-button shape="circle">☰</a-button>
            <template #overlay>
              <a-menu @click="({ key }) => key === 'logout' && logout()">
                <a-menu-item key="logout" danger>退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <a-layout-content>
        <div class="app-container app-main">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  `
};
