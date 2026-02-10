'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    isLoading: boolean;
    userToken: string | null;
    userInfo: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoading: true,
    userToken: null,
    userInfo: null,
    login: () => {},
    logout: () => {},
    updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const router = useRouter();

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('userToken');
            const storedUser = localStorage.getItem('userInfo');

            if (token && storedUser) {
                setUserToken(token);
                setUserInfo(JSON.parse(storedUser));

                // Optional: Verify token with backend if needed
                // const res = await api.get('/api/me');
                // if (res.data.success) setUserInfo(res.data.user);
            }
        } catch (e) {
            console.error('Login check error', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    const login = (token: string, user: User) => {
        setIsLoading(true);
        setUserToken(token);
        setUserInfo(user);
        localStorage.setItem('userToken', token);
        localStorage.setItem('userInfo', JSON.stringify(user));
        setIsLoading(false);
        router.push(user.is_tunnel_completed ? '/dashboard' : '/tunnel');
    };

    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        setIsLoading(false);
        router.push('/auth/login');
    };

    const updateUser = (user: User) => {
        setUserInfo(user);
        localStorage.setItem('userInfo', JSON.stringify(user));
    }

    return (
        <AuthContext.Provider value={{ isLoading, userToken, userInfo, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
