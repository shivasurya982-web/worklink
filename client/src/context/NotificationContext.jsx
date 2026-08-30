import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const { user, token } = useAuth();
  const { socket } = useSocket();

  // Fetch initial notifications
  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, user]);

  // Listen for socket notification events
  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // If it's a chat notification, update that count too
        if (newNotif.type === 'chat') {
          setUnreadMessagesCount(prev => prev + 1);
        }

        showToast(newNotif.title, newNotif.message, 'info');
      });

      socket.on('refresh_notifications', () => {
        fetchNotifications();
      });

      socket.on('messages_read', ({ conversationId, readBy }) => {
        if (String(readBy) === String(user?._id)) {
          fetchNotifications();
        }
      });

      return () => {
        socket.off('notification');
        socket.off('refresh_notifications');
        socket.off('messages_read');
      };
    }
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      if (res.success) {
        const notifs = res.data.notifications || [];
        setNotifications(notifs);
        setUnreadCount(res.data.unreadCount || 0);

        // Calculate unread messages
        const msgCount = notifs.filter(n => n.type === 'chat' && !n.isRead).length;
        setUnreadMessagesCount(msgCount);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Update message count if it was a chat notification
      const notif = notifications.find(n => n._id === id);
      if (notif && notif.type === 'chat') {
        setUnreadMessagesCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      setUnreadMessagesCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err.message);
    }
  };

  const showToast = (title, message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadMessagesCount,
        toasts,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        showToast,
        removeToast,
      }}
    >
      {children}
      {/* Toast Notification Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl glass-card border flex items-start gap-3 shadow-xl transition-all duration-300 animate-slide-in ${
              toast.type === 'error'
                ? 'border-accent-red/50 bg-red-50/90'
                : toast.type === 'info'
                ? 'border-accent-blue/50 bg-blue-50/90'
                : 'border-accent-gold/50 bg-amber-50/90'
            }`}
          >
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-text-primary">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-text-secondary mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-primary text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
