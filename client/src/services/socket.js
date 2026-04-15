import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
const SOCKET_URL = import.meta.env.VITE_API_URL || '/';
    const teamId = sessionStorage.getItem('ipl_team_id');
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      query: teamId ? { teamId } : {},
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 3000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
