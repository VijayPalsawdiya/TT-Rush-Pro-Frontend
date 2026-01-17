import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { getBaseUrl } from '@/config/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const connectSocket = async () => {
            // Only connect if user is authenticated
            if (!user) {
                if (socketRef.current) {
                    console.log('🔌 Disconnecting socket (no auth)');
                    socketRef.current.disconnect();
                    socketRef.current = null;
                    setSocket(null);
                    setIsConnected(false);
                }
                return;
            }

            // Get token from AsyncStorage
            const token = await AsyncStorage.getItem('@access_token');
            if (!token) {
                console.warn('No access token found');
                return;
            }

            // Connect to Socket.IO server
            const baseUrl = getBaseUrl().replace('/api', ''); // Remove /api for socket connection
            console.log('🔌 Connecting to Socket.IO server:', baseUrl);

            const newSocket = io(baseUrl, {
                auth: {
                    token: token,
                },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setIsConnected(false);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        };

        connectSocket();

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                console.log('🔌 Cleaning up socket connection');
                socketRef.current.disconnect();
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
