import axios from 'axios';
import { CONFIG } from '../Config';
import LoggerService from './LoggerService';

export const TunnelService = {
    updateUserType: async (userId: number, userType: string) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/update-type`, { user_id: userId, user_type: userType });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update User Type Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updatePersonalAdditionalInfo: async (userId: number, data: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/personal/additional`, {
                user_id: userId,
                username: data.username,
                gender: data.gender,
                interests: data.interests
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Personal Additional Info Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updatePersonalSkills: async (userId: number, skills: string[]) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/personal/skills`, { user_id: userId, skills });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Skills Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updatePersonalEducation: async (userId: number, education: any) => {
        // education: { degree, institution, year, resumeFile? }
        // Note: For file upload we need FormData.
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/education`, {
                user_id: userId,
                degree: education.degree,
                institution: education.institution,
                year: education.year
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Education Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updatePersonalDetails: async (userId: number, details: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/personal/details`, {
                user_id: userId,
                address: details.address,
                current_job_title: details.jobTitle
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Personal Details Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updateBusinessLocation: async (userId: number, data: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/business/location`, {
                user_id: userId,
                address: data.address,
                location_lat: data.lat,
                location_lng: data.lng
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Business Location Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updateBusinessType: async (userId: number, data: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/business/type`, {
                user_id: userId,
                business_type: data.business_type,
                description: data.description,
                payment_methods: data.payment_methods,
                socials: data.socials, // If needed
                phone: data.phone,
                email: data.email
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Business Type Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    updateBusinessIndustry: async (userId: number, data: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/business/industry`, {
                user_id: userId,
                industry: data.industry,
                category: data.category
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Update Business Industry Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    // Legacy or for BusinessOnboardingScreen
    updateBusinessOnboarding: async (data: any) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/business/onboarding`, data);
            return response.data;
        } catch (error: any) {
            LoggerService.error('Business Onboarding Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    completeTunnel: async (userId: number) => {
        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/tunnel/complete`, { user_id: userId });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Complete Tunnel Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    uploadResume: async (file: any, userId: number) => {
        const formData = new FormData();
        formData.append('image', {
            uri: file.uri,
            type: file.type || 'image/jpeg', // generic fallback
            name: file.fileName || `resume-${userId}.jpg`,
        } as any);
        formData.append('userId', String(userId));

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/upload/resume`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error: any) {
            LoggerService.error('Upload Resume Error:', error, 'TunnelService');
            throw error.response?.data || { message: 'Network Error' };
        }
    },

    verifyRaastAccount: async (accountNumber: string) => {
        const payload = {
            action: 'merchantInquiry',
            referenceNumber: accountNumber
        };

        // Log Request Start
        LoggerService.info('Raast: Sending Verification Request', payload, 'TunnelService');

        try {
            const response = await axios.post(`${CONFIG.API_URL}/api/raast`, payload);

            // Log Success Response
            LoggerService.info('Raast: Verification Success', { request: payload, response: response.data }, 'TunnelService');

            return response.data;
        } catch (error: any) {
            // Log Failure
            const errorDetails = {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            };
            LoggerService.error('Raast: Verification Failed', { request: payload, error: errorDetails }, 'TunnelService');

            if (error.response) {
                throw { message: error.response.data?.message || `Server Error: ${error.response.status}` };
            }
            throw { message: 'Network Error - Could not connect to Verification API' };
        }
    }
};
