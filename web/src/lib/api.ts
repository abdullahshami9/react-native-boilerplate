import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'http://localhost:3000', // Ensure this matches your backend URL
    timeout: 10000,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor (optional, for handling 401s globally)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token might be expired
            if (typeof window !== 'undefined') {
                // Optionally redirect to login or clear token
                // localStorage.removeItem('userToken');
                // window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
