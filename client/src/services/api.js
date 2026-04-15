import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
const api = axios.create({ baseURL: API_URL, timeout: 10000 });

api.interceptors.request.use((cfg) => {
  const token = sessionStorage.getItem('ipl_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('ipl_token');
      sessionStorage.removeItem('ipl_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login         = (u, p)    => api.post('/login', { username: u, password: p });
export const getTeams      = ()        => api.get('/teams');
export const deductPurse   = (id, amt, playerInfo = {}) => api.post('/deduct', { teamId: id, amount: amt, ...playerInfo });
export const resetPurse    = (id)      => api.post('/reset', { teamId: id });
export const resetAll      = ()        => api.post('/reset', { resetAll: true });
export const deletePlayer  = (teamId, playerName) => api.delete(`/teams/${teamId}/players/${encodeURIComponent(playerName)}`);
export const broadcastLotPreview = (data) => api.post('/preview', data);
export const getLog        = ()        => api.get('/log');
export const healthCheck   = ()        => api.get('/health');
export default api;
