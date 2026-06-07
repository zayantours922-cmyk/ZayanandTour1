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
  
  // Gallery
  getGalleryImages: async (category = null) => {
    const url = category ? `${API_BASE_URL}/gallery?category=${category}` : `${API_BASE_URL}/gallery`;
    const response = await fetch(url);
    return response.json();
  },
  
  getGalleryCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/gallery/categories`);
    return response.json();
  },
  
  getAdminGalleryImages: async () => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/gallery/admin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  
  addGalleryImage: async (imageData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(imageData),
    });
    return response.json();
  },
  
  updateGalleryImage: async (id, imageData) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(imageData),
    });
    return response.json();
  },
  
  deleteGalleryImage: async (id) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },
  
  toggleGalleryImageStatus: async (id, isActive) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/gallery/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: isActive }),
    });
    return response.json();
  }
};  // <-- This closing brace was missing!

export default api;