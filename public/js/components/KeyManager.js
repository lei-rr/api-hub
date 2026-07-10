/**
 * 密钥管理组件
 */

const KeyManager = {
  name: 'KeyManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const form = Vue.reactive({
      id: null,
      channelId: '',
      name: '',
      value: '',
      isDefault: false,
      enabled: true
    });

    const columns = [
      { title: '渠道', key: 'channel' },
      { title: '密钥名称', dataIndex: 'name', key: 'name' },
      { title: '密钥值', key: 'value' },
      { title: '默认', dataIndex: 'isDefault', key: 'isDefault' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.channelId = store.channels[0]?.id || '';
      form.name = '';
      form.value = '';
      form.isDefault = false;
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

    async function saveKey() {
      const data = {
        channelId: form.channelId,
        name: form.name,
        value: form.value,
        isDefault: form.isDefault,
        enabled: form.enabled
      };

      if (isEdit.value) {
        await keyApi.update(form.id, data);
      } else {
        await keyApi.create(data);
      }

      modalVisible.value = false;
      await store.loadAll();
    }

    async function deleteKey(id) {
      await keyApi.delete(id);
      await store.loadAll();
    }

    function getChannelName(channelId) {
      const channel = store.channels.find(c => c.id === channelId);
      return channel ? channel.name : '-';
    }

    function maskKey(value) {
      if (!value || value.length <= 8) return value;
      return value.slice(0, 6) + '****' + value.slice(-4);
    }

    return {
      store,
      modalVisible,
      isEdit,
      form,
      columns,
      openCreate,
      openEdit,
      saveKey,
      deleteKey,
      getChannelName,
      maskKey
    };
  },

  template: `
    <div>
      <div class="page-toolbar">
        <a-typography-title :level="5" style="margin: 0;">密钥管理</a-typography-title>
        <div class="page-actions">
          <a-button type="primary" @click="openCreate">新增密钥</a-button>
        </div>
      </div>

      <a-table :dataSource="store.keys" :columns="columns" :rowKey="'id'" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'channel'">
            {{ getChannelName(record.channelId) }}
          </template>
          <template v-if="column.key === 'value'">
            {{ maskKey(record.value) }}
          </template>
          <template v-if="column.key === 'isDefault'">
            <a-tag :color="record.isDefault ? 'green' : ''">{{ record.isDefault ? '是' : '否' }}</a-tag>
          </template>
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" disabled />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="deleteKey(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        :visible="modalVisible"
        :title="isEdit ? '编辑密钥' : '新增密钥'"
        @ok="saveKey"
        @cancel="modalVisible = false"
        width="500px"
      >
        <a-form layout="vertical">
          <a-form-item label="渠道">
            <a-select
              v-model:value="form.channelId"
              :options="store.channels.map(c => ({ label: c.name, value: c.id }))"
              placeholder="选择渠道"
            />
          </a-form-item>
          <a-form-item label="密钥名称">
            <a-input v-model:value="form.name" placeholder="如：主密钥" />
          </a-form-item>
          <a-form-item label="密钥值">
            <a-input v-model:value="form.value" placeholder="如：sk-xxxxxxxx" />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
              <a-checkbox v-model:checked="form.isDefault">设为默认</a-checkbox>
            </a-space>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  `
};
