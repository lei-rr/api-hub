/**
 * 客户端管理组件
 */

const ClientManager = {
  name: 'ClientManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const form = Vue.reactive({
      id: null,
      name: '',
      apiKey: '',
      enabled: true
    });

    const columns = [
      { title: '名称', dataIndex: 'name', key: 'name' },
      { title: 'API Key', dataIndex: 'apiKey', key: 'apiKey' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.name = '';
      form.apiKey = '';
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

    async function saveClient() {
      const data = {
        name: form.name,
        apiKey: form.apiKey,
        enabled: form.enabled
      };

      if (isEdit.value) {
        await clientApi.update(form.id, data);
      } else {
        await clientApi.create(data);
      }

      modalVisible.value = false;
      await store.loadAll();
    }

    async function deleteClient(id) {
      await clientApi.delete(id);
      await store.loadAll();
    }

    return {
      store,
      modalVisible,
      isEdit,
      form,
      columns,
      openCreate,
      openEdit,
      saveClient,
      deleteClient
    };
  },

  template: `
    <div>
      <div class="page-toolbar">
        <a-typography-title :level="5" style="margin: 0;">客户端管理</a-typography-title>
        <div class="page-actions">
          <a-button type="primary" @click="openCreate">新增客户端</a-button>
        </div>
      </div>

      <a-table :dataSource="store.clients" :columns="columns" :rowKey="'id'" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" disabled />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="deleteClient(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        :visible="modalVisible"
        :title="isEdit ? '编辑客户端' : '新增客户端'"
        @ok="saveClient"
        @cancel="modalVisible = false"
        width="500px"
      >
        <a-form layout="vertical">
          <a-form-item label="名称">
            <a-input v-model:value="form.name" placeholder="如：默认客户端" />
          </a-form-item>
          <a-form-item label="API Key">
            <a-input v-model:value="form.apiKey" placeholder="客户端调用时使用的 Key，如 guolei" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  `
};
