import axios from 'axios';
import { CONFIG } from '../Config';
import LoggerService from './LoggerService';

export const DataService = {
    // --- PROFILE ---
    getProfile: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/profile/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Profile Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    updateProduct: async (productId: number, data: any) => {
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/products/${productId}`, data);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Product Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getProductLogs: async (productId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/products/${productId}/logs`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Product Logs Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    updateAppointmentStatus: async (apptId: number, status: string) => {
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/appointments/${apptId}/status`, { status });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Appt Status Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

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
    getCustomerOrders: async (userId: number) => {
        try {
           const response = await axios.get(`${CONFIG.API_URL}/api/orders/customer/${userId}`);
           return response.data;
       } catch (error: any) {
           LoggerService.error('Get Customer Orders Error:', error, 'DataService');
           throw error.response?.data || { message: 'Network Error' };
       }
   },
   getUserCounts: async (userId: number) => {
       try {
           const response = await axios.get(`${CONFIG.API_URL}/api/user/counts/${userId}`);
           return response.data;
       } catch (error: any) {
           LoggerService.error('Get User Counts Error:', error, 'DataService');
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

    // --- EDUCATION ---
    addEducation: async (userId: number, eduData: { institution: string, degree: string, year: string, type: string }) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/education`, { user_id: userId, ...eduData });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Add Education Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getEducation: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/education/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Education Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    deleteEducation: async (eduId: number) => {
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/education/${eduId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Delete Education Error:', error, 'DataService');
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

    // --- SERVICES ---
    addService: async (serviceData: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/services`, serviceData);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Add Service Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getServices: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/services/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Services Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    updateService: async (serviceId: number, data: any) => {
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/services/${serviceId}`, data);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Service Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    deleteService: async (serviceId: number) => {
        try {
            const response = await axios.delete(`${CONFIG.API_URL}/api/services/${serviceId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Delete Service Error:', error, 'DataService');
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
    uploadServiceImage: async (serviceId: number, file: any) => {
        const formData = new FormData();
        formData.append('serviceId', String(serviceId));
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || `service-${serviceId}.jpg`
        });

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/upload/service`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Upload Service Image Error:', error, 'DataService');
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
    discoverUsers: async (search: string, excludeId: number, type: string = 'All') => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/users/discover`, { params: { search, excludeId, type } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Discover Users Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    discoverProducts: async (search: string, type: string = 'All') => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/products/discover`, { params: { search, type } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Discover Products Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    discoverServices: async (search: string, type: string = 'All') => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/services/discover`, { params: { search, type } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Discover Services Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // --- ORDERS & PROCUREMENT ---
    createOrder: async (sellerId: number, items: any[], buyerId?: number, paymentMethod: string = 'cod') => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/orders`, { seller_id: sellerId, items, buyer_id: buyerId, payment_method: paymentMethod });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Create Order Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getBusinessOrders: async (userId: number) => {
         try {
            const response = await axios.get(`${CONFIG.API_URL}/api/orders/business/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Business Orders Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    updateOrderStatus: async (orderId: number, status: string) => {
        try {
            const response = await axios.put(`${CONFIG.API_URL}/api/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Order Status Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getProcurementSummary: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/business/procurement/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Procurement Error:', error, 'DataService');
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
    bookAppointment: async (providerId: number, customerId: number, serviceId: number, date: string, durationMins: number) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/appointments`, {
                provider_id: providerId,
                customer_id: customerId,
                service_id: serviceId,
                appointment_date: date,
                duration_mins: durationMins
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Book Appointment Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getAppointments: async (userId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/appointments/${userId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Appointments Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getAppointmentSlots: async (providerId: number, date: string) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/appointments/slots/${providerId}`, { params: { date } });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Slots Error:', error, 'DataService');
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
    },

    // --- LOCATIONS ---
    getProvinces: async () => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/provinces`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Provinces Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getCities: async (provinceId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/cities/${provinceId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Cities Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getLocations: async (cityId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/locations/${cityId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Locations Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getSublocations: async (locationId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/sublocations/${locationId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Sublocations Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },
    getStreets: async (sublocationId: number) => {
        try {
            const response = await axios.get(`${CONFIG.API_URL}/api/streets/${sublocationId}`);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Get Streets Error:', error, 'DataService');
            throw error.response?.data || { message: 'Network Error' };
        }
    }
};
