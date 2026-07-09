/**
 * Vue 应用入口
 */

const { createApp } = Vue;
const { createPinia } = Pinia;

const app = createApp({
  template: '<router-view />'
});

app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue error]', info, err);
};

app.use(createPinia());
app.use(antd);
app.use(router);

app.mount('#app');
