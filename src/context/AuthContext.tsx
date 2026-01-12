import React, { createContext, useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';
import DeviceInfo from 'react-native-device-info';
import LoggerService from '../services/LoggerService';

const { NavBarColor } = NativeModules;

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'android' && NavBarColor) {
            NavBarColor.setBackgroundColor(isDarkMode ? '#1A202C' : '#FFFFFF', !isDarkMode);
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            const response = await AuthService.login({ email, password: pass });
            if (response.success) {
                setUserInfo(response.user);
                setUserToken(response.token);
                AsyncStorage.setItem('userToken', response.token);
                AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
                LoggerService.info('Login successful', { email }, 'AuthContext');
            }
            return response;
        } catch (e: any) {
            LoggerService.error(`Login error: ${e.message}`, e, 'AuthContext');
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, phone: string, user_type: string) => {
        // Removed setIsLoading to prevent Login/Signup screens from unmounting and losing alert state
        try {
            // Get device unique ID (MAC address equivalent)
            const mac_address = await DeviceInfo.getUniqueId();
            const response = await AuthService.register({ name, email, password, phone, user_type, mac_address });
            LoggerService.info('Registration successful', { email, mac_address }, 'AuthContext');

            // Auto Login after register to simplify flow, if needed, or just return response
            return response;
        } catch (e: any) {
            // Stringify the error object if it's an object to avoid [object Object] in logs
            const errorMessage = typeof e === 'object' ? JSON.stringify(e) : String(e);
            LoggerService.error(`Register error: ${errorMessage}`, e, 'AuthContext');
            throw e;
        } finally {
            // setIsLoading(false); 
        }
    };

    const biometricLogin = async () => {
        // Do not set global isLoading(true) here because it unmounts the LoginScreen 
        // via App.tsx, causing the local alert state to be lost when checking for errors.
        try {
            LoggerService.info('BiometricLogin: Getting device MAC address...', undefined, 'AuthContext');
            // Get current device MAC address
            const mac_address = await DeviceInfo.getUniqueId();
            LoggerService.info('BiometricLogin: Device MAC address:', { mac_address }, 'AuthContext');

            // Call backend to find user by MAC address
            LoggerService.info('BiometricLogin: Calling backend API...', undefined, 'AuthContext');
            const response = await AuthService.biometricLogin(mac_address);
            LoggerService.info('BiometricLogin: Backend response:', response, 'AuthContext');

            if (response.success) {
                LoggerService.info('BiometricLogin: Success! Setting user info and token...', undefined, 'AuthContext');
                setUserInfo(response.user);
                setUserToken('biometric-token');
                await AsyncStorage.setItem('userToken', 'biometric-token');
                await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
                LoggerService.info('BiometricLogin: User logged in successfully!', undefined, 'AuthContext');
            } else {
                throw new Error(response.message || 'Biometric login failed');
            }
        } catch (e: any) {
            LoggerService.error(`Biometric Login error: ${e.message}`, e, 'AuthContext');
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

    const updateProfile = async (name: string, phone: string) => {
        setIsLoading(true);
        try {
            const userInfo = await AsyncStorage.getItem('userInfo');
            const token = await AsyncStorage.getItem('userToken');

            if (userInfo && token) {
                const user = JSON.parse(userInfo);
                // We pass userId (or email) if backend needs it, usually token is enough for auth
                // But updateProfile endpoint might need id. 
                // Using existing user_id from stored info
                const response = await AuthService.updateProfile({
                    userId: user.id,
                    name,
                    phone
                });

                if (response.success) {
                    const updatedUser = { ...user, name, phone };
                    setUserInfo(updatedUser);
                    AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
                    LoggerService.info('Profile updated successfully', { userId: user.id }, 'AuthContext');
                }
                return response;
            }
        } catch (e: any) {
            LoggerService.error(`Update Profile error: ${e}`, e, 'AuthContext');
            throw e;
        } finally {
            setIsLoading(false);
        }
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');
            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            setUserToken(userToken);
            setIsLoading(false);
        } catch (e: any) {
            LoggerService.error(`isLogged in error ${e}`, e, 'AuthContext');
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, updateProfile, biometricLogin, isLoading, userToken, userInfo, isDarkMode, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};
