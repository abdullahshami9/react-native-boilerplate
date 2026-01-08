import axios from 'axios';
import { CONFIG } from '../Config';
import LoggerService from './LoggerService';

export const DataService = {
    // Skills
    addSkill: async (userId: number, skillName: string) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/skills`, { user_id: userId, skill_name: skillName });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Add Skill Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getSkills: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/skills/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Skills Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    deleteSkill: async (skillId: number) => {
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/skills/${skillId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Delete Skill Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // Products
    addProduct: async (productData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/products`, productData);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Add Product Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getProducts: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/products/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Products Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // Availability
    setAvailability: async (userId: number, date: string, status: string) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/availability`, { user_id: userId, date, status });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Set Availability Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getAvailability: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/availability/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Availability Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    }
};
