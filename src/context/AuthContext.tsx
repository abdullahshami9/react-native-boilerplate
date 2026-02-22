import React, { createContext, useState, useEffect } from 'react';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/AuthService';
import DeviceInfo from 'react-native-device-info';
import LoggerService from '../services/LoggerService';
import axios from 'axios';
import { colors } from '../theme/colors';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { CONFIG } from '../Config';

const { NavBarColor } = NativeModules;

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (Platform.OS === 'android' && NavBarColor) {
            NavBarColor.setBackgroundColor(isDarkMode ? colors.dark.navBg : colors.light.navBg, !isDarkMode);
            if (NavBarColor.setNightMode) {
                NavBarColor.setNightMode(isDarkMode);
            }
        }

        // Configure Google Sign-In
        GoogleSignin.configure({
            webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
            forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
            // accountName: '', // [Android] specifies an account name on the device that should be used
            // iosClientId: '<FROM DEVELOPER CONSOLE>', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
        });
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const newValue = !prev;
            AsyncStorage.setItem('isDarkMode', JSON.stringify(newValue));
            return newValue;
        });
    };

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            const response = await AuthService.login({ email, password: pass });
            if (response.success) {
                setUserInfo(response.user);
                setUserToken(response.token);
                if (response.token) {
                    await AsyncStorage.setItem('userToken', response.token);
                    // Set global axios header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
                }
                if (response.user) {
                    await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
                }
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

                // Use actual token from backend if available, else fallback (though backend should send it now)
                const token = response.token || 'biometric-token';
                setUserToken(token);
                await AsyncStorage.setItem('userToken', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

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

    const googleLogin = async () => {
        try {
            LoggerService.info('Starting Google SignIn flow...', undefined, 'AuthContext');

            // Check if device supports Google Play Services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Trigger Google Sign-In Prompts
            const response = await GoogleSignin.signIn();

            // Extract the secure idToken (from response.data if using v13.x+)
            let idToken = null;
            if (response.data?.idToken) {
                idToken = response.data.idToken;
            } else if ((response as any).idToken) {
                // Fallback for older SDK versions
                idToken = (response as any).idToken;
            }

            if (!idToken) {
                LoggerService.error('Google Sign-In failed: No ID Token retrieved', undefined, 'AuthContext');
                throw new Error("No ID Token found. Web Client ID may be missing or incorrect.");
            }

            LoggerService.info('Google SignIn Success. Calling Backend...', undefined, 'AuthContext');
            const apiResponse = await AuthService.googleLogin(idToken);

            if (apiResponse.success) {
                setUserInfo(apiResponse.user);

                const token = apiResponse.token;
                setUserToken(token);
                await AsyncStorage.setItem('userToken', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                await AsyncStorage.setItem('userInfo', JSON.stringify(apiResponse.user));
                LoggerService.info('Google Login Success from Backend', undefined, 'AuthContext');
                return apiResponse;
            } else {
                throw new Error(apiResponse.message || 'Backend Google Authentication failed');
            }

        } catch (error: any) {
            LoggerService.error('Google Auth Context Error:', error, 'AuthContext');

            // Handle specific Google Signin Error Codes
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                throw new Error('User cancelled the login flow');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                throw new Error('Sign in is in progress already');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error('Play services not available or outdated');
            } else {
                // Pass back the backend string error message if present
                throw error;
            }
        }
    };

    const upgradeGuest = async () => {
        try {
            LoggerService.info('Upgrading Guest to Individual', undefined, 'AuthContext');
            const updatedUser = { ...userInfo, user_type: 'Individual', is_tunnel_completed: 0 };

            await TunnelService.updateUserType(userInfo.id, 'Individual');
            await TunnelService.revertTunnel(userInfo.id);

            setUserInfo(updatedUser);
            await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
        } catch (error: any) {
            LoggerService.error('Upgrade Guest Error:', error, 'AuthContext');
            throw error;
        }
    };

    const logout = () => {
        setIsLoading(true);
        setUserToken(null);
        setUserInfo(null);
        AsyncStorage.removeItem('userToken');
        AsyncStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];
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

    const updateProfileLocal = async (updatedUser: any) => {
        setUserInfo(updatedUser);
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let userToken = await AsyncStorage.getItem('userToken');
            let userInfo = await AsyncStorage.getItem('userInfo');
            let savedTheme = await AsyncStorage.getItem('isDarkMode');

            if (userToken) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
            }

            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            setUserToken(userToken);
            if (savedTheme) {
                setIsDarkMode(JSON.parse(savedTheme));
            }
            setIsLoading(false);
        } catch (e: any) {
            LoggerService.error(`isLogged in error ${e}`, e, 'AuthContext');
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, logout, register, updateProfile, updateProfileLocal, biometricLogin, googleLogin, upgradeGuest, isLoading, userToken, userInfo, isDarkMode, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};
