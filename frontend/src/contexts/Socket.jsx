import io from 'socket.io-client';
import { createContext, useContext, useEffect } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  return socket;
};

export const SocketProvider = ({ children }) => {
  const socket = io('http://localhost:4000');

  useEffect(() => () => socket.disconnect(), [socket]);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
