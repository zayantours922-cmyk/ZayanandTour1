import { supabase } from '../lib/supabase'

// ============================================
// PACKAGES
// ============================================

export async function getPackages() {
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
}

export async function getPackageById(id) {
    const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', id)
        .single()
    
    if (error) throw error
    return data
}

// ============================================
// VEHICLES
// ============================================

export async function getVehicles() {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('price_per_day', { ascending: true })
    
    if (error) throw error
    return data
}

// ============================================
// DRIVERS
// ============================================

export async function getDrivers() {
    const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('experience_years', { ascending: false })
    
    if (error) throw error
    return data
}

// ============================================
// REVIEWS
// ============================================

export async function getApprovedReviews() {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10)
    
    if (error) throw error
    return data
}

export async function submitReview(name, text, rating) {
    const { data, error } = await supabase
        .from('reviews')
        .insert([
            { 
                name: name, 
                text: text, 
                rating: rating,
                is_approved: false
            }
        ])
        .select()
    
    if (error) throw error
    return data
}

// ============================================
// CONTACT MESSAGES
// ============================================

export async function submitContactMessage(name, email, message) {
    const { data, error } = await supabase
        .from('contactmessages')
        .insert([
            { 
                name: name, 
                email: email, 
                message: message,
                is_read: false
            }
        ])
        .select()
    
    if (error) throw error
    return data
}

// ============================================
// ROUND TOURS
// ============================================

export async function getRoundTours() {
    const { data, error } = await supabase
        .from('roundtours')
        .select('*')
        .order('days', { ascending: true })
    
    if (error) throw error
    return data
}

// ============================================
// VIDEOS
// ============================================

export async function getVideos(category = null) {
    let query = supabase.from('videos').select('*')
    
    if (category) {
        query = query.eq('category', category)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
}