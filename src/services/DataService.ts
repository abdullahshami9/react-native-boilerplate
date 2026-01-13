import axios from 'axios';
import { CONFIG } from '../Config';
import LoggerService from './LoggerService';

export const DataService = {
    // --- SKILLS ---
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

    // --- PRODUCTS ---
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
    updateStock: async (productId: number, stock: number) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/products/${productId}/stock`, { stock });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Stock Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- AVAILABILITY ---
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
    },

    // --- UPLOADS ---
    uploadProfilePic: async (userId: number, file: any) => {
        const formData = new FormData();
        formData.append('userId', String(userId));
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || 'profile.jpg'
        });

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/upload/profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Upload Profile Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    uploadProductImage: async (productId: number, index: number, file: any) => {
        const formData = new FormData();
        formData.append('productId', String(productId));
        formData.append('index', String(index));
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || `product-${index}.jpg`
        });

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/upload/product`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Upload Product Image Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- CONNECTIONS ---
    toggleConnection: async (followerId: number, followingId: number, action: 'follow' | 'unfollow') => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/connections`, { follower_id: followerId, following_id: followingId, action });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Connection Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getConnections: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/connections/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Connections Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    discoverUsers: async (search: string, excludeId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/users/discover`, { params: { search, excludeId } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Discover Users Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    discoverProducts: async (search: string) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/products/discover`, { params: { search } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Discover Products Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- ORDERS ---
    createOrder: async (sellerId: number, items: any[]) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/orders`, { seller_id: sellerId, items });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Create Order Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getSalesReport: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/reports/sales/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Sales Report Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- APPOINTMENTS ---
    getAppointments: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/appointments/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Appointments Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- CHAT ---
    initiateChat: async (user1Id: number, user2Id: number) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/chats/initiate`, { user1_id: user1Id, user2_id: user2Id });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Initiate Chat Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    }
};
