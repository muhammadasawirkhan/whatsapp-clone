import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
  
    if (user && user._id) {
      const s = getSocket();
      setSocket(s);

      
      s.emit('user:online', user._id);

      
      s.on('users:online', (users) => setOnlineUsers(users));

      
      const handleReconnect = () => {
        s.emit('user:online', user._id);
      };
      s.on('connect', handleReconnect);

     
      return () => { 
        s.off('users:online'); 
        s.off('connect', handleReconnect);
      };
    } else {
      
      disconnectSocket();
      setSocket(null);
    }
  }, [user]); 

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);