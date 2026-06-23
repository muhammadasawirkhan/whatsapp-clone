import { io } from 'socket.io-client';

let socket;

export const getSocket = () => {
  if (!socket) {
    // socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket'] });
    socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};