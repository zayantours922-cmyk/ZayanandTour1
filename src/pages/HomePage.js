// HomePage.js - Updated with Quick Inquiry Modal (same as contact form)
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import TgsLogo from '../assets/images/TGS.png';
import '../styles/HomePage.css';
import { supabase, luxelankaService } from '../services/supabaseService';
import { Helmet } from "react-helmet";
import Gallery from '../pages/Gallery';
import FacebookIcon from '../assets/images/facebook.png';

function HomePage() {
    const [activeSection, setActiveSection] = useState('home');
    const [packages, setPackages] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Package Modal State
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showPackageModal, setShowPackageModal] = useState(false);

    // Special Tours State
    const [specialTours, setSpecialTours] = useState([]);

    // Quick Inquiry Modal State (Same as contact form)
    const [showQuickInquiry, setShowQuickInquiry] = useState(false);
    const [inquiryItemType, setInquiryItemType] = useState('');
    const [inquiryItemName, setInquiryItemName] = useState('');
    const [quickInquirySubmitting, setQuickInquirySubmitting] = useState(false);
    const [quickInquiryData, setQuickInquiryData] = useState({
        name: '',
        country: '',
        email: '',
        arrivalDate: '',
        departureDate: '',
        noOfAdults: '1',
        hotelCategory: 'budget',
        message: ''
    });

    // Contact Form State - Updated with travel fields
    const [contactFormData, setContactFormData] = useState({
        name: '',
        country: '',
        email: '',
        arrivalDate: '',
        departureDate: '',
        noOfAdults: '1',
        hotelCategory: 'budget',
        message: ''
    });
    const [contactSubmitting, setContactSubmitting] = useState(false);

    // Quick Contact Form State (for footer/sidebar - kept for compatibility)
    const [quickContactFormData, setQuickContactFormData] = useState({
        name: '',
        phone: '',
        email: ''
    });
    const [quickContactSubmitting, setQuickContactSubmitting] = useState(false);

    // Long Inquiry Form State
    const [longInquiryFormData, setLongInquiryFormData] = useState({
        name: '',
        country: '',
        email: '',
        phone: '',
        arrivalDate: '',
        departureDate: '',
        noOfAdults: '1',
        noOfChildren: '0',
        hotelCategory: 'budget',
        noOfRooms: '1',
        mealPlan: 'bed_breakfast',
        interests: [],
        packageBudget: '500-1500',
        specialRequests: '',
        hearAboutUs: '',
        contactMethod: 'whatsapp'
    });
    const [longInquirySubmitting, setLongInquirySubmitting] = useState(false);

    // Review Form State
    const [reviewFormData, setReviewFormData] = useState({
        name: '',
        review: '',
        rating: '5'
    });

    // Stats counter animation
    const [stats, setStats] = useState({
        customers: 0,
        travelers: 0,
        experience: 0,
        support: 0
    });

    // Interest options for long inquiry form
    const interestOptions = [
        { value: 'cultural_heritage', label: '🏛️ Cultural & Heritage' },
        { value: 'nature', label: '🌿 Nature & Scenery' },
        { value: 'ancient', label: '🏺 Ancient Cities' },
        { value: 'archeology', label: '🔍 Archeology' },
        { value: 'wildlife', label: '🦁 Wildlife Safari' },
        { value: 'adventure', label: '🧗 Adventure Activities' },
        { value: 'beach', label: '🏖️ Beach & Relaxation' },
        { value: 'shopping', label: '🛍️ Shopping' },
        { value: 'ayurveda', label: '🌿 Ayurveda & Wellness' },
        { value: 'culinary', label: '🍛 Culinary Experiences' }
    ];

    // Hear about us options
    const hearAboutOptions = [
        { value: 'google', label: 'Google Search' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'friend', label: 'Friend/Family Recommendation' },
        { value: 'tripadvisor', label: 'TripAdvisor' },
        { value: 'other', label: 'Other' }
    ];

    useEffect(() => {
        fetchData();
        fetchSpecialTours();
        startStatsCounter();
    }, []);

    const startStatsCounter = () => {
        const targets = {
            customers: 500,
            travelers: 1000,
            experience: 15,
            support: 24
        };

        const duration = 2000;
        const interval = 20;
        const steps = duration / interval;

        let currentStep = 0;

        const counter = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setStats({
                customers: Math.min(Math.floor(targets.customers * progress), targets.customers),
                travelers: Math.min(Math.floor(targets.travelers * progress), targets.travelers),
                experience: Math.min(Math.floor(targets.experience * progress), targets.experience),
                support: Math.min(Math.floor(targets.support * progress), targets.support)
            });

            if (currentStep >= steps) {
                clearInterval(counter);
            }
        }, interval);
    };

    const fetchSpecialTours = async () => {
        try {
            const { data, error } = await supabase
                .from('specialtours')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const processedTours = (data || []).map(tour => ({
                ...tour,
                highlights: Array.isArray(tour.highlights) ? tour.highlights :
                    (typeof tour.highlights === 'string' ? JSON.parse(tour.highlights) : []),
                inclusions: Array.isArray(tour.inclusions) ? tour.inclusions :
                    (typeof tour.inclusions === 'string' ? JSON.parse(tour.inclusions) : []),
                gallery: Array.isArray(tour.gallery) ? tour.gallery :
                    (typeof tour.gallery === 'string' ? JSON.parse(tour.gallery) : [])
            }));

            setSpecialTours(processedTours);
        } catch (error) {
            console.error('Error fetching special tours:', error);
            setSpecialTours([]);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [packagesData, vehiclesData, driversData, videosData, reviewsData] = await Promise.all([
                luxelankaService.getPackages().catch(err => {
                    console.error('Error fetching packages:', err);
                    return [];
                }),
                luxelankaService.getVehicles().catch(err => {
                    console.error('Error fetching vehicles:', err);
                    return [];
                }),
                luxelankaService.getDrivers().catch(err => {
                    console.error('Error fetching drivers:', err);
                    return [];
                }),
                luxelankaService.getVideos().catch(err => {
                    console.error('Error fetching videos:', err);
                    return [];
                }),
                luxelankaService.getReviews().catch(err => {
                    console.error('Error fetching reviews:', err);
                    return [];
                })
            ]);

            setPackages(packagesData || []);
            setVehicles(vehiclesData || []);
            setDrivers(driversData || []);
            setVideos(videosData || []);
            setReviews(reviewsData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            let errorMessage = 'Failed to load data. ';
            if (error.message?.includes('JWT') || error.message?.includes('API key')) {
                errorMessage += 'Invalid Supabase API key. Please check your .env file.';
            } else if (error.message?.includes('Failed to fetch')) {
                errorMessage += 'Cannot connect to Supabase. Please check your internet connection.';
            } else {
                errorMessage += error.message || 'Please check your connection and try again.';
            }
            setError(errorMessage);
            setPackages([]);
            setVehicles([]);
            setDrivers([]);
            setVideos([]);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const openPackageModal = (pkg) => {
        setSelectedPackage(pkg);
        setShowPackageModal(true);
        document.body.style.overflow = 'hidden';
    };

    const closePackageModal = () => {
        setShowPackageModal(false);
        setSelectedPackage(null);
        document.body.style.overflow = 'auto';
    };

    const redirectToGallery = () => {
        setActiveSection('gallery');
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // NEW: Open Quick Inquiry Modal (same as contact form)
    const openQuickInquiry = (type, item = null) => {
        const itemTitle = item ? (item.title || item.name) : type;
        setInquiryItemType(type);
        setInquiryItemName(itemTitle);
        setQuickInquiryData({
            name: '',
            country: '',
            email: '',
            arrivalDate: '',
            departureDate: '',
            noOfAdults: '1',
            hotelCategory: 'budget',
            message: `I'm interested in: ${itemTitle}`
        });
        setShowQuickInquiry(true);
        document.body.style.overflow = 'hidden';
    };

    const closeQuickInquiry = () => {
        setShowQuickInquiry(false);
        setInquiryItemType('');
        setInquiryItemName('');
        setQuickInquiryData({
            name: '',
            country: '',
            email: '',
            arrivalDate: '',
            departureDate: '',
            noOfAdults: '1',
            hotelCategory: 'budget',
            message: ''
        });
        document.body.style.overflow = 'auto';
    };

    const handleQuickInquiryChange = (e) => {
        setQuickInquiryData({
            ...quickInquiryData,
            [e.target.name]: e.target.value
        });
    };

    // Quick Inquiry Submit Handler (Same as contact form)
    const handleQuickInquirySubmit = async (e) => {
        e.preventDefault();
        setQuickInquirySubmitting(true);

        const whatsappMessage = `*NEW INQUIRY - ${inquiryItemType.toUpperCase()}*\n\n` +
            `*Item:* ${inquiryItemName}\n\n` +
            `*Personal Information:*\n` +
            `*Name:* ${quickInquiryData.name}\n` +
            `*Country:* ${quickInquiryData.country || 'Not specified'}\n` +
            `*Email:* ${quickInquiryData.email}\n\n` +
            `*Travel Details:*\n` +
            `*Arrival Date:* ${quickInquiryData.arrivalDate || 'Not specified'}\n` +
            `*Departure Date:* ${quickInquiryData.departureDate || 'Not specified'}\n` +
            `*Number of Pax:* ${quickInquiryData.noOfAdults || '1'} Adults\n\n` +
            `*Hotel Category:* ${getHotelCategoryLabel(quickInquiryData.hotelCategory || 'budget')}\n\n` +
            `*Special Requests/Message:*\n${quickInquiryData.message || 'None'}\n\n` +
            `*Sent from Tour Guide SriLanka Website - ${inquiryItemType} Inquiry*`;

        const whatsappUrl = `https://wa.me/94724024002?text=${encodeURIComponent(whatsappMessage)}`;

        try {
            const supabaseData = {
                name: quickInquiryData.name,
                country: quickInquiryData.country,
                email: quickInquiryData.email,
                arrival_date: quickInquiryData.arrivalDate,
                departure_date: quickInquiryData.departureDate,
                no_of_adults: quickInquiryData.noOfAdults,
                hotel_category: quickInquiryData.hotelCategory,
                message: quickInquiryData.message,
                inquiry_type: `${inquiryItemType} Inquiry`,
                item_name: inquiryItemName,
                created_at: new Date().toISOString()
            };
            await luxelankaService.submitQuickContact?.(supabaseData);
            console.log('Quick inquiry saved to Supabase');
        } catch (error) {
            console.error('Error saving quick inquiry:', error);
        }

        window.open(whatsappUrl, '_blank');
        alert(`Thank you! Your inquiry about ${inquiryItemName} has been sent. We will contact you shortly via WhatsApp.`);
        closeQuickInquiry();
        setQuickInquirySubmitting(false);
    };

    // Get hotel category label
    const getHotelCategoryLabel = (value) => {
        const categories = {
            boutique: '🏨 Boutique Hotel',
            '5star': '⭐⭐⭐⭐⭐ 5 Star Luxury Hotel',
            '4star': '⭐⭐⭐⭐ 4 Star Premium Hotel',
            '3star': '⭐⭐⭐ 3 Star Standard Hotel',
            budget: '🏠 Budget Accommodation'
        };
        return categories[value] || value;
    };

    const getMealPlanLabel = (value) => {
        const plans = {
            bed_breakfast: 'Bed & Breakfast',
            half_board: 'Half Board (Breakfast + Dinner)',
            full_board: 'Full Board (All Meals)'
        };
        return plans[value] || value;
    };

    const getBudgetLabel = (value) => {
        const budgets = {
            '500-1500': '$500 - $1,500',
            '1500-2500': '$1,500 - $2,500',
            '2500-4000': '$2,500 - $4,000',
            '4000-6000': '$4,000 - $6,000',
            'above-6000': 'Above $6,000'
        };
        return budgets[value] || value;
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        const trimmedUrl = url.trim();
        const patterns = [
            /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
            /[?&]v=([A-Za-z0-9_-]{11})/,
            /youtu\.be\/([A-Za-z0-9_-]{11})/,
            /embed\/([A-Za-z0-9_-]{11})/,
            /shorts\/([A-Za-z0-9_-]{11})/
        ];
        let videoId = null;
        for (const pattern of patterns) {
            const match = trimmedUrl.match(pattern);
            if (match && match[1]) {
                videoId = match[1];
                break;
            }
        }
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?playsinline=1&modestbranding=1&rel=0&enablejsapi=1`;
        }
        return trimmedUrl;
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            name: reviewFormData.name,
            text: reviewFormData.review,
            rating: parseInt(reviewFormData.rating)
        };
        try {
            await luxelankaService.submitReview(formData);
            alert('Thank you for your review! It will appear after admin approval.');
            setReviewFormData({ name: '', review: '', rating: '5' });
            fetchData();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        }
    };

    const handleReviewInputChange = (e) => {
        setReviewFormData({
            ...reviewFormData,
            [e.target.name]: e.target.value
        });
    };

    const getFilteredVideos = (category) => {
        if (!videos || videos.length === 0) return [];
        return videos.filter(v => v.category === category);
    };

    const handleBackToHome = () => {
        setActiveSection('home');
    };

    const getHomeVideos = () => {
        const homeVideos = getFilteredVideos('home');
        if (homeVideos.length > 0) return homeVideos;
        return videos.slice(0, 3);
    };

    // Scroll to top function
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Contact Form Handlers
    const handleContactInputChange = (e) => {
        setContactFormData({
            ...contactFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setContactSubmitting(true);

        const whatsappMessage = `*NEW TOUR INQUIRY - CONTACT FORM*\n\n` +
            `*Personal Information:*\n` +
            `*Name:* ${contactFormData.name}\n` +
            `*Country:* ${contactFormData.country || 'Not specified'}\n` +
            `*Email:* ${contactFormData.email}\n\n` +
            `*Travel Details:*\n` +
            `*Arrival Date:* ${contactFormData.arrivalDate || 'Not specified'}\n` +
            `*Departure Date:* ${contactFormData.departureDate || 'Not specified'}\n` +
            `*Number of Pax:* ${contactFormData.noOfAdults || '1'} Adults\n\n` +
            `*Hotel Category:* ${getHotelCategoryLabel(contactFormData.hotelCategory || 'budget')}\n\n` +
            `*Special Requests/Message:*\n${contactFormData.message || 'None'}\n\n` +
            `*Sent from Tour Guide SriLanka Website Contact Section*`;

        const whatsappUrl = `https://wa.me/94724024002?text=${encodeURIComponent(whatsappMessage)}`;

        try {
            const supabaseData = {
                name: contactFormData.name,
                country: contactFormData.country,
                email: contactFormData.email,
                arrival_date: contactFormData.arrivalDate,
                departure_date: contactFormData.departureDate,
                no_of_adults: contactFormData.noOfAdults,
                hotel_category: contactFormData.hotelCategory,
                message: contactFormData.message,
                inquiry_type: 'Contact Form',
                created_at: new Date().toISOString()
            };
            await luxelankaService.submitQuickContact?.(supabaseData);
            console.log('Contact form saved to Supabase');
        } catch (error) {
            console.error('Error saving contact form:', error);
        }

        window.open(whatsappUrl, '_blank');
        alert('Thank you! We have received your travel inquiry. We will contact you shortly via WhatsApp.');

        setContactFormData({
            name: '',
            country: '',
            email: '',
            arrivalDate: '',
            departureDate: '',
            noOfAdults: '1',
            hotelCategory: 'budget',
            message: ''
        });
        setContactSubmitting(false);
    };

    const handleQuickContactInputChange = (e) => {
        setQuickContactFormData({
            ...quickContactFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuickContactSubmit = async (e) => {
        e.preventDefault();
        setQuickContactSubmitting(true);

        const whatsappMessage = `*NEW QUICK INQUIRY - WEBSITE*\n\n` +
            `*Name:* ${quickContactFormData.name}\n` +
            `*Phone:* ${quickContactFormData.phone}\n` +
            `*Email:* ${quickContactFormData.email}\n\n` +
            `*Message:* This customer has requested to be contacted regarding tour planning. Please reach out to them as soon as possible.\n\n` +
            `*Sent from Tour Guide SriLanka Website Quick Contact Form*`;

        const whatsappUrl = `https://wa.me/94724024002?text=${encodeURIComponent(whatsappMessage)}`;

        try {
            const supabaseData = {
                name: quickContactFormData.name,
                phone: quickContactFormData.phone,
                email: quickContactFormData.email,
                inquiry_type: 'Quick Contact',
                created_at: new Date().toISOString()
            };
            await luxelankaService.submitQuickContact?.(supabaseData);
            console.log('Quick contact saved to Supabase');
        } catch (error) {
            console.error('Error saving quick contact:', error);
        }

        window.open(whatsappUrl, '_blank');
        alert('Thank you! We have received your inquiry. We will contact you shortly via WhatsApp.');

        setQuickContactFormData({
            name: '',
            phone: '',
            email: ''
        });
        setQuickContactSubmitting(false);
    };

    const handleLongInquiryInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (checked) {
                setLongInquiryFormData(prev => ({
                    ...prev,
                    interests: [...prev.interests, value]
                }));
            } else {
                setLongInquiryFormData(prev => ({
                    ...prev,
                    interests: prev.interests.filter(i => i !== value)
                }));
            }
        } else if (type === 'radio') {
            setLongInquiryFormData({
                ...longInquiryFormData,
                [name]: value
            });
        } else {
            setLongInquiryFormData({
                ...longInquiryFormData,
                [name]: value
            });
        }
    };

    const handleLongInterestChange = (interest) => {
        setLongInquiryFormData(prev => {
            const newInterests = prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests: newInterests };
        });
    };

    const handleLongInquirySubmit = async (e) => {
        e.preventDefault();
        setLongInquirySubmitting(true);

        const interestsText = longInquiryFormData.interests.length > 0
            ? longInquiryFormData.interests.join(', ')
            : 'Not specified';

        const preferredContactMethod = longInquiryFormData.contactMethod === 'whatsapp'
            ? 'WhatsApp'
            : 'Email';

        const whatsappMessage = `*NEW DETAILED TOUR INQUIRY*%0A%0A` +
            `*Personal Information:*%0A` +
            `*Name:* ${longInquiryFormData.name}%0A` +
            `*Country:* ${longInquiryFormData.country}%0A` +
            `*Email:* ${longInquiryFormData.email}%0A` +
            `*Phone:* ${longInquiryFormData.phone}%0A%0A` +
            `*Travel Details:*%0A` +
            `*Arrival Date:* ${longInquiryFormData.arrivalDate || 'Not specified'}%0A` +
            `*Departure Date:* ${longInquiryFormData.departureDate || 'Not specified'}%0A%0A` +
            `*Group Details:*%0A` +
            `*Number of Adults:* ${longInquiryFormData.noOfAdults}%0A` +
            `*Number of Children:* ${longInquiryFormData.noOfChildren}%0A` +
            `*Total Pax:* ${parseInt(longInquiryFormData.noOfAdults) + parseInt(longInquiryFormData.noOfChildren)}%0A` +
            `*Number of Rooms:* ${longInquiryFormData.noOfRooms}%0A%0A` +
            `*Accommodation:*%0A` +
            `*Hotel Category:* ${getHotelCategoryLabel(longInquiryFormData.hotelCategory)}%0A` +
            `*Meal Plan:* ${getMealPlanLabel(longInquiryFormData.mealPlan)}%0A%0A` +
            `*Interests:* ${interestsText}%0A%0A` +
            `*Package Budget:* ${getBudgetLabel(longInquiryFormData.packageBudget)}%0A%0A` +
            `*Special Requests:*%0A${longInquiryFormData.specialRequests || 'None'}%0A%0A` +
            `*How did you hear about us?* ${longInquiryFormData.hearAboutUs || 'Not specified'}%0A%0A` +
            `*CUSTOMER PREFERRED CONTACT METHOD:* ${preferredContactMethod}%0A%0A` +
            `*Sent from Tour Guide SriLanka Website Long Inquiry Form*`;

        const whatsappUrl = `https://wa.me/94724024002?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');

        alert(`Thank you! Your detailed inquiry has been sent. We will contact you ${longInquiryFormData.contactMethod === 'whatsapp' ? 'via WhatsApp shortly' : 'via email within 24 hours'}.`);

        try {
            const supabaseData = {
                name: longInquiryFormData.name,
                country: longInquiryFormData.country,
                email: longInquiryFormData.email,
                phone: longInquiryFormData.phone,
                arrival_date: longInquiryFormData.arrivalDate,
                departure_date: longInquiryFormData.departureDate,
                no_of_adults: longInquiryFormData.noOfAdults,
                no_of_children: longInquiryFormData.noOfChildren,
                hotel_category: longInquiryFormData.hotelCategory,
                no_of_rooms: longInquiryFormData.noOfRooms,
                meal_plan: longInquiryFormData.mealPlan,
                interests: longInquiryFormData.interests,
                package_budget: longInquiryFormData.packageBudget,
                special_requests: longInquiryFormData.specialRequests,
                hear_about_us: longInquiryFormData.hearAboutUs,
                contact_method: longInquiryFormData.contactMethod,
                inquiry_type: 'Detailed Inquiry',
                created_at: new Date().toISOString()
            };
            await luxelankaService.submitLongInquiry?.(supabaseData);
            console.log('Long inquiry saved to Supabase');
        } catch (error) {
            console.error('Error saving long inquiry:', error);
        }

        setLongInquiryFormData({
            name: '',
            country: '',
            email: '',
            phone: '',
            arrivalDate: '',
            departureDate: '',
            noOfAdults: '1',
            noOfChildren: '0',
            hotelCategory: 'budget',
            noOfRooms: '1',
            mealPlan: 'bed_breakfast',
            interests: [],
            packageBudget: '500-1500',
            specialRequests: '',
            hearAboutUs: '',
            contactMethod: 'whatsapp'
        });
        setLongInquirySubmitting(false);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading Tour Guide SriLanka...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                    <h2>Connection Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-glass-round">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const VideoIframe = ({ video }) => {
        const embedUrl = getYouTubeEmbedUrl(video.embed_code || video.youtube_url);
        return (
            <div className="video-glass-card">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                    ></iframe>
                ) : (
                    <div className="video-error">Unable to load video</div>
                )}
                <div className="video-title">{video.title}</div>
            </div>
        );
    };

    return (
        <div className="homepage">
            <Helmet>
                <title>Tour Guide Sri Lanka | Private Driver Tours | Negombo</title>
                <meta name="description" content="Best tour guide in Sri Lanka. Private driver, airport transfers, custom tours in Negombo, Kandy, Ella & more. Book your Sri Lanka tour today!" />
                <link rel="canonical" href="https://www.toursguidesrilanka.com/" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            {/* QUICK INQUIRY MODAL - Same as Contact Form */}
            {showQuickInquiry && (
                <div className="inquiry-modal-overlay" onClick={closeQuickInquiry}>
                    <div className="inquiry-modal-container quick-inquiry-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="inquiry-modal-header">
                            <h2><i className="fas fa-paper-plane"></i> Quick Inquiry - {inquiryItemType}</h2>
                            <button className="inquiry-modal-close" onClick={closeQuickInquiry}>&times;</button>
                        </div>
                        <div className="inquiry-modal-body">
                            <p className="inquiry-modal-subtitle">
                                Interested in <strong>{inquiryItemName}</strong>? Fill out the form below and we'll get back to you via WhatsApp.
                            </p>
                            <form onSubmit={handleQuickInquirySubmit} className="inquiry-form">
                                {/* Name Field */}
                                <div className="form-group">
                                    <label><i className="fas fa-user"></i> Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={quickInquiryData.name} 
                                        onChange={handleQuickInquiryChange} 
                                        placeholder="Enter your full name" 
                                        required 
                                    />
                                </div>
                                
                                {/* Country Field */}
                                <div className="form-group">
                                    <label><i className="fas fa-globe"></i> Country *</label>
                                    <select 
                                        name="country" 
                                        value={quickInquiryData.country} 
                                        onChange={handleQuickInquiryChange} 
                                        required
                                    >
                                        <option value="">Select your country</option>
                                        <option value="USA">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        <option value="Australia">Australia</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Italy">Italy</option>
                                        <option value="Spain">Spain</option>
                                        <option value="Netherlands">Netherlands</option>
                                        <option value="Switzerland">Switzerland</option>
                                        <option value="India">India</option>
                                        <option value="China">China</option>
                                        <option value="Japan">Japan</option>
                                        <option value="South Korea">South Korea</option>
                                        <option value="Russia">Russia</option>
                                        <option value="Brazil">Brazil</option>
                                        <option value="Mexico">Mexico</option>
                                        <option value="South Africa">South Africa</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                
                                {/* Email Field */}
                                <div className="form-group">
                                    <label><i className="fas fa-envelope"></i> Email Address *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={quickInquiryData.email} 
                                        onChange={handleQuickInquiryChange} 
                                        placeholder="your@email.com" 
                                        required 
                                    />
                                </div>
                                
                                {/* Arrival Date */}
                                <div className="form-group">
                                    <label><i className="fas fa-calendar-plus"></i> Arrival Date *</label>
                                    <input 
                                        type="date" 
                                        name="arrivalDate" 
                                        value={quickInquiryData.arrivalDate} 
                                        onChange={handleQuickInquiryChange} 
                                        required 
                                    />
                                </div>
                                
                                {/* Departure Date */}
                                <div className="form-group">
                                    <label><i className="fas fa-calendar-minus"></i> Departure Date *</label>
                                    <input 
                                        type="date" 
                                        name="departureDate" 
                                        value={quickInquiryData.departureDate} 
                                        onChange={handleQuickInquiryChange} 
                                        required 
                                    />
                                </div>
                                
                                {/* Number of Pax (Adults) - Max 30 */}
                                <div className="form-group">
                                    <label><i className="fas fa-users"></i> Number of Pax (Adults) *</label>
                                    <select 
                                        name="noOfAdults" 
                                        value={quickInquiryData.noOfAdults} 
                                        onChange={handleQuickInquiryChange} 
                                        required
                                    >
                                        {[...Array(30).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Pax' : 'Pax'}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Hotel Category */}
                                <div className="form-group">
                                    <label><i className="fas fa-hotel"></i> Hotel Category *</label>
                                    <select 
                                        name="hotelCategory" 
                                        value={quickInquiryData.hotelCategory} 
                                        onChange={handleQuickInquiryChange} 
                                        required
                                    >
                                        <option value="boutique">🏨 Boutique Hotel</option>
                                        <option value="5star">⭐⭐⭐⭐⭐ 5 Star Luxury Hotel</option>
                                        <option value="4star">⭐⭐⭐⭐ 4 Star Premium Hotel</option>
                                        <option value="3star">⭐⭐⭐ 3 Star Standard Hotel</option>
                                        <option value="budget">🏠 Budget Accommodation</option>
                                    </select>
                                </div>
                                
                                {/* Message Field */}
                                <div className="form-group">
                                    <label><i className="fas fa-comment-dots"></i> Special Requests / Message</label>
                                    <textarea 
                                        name="message" 
                                        rows="3" 
                                        value={quickInquiryData.message} 
                                        onChange={handleQuickInquiryChange} 
                                        placeholder="Tell us about your preferred destinations, activities, or any special requirements..."
                                    ></textarea>
                                </div>
                                
                                <div className="inquiry-modal-footer">
                                    <button type="button" className="btn-cancel" onClick={closeQuickInquiry}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={quickInquirySubmitting}>
                                        {quickInquirySubmitting ? (
                                            <>Sending <i className="fas fa-spinner fa-spin"></i></>
                                        ) : (
                                            <>Send Inquiry <i className="fab fa-whatsapp"></i></>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Package Modal */}
            {showPackageModal && selectedPackage && (
                <div className="package-modal-overlay" onClick={closePackageModal}>
                    <div className="package-modal-container" onClick={(e) => e.stopPropagation()}>
                        <button className="package-modal-close" onClick={closePackageModal}>&times;</button>
                        <div className="package-modal-content">
                            <h2 className="package-modal-title">{selectedPackage.title}</h2>
                            <div className="package-modal-gallery">
                                <div className="gallery-main">
                                    <img src={selectedPackage.main_image} alt={selectedPackage.title} />
                                </div>
                                <div className="gallery-thumbnails">
                                    {selectedPackage.gallery && selectedPackage.gallery.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${selectedPackage.title} ${idx + 1}`}
                                            className="thumbnail-img"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const mainImg = e.target.closest('.package-modal-gallery').querySelector('.gallery-main img');
                                                const clickedImg = e.target;
                                                if (mainImg && clickedImg) {
                                                    const tempSrc = mainImg.src;
                                                    mainImg.src = clickedImg.src;
                                                    clickedImg.src = tempSrc;
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="package-modal-info">
                                <div className="package-duration">
                                    <i className="fas fa-clock"></i> {selectedPackage.duration}
                                </div>
                                <p className="package-description">{selectedPackage.description}</p>
                                <div className="package-highlights-section">
                                    <h4><i className="fas fa-star"></i> Highlights</h4>
                                    <ul>
                                        {selectedPackage.highlights && selectedPackage.highlights.map((highlight, idx) => (
                                            <li key={idx}>{highlight}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="package-inclusions-section">
                                    <h4><i className="fas fa-check-circle"></i> Inclusions</h4>
                                    <ul>
                                        {selectedPackage.inclusions && selectedPackage.inclusions.map((inclusion, idx) => (
                                            <li key={idx}>{inclusion}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="modal-buttons">
                                    <button
                                        className="package-inquiry-btn"
                                        onClick={() => {
                                            closePackageModal();
                                            setTimeout(() => {
                                                openQuickInquiry('Special Tour', selectedPackage);
                                            }, 100);
                                        }}
                                    >
                                        <i className="fab fa-whatsapp"></i> Inquire About This Package
                                    </button>
                                    <button
                                        className="package-gallery-btn"
                                        onClick={() => {
                                            closePackageModal();
                                            setTimeout(() => {
                                                redirectToGallery();
                                            }, 100);
                                        }}
                                    >
                                        <i className="fas fa-images"></i> View Full Gallery
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="glass-nav">
                <div className="nav-container">
                    <div className="logo">
                        🌴 Tour Guide SriLanka
                    </div>
                    <div className="menu-container">
                        <button className="menu-toggle1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <div className="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        <span className="menu-text1">Menu</span>
                    </div>
                    <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
                        <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'home' ? 'active' : ''}`}>
                            <i className="fas fa-home"></i> Home
                        </button>
                        <button onClick={() => { setActiveSection('tourPackages'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'tourPackages' ? 'active' : ''}`}>
                            <i className="fas fa-suitcase-rolling"></i> Tour Packages
                        </button>
                        <a href="/round-tours" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
                            <i className="fas fa-map-marked-alt"></i> Round Tours
                        </a>
                        <button onClick={() => { setActiveSection('longInquiry'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'longInquiry' ? 'active' : ''}`}>
                            <i className="fas fa-file-alt"></i> Tailor Made Tour
                        </button>
                        <button onClick={() => { setActiveSection('gallery'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'gallery' ? 'active' : ''}`}>
                            <i className="fas fa-images"></i> Gallery
                        </button>
                        <button onClick={() => { setActiveSection('packages'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'packages' ? 'active' : ''}`}>
                            <i className="fas fa-umbrella-beach"></i> Things To Do
                        </button>
                        <button onClick={() => { setActiveSection('vehicle'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'vehicle' ? 'active' : ''}`}>
                            <i className="fas fa-car"></i> Vehicle Packages
                        </button>
                        <button onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}>
                            <i className="fas fa-star"></i> Reviews
                        </button>
                        <button onClick={() => { setActiveSection('contact'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'contact' ? 'active' : ''}`}>
                            <i className="fas fa-envelope"></i> Contact Us
                        </button>
                    </div>
                </div>
            </nav>

            <div className="top-info-bar">
                <div className="info-bar-content">
                    <span><i className="fas fa-phone-alt"></i> +94 72 402 4002</span>
                    <span><i className="fas fa-clock"></i> 24/7 Support</span>
                </div>
            </div>

            {activeSection !== 'home' && (
                <div className="page-action-row">
                    <button className="page-back-btn" onClick={handleBackToHome}>
                        <i className="fas fa-arrow-left"></i> Back to home
                    </button>
                </div>
            )}

            <div className="floating-social2">
                <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=tourguidesrilanka234@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="float-glass-btn email"
                    aria-label="Send Email"
                >
                    <img
                        src="https://cdn3d.iconscout.com/3d/free/thumb/free-gmail-3d-icon-png-download-7250524.png"
                        style={{ width: "90px", height: "90px" }}
                        alt="Gmail"
                    />
                </a>
            </div>

            <div className="floating-social1">
                <a
                    href="https://wa.me/94724024002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="float-glass-btn whatsapp"
                    aria-label="Chat on WhatsApp"
                >
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
                        style={{ width: "90px", height: "90px" }}
                        alt="WhatsApp"
                    />
                </a>
            </div>

            <main className="container">
                {/* HOME SECTION */}
                {activeSection === 'home' && (
                    <section className="section active-section">
                        <div className="hero">
                            <h1>Private Tour Guide in Sri Lanka with Driver</h1>
                            <h2>Ayubowan! Welcome to Sri Lanka</h2>
                            <p>Luxury vehicles, expert drivers, and handcrafted journeys — discover paradise with us.</p>
                            <p>
                                Looking for a reliable tour guide in Sri Lanka? We offer private driver tours, airport transfers, and customized travel experiences across Negombo, Kandy, Ella, and more.
                            </p>
                            <button onClick={() => window.location.href = '/round-tours'} className="btn-glass-round">
                                View Packages <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                        <div className="seo-content">
                            <h2>Best Tour Guide in Sri Lanka</h2>
                            <p>
                                We provide professional tour guide services in Sri Lanka with experienced driver guides. Whether you need airport transfers from Negombo, a cultural tour in Kandy, or a scenic رحلة to Ella, we offer fully customized travel experiences.
                            </p>
                            <p>
                                Our Sri Lanka private tours include visits to Sigiriya, Nuwara Eliya, Yala National Park, Mirissa beaches, and more. With comfortable vehicles and friendly local drivers, your journey will be safe, relaxing, and unforgettable.
                            </p>
                            <p>
                                Book your Sri Lanka driver guide today and explore the island with confidence.
                            </p>
                        </div>

                        <div className="stats-section">
                            <div className="stats-container">
                                <div className="stat-card">
                                    <div className="stat-icon"><i className="fas fa-smile"></i></div>
                                    <div className="stat-number">{stats.customers}+</div>
                                    <div className="stat-label">Happy Customers</div>
                                    <div className="stat-description">Trusted by travelers worldwide</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><i className="fas fa-globe-asia"></i></div>
                                    <div className="stat-number">{stats.travelers}+</div>
                                    <div className="stat-label">Happy Travelers</div>
                                    <div className="stat-description">Explored Sri Lanka with us</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><i className="fas fa-award"></i></div>
                                    <div className="stat-number">{stats.experience}+</div>
                                    <div className="stat-label">Years Experience</div>
                                    <div className="stat-description">Excellence in service</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon"><i className="fas fa-headset"></i></div>
                                    <div className="stat-number">{stats.support}/7</div>
                                    <div className="stat-label">Support</div>
                                    <div className="stat-description">Always here to help</div>
                                </div>
                            </div>
                        </div>

                        <div className="About">
                            <h1>Ayubowan! Welcome to SriLanka</h1>
                            <p><center>We're thrilled to have you here. From stunning beaches to rich culture We're excited for you to experience our island's beauty: Were here to make your stay unforgettable! Srilanka - a tropical paradise Located in the indian Ocean, this tiny island nation is a treasure trove of stunning landscapes, rich culture, and warm hospitality. From the misty hills of Nuwara Eliya to the golden beaches of Mirissa, Srilanka is a heaven for travelers.</center></p>
                            <div className="country-images">
                                <img src="https://flagcdn.com/w320/us.png" alt="USA" />
                                <img src="https://flagcdn.com/w320/fr.png" alt="France" />
                                <img src="https://flagcdn.com/w320/it.png" alt="Italy" />
                                <img src="https://flagcdn.com/w320/mx.png" alt="Mexico" />
                            </div>
                        </div>

                        <div className="video-section">
                            <h2 className="section-title"><i className="fas fa-video"></i> Video Reviews<span className="orange-badge">Travel Stories</span></h2>
                            {getHomeVideos().length > 0 ? (
                                <div className="video-grid">
                                    {getHomeVideos().map(video => (<VideoIframe key={video.id} video={video} />))}
                                </div>
                            ) : (
                                <div className="no-videos-message"><p>No videos available yet. Check back soon for travel stories!</p></div>
                            )}
                        </div>

                        <div className="reviews-section">
                            <h2 className="section-title"><i className="fas fa-star"></i> Traveler Reviews</h2>
                            {reviews.length > 0 ? (
                                <div className="reviews-carousel">
                                    <Swiper modules={[Autoplay, Pagination, Navigation]} spaceBetween={20} slidesPerView={1} autoplay={{ delay: 4000, disableOnInteraction: false }} pagination={{ clickable: true }} navigation breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}>
                                        {reviews.map(review => (
                                            <SwiperSlide key={review.id}>
                                                <div className="review-card">
                                                    <i className="fas fa-quote-left" style={{ color: '#ff7b2c', fontSize: '1.5rem' }}></i>
                                                    <p>“{review.text.substring(0, 150)}”</p>
                                                    <strong>{review.name}</strong>
                                                    <div className="rating">{'⭐'.repeat(review.rating)}</div>
                                                    <small>{new Date(review.created_at).toLocaleDateString()}</small>
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            ) : (
                                <div className="no-reviews-message"><p>No reviews yet. Be the first to share your experience!</p></div>
                            )}
                        </div>
                    </section>
                )}

                {/* THINGS TO DO SECTION */}
                {activeSection === 'packages' && (
                    <section className="section">
                        <h2 className="section-title"><i className="fas fa-umbrella-beach"></i> Signature Tours</h2>
                        {packages.length > 0 ? (
                            <div className="card-grid">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className="glass-card">
                                        <img className="card-img" src={pkg.image_url} alt={pkg.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
                                        <div className="card-content">
                                            <h3>{pkg.title}</h3>
                                            <p>{pkg.description}</p>
                                            <div className="price">{pkg.price !== '' && pkg.price != null ? `$${pkg.price}` : 'Inquire About This Place'}</div>
                                            <button className="btn-outline-glass" onClick={() => openQuickInquiry('Things To Do', pkg)}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message"><p>No packages available. Please check back later.</p></div>
                        )}
                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Tour Videos</h3>
                            {getFilteredVideos('tour').length > 0 ? (
                                <div className="video-grid">{getFilteredVideos('tour').map(video => (<VideoIframe key={video.id} video={video} />))}</div>
                            ) : (<p>No tour videos available.</p>)}
                        </div>
                    </section>
                )}

                {/* VEHICLE PACKAGES SECTION */}
                {activeSection === 'vehicle' && (
                    <section className="section">
                        <h2 className="section-title"><i className="fas fa-car"></i> Premium Fleet</h2>
                        {vehicles.length > 0 ? (
                            <div className="card-grid">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="glass-card">
                                        <img className="card-img" src={vehicle.image_url} alt={vehicle.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
                                        <div className="card-content">
                                            <h3>{vehicle.name}</h3>
                                            <p>{vehicle.description}</p>
                                            <div className="price">{vehicle.price_per_day !== '' && vehicle.price_per_day != null ? `$${vehicle.price_per_day}/day` : 'Inquire About This Vehicle'}</div>
                                            <button className="btn-outline-glass" onClick={() => openQuickInquiry('Vehicle Rental', vehicle)}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message"><p>No vehicles available. Please check back later.</p></div>
                        )}
                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Vehicle Videos</h3>
                            {getFilteredVideos('vehicle').length > 0 ? (
                                <div className="video-grid">{getFilteredVideos('vehicle').map(video => (<VideoIframe key={video.id} video={video} />))}</div>
                            ) : (<p>No vehicle videos available.</p>)}
                        </div>
                    </section>
                )}

                {/* GALLERY SECTION */}
                {activeSection === 'gallery' && (
                    <section className="section">
                        <h2 className="section-title"><i className="fas fa-images"></i> Photo Gallery</h2>
                        <Gallery />
                    </section>
                )}

                {/* SPECIAL TOURS SECTION */}
                {activeSection === 'tourPackages' && (
                    <section className="section">
                        <h2 className="section-title"><i className="fas fa-suitcase-rolling"></i> Our Special Tour Packages</h2>
                        <p className="section-subtitle">Choose from our carefully crafted tour packages designed to showcase the best of Sri Lanka</p>
                        {specialTours.length > 0 ? (
                            <div className="card-grid">
                                {specialTours.map(pkg => (
                                    <div key={pkg.id} className="glass-card tour-package-card" onClick={() => openPackageModal(pkg)} style={{ cursor: 'pointer' }}>
                                        <img className="card-img" src={pkg.main_image} alt={pkg.title} onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
                                        <div className="card-content">
                                            <div className="package-badge">{pkg.duration}</div>
                                            <h3>{pkg.title}</h3>
                                            <p>{pkg.description.substring(0, 100)}...</p>
                                            <div className="package-highlights">
                                                {pkg.highlights && pkg.highlights.slice(0, 2).map((highlight, idx) => (
                                                    <span key={idx} className="highlight-tag">{highlight}</span>
                                                ))}
                                            </div>
                                            <button
                                                className="btn-outline-glass"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openPackageModal(pkg);
                                                }}
                                            >
                                                <i className="fas fa-images"></i> View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No special tour packages available yet. Check back soon for amazing tour packages!</p>
                            </div>
                        )}
                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Tour Experience Videos</h3>
                            {getFilteredVideos('tour').length > 0 ? (
                                <div className="video-grid">{getFilteredVideos('tour').map(video => (<VideoIframe key={video.id} video={video} />))}</div>
                            ) : (<p>No tour videos available.</p>)}
                        </div>
                    </section>
                )}

                {/* REVIEWS SECTION */}
                {activeSection === 'reviews' && (
                    <section className="section">
                        <h2 className="section-title"><i className="fas fa-star"></i> Guest Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-item">
                                        <strong>{review.name}</strong>
                                        <div className="rating">{'⭐'.repeat(review.rating)}</div>
                                        <p>{review.text}</p>
                                        <small><i className="fas fa-calendar-alt"></i> {new Date(review.created_at).toLocaleDateString()}</small>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message"><p>No reviews yet. Be the first to share your experience!</p></div>
                        )}
                        <div className="review-form">
                            <h3><i className="fas fa-edit"></i> Share Your Experience</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <input type="text" name="name" placeholder="Your name" value={reviewFormData.name} onChange={handleReviewInputChange} required />
                                <textarea name="review" rows="3" placeholder="Write your review..." value={reviewFormData.review} onChange={handleReviewInputChange} required></textarea>
                                <select name="rating" value={reviewFormData.rating} onChange={handleReviewInputChange} required>
                                    <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ - Very Good</option>
                                    <option value="3">⭐⭐⭐ - Good</option>
                                    <option value="2">⭐⭐ - Fair</option>
                                    <option value="1">⭐ - Poor</option>
                                </select>
                                <button type="submit" className="btn-glass-round"><i className="fas fa-paper-plane"></i> Post Review</button>
                            </form>
                        </div>
                    </section>
                )}

                {/* CONTACT US SECTION - ENHANCED WITH TRAVEL DETAILS */}
                {activeSection === 'contact' && (
                    <section className="section contact-section-enhanced">
                        <div className="contact-logo-container">
                            <img src={TgsLogo} alt="Tour Guide Sri Lanka Logo" className="centered-logo-img" />
                        </div>
                        <div className="contact-header">
                            <h2 className="section-title"><i className="fas fa-phone-alt"></i> Contact Us</h2>
                            <p className="contact-subtitle">Let's craft your perfect Sri Lankan adventure together</p>
                        </div>
                        
                        {/* Enhanced Contact Form with Travel Details */}
                        <div className="contact-wrapper-enhanced">
                            <div className="contact-info-card">
                                <div className="info-card-header">
                                    <i className="fas fa-headset"></i>
                                    <h3>Get in Touch</h3>
                                    <p>We're here to help you 24/7</p>
                                </div>
                                <div className="info-items">
                                    <div className="info-item">
                                        <div className="info-icon call-bg">
                                            <img src="https://cdn.iconscout.com/icon/free/png-256/free-apple-phone-icon-svg-download-png-493154.png?f=webp" style={{ width: "50px", height: "50px" }} alt="phone" />
                                        </div>
                                        <div className="info-details">
                                            <span>Call Us</span>
                                            <a href="tel:+94724024002">+94 72 402 4002</a>
                                            <small>24/7 Support</small>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon email-bg">
                                            <i className="fas fa-envelope"></i>
                                            <img
                                                src="https://cdn3d.iconscout.com/3d/free/thumb/free-gmail-3d-icon-png-download-7250524.png"
                                                style={{ width: "80px", height: "80px" }}
                                                alt="Gmail" 
                                            />
                                        </div>
                                        <div className="info-details">
                                            <span>Email Us</span>
                                            <a href="mailto:tourguidesrilanka234@gmail.com">tourguidesrilanka234@gmail.com</a>
                                            <small>Response within 24h</small>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon whatsapp-bg">
                                            <img
                                                src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
                                                alt="WhatsApp"
                                                style={{ width: "80px", height: "80px" }}
                                            />
                                        </div>
                                        <div className="info-details">
                                            <span>WhatsApp</span>
                                            <a href="https://wa.me/94724024002">+94 72 402 4002</a>
                                            <small>Fastest response</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="business-hours">
                                    <h4><i className="fas fa-clock"></i> Business Hours</h4>
                                    <p>Monday - Sunday: 24/7</p>
                                    <p>Support: Always available</p>
                                </div>
                            </div>
                            
                            <div className="contact-form-card">
                                <div className="form-card-header">
                                    <i className="fas fa-paper-plane"></i>
                                    <h3>Quick Inquiry Form</h3>
                                    <p>Fill in your travel details and we'll get back to you via WhatsApp</p>
                                </div>
                                <form onSubmit={handleContactSubmit} className="contact-form-enhanced">
                                    {/* Name Field */}
                                    <div className="form-group">
                                        <label htmlFor="contact_name"><i className="fas fa-user"></i> Full Name *</label>
                                        <input 
                                            type="text" 
                                            id="contact_name" 
                                            name="name" 
                                            value={contactFormData.name} 
                                            onChange={handleContactInputChange} 
                                            placeholder="Enter your full name" 
                                            required 
                                            className="form-input" 
                                        />
                                    </div>
                                    
                                    {/* Country Field */}
                                    <div className="form-group">
                                        <label htmlFor="contact_country"><i className="fas fa-globe"></i> Country *</label>
                                        <select 
                                            id="contact_country" 
                                            name="country" 
                                            value={contactFormData.country || ''} 
                                            onChange={handleContactInputChange} 
                                            required 
                                            className="form-input"
                                        >
                                            <option value="">Select your country</option>
                                            <option value="USA">United States</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="Canada">Canada</option>
                                            <option value="Australia">Australia</option>
                                            <option value="Germany">Germany</option>
                                            <option value="France">France</option>
                                            <option value="Italy">Italy</option>
                                            <option value="Spain">Spain</option>
                                            <option value="Netherlands">Netherlands</option>
                                            <option value="Switzerland">Switzerland</option>
                                            <option value="India">India</option>
                                            <option value="China">China</option>
                                            <option value="Japan">Japan</option>
                                            <option value="South Korea">South Korea</option>
                                            <option value="Russia">Russia</option>
                                            <option value="Brazil">Brazil</option>
                                            <option value="Mexico">Mexico</option>
                                            <option value="South Africa">South Africa</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    
                                    {/* Email Field */}
                                    <div className="form-group">
                                        <label htmlFor="contact_email"><i className="fas fa-envelope"></i> Email Address *</label>
                                        <input 
                                            type="email" 
                                            id="contact_email" 
                                            name="email" 
                                            value={contactFormData.email} 
                                            onChange={handleContactInputChange} 
                                            placeholder="your@email.com" 
                                            required 
                                            className="form-input" 
                                        />
                                    </div>
                                    
                                    {/* Arrival Date */}
                                    <div className="form-group">
                                        <label htmlFor="arrival_date"><i className="fas fa-calendar-plus"></i> Arrival Date *</label>
                                        <input 
                                            type="date" 
                                            id="arrival_date" 
                                            name="arrivalDate" 
                                            value={contactFormData.arrivalDate || ''} 
                                            onChange={handleContactInputChange} 
                                            required 
                                            className="form-input" 
                                        />
                                    </div>
                                    
                                    {/* Departure Date */}
                                    <div className="form-group">
                                        <label htmlFor="departure_date"><i className="fas fa-calendar-minus"></i> Departure Date *</label>
                                        <input 
                                            type="date" 
                                            id="departure_date" 
                                            name="departureDate" 
                                            value={contactFormData.departureDate || ''} 
                                            onChange={handleContactInputChange} 
                                            required 
                                            className="form-input" 
                                        />
                                    </div>
                                    
                                    {/* Number of Pax (Adults) - Max 30 */}
                                    <div className="form-group">
                                        <label htmlFor="no_of_pax"><i className="fas fa-users"></i> Number of Pax (Adults) *</label>
                                        <select 
                                            id="no_of_pax" 
                                            name="noOfAdults" 
                                            value={contactFormData.noOfAdults || '1'} 
                                            onChange={handleContactInputChange} 
                                            required 
                                            className="form-input"
                                        >
                                            {[...Array(30).keys()].map(i => (
                                                <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Pax' : 'Pax'}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Hotel Category */}
                                    <div className="form-group">
                                        <label htmlFor="hotel_category"><i className="fas fa-hotel"></i> Hotel Category *</label>
                                        <select 
                                            id="hotel_category" 
                                            name="hotelCategory" 
                                            value={contactFormData.hotelCategory || 'budget'} 
                                            onChange={handleContactInputChange} 
                                            required 
                                            className="form-input"
                                        >
                                            <option value="boutique">🏨 Boutique Hotel</option>
                                            <option value="5star">⭐⭐⭐⭐⭐ 5 Star Luxury Hotel</option>
                                            <option value="4star">⭐⭐⭐⭐ 4 Star Premium Hotel</option>
                                            <option value="3star">⭐⭐⭐ 3 Star Standard Hotel</option>
                                            <option value="budget">🏠 Budget Accommodation</option>
                                        </select>
                                    </div>
                                    
                                    {/* Message Field */}
                                    <div className="form-group">
                                        <label htmlFor="contact_message"><i className="fas fa-comment-dots"></i> Special Requests / Message</label>
                                        <textarea 
                                            id="contact_message" 
                                            name="message" 
                                            rows="4" 
                                            value={contactFormData.message} 
                                            onChange={handleContactInputChange} 
                                            placeholder="Tell us about your preferred destinations, activities, or any special requirements..." 
                                            className="form-textarea"
                                        ></textarea>
                                    </div>
                                    
                                    <div className="form-options">
                                        <div className="preferred-contact"><i className="fab fa-whatsapp"></i><span>We'll reply via WhatsApp</span></div>
                                    </div>
                                    
                                    <button type="submit" className="submit-btn-enhanced" disabled={contactSubmitting}>
                                        {contactSubmitting ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                                        ) : (
                                            <><i className="fab fa-whatsapp"></i> Send Inquiry via WhatsApp <i className="fas fa-arrow-right"></i></>
                                        )}
                                    </button>
                                    <p className="form-note"><i className="fas fa-lock"></i> Your information is secure and will only be used to respond to your inquiry</p>
                                </form>
                            </div>
                        </div>
                        
                        <div className="why-choose-us-section">
                            <h3 className="section-title"><i className="fas fa-check-circle"></i> Why Choose Tour Guide SriLanka?</h3>
                            <div className="features-grid-enhanced">
                                <div className="feature-card-enhanced"><div className="feature-icon1"></div><h4>100% Personal Driver Service</h4><p>For the safety, comfort, and well-being of all passengers, our personal drivers are strictly prohibited from consuming alcohol, smoking, or using mobile phones while driving.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon2"></div><h4>Good & Clean Vehicles</h4><p>Well-maintained, comfortable, and spotless vehicles for a premium travel experience.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon3"></div><h4>No Kilometer Limit Per Day</h4><p>Explore freely without worrying about extra charges. No hidden fees or mileage restrictions.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon4"></div><h4>100% Satisfaction Guaranteed</h4><p>Your happiness is our priority. We go above and beyond to ensure an unforgettable journey.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon5"></div><h4>Local Experts</h4><p>Our drivers are knowledgeable locals who will share hidden gems and authentic experiences.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon6"></div><h4>Your Safety Our Priority</h4><p>Fully licensed, insured, and safety-certified vehicles with professional drivers.</p></div>
                            </div>
                        </div>
                        
                        <div className="social-media-section">
                            <h3><i className="fas fa-share-alt"></i> Follow Our Adventures</h3>
                            <div className="social-icons-container">
                                <a href="https://www.instagram.com/toursguidesrilanka?igsh=amM1aTE4ZGduajB6" target="_blank" rel="noopener noreferrer" className="social-icon-link1 instagram-icon" aria-label="Follow us on Instagram"></a>
                                <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-icon-link2 tiktok-icon" aria-label="Follow us on TikTok"></a>
                                <a href="https://www.facebook.com/share/1DnjLAS8ds/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-icon-link3" aria-label="Follow us on Facebook">
                                    <img src={FacebookIcon} alt="Facebook" style={{ width: "90px", height: "90px", borderRadius: "50%" }} />
                                </a>
                            </div>
                            <p className="social-follow-text">Join our community for travel inspiration, tips, and exclusive offers!</p>
                        </div>
                        
                        <div className="map-section">
                            <h3><i className="fas fa-map-marker-alt"></i> Explore Sri Lanka</h3>
                            <div className="map-container">
                                <iframe title="Sri Lanka Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4047277.479412064!2d79.56546606379061!3d7.873053671188431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0xe13da4b400e2d38c!2sSri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" width="100%" height="300" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>
                    </section>
                )}

                {/* LONG INQUIRY FORM SECTION */}
                {activeSection === 'longInquiry' && (
                    <section className="section long-inquiry-section">
                        <div className="contact-logo-container">
                            <img src={TgsLogo} alt="Tour Guide Sri Lanka Logo" className="centered-logo-img" />
                        </div>
                        <div className="contact-header">
                            <h2 className="section-title"><i className="fas fa-file-alt"></i> Plan Your Dream Tour</h2>
                            <p className="contact-subtitle">Fill out this detailed form and we'll create a custom tour package just for you</p>
                        </div>

                        <div className="long-inquiry-form-container">
                            <form onSubmit={handleLongInquirySubmit} className="long-inquiry-form">
                                {/* Personal Information Section */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-user-circle"></i> Personal Information</h3>
                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label><i className="fas fa-user"></i> Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={longInquiryFormData.name}
                                                onChange={handleLongInquiryInputChange}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fas fa-globe"></i> Country *</label>
                                            <select
                                                name="country"
                                                value={longInquiryFormData.country}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            >
                                                <option value="">Select your country</option>
                                                <option value="USA">United States</option>
                                                <option value="UK">United Kingdom</option>
                                                <option value="Canada">Canada</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Germany">Germany</option>
                                                <option value="France">France</option>
                                                <option value="Italy">Italy</option>
                                                <option value="Spain">Spain</option>
                                                <option value="Netherlands">Netherlands</option>
                                                <option value="Switzerland">Switzerland</option>
                                                <option value="India">India</option>
                                                <option value="China">China</option>
                                                <option value="Japan">Japan</option>
                                                <option value="South Korea">South Korea</option>
                                                <option value="Russia">Russia</option>
                                                <option value="Brazil">Brazil</option>
                                                <option value="Mexico">Mexico</option>
                                                <option value="South Africa">South Africa</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label><i className="fas fa-envelope"></i> Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={longInquiryFormData.email}
                                                onChange={handleLongInquiryInputChange}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fab fa-whatsapp"></i> WhatsApp Number *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={longInquiryFormData.phone}
                                                onChange={handleLongInquiryInputChange}
                                                placeholder="+94 XX XXX XXXX"
                                                required
                                            />
                                            <small className="field-note">We'll use this number to contact you</small>
                                        </div>
                                    </div>
                                </div>

                                {/* Travel Dates Section */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-calendar-alt"></i> Travel Dates</h3>
                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label><i className="fas fa-calendar-plus"></i> Arrival Date *</label>
                                            <input
                                                type="date"
                                                name="arrivalDate"
                                                value={longInquiryFormData.arrivalDate}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fas fa-calendar-minus"></i> Departure Date *</label>
                                            <input
                                                type="date"
                                                name="departureDate"
                                                value={longInquiryFormData.departureDate}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Travelers Information Section */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-users"></i> Travelers Information</h3>
                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label><i className="fas fa-user-friends"></i> Number of Adults *</label>
                                            <select
                                                name="noOfAdults"
                                                value={longInquiryFormData.noOfAdults}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            >
                                                {[...Array(30).keys()].map(i => (
                                                    <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Adult' : 'Adults'}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fas fa-child"></i> Number of Children</label>
                                            <select
                                                name="noOfChildren"
                                                value={longInquiryFormData.noOfChildren}
                                                onChange={handleLongInquiryInputChange}
                                            >
                                                {[...Array(11).keys()].map(i => (
                                                    <option key={i} value={i}>{i} {i === 1 ? 'Child' : 'Children'}</option>
                                                ))}
                                            </select>
                                            <small className="field-note">Under 12 years old</small>
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fas fa-bed"></i> Number of Rooms *</label>
                                            <select
                                                name="noOfRooms"
                                                value={longInquiryFormData.noOfRooms}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            >
                                                {[...Array(40).keys()].map(i => (
                                                    <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Room' : 'Rooms'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Accommodation Preferences */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-hotel"></i> Accommodation Preferences</h3>
                                    <div className="form-row-grid">
                                        <div className="form-group">
                                            <label><i className="fas fa-star"></i> Hotel Category *</label>
                                            <select
                                                name="hotelCategory"
                                                value={longInquiryFormData.hotelCategory}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            >
                                                <option value="boutique">🏨 Boutique Hotel</option>
                                                <option value="5star">⭐⭐⭐⭐⭐ 5 Star Luxury</option>
                                                <option value="4star">⭐⭐⭐⭐ 4 Star Premium</option>
                                                <option value="3star">⭐⭐⭐ 3 Star Standard</option>
                                                <option value="budget">🏠 Budget Accommodation</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label><i className="fas fa-utensils"></i> Meal Plan *</label>
                                            <select
                                                name="mealPlan"
                                                value={longInquiryFormData.mealPlan}
                                                onChange={handleLongInquiryInputChange}
                                                required
                                            >
                                                <option value="bed_breakfast">🍳 Bed & Breakfast</option>
                                                <option value="half_board">🍽️ Half Board (Breakfast + Dinner)</option>
                                                <option value="full_board">🍱 Full Board (All Meals)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Travel Interests */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-heart"></i> Your Travel Interests</h3>
                                    <p className="section-subtitle-small">Select all that apply to help us customize your tour</p>
                                    <div className="interests-grid">
                                        {interestOptions.map(interest => (
                                            <label key={interest.value} className="interest-checkbox">
                                                <input
                                                    type="checkbox"
                                                    value={interest.value}
                                                    checked={longInquiryFormData.interests.includes(interest.value)}
                                                    onChange={() => handleLongInterestChange(interest.value)}
                                                />
                                                <span>{interest.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Budget Information */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-dollar-sign"></i> Budget Information</h3>
                                    <div className="form-group">
                                        <label>Target Package Budget (per person) *</label>
                                        <select
                                            name="packageBudget"
                                            value={longInquiryFormData.packageBudget}
                                            onChange={handleLongInquiryInputChange}
                                            required
                                        >
                                            <option value="500-1500">💰 $500 - $1,500</option>
                                            <option value="1500-2500">💰 $1,500 - $2,500</option>
                                            <option value="2500-4000">💰 $2,500 - $4,000</option>
                                            <option value="4000-6000">💰 $4,000 - $6,000</option>
                                            <option value="above-6000">💰 Above $6,000</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Special Requests */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-pencil-alt"></i> Special Requests</h3>
                                    <div className="form-group">
                                        <textarea
                                            name="specialRequests"
                                            value={longInquiryFormData.specialRequests}
                                            onChange={handleLongInquiryInputChange}
                                            rows="4"
                                            placeholder="Tell us about any special requests, dietary restrictions, preferred activities, must-visit places, etc."
                                            className="special-requests-textarea"
                                        ></textarea>
                                    </div>
                                </div>

                                {/* How did you hear about us */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-question-circle"></i> How did you hear about us?</h3>
                                    <div className="form-group">
                                        <select
                                            name="hearAboutUs"
                                            value={longInquiryFormData.hearAboutUs}
                                            onChange={handleLongInquiryInputChange}
                                        >
                                            <option value="">Select an option</option>
                                            {hearAboutOptions.map(option => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* CONTACT METHOD - Radio Buttons */}
                                <div className="form-section">
                                    <h3 className="form-section-title"><i className="fas fa-headset"></i> How would you like us to contact you? *</h3>
                                    <p className="section-subtitle-small">Your inquiry will be sent instantly, and we'll respond via your preferred method</p>
                                    <div className="contact-method-radio-group">
                                        <label className={`contact-radio-option ${longInquiryFormData.contactMethod === 'whatsapp' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="contactMethod"
                                                value="whatsapp"
                                                checked={longInquiryFormData.contactMethod === 'whatsapp'}
                                                onChange={handleLongInquiryInputChange}
                                            />
                                            <div className="radio-content">
                                                <i className="fab fa-whatsapp"></i>
                                                <span>WhatsApp</span>
                                                <small>Fastest response, we'll message you within minutes</small>
                                            </div>
                                        </label>
                                        <label className={`contact-radio-option ${longInquiryFormData.contactMethod === 'email' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="contactMethod"
                                                value="email"
                                                checked={longInquiryFormData.contactMethod === 'email'}
                                                onChange={handleLongInquiryInputChange}
                                            />
                                            <div className="radio-content">
                                                <i className="fas fa-envelope"></i>
                                                <span>Email</span>
                                                <small>Detailed response within 24 hours</small>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="form-submit">
                                    <button type="submit" className="submit-btn-long" disabled={longInquirySubmitting}>
                                        {longInquirySubmitting ? (
                                            <><i className="fas fa-spinner fa-spin"></i> Submitting...</>
                                        ) : (
                                            <><i className="fab fa-whatsapp"></i> Submit Tour Request</>
                                        )}
                                    </button>
                                    <p className="form-note">
                                        <i className="fab fa-whatsapp"></i> Your inquiry will be sent via WhatsApp. We'll respond to you via your preferred contact method within 24 hours.
                                    </p>
                                </div>
                            </form>
                        </div>

                        <div className="why-choose-us-section">
                            <h3 className="section-title"><i className="fas fa-check-circle"></i> Why Choose Tour Guide SriLanka?</h3>
                            <div className="features-grid-enhanced">
                                <div className="feature-card-enhanced"><div className="feature-icon1"></div><h4>100% Personal Driver Service</h4><p>Your personal driver will be with you throughout the journey, ensuring a private and tailored experience.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon2"></div><h4>Good & Clean Vehicles</h4><p>Well-maintained, comfortable, and spotless vehicles for a premium travel experience.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon3"></div><h4>No Kilometer Limit Per Day</h4><p>Explore freely without worrying about extra charges. No hidden fees or mileage restrictions.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon4"></div><h4>100% Satisfaction Guaranteed</h4><p>Your happiness is our priority. We go above and beyond to ensure an unforgettable journey.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon5"></div><h4>Local Experts</h4><p>Our drivers are knowledgeable locals who will share hidden gems and authentic experiences.</p></div>
                                <div className="feature-card-enhanced"><div className="feature-icon6"></div><h4>Your Safety Our Priority</h4><p>Fully licensed, insured, and safety-certified vehicles with professional drivers.</p></div>
                            </div>
                        </div>

                        <div className="social-media-section">
                            <h3><i className="fas fa-share-alt"></i> Follow Our Adventures</h3>
                            <div className="social-icons-container">
                                <a href="https://www.instagram.com/toursguidesrilanka?igsh=amM1aTE4ZGduajB6" target="_blank" rel="noopener noreferrer" className="social-icon-link1 instagram-icon" aria-label="Follow us on Instagram"></a>
                                <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-icon-link2 tiktok-icon" aria-label="Follow us on TikTok"></a>
                                <a href="https://www.facebook.com/share/1DnjLAS8ds/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="social-icon-link3" aria-label="Follow us on Facebook">
                                    <img src={FacebookIcon} alt="Facebook" style={{ width: "90px", height: "90px", borderRadius: "50%" }} />
                                </a>
                            </div>
                            <p className="social-follow-text">Join our community for travel inspiration, tips, and exclusive offers!</p>
                        </div>

                        <div className="map-section">
                            <h3><i className="fas fa-map-marker-alt"></i> Explore Sri Lanka</h3>
                            <div className="map-container">
                                <iframe title="Sri Lanka Map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4047277.479412064!2d79.56546606379061!3d7.873053671188431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0xe13da4b400e2d38c!2sSri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk" width="100%" height="300" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* UPDATED FOOTER WITH QUICK LINKS */}
            <footer className="footer-enhanced">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            🌴 Tour Guide SriLanka
                        </div>
                        <p className="footer-description">
                            Your trusted partner for exploring the pearl of the Indian Ocean. Experience Sri Lanka with our professional driver guides and premium vehicles.
                        </p>
                        <div className="footer-contact-info">
                            <p><i className="fas fa-phone-alt"></i> +94 72 402 4002</p>
                            <p><i className="fas fa-envelope"></i> tourguidesrilanka234@gmail.com</p>
                            <p><i className="fas fa-clock"></i> 24/7 Customer Support</p>
                        </div>
                    </div>

                    <div className="footer-quick-links">
                        <h3><i className="fas fa-link"></i> Quick Links</h3>
                        <ul>
                            <li>
                                <button onClick={() => { setActiveSection('home'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-home"></i> Home
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('packages'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-umbrella-beach"></i> Things To Do
                                </button>
                            </li>
                            <li>
                                <a href="/round-tours" className="footer-link-btn" onClick={scrollToTop}>
                                    <i className="fas fa-map-marked-alt"></i> Round Tours
                                </a>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('vehicle'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-car"></i> Vehicle Packages
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('tourPackages'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-suitcase-rolling"></i> Tour Packages
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('reviews'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-star"></i> Reviews
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('gallery'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-images"></i> Gallery
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('contact'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-envelope"></i> Contact Us
                                </button>
                            </li>
                            <li>
                                <button onClick={() => { setActiveSection('longInquiry'); scrollToTop(); }} className="footer-link-btn">
                                    <i className="fas fa-file-alt"></i> Plan Your Tour
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="footer-social-links">
                        <div className="footer-newsletter">
                            <h4>Get Travel Inspiration</h4>
                            <p>Subscribe for exclusive offers and travel tips</p>
                            <div className="footer-newsletter-form">
                                <input type="email" placeholder="Your email address" />
                                <button>Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; 2026 Tour Guide SriLanka — Premium Driver & Tour Experts. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                        <a href="#">Sitemap</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;