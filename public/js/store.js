/**
 * Pinia Store
 * 路由核心：客户端 + 客户端模型名 → 多个目标（上游 + 上游模型）
 */

const { defineStore } = Pinia;

const useHubStore = defineStore('hub', {
  state: () => ({
    clients: [],
    upstreams: [],
    routes: [],
    currentClientId: null,
    currentModel: '',
    messages: [],
    loading: false
  }),

  getters: {
    currentClient(state) {
      return state.clients.find(c => c.id === state.currentClientId) || state.clients[0] || null;
    },
    enabledClients(state) {
      return state.clients.filter(c => c.enabled);
    },
    currentRoutes(state) {
      if (!state.currentClientId) return [];
      return state.routes.filter(r => r.clientId === state.currentClientId && r.enabled);
    },
    availableModels(state) {
      return state.currentRoutes.map(r => r.clientModel);
    },
    currentRoute(state) {
      return state.currentRoutes.find(r => r.clientModel === state.currentModel) || state.currentRoutes[0] || null;
    }
  },

  actions: {
    async loadAll() {
      const [clientsRes, upstreamsRes, routesRes] = await Promise.all([
        clientApi.list(),
        upstreamApi.list(),
        routeApi.list()
      ]);

      this.clients = clientsRes.data.data || [];
      this.upstreams = upstreamsRes.data.data || [];
      this.routes = routesRes.data.data || [];

      if (!this.currentClientId && this.enabledClients.length > 0) {
        this.currentClientId = this.enabledClients[0].id;
        const models = this.availableModels;
        if (models.length > 0) this.currentModel = models[0];
      }
    },

    setCurrentClient(clientId) {
      this.currentClientId = clientId;
      const models = this.availableModels;
      this.currentModel = models.length > 0 ? models[0] : '';
    },

    setCurrentModel(model) {
      this.currentModel = model;
    },

    addMessage(role, content) {
      this.messages.push({ role, content, id: Date.now() + Math.random() });
    },

    updateLastMessage(content) {
      const last = this.messages[this.messages.length - 1];
      if (last && last.role === 'assistant') {
        last.content = content;
      }
    },

    clearMessages() {
      this.messages = [];
    }
  }
});
