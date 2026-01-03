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

    const register = async (name: string, email: string, password: string, phone: string, user_type: string) => {
        setIsLoading(true);
        try {
            const response = await AuthService.register({ name, email, password, phone, user_type });
            // Optionally auto-login or just return success
            return response;
        } catch (e: any) {
            console.log(`Register error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const biometricLogin = async () => {
        setIsLoading(true);
        try {
            // Mock successful login for biometric demo
            const mockUser = { name: 'Biometric User', email: 'bio@example.com', user_type: 'individual' };
            const mockToken = 'biometric-demo-token';

            setUserInfo(mockUser);
            setUserToken(mockToken);
            await AsyncStorage.setItem('userToken', mockToken);
            await AsyncStorage.setItem('userInfo', JSON.stringify(mockUser));
        } catch (e: any) {
            console.log(`Biometric Login error: ${e}`);
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

    const updateProfile = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await AuthService.updateProfile(data);
            // Update local state merged with new data
            const updatedUser = { ...userInfo, ...data };
            setUserInfo(updatedUser);
            AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser)); // Persist update
            return response;
        } catch (e: any) {
            console.log(`Update Profile error: ${e}`);
            throw e;
        } finally {
            setIsLoading(false);
        }
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
        <AuthContext.Provider value={{ login, logout, register, updateProfile, biometricLogin, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
