import axios from 'axios';
import { CONFIG } from '../Config';
import LoggerService from './LoggerService';

export const AuthService = {
    register: async (userData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/register`, userData);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Register Error:', error, 'AuthService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    login: async (credentials: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/login`, credentials);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Login Error:', error, 'AuthService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updateProfile: async (userData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/update-profile`, userData);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Profile Error:', error, 'AuthService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    biometricLogin: async (mac_address: string) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/biometric/login`, { mac_address });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Biometric Login Error:', error, 'AuthService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // checkBiometric removed as per user request
};
