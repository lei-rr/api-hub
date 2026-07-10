/**
 * 控制台概览
 */

const DashboardView = {
  name: 'DashboardView',

  setup() {
    const store = useHubStore();

    const stats = Vue.computed(() => {
      return [
        { title: '渠道', value: store.channels.length },
        { title: '密钥', value: store.keys.length },
        { title: '路由规则', value: store.routes.length },
        { title: '客户端', value: store.clients.length }
      ];
    });

    function getClientName(clientId) {
      const client = store.clients.find(c => c.id === clientId);
      return client ? `${client.name} (${client.apiKey})` : '-';
    }

    function getChannelName(channelId) {
      const channel = store.channels.find(c => c.id === channelId);
      return channel ? channel.name : '-';
    }

    return {
      store,
      stats,
      getClientName,
      getChannelName
    };
  },

  template: `
    <div>
      <a-row :gutter="16" style="margin-bottom: 24px;">
        <a-col v-for="stat in stats" :key="stat.title" :span="6" :xs="12" :sm="12" :md="6">
          <a-card>
            <a-statistic :title="stat.title" :value="stat.value" />
          </a-card>
        </a-col>
      </a-row>

      <a-card title="路由概览" :bordered="false">
        <a-table :dataSource="store.routes" :rowKey="'id'" size="small">
          <a-table-column title="客户端" dataIndex="clientId" key="client">
            <template #default="{ text }">{{ getClientName(text) }}</template>
          </a-table-column>
          <a-table-column title="客户端模型" dataIndex="clientModel" />
          <a-table-column title="渠道" dataIndex="channelId" key="channel">
            <template #default="{ text }">{{ getChannelName(text) }}</template>
          </a-table-column>
          <a-table-column title="渠道模型" dataIndex="upstreamModel" />
          <a-table-column title="状态" dataIndex="enabled" key="enabled">
            <template #default="{ text }">
              <a-tag :color="text ? 'success' : 'default'">{{ text ? '启用' : '禁用' }}</a-tag>
            </template>
          </a-table-column>
        </a-table>
      </a-card>
    </div>
  `
};
