import { createContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../redux/slices/chatSlice';
import { addNotification } from '../redux/slices/notificationSlice';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(window.location.origin, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('setup', user._id);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('message-received', (message) => {
        dispatch(addMessage(message));
      });

      newSocket.on('notification', (notification) => {
        dispatch(addNotification(notification));
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      return () => {
        newSocket.close();
        socketRef.current = null;
      };
    }
  }, [isAuthenticated, user, dispatch]);

  const joinChat = (chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('join-chat', chatId);
    }
  };

  const sendSocketMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit('new-message', message);
    }
  };

  const emitTyping = (chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', chatId);
    }
  };

  const emitStopTyping = (chatId) => {
    if (socketRef.current) {
      socketRef.current.emit('stop-typing', chatId);
    }
  };

  const sendNotification = (notification) => {
    if (socketRef.current) {
      socketRef.current.emit('new-notification', notification);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        sendSocketMessage,
        emitTyping,
        emitStopTyping,
        sendNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
