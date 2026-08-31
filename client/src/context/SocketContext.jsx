import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, token } = useAuth();

  useEffect(() => {
    // Only attempt connection if we have a token
    if (token && user) {
      // In development, we use relative path so Vite proxy handles it.
      // In production, we use the VITE_API_URL if defined.
      let socketUrl = '/';

      if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
        socketUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      }

      console.log(`[Socket] Connecting to: ${socketUrl}`);

      const newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 2000,
        // Path is handled by proxy in dev or root in prod
      });

      newSocket.on('connect', () => {
        console.log('⚡ [Socket] Connected successfully:', newSocket.id);
        newSocket.emit('authenticate', { userId: user._id, role: user.role });
      });

      newSocket.on('connect_error', (err) => {
        console.warn('⚠️ [Socket] Connection error:', err.message);
        if (err.message === 'xhr poll error') {
           console.error('[Socket] Server might be down or port 5000 is blocked.');
        }
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
        console.log('[Socket] Disconnecting...');
        newSocket.disconnect();
      };
    } else {
      // Clear socket if user logged out
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
