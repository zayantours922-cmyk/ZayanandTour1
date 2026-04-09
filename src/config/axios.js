// src/config/axios.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://luxe-lanka-backend.vercel.app/api';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
    (config) => {
        console.log(`🌐 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    (error) => {
        console.error(`❌ API Error: ${error.config?.url} -`, error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;