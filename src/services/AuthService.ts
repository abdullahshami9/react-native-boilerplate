import axios from 'axios';
import { CONFIG } from '../Config';
// import ReactNativeBiometrics from 'react-native-biometrics'; // Skipping native link for stability unless requested

export const AuthService = {
    register: async (userData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/register`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Register Error:', error);
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    login: async (credentials: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/login`, credentials);
            return response.data;
        } catch (error: any) {
            console.error('Login Error:', error);
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updateProfile: async (userData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/update-profile`, userData);
            return response.data;
        } catch (error: any) {
            console.error('Update Profile Error:', error);
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // checkBiometric removed as per user request
};
