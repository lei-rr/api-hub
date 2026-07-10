/**
 * 路由规则管理组件
 * 客户端 + 客户端模型名 → 多个目标（上游 + 上游模型）
 */

const RouteManager = {
  name: 'RouteManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const fetching = Vue.ref({});
    const upstreamOptions = Vue.ref({});

    const form = Vue.reactive({
      id: null,
      clientId: '',
      clientModel: '',
      strategy: 'round-robin',
      targets: [],
      enabled: true
    });

    const columns = [
      { title: '客户端', key: 'client' },
      { title: '客户端模型', dataIndex: 'clientModel', key: 'clientModel' },
      { title: '策略', dataIndex: 'strategy', key: 'strategy' },
      { title: '目标上游', key: 'targets' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.clientId = store.clients[0]?.id || '';
      form.clientModel = '';
      form.strategy = 'round-robin';
      form.targets = [];
      form.enabled = true;
      upstreamOptions.value = {};
    }

    function openCreate() {
      resetForm();
      isEdit.value = false;
      modalVisible.value = true;
    }

    function openEdit(record) {
      Object.assign(form, {
        ...record,
        targets: record.targets.map(t => ({ ...t }))
      });
      isEdit.value = true;
      modalVisible.value = true;
      upstreamOptions.value = {};
    }

    function addTarget() {
      form.targets.push({
        upstreamId: store.upstreams[0]?.id || '',
        upstreamModel: '',
        weight: 1
      });
    }

    function removeTarget(index) {
      form.targets.splice(index, 1);
    }

    async function fetchUpstream(index) {
      const target = form.targets[index];
      if (!target || !target.upstreamId) return;

      fetching.value[index] = true;
      try {
        const res = await upstreamApi.fetchModels(target.upstreamId);
        upstreamOptions.value[index] = (res.data.data || []).map(m => ({
          label: m.id,
          value: m.id
        }));
      } finally {
        fetching.value[index] = false;
      }
    }

    async function saveRoute() {
      const data = {
        clientId: form.clientId,
        clientModel: form.clientModel,
        strategy: form.strategy,
        targets: form.targets,
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

    function getClientName(clientId) {
      const client = store.clients.find(c => c.id === clientId);
      return client ? `${client.name} (${client.apiKey})` : '-';
    }

    function getUpstreamName(upstreamId) {
      const upstream = store.upstreams.find(u => u.id === upstreamId);
      return upstream ? upstream.name : '-';
    }

    function formatTargets(targets) {
      if (!targets || targets.length === 0) return '-';
      return targets.map(t => `${getUpstreamName(t.upstreamId)}/${t.upstreamModel}`).join('、');
    }

    return {
      store,
      modalVisible,
      isEdit,
      form,
      columns,
      fetching,
      upstreamOptions,
      openCreate,
      openEdit,
      addTarget,
      removeTarget,
      fetchUpstream,
      saveRoute,
      deleteRoute,
      getClientName,
      formatTargets
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
          <template v-if="column.key === 'strategy'">
            {{ record.strategy === 'round-robin' ? '轮询' : '随机' }}
          </template>
          <template v-if="column.key === 'targets'">
            {{ formatTargets(record.targets) }}
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
        width="700px"
      >
        <a-form layout="vertical">
          <a-form-item label="客户端">
            <a-select
              v-model:value="form.clientId"
              :options="store.clients.map(c => ({ label: c.name + ' (' + c.apiKey + ')', value: c.id }))"
              placeholder="选择客户端"
            />
          </a-form-item>
          <a-form-item label="客户端模型名">
            <a-input v-model:value="form.clientModel" placeholder="Codex 里填的模型名，如：gpt" />
          </a-form-item>
          <a-form-item label="策略">
            <a-radio-group v-model:value="form.strategy">
              <a-radio value="round-robin">轮询</a-radio>
              <a-radio value="random">随机</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="目标上游">
            <a-space direction="vertical" style="width: 100%;" size="small">
              <a-row v-for="(target, index) in form.targets" :key="index" :gutter="8" align="middle">
                <a-col :span="7">
                  <a-select
                    v-model:value="target.upstreamId"
                    :options="store.upstreams.map(u => ({ label: u.name, value: u.id }))"
                    placeholder="选择上游"
                    style="width: 100%;"
                  />
                </a-col>
                <a-col :span="7">
                  <a-select
                    v-model:value="target.upstreamModel"
                    :options="upstreamOptions[index] || []"
                    placeholder="上游模型名"
                    style="width: 100%;"
                    show-search
                    allow-clear
                    :dropdown-match-select-width="false"
                  />
                </a-col>
                <a-col :span="4">
                  <a-input-number
                    v-model:value="target.weight"
                    :min="1"
                    :max="100"
                    placeholder="权重"
                    style="width: 100%;"
                  />
                </a-col>
                <a-col :span="6">
                  <a-space>
                    <a-button size="small" :loading="fetching[index]" @click="fetchUpstream(index)">获取</a-button>
                    <a-button size="small" danger @click="removeTarget(index)">删除</a-button>
                  </a-space>
                </a-col>
              </a-row>
              <a-button type="dashed" block @click="addTarget" v-if="form.targets.length < 10">
                + 添加目标上游
              </a-button>
            </a-space>
          </a-form-item>

          <a-form-item>
            <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  `
};
