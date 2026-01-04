import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';
import DeviceInfo from 'react-native-device-info';

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
            // Get device unique ID (MAC address equivalent)
            const mac_address = await DeviceInfo.getUniqueId();
            const response = await AuthService.register({ name, email, password, phone, user_type, mac_address });
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
        // Do not set global isLoading(true) here because it unmounts the LoginScreen 
        // via App.tsx, causing the local alert state to be lost when checking for errors.
        try {
            console.log('BiometricLogin: Getting device MAC address...');
            // Get current device MAC address
            const mac_address = await DeviceInfo.getUniqueId();
            console.log('BiometricLogin: Device MAC address:', mac_address);

            // Call backend to find user by MAC address
            console.log('BiometricLogin: Calling backend API...');
            const response = await AuthService.biometricLogin(mac_address);
            console.log('BiometricLogin: Backend response:', response);

            if (response.success) {
                console.log('BiometricLogin: Success! Setting user info and token...');
                setUserInfo(response.user);
                setUserToken('biometric-token');
                await AsyncStorage.setItem('userToken', 'biometric-token');
                await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
                console.log('BiometricLogin: User logged in successfully!');
            } else {
                throw new Error(response.message || 'Biometric login failed');
            }
        } catch (e: any) {
            console.error(`Biometric Login error: ${e.message}`, e);
            throw e;
        } finally {
            // setIsLoading(false); // Removed to prevent unmount/remount cycle
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
