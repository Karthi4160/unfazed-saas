import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token, userType, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  const userId = user?._id || user?.id;
  const normalizedUserType = userType === 'client' ? 'Client' : 'Therapist';

  useEffect(() => {
    if (!isAuthenticated || !token || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Re-authenticate on EVERY connect (handles reconnects)
    const registerSelf = () => {
      console.log('[Socket] Registering:', normalizedUserType, userId, 'socket:', newSocket.id);
      newSocket.emit('authenticate', {
        userId,
        userType: normalizedUserType
      });
    };

    newSocket.on('connect', () => {
      console.log('[Socket] connected:', newSocket.id);
      registerSelf();
    });

    // Also handle reconnection events
    newSocket.io.on('reconnect', () => {
      console.log('[Socket] reconnected');
      registerSelf();
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[Socket] disconnected:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message);
    });

    newSocket.on('error', (err) => {
      console.error('[Socket] error event:', err);
    });

    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => {
        const exists = prev.find(u => u.userId === data.userId && u.userType === data.userType);
        return exists ? prev : [...prev, data];
      });
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => prev.filter(
        u => !(u.userId === data.userId && u.userType === data.userType)
      ));
    });

    return () => {
      // Do not disconnect here — persists across renders
    };
  }, [isAuthenticated, token, userId, normalizedUserType]);

  const sendMessage = (toUserId, toUserType, message, type = 'text') => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn('[Socket] Not connected');
      return false;
    }
    socketRef.current.emit('send_message', {
      toUserId,
      toUserType,
      message,
      type
    });
    return true;
  };

  const emitTyping = (toUserId, toUserType, isTyping) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { toUserId, toUserType, isTyping });
    }
  };

  const value = {
    socket,
    onlineUsers,
    sendMessage,
    emitTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};