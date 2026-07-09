/**
 * 登录页面
 */

const LoginPage = {
  name: 'LoginPage',

  setup() {
    const username = Vue.ref('');
    const password = Vue.ref('');
    const loading = Vue.ref(false);

    Vue.onMounted(async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          await authApi.me();
          window.location.hash = '#/dashboard';
        } catch {
          localStorage.removeItem('adminToken');
        }
      }
    });

    async function submit() {
      if (!username.value.trim() || !password.value || loading.value) return;

      loading.value = true;
      try {
        const res = await authApi.login(username.value.trim(), password.value);
        localStorage.setItem('adminToken', res.data.data.token);
        window.location.hash = '#/dashboard';
      } catch (err) {
        antd.message.error('登录失败：' + (err.response?.data?.error?.message || err.message));
      } finally {
        loading.value = false;
      }
    }

    return {
      username,
      password,
      loading,
      submit
    };
  },

  template: `
    <a-layout style="min-height: 100vh; background: #fff;">
      <a-layout-content style="display: flex; align-items: center; justify-content: center; padding: 24px;">
        <div style="width: min(360px, calc(100vw - 32px));">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 30px;">
            <a-avatar shape="square" size="large" style="background: #1677ff">H</a-avatar>
            <a-typography-title :level="3" style="margin: 0; line-height: 1;">Hub Proxy</a-typography-title>
          </div>
          <a-form layout="vertical" @submit.prevent="submit">
            <a-form-item style="margin-bottom: 18px;">
              <a-input
                v-model:value="username"
                size="large"
                placeholder="用户名"
                autocomplete="username"
                @pressEnter="submit"
              />
            </a-form-item>
            <a-form-item style="margin-bottom: 18px;">
              <a-input-password
                v-model:value="password"
                size="large"
                placeholder="密码"
                autocomplete="current-password"
                @pressEnter="submit"
              />
            </a-form-item>
            <a-button
              type="primary"
              size="large"
              block
              :loading="loading"
              :disabled="!username.trim() || !password"
              @click="submit"
            >
              登录
            </a-button>
          </a-form>
        </div>
      </a-layout-content>
    </a-layout>
  `
};
