import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await AuthService.login({ email, password });
            setUserInfo(response.user);
            setUserToken(response.token || 'dummy-token'); // Ensure we have a token
            AsyncStorage.setItem('userToken', response.token || 'dummy-token');
            AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        } catch (e: any) {
            console.log(`Login error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, phone: string) => {
        setIsLoading(true);
        try {
            const response = await AuthService.register({ name, email, password, phone });
            // Optionally auto-login or just return success
            return response;
        } catch (e: any) {
            console.log(`Register error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userInfo');
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfoStr = await AsyncStorage.getItem('userInfo');
            setUserToken(userToken);
            if (userInfoStr) setUserInfo(JSON.parse(userInfoStr));
            setIsLoading(false);
        } catch (e) {
            console.log(`isLogged in error ${e}`);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
