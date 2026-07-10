/**
 * 上游管理组件
 * 合并原渠道 + 密钥两层为上游一层
 */

const UpstreamManager = {
  name: 'UpstreamManager',

  setup() {
    const store = useHubStore();

    const modalVisible = Vue.ref(false);
    const isEdit = Vue.ref(false);
    const modelModalVisible = Vue.ref(false);
    const modelList = Vue.ref([]);
    const modelListTitle = Vue.ref('');

    const form = Vue.reactive({
      id: null,
      name: '',
      baseUrl: '',
      enabled: true,
      keys: []
    });

    const columns = [
      { title: '上游名称', dataIndex: 'name', key: 'name' },
      { title: '上游地址', dataIndex: 'baseUrl', key: 'baseUrl' },
      { title: '密钥数量', key: 'keyCount' },
      { title: '启用', dataIndex: 'enabled', key: 'enabled' },
      { title: '操作', key: 'action' }
    ];

    function resetForm() {
      form.id = null;
      form.name = '';
      form.baseUrl = '';
      form.enabled = true;
      form.keys = [];
    }

    function openCreate() {
      resetForm();
      isEdit.value = false;
      modalVisible.value = true;
    }

    function openEdit(record) {
      Object.assign(form, {
        ...record,
        keys: (record.keys || []).map(k => ({ ...k }))
      });
      isEdit.value = true;
      modalVisible.value = true;
    }

    function addKey() {
      form.keys.push({
        id: null,
        name: '',
        value: '',
        isDefault: false,
        enabled: true
      });
    }

    function removeKey(index) {
      form.keys.splice(index, 1);
    }

    function maskKey(value) {
      if (!value || value.length <= 8) return value;
      return value.slice(0, 6) + '****' + value.slice(-4);
    }

    async function saveUpstream() {
      const data = {
        name: form.name,
        baseUrl: form.baseUrl,
        enabled: form.enabled,
        keys: form.keys.map(k => {
          const key = {
            name: k.name,
            value: k.value,
            isDefault: k.isDefault,
            enabled: k.enabled
          };
          if (k.id) key.id = k.id;
          return key;
        })
      };

      if (isEdit.value) {
        await upstreamApi.update(form.id, data);
      } else {
        await upstreamApi.create(data);
      }

      modalVisible.value = false;
      await store.loadAll();
    }

    async function deleteUpstream(id) {
      await upstreamApi.delete(id);
      await store.loadAll();
    }

    async function fetchModels(record) {
      try {
        const res = await upstreamApi.fetchModels(record.id);
        modelList.value = res.data.data || [];
        modelListTitle.value = `${record.name} 的模型`;
        modelModalVisible.value = true;
      } catch (err) {
        // eslint-disable-next-line no-undef
        antd.message.error('获取模型失败：' + (err.message || '未知错误'));
      }
    }

    function closeModelModal() {
      modelModalVisible.value = false;
    }

    return {
      store,
      modalVisible,
      isEdit,
      modelModalVisible,
      modelList,
      modelListTitle,
      form,
      columns,
      openCreate,
      openEdit,
      addKey,
      removeKey,
      saveUpstream,
      deleteUpstream,
      fetchModels,
      closeModelModal,
      maskKey
    };
  },

  template: `
    <div>
      <div class="page-toolbar">
        <a-typography-title :level="5" style="margin: 0;">上游管理</a-typography-title>
        <div class="page-actions">
          <a-button type="primary" @click="openCreate">新增上游</a-button>
        </div>
      </div>

      <a-table :dataSource="store.upstreams" :columns="columns" :rowKey="'id'" size="middle">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'keyCount'">
            {{ (record.keys || []).length }}
          </template>
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" disabled />
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="openEdit(record)">编辑</a-button>
              <a-button type="link" @click="fetchModels(record)">获取模型</a-button>
              <a-popconfirm title="确定删除吗？" @confirm="deleteUpstream(record.id)">
                <a-button type="link" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        :visible="modalVisible"
        :title="isEdit ? '编辑上游' : '新增上游'"
        @ok="saveUpstream"
        @cancel="modalVisible = false"
        width="680px"
      >
        <a-form layout="vertical">
          <a-form-item label="上游名称">
            <a-input v-model:value="form.name" placeholder="如：OpenAI 官方" />
          </a-form-item>
          <a-form-item label="上游地址">
            <a-input v-model:value="form.baseUrl" placeholder="如：https://api.openai.com/v1" />
          </a-form-item>
          <a-form-item>
            <a-checkbox v-model:checked="form.enabled">启用</a-checkbox>
          </a-form-item>

          <a-form-item label="密钥列表">
            <a-space direction="vertical" style="width: 100%;" size="small">
              <a-row v-for="(key, index) in form.keys" :key="index" :gutter="8" align="middle">
                <a-col :span="6">
                  <a-input v-model:value="key.name" placeholder="密钥名称" />
                </a-col>
                <a-col :span="10">
                  <a-input v-model:value="key.value" placeholder="密钥值" />
                </a-col>
                <a-col :span="5">
                  <a-space>
                    <a-checkbox v-model:checked="key.enabled">启用</a-checkbox>
                    <a-checkbox v-model:checked="key.isDefault">默认</a-checkbox>
                  </a-space>
                </a-col>
                <a-col :span="3">
                  <a-button size="small" danger @click="removeKey(index)">删除</a-button>
                </a-col>
              </a-row>
              <a-button type="dashed" block @click="addKey">
                + 添加密钥
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-modal
        :visible="modelModalVisible"
        :title="modelListTitle"
        :footer="null"
        @cancel="closeModelModal"
        width="500px"
      >
        <a-space wrap>
          <a-tag v-for="m in modelList" :key="m.id">{{ m.id }}</a-tag>
        </a-space>
      </a-modal>
    </div>
  `
};
