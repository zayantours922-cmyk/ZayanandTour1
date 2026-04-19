import { createClient } from '@supabase/supabase-js'

// Get from your .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://zriekzmnawmukjfdfndq.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service functions for LuxeLanka
export const luxelankaService = {
    // Get all packages
     async getAdminByUsername(username) {
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    async verifyAdminPassword(username, password) {
        // For demo purposes with hardcoded admin
        if (username === 'admin' && password === 'admin123') {
            return { id: 1, username: 'admin' };
        }
        
        // For production with Supabase Auth
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error || !admin) throw new Error('Admin not found');
        
        // Verify password (you should use bcrypt or Supabase Auth)
        // This is simplified - use Supabase Auth for production
        return admin;
    },
    async getPackages() {
        const { data, error } = await supabase
            .from('packages')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Get all vehicles
    async getVehicles() {
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .order('price_per_day', { ascending: true })
        
        if (error) throw error
        return data
    },

    // Get all drivers
    async getDrivers() {
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .order('experience_years', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Get all videos
    async getVideos() {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Get approved reviews
    async getReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Submit a new review
    async submitReview(reviewData) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                name: reviewData.name,
                text: reviewData.text,
                rating: reviewData.rating,
                is_approved: false
            }])
            .select()
        
        if (error) throw error
        return data
    },

    // Submit contact message
    async submitContactMessage(messageData) {
        const { data, error } = await supabase
            .from('contactmessages')
            .insert([{
                name: messageData.name,
                email: messageData.email,
                message: messageData.message,
                is_read: false
            }])
            .select()
        
        if (error) throw error
        return data
    }
}