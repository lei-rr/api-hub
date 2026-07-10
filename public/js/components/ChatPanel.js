/**
 * 聊天面板组件
 * 展示当前客户端的路由：客户端 + 模型 → 渠道 + 渠道模型
 */

const ChatPanel = {
  name: 'ChatPanel',

  setup() {
    const store = useHubStore();
    const { streamResponse } = useStreaming();

    const userInput = Vue.ref('');

    const clientOptions = Vue.computed(() => {
      return store.enabledClients.map(c => ({
        label: `${c.name} (${c.apiKey})`,
        value: c.id
      }));
    });

    const modelOptions = Vue.computed(() => {
      return store.availableModels.map(m => ({
        label: m,
        value: m
      }));
    });

    const apiKey = Vue.computed(() => {
      const client = store.currentClient;
      return client ? client.apiKey : '';
    });

    const routeInfo = Vue.computed(() => {
      const route = store.currentRoute;
      if (!route) return '无路由规则';
      if (!route.targets || route.targets.length === 0) return '路由规则无目标';

      const targets = route.targets.map(t => {
        const channel = store.channels.find(c => c.id === t.channelId);
        return `${channel?.name || '-'}/${t.upstreamModel}`;
      });
      return `策略：${route.strategy === 'round-robin' ? '轮询' : '随机'} | 目标：${targets.join('、')}`;
    });

    async function sendMessage() {
      const text = userInput.value.trim();
      if (!text || !store.currentModel) return;

      store.addMessage('user', text);
      userInput.value = '';
      store.loading = true;
      store.addMessage('assistant', '');

      const messages = store.messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }));

      const body = {
        model: store.currentModel,
        messages,
        stream: true
      };

      try {
        const response = await proxyApi.chatCompletions(body, apiKey.value);

        if (!response.ok) {
          const error = await response.text();
          store.updateLastMessage(`请求失败: ${error}`);
          store.loading = false;
          return;
        }

        let fullContent = '';
        for await (const event of streamResponse(response)) {
          if (event.done) break;
          const delta = event.data?.choices?.[0]?.delta;
          if (delta && delta.content) {
            fullContent += delta.content;
            store.updateLastMessage(fullContent);
          }
        }
      } catch (err) {
        store.updateLastMessage(`错误: ${err.message}`);
      } finally {
        store.loading = false;
      }
    }

    function clearChat() {
      store.clearMessages();
    }

    return {
      store,
      userInput,
      clientOptions,
      modelOptions,
      apiKey,
      routeInfo,
      sendMessage,
      clearChat
    };
  },

  template: `
    <div>
      <a-typography-title :level="4">API 中转测试</a-typography-title>

      <a-space wrap style="margin-bottom: 16px;">
        <a-select
          :value="store.currentClientId"
          :options="clientOptions"
          placeholder="选择客户端"
          @change="store.setCurrentClient"
          style="width: 260px"
        />
        <a-select
          :value="store.currentModel"
          :options="modelOptions"
          placeholder="选择模型"
          @change="store.setCurrentModel"
          style="width: 160px"
        />
        <a-input
          :value="apiKey"
          disabled
          placeholder="客户端 API Key"
          style="width: 200px"
        />
      </a-space>

      <a-alert
        :message="'当前路由：' + routeInfo"
        type="info"
        show-icon
        style="margin-bottom: 16px;"
      />

      <a-list
        :data-source="store.messages"
        bordered
        style="max-height: 500px; overflow-y: auto; margin-bottom: 16px;"
        :locale="{ emptyText: '开始一段新的对话' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                <a-tag :color="item.role === 'user' ? 'blue' : 'green'">
                  {{ item.role === 'user' ? '用户' : '助手' }}
                </a-tag>
              </template>
              <template #description>
                <div class="message-content">{{ item.content }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <a-space direction="vertical" style="width: 100%;" size="middle">
        <a-textarea
          v-model:value="userInput"
          :rows="3"
          placeholder="输入消息，按 Ctrl+Enter 发送..."
          @pressEnter.ctrl.prevent="sendMessage"
        />
        <a-space>
          <a-button type="primary" :loading="store.loading" @click="sendMessage">
            发送
          </a-button>
          <a-button @click="clearChat">清空对话</a-button>
        </a-space>
      </a-space>
    </div>
  `
};
