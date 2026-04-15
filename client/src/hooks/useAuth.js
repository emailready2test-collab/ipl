import { useState } from 'react';
import { login as apiLogin } from '../services/api';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await apiLogin(username, password);
      sessionStorage.setItem('ipl_token', data.token);
      sessionStorage.setItem('ipl_user', data.username);
      sessionStorage.setItem('ipl_role', data.role); // 'admin' or 'team'
      if (data.teamId) {
        sessionStorage.setItem('ipl_team_id', data.teamId);
      } else {
        sessionStorage.removeItem('ipl_team_id');
      }
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ipl_token');
    sessionStorage.removeItem('ipl_user');
    sessionStorage.removeItem('ipl_role');
    sessionStorage.removeItem('ipl_team_id');
    window.location.href = '/login';
  };

  const isAuthenticated = () => {
    const token = sessionStorage.getItem('ipl_token');
    const role = sessionStorage.getItem('ipl_role');
    return !!token && role === 'admin';
  };

  const isTeamAuthenticated = () => {
    const token = sessionStorage.getItem('ipl_token');
    const role = sessionStorage.getItem('ipl_role');
    return !!token && role === 'team';
  };

  const getUser = () => ({
    username: sessionStorage.getItem('ipl_user'),
    role: sessionStorage.getItem('ipl_role'),
    teamId: sessionStorage.getItem('ipl_team_id')
  });

  // Backward compatibility helpers
  const getUsername = () => sessionStorage.getItem('ipl_user');
  const getTeamId = () => sessionStorage.getItem('ipl_team_id');

  return { 
    login, logout, 
    isAuthenticated, isTeamAuthenticated, 
    getUser, getUsername, getTeamId,
    isLoading, error 
  };
}
