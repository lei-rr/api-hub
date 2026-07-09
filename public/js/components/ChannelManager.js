/**
 * 渠道管理组件
 */

const ChannelManager = {
  name: 'ChannelManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const form = Vue.reactive({
      id: null,
      name: '',
      baseUrl: '',
      enabled: true
    });

    const columns = [
      { title: '渠道名称', dataIndex: 'name', key: 'name' },
      { title: '上游地址', dataIndex: 'baseUrl', key: 'baseUrl' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.name = '';
      form.baseUrl = '';
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

    async function saveChannel() {
      const data = {
        name: form.name,
        baseUrl: form.baseUrl,
        enabled: form.enabled
      };

      if (isEdit.value) {
        await channelApi.update(form.id, data);
      } else {
        await channelApi.create(data);
      }

      modalVisible.value = false;
      await store.loadAll();
    }

    async function deleteChannel(id) {
      await channelApi.delete(id);
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
      saveChannel,
      deleteChannel
    };
  },

  template: `
    <div>
      <div class="page-toolbar">
        <a-typography-title :level="5" style="margin: 0;">渠道管理</a-typography-title>
        <div class="page-actions">
          <a-button type="primary" @click="openCreate">新增渠道</a-button>
        </div>
      </div>

      <a-table :dataSource="store.channels" :columns="columns" :rowKey="'id'" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" disabled />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="deleteChannel(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        :visible="modalVisible"
        :title="isEdit ? '编辑渠道' : '新增渠道'"
        @ok="saveChannel"
        @cancel="modalVisible = false"
        width="500px"
      >
        <a-form layout="vertical">
          <a-form-item label="渠道名称">
            <a-input v-model:value="form.name" placeholder="如：OpenAI 官方" />
          </a-form-item>
          <a-form-item label="上游地址 (baseUrl)">
            <a-input v-model:value="form.baseUrl" placeholder="https://api.openai.com/v1" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  `
};
