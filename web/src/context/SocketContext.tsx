'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { userInfo, userToken } = useContext(AuthContext);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (userInfo && userToken) {
            // Establish Socket Connection
            const newSocket = io('http://localhost:3000', {
                auth: { token: userToken },
            });

            newSocket.on('connect', () => {
                console.log('Socket Connected:', newSocket.id);
                // Register User Room
                newSocket.emit('register_user', userInfo.id);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            // Cleanup on logout
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [userInfo, userToken]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
