import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
const SOCKET_URL = API_URL.replace(/\/v1\/?$/, '');

type SongProgressStage = 'analyzing' | 'lyrics' | 'melody';

interface AppSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const AppSocketContext = createContext<AppSocketContextType>({ socket: null, isConnected: false });

export function AppSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user?._id) {
      setSocket((prev) => {
        if (prev) prev.disconnect();
        return null;
      });
      setIsConnected(false);
      return;
    }

    const coupleId = user.coupleId?._id ?? user.coupleId;
    if (!coupleId) return;

    const s = io(`${SOCKET_URL}/app`, {
      auth: { userId: user._id, coupleId: typeof coupleId === 'string' ? coupleId : (coupleId as { _id?: string })?._id ?? coupleId },
      transports: ['websocket'],
    });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user?._id, user?.coupleId]);

  return (
    <AppSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </AppSocketContext.Provider>
  );
}

export function useAppSocket() {
  return useContext(AppSocketContext);
}

export type { SongProgressStage };
