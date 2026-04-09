// src/services/api.js
import { API_BASE_URL } from '../config';

const api = {
  // Packages
  getPackages: async () => {
    const response = await fetch(`${API_BASE_URL}/packages`);
    return response.json();
  },
  
  getPackage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/packages/${id}`);
    return response.json();
  },
  
  // Vehicles
  getVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    return response.json();
  },
  
  // Drivers
  getDrivers: async () => {
    const response = await fetch(`${API_BASE_URL}/drivers`);
    return response.json();
  },
  
  getDriver: async (id) => {
    const response = await fetch(`${API_BASE_URL}/drivers/${id}`);
    return response.json();
  },
  
  // Videos
  getVideos: async (category = null) => {
    const url = category ? `${API_BASE_URL}/videos?category=${category}` : `${API_BASE_URL}/videos`;
    const response = await fetch(url);
    return response.json();
  },
  
  // Reviews
  getReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    return response.json();
  },
  
  submitReview: async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
    return response.json();
  },
  
  // Contact
  submitContact: async (contactData) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });
    return response.json();
  },
  
  // Round Tours
  getRoundTours: async () => {
    const response = await fetch(`${API_BASE_URL}/round-tours`);
    return response.json();
  },
  
  getRoundTour: async (id) => {
    const response = await fetch(`${API_BASE_URL}/round-tours/${id}`);
    return response.json();
  },
  
  // Admin
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },
};

export default api;