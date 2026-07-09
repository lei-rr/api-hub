/**
 * 路由规则管理组件
 * 客户端 + 客户端模型名 → 渠道 + 上游模型
 */

const RouteManager = {
  name: 'RouteManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const fetching = Vue.ref(false);

    const form = Vue.reactive({
      id: null,
      clientId: '',
      channelId: '',
      clientModel: '',
      upstreamModel: '',
      enabled: true
    });

    const selectedChannelId = Vue.ref('');

    const columns = [
      { title: '客户端', key: 'client' },
      { title: '客户端模型', dataIndex: 'clientModel', key: 'clientModel' },
      { title: '渠道', key: 'channel' },
      { title: '上游模型', dataIndex: 'upstreamModel', key: 'upstreamModel' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.clientId = store.clients[0]?.id || '';
      form.channelId = store.channels[0]?.id || '';
      form.clientModel = '';
      form.upstreamModel = '';
      form.enabled = true;
    }

    function openCreate() {
      resetForm();
      isEdit.value = false;
      modalVisible.value = true;
    }

    function openEdit(record) {
      Object.assign(form, record);
      isEdit.value = true;
      modalVisible.value = true;
    }

    async function saveRoute() {
      const data = {
        clientId: form.clientId,
        channelId: form.channelId,
        clientModel: form.clientModel,
        upstreamModel: form.upstreamModel,
        enabled: form.enabled
      };

      if (isEdit.value) {
        await routeApi.update(form.id, data);
      } else {
        await routeApi.create(data);
      }

      modalVisible.value = false;
      await store.loadAll();
    }

    async function deleteRoute(id) {
      await routeApi.delete(id);
      await store.loadAll();
    }

    async function fetchUpstream() {
      if (!selectedChannelId.value) return;
      fetching.value = true;
      try {
        const res = await channelApi.fetchModels(selectedChannelId.value);
        store.setUpstreamModels(res.data.data || []);
      } finally {
        fetching.value = false;
      }
    }

    function selectUpstreamModel(modelId) {
      form.upstreamModel = modelId;
    }

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
      modalVisible,
      isEdit,
      form,
      columns,
      selectedChannelId,
      fetching,
      openCreate,
      openEdit,
      saveRoute,
      deleteRoute,
      fetchUpstream,
      selectUpstreamModel,
      getClientName,
      getChannelName
    };
  },

  template: `
    <div>
      <div class="page-toolbar">
        <a-typography-title :level="5" style="margin: 0;">路由规则管理</a-typography-title>
        <div class="page-actions">
          <a-button type="primary" @click="openCreate">新增路由</a-button>
        </div>
      </div>

      <a-table :dataSource="store.routes" :columns="columns" :rowKey="'id'" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'client'">
            {{ getClientName(record.clientId) }}
          </template>
          <template v-if="column.key === 'channel'">
            {{ getChannelName(record.channelId) }}
          </template>
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" disabled />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="deleteRoute(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        :visible="modalVisible"
        :title="isEdit ? '编辑路由规则' : '新增路由规则'"
        @ok="saveRoute"
        @cancel="modalVisible = false"
        width="600px"
      >
        <a-form layout="vertical">
          <a-form-item label="客户端">
            <a-select
              v-model:value="form.clientId"
              :options="store.clients.map(c => ({ label: c.name + ' (' + c.apiKey + ')', value: c.id }))"
              placeholder="选择客户端"
            />
          </a-form-item>
          <a-form-item label="渠道">
            <a-select
              v-model:value="form.channelId"
              :options="store.channels.map(c => ({ label: c.name, value: c.id }))"
              placeholder="选择渠道"
            />
          </a-form-item>
          <a-form-item label="客户端模型名">
            <a-input v-model:value="form.clientModel" placeholder="Codex 里填的模型名，如：gpt" />
          </a-form-item>
          <a-form-item label="上游模型名">
            <a-input v-model:value="form.upstreamModel" placeholder="上游真实模型名，如：gpt-5.5" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
          </a-form-item>
        </a-form>

        <a-divider>或从上游自动选择模型</a-divider>

        <a-space direction="vertical" style="width: 100%;">
          <a-space>
            <a-select
              v-model:value="selectedChannelId"
              :options="store.channels.map(c => ({ label: c.name, value: c.id }))"
              placeholder="选择渠道"
              style="width: 240px"
            />
            <a-button :loading="fetching" @click="fetchUpstream">获取上游模型</a-button>
          </a-space>

          <a-space v-if="store.upstreamModels.length > 0" wrap>
            <a-tag
              v-for="m in store.upstreamModels"
              :key="m.id"
              color="blue"
              style="cursor: pointer;"
              @click="selectUpstreamModel(m.id)"
            >
              {{ m.id }}
            </a-tag>
          </a-space>
        </a-space>
      </a-modal>
    </div>
  `
};
