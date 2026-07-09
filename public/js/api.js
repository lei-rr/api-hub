/**
 * Axios 封装
 */

const api = axios.create({
  baseURL: '',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token && config.url.startsWith('/api/') && !config.url.startsWith('/api/auth/login')) {
    config.headers.Authorization = `Admin ${token}`;
  }
  return config;
});

const authApi = {
  login(username, password) {
    return api.post('/api/auth/login', { username, password });
  },
  me() {
    return api.get('/api/auth/me');
  },
  logout() {
    return api.post('/api/auth/logout');
  }
};

const clientApi = {
  list() { return api.get('/api/clients'); },
  create(data) { return api.post('/api/clients', data); },
  update(id, data) { return api.put(`/api/clients/${id}`, data); },
  delete(id) { return api.delete(`/api/clients/${id}`); }
};

const channelApi = {
  list() { return api.get('/api/channels'); },
  create(data) { return api.post('/api/channels', data); },
  update(id, data) { return api.put(`/api/channels/${id}`, data); },
  delete(id) { return api.delete(`/api/channels/${id}`); },
  fetchModels(id) { return api.get(`/api/channels/${id}/fetch-models`); }
};

const routeApi = {
  list(params) { return api.get('/api/routes', { params }); },
  create(data) { return api.post('/api/routes', data); },
  update(id, data) { return api.put(`/api/routes/${id}`, data); },
  delete(id) { return api.delete(`/api/routes/${id}`); }
};

const keyApi = {
  list(params) { return api.get('/api/keys', { params }); },
  create(data) { return api.post('/api/keys', data); },
  update(id, data) { return api.put(`/api/keys/${id}`, data); },
  delete(id) { return api.delete(`/api/keys/${id}`); }
};

const proxyApi = {
  chatCompletions(data, apiKey) {
    return fetch('/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || ''}`
      },
      body: JSON.stringify(data)
    });
  }
};
