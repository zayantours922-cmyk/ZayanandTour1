// src/services/supabaseService.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Public client only
export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey
);

class LuxeLankaService {
    constructor() {
        this.supabase = supabase;
    }

    // =========================
    // EXISTING METHODS (Keep as is)
    // =========================

    async getPackages() {
        try {
            const { data, error } = await this.supabase
                .from('packages')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching packages:', error);
            return [];
        }
    }

    async getVehicles() {
        try {
            const { data, error } = await this.supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            return [];
        }
    }

    async getDrivers() {
        try {
            const { data, error } = await this.supabase
                .from('drivers')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching drivers:', error);
            return [];
        }
    }

    async getVideos() {
        try {
            const { data, error } = await this.supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    }

    async getReviews() {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    }

    async submitReview(reviewData) {
        try {
            const { data, error } = await this.supabase
                .from('reviews')
                .insert([{
                    name: reviewData.name,
                    text: reviewData.text,
                    rating: reviewData.rating,
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    }

    async submitQuickContact(contactData) {
        try {
            const { data, error } = await this.supabase
                .from('quick_contacts')
                .insert([contactData])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting quick contact:', error);
            throw error;
        }
    }

    async submitLongInquiry(inquiryData) {
        try {
            const { data, error } = await this.supabase
                .from('long_inquiries')
                .insert([inquiryData])
                .select();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error submitting long inquiry:', error);
            throw error;
        }
    }

    // =========================
    // SIMPLIFIED GALLERY METHODS
    // =========================

    async getGalleryImages() {
        try {
            const { data, error } = await this.supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching gallery images:', error);
            return [];
        }
    }

    async addGalleryImage(imageUrl) {
        try {
            const { data, error } = await this.supabase
                .from('gallery')
                .insert([{
                    image_url: imageUrl,
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) throw error;
            return data?.[0];
        } catch (error) {
            console.error('Error adding gallery image:', error);
            throw error;
        }
    }

    // ADD THIS MISSING METHOD
    async addMultipleGalleryImages(imageUrls) {
        try {
            const imagesToInsert = imageUrls.map(imageUrl => ({
                image_url: imageUrl,
                created_at: new Date().toISOString()
            }));
            
            const { data, error } = await this.supabase
                .from('gallery')
                .insert(imagesToInsert)
                .select();
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error adding multiple gallery images:', error);
            throw error;
        }
    }

    async deleteGalleryImage(id) {
        try {
            const { error } = await this.supabase
                .from('gallery')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            throw error;
        }
    }

    async deleteMultipleGalleryImages(ids) {
        try {
            const { error } = await this.supabase
                .from('gallery')
                .delete()
                .in('id', ids);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting multiple gallery images:', error);
            throw error;
        }
    }
}

export const luxelankaService = new LuxeLankaService();