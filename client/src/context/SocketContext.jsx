import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, token } = useAuth();

  useEffect(() => {
    if (token && user) {
      // For production (Render), we need the full URL.
      // VITE_API_URL might be "https://api.com/api", so we remove "/api" to get the root.
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const socketUrl = apiUrl ? apiUrl.replace('/api', '') : '/';

      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        // Relative path only works in dev with Vite proxy
        // In production, socketUrl will be the Render backend URL.
      });

      newSocket.on('connect', () => {
        console.log('⚡ Socket connected:', newSocket.id);
        newSocket.emit('authenticate', { userId: user._id, role: user.role });
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection warning:', err.message);
      });

      newSocket.on('user_online', ({ userId }) => {
        if (userId) setOnlineUsers((prev) => new Set([...prev, userId.toString()]));
      });

      newSocket.on('user_offline', ({ userId }) => {
        if (userId) {
          setOnlineUsers((prev) => {
            const updated = new Set(prev);
            updated.delete(userId.toString());
            return updated;
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, user?._id]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  };

  return (
    <SocketContext.Provider value={{ socket, isUserOnline, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
