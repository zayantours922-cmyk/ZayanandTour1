// HomePage.js
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../styles/HomePage.css';
import { luxelankaService } from '../services/supabaseService';

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
    const [contactFormData, setContactFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
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

    useEffect(() => {
        fetchData();
        startStatsCounter();
    }, []);

    const startStatsCounter = () => {
        const targets = {
            customers: 500,
            travelers: 1000,
            experience: 15,
            support: 24
        };

        const duration = 2000; // 2 seconds
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

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching data from Supabase...');

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

            console.log('Data loaded successfully from Supabase:', {
                packages: packagesData?.length,
                vehicles: vehiclesData?.length,
                drivers: driversData?.length,
                videos: videosData?.length,
                reviews: reviewsData?.length
            });
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

    // Function to convert YouTube URL to embed URL with mobile-friendly parameters
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

    const handleContactSubmit = async (e) => {
        e.preventDefault();

        const whatsappMessage = `*New Tour Inquiry*%0A%0A*Name:* ${contactFormData.name}%0A*Email:* ${contactFormData.email}%0A*Message:* ${contactFormData.message}%0A%0A*Sent from Luxe Lanka Website*`;

        const whatsappUrl = `https://wa.me/94774120009?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');

        try {
            await luxelankaService.submitContactMessage(contactFormData);
            console.log('Contact message saved to Supabase');
        } catch (error) {
            console.error('Error saving contact message:', error);
        }

        alert('Message prepared for WhatsApp! Click send to complete.');
        setContactFormData({ name: '', email: '', message: '' });
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

    const handleContactInputChange = (e) => {
        setContactFormData({
            ...contactFormData,
            [e.target.name]: e.target.value
        });
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

    // Reusable video component
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
            <nav className="glass-nav">
                <div className="nav-container">
                    <div className="logo">
                       🌴 Tour Guide SriLanka
                    </div>                    
                    <div className="menu-container">
                        <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <div className="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                        <span className="menu-text">Menu</span>
                    </div>
                    <div className={`nav-links ${mobileMenuOpen ? 'show' : ''}`}>
                        <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'home' ? 'active' : ''}`}>
                            <i className="fas fa-home"></i> Home
                        </button>
                        <button onClick={() => { setActiveSection('packages'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'packages' ? 'active' : ''}`}>
                            <i className="fas fa-umbrella-beach"></i> Tour Packages
                        </button>
                        <a href="/round-tours" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
                            <i className="fas fa-map-marked-alt"></i> Round Tours
                        </a>
                        <button onClick={() => { setActiveSection('vehicle'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'vehicle' ? 'active' : ''}`}>
                            <i className="fas fa-car"></i> Vehicle Packages
                        </button>
                        <button onClick={() => { setActiveSection('drivers'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'drivers' ? 'active' : ''}`}>
                            <i className="fas fa-users"></i> About Drivers
                        </button>
                        <button onClick={() => { setActiveSection('reviews'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}>
                            <i className="fas fa-star"></i> Reviews
                        </button>
                        <button onClick={() => { setActiveSection('contact'); setMobileMenuOpen(false); }} className={`glass-nav-btn ${activeSection === 'contact' ? 'active' : ''}`}>
                            <i className="fas fa-envelope"></i> Contact
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

            <div className="floating-social">
                <a
                    href="https://wa.me/94774120009"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="float-glass-btn whatsapp"
                    aria-label="Chat on WhatsApp"
                >
                    <img
                        src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
                        style={{ width: "80px", height: "80px" }}
                        alt="WhatsApp"
                    />
                </a>
            </div>

            <main className="container">
                {activeSection === 'home' && (
                    <section className="section active-section">
                        <div className="hero">
                            <h1>Explore Sri Lanka in Style</h1>
                            <p>Luxury vehicles, expert drivers, and handcrafted journeys — discover paradise with us.</p>
                            <button onClick={() => setActiveSection('packages')} className="btn-glass-round">
                                View Packages <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                        {/* Stats Section - New Addition */}
                        <div className="stats-section">
                            <div className="stats-container">
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-smile"></i>
                                    </div>
                                    <div className="stat-number">
                                        {stats.customers}+
                                    </div>
                                    <div className="stat-label">
                                        Happy Customers
                                    </div>
                                    <div className="stat-description">
                                        Trusted by travelers worldwide
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-globe-asia"></i>
                                    </div>
                                    <div className="stat-number">
                                        {stats.travelers}+
                                    </div>
                                    <div className="stat-label">
                                        Happy Travelers
                                    </div>
                                    <div className="stat-description">
                                        Explored Sri Lanka with us
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-award"></i>
                                    </div>
                                    <div className="stat-number">
                                        {stats.experience}+
                                    </div>
                                    <div className="stat-label">
                                        Years Experience
                                    </div>
                                    <div className="stat-description">
                                        Excellence in service
                                    </div>
                                </div>
                                
                                <div className="stat-card">
                                    <div className="stat-icon">
                                        <i className="fas fa-headset"></i>
                                    </div>
                                    <div className="stat-number">
                                        {stats.support}/7
                                    </div>
                                    <div className="stat-label">
                                        Support
                                    </div>
                                    <div className="stat-description">
                                        Always here to help
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="About">
                            <h1>Ayubowan! Welcome to SriLanka</h1>
                            <p><center>We're thrilled to have you here. From stunning beaches to rich culture We're excited for you to experience our island's beauty: Were here to make your stay unforgettable!

                                Srilanka - a tropical paradise Located in the indian Ocean, this tiny island nation is a treasure trove of stunning landscapes, rich culture, and warm hospitality. From the misty hills of Nuwara Eliya to the golden beaches of Mirissa, Srilanka is a heaven for travelers.
                            </center></p>

                            <div className="country-images">
                                <img src="https://flagcdn.com/w320/us.png" alt="USA" />
                                <img src="https://flagcdn.com/w320/fr.png" alt="France" />
                                <img src="https://flagcdn.com/w320/it.png" alt="Italy" />
                                <img src="https://flagcdn.com/w320/mx.png" alt="Mexico" />
                            </div>
                        </div>

                        <div className="video-section">
                            <h2 className="section-title">
                                <i className="fas fa-video"></i> Video Reviews
                                <span className="orange-badge">Travel Stories</span>
                            </h2>
                            {getHomeVideos().length > 0 ? (
                                <div className="video-grid">
                                    {getHomeVideos().map(video => (
                                        <VideoIframe key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <div className="no-videos-message">
                                    <p>No videos available yet. Check back soon for travel stories!</p>
                                </div>
                            )}
                        </div>

                        <div className="reviews-section">
                            <h2 className="section-title">
                                <i className="fas fa-star"></i> Traveler Reviews
                            </h2>
                            {reviews.length > 0 ? (
                                <div className="reviews-carousel">
                                    <Swiper
                                        modules={[Autoplay, Pagination, Navigation]}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                                        pagination={{ clickable: true }}
                                        navigation
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            1024: { slidesPerView: 3 }
                                        }}
                                    >
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
                                <div className="no-reviews-message">
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'packages' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-umbrella-beach"></i> Signature Tours
                        </h2>
                        {packages.length > 0 ? (
                            <div className="card-grid">
                                {packages.map(pkg => (
                                    <div key={pkg.id} className="glass-card">
                                        <img className="card-img" src={pkg.image_url} alt={pkg.title} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="card-content">
                                            <h3>{pkg.title}</h3>
                                            <p>{pkg.description}</p>
                                            <div className="price">
                                                {pkg.price !== '' && pkg.price != null ? `$${pkg.price}` : 'Contact for price'}
                                            </div>
                                            <button className="btn-outline-glass" onClick={() => window.open('https://wa.me/94774120009', '_blank')}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No packages available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Tour Videos</h3>
                            {getFilteredVideos('tour').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('tour').map(video => (
                                        <VideoIframe key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <p>No tour videos available.</p>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'vehicle' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-car"></i> Premium Fleet
                        </h2>
                        {vehicles.length > 0 ? (
                            <div className="card-grid">
                                {vehicles.map(vehicle => (
                                    <div key={vehicle.id} className="glass-card">
                                        <img className="card-img" src={vehicle.image_url} alt={vehicle.name} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="card-content">
                                            <h3>{vehicle.name}</h3>
                                            <p>{vehicle.description}</p>
                                            <div className="price">
                                                {vehicle.price_per_day !== '' && vehicle.price_per_day != null ? `$${vehicle.price_per_day}/day` : 'Contact for price'}
                                            </div>
                                            <button className="btn-outline-glass" onClick={() => window.open('https://wa.me/94774120009', '_blank')}>
                                                <i className="fab fa-whatsapp"></i> Inquire
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No vehicles available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Vehicle Videos</h3>
                            {getFilteredVideos('vehicle').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('vehicle').map(video => (
                                        <VideoIframe key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <p>No vehicle videos available.</p>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'drivers' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-users"></i> Meet Your Expert Drivers
                        </h2>
                        {drivers.length > 0 ? (
                            <div className="driver-grid">
                                {drivers.map(driver => (
                                    <div key={driver.id} className="driver-glass-card">
                                        <img className="driver-img" src={driver.image_url} alt={driver.name} onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }} />
                                        <div className="driver-info">
                                            <div className="driver-name">{driver.name}</div>
                                            <span className="orange-badge">
                                                <i className="fas fa-calendar-alt"></i> {driver.experience_years}+ years
                                            </span>
                                            <p className="driver-bio">{driver.bio}</p>
                                            <small><i className="fas fa-tag"></i> {driver.specialty}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-message">
                                <p>No drivers available. Please check back later.</p>
                            </div>
                        )}

                        <div className="video-section">
                            <h3><i className="fas fa-video"></i> Driver Stories</h3>
                            {getFilteredVideos('driver').length > 0 ? (
                                <div className="video-grid">
                                    {getFilteredVideos('driver').map(video => (
                                        <VideoIframe key={video.id} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <p>No driver stories available.</p>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'reviews' && (
                    <section className="section">
                        <h2 className="section-title">
                            <i className="fas fa-star"></i> Guest Reviews
                        </h2>
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
                            <div className="no-data-message">
                                <p>No reviews yet. Be the first to share your experience!</p>
                            </div>
                        )}

                        <div className="review-form">
                            <h3><i className="fas fa-edit"></i> Share Your Experience</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={reviewFormData.name}
                                    onChange={handleReviewInputChange}
                                    required
                                />
                                <textarea
                                    name="review"
                                    rows="3"
                                    placeholder="Write your review..."
                                    value={reviewFormData.review}
                                    onChange={handleReviewInputChange}
                                    required
                                ></textarea>
                                <select
                                    name="rating"
                                    value={reviewFormData.rating}
                                    onChange={handleReviewInputChange}
                                    required
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                                    <option value="4">⭐⭐⭐⭐ - Very Good</option>
                                    <option value="3">⭐⭐⭐ - Good</option>
                                    <option value="2">⭐⭐ - Fair</option>
                                    <option value="1">⭐ - Poor</option>
                                </select>
                                <button type="submit" className="btn-glass-round">
                                    <i className="fas fa-paper-plane"></i> Post Review
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                {activeSection === 'contact' && (
                    <section className="section contact-section-enhanced">
                        <div className="contact-header">
                            <h2 className="section-title">
                                <i className="fas fa-phone-alt"></i> Plan Your Journey
                            </h2>
                            <p className="contact-subtitle">Let's craft your perfect Sri Lankan adventure together</p>
                        </div>

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
                                            <img
                                                src="https://cdn.iconscout.com/icon/free/png-256/free-apple-phone-icon-svg-download-png-493154.png?f=webp"
                                                style={{ width: "50px", height: "50px" }}
                                                alt="phone"
                                            />
                                        </div>
                                        <div className="info-details">
                                            <span>Call Us</span>
                                            <a href="tel:+94774120009">+94 77 412 0009</a>
                                            <small>Available 8AM - 10PM</small>
                                        </div>
                                    </div>


                                </div>

                                <div className="business-hours">
                                    <h4><i className="fas fa-clock"></i> Business Hours</h4>
                                    <p>Monday - Sunday: 8:00 AM - 10:00 PM</p>
                                    <p>Emergency Support: 24/7</p>
                                </div>
                            </div>

                            <div className="contact-form-card">
                                <div className="form-card-header">
                                    <i className="fas fa-paper-plane"></i>
                                    <h3>Send a Message</h3>
                                    <p>We'll get back to you via WhatsApp</p>
                                </div>

                                <form onSubmit={handleContactSubmit} className="contact-form-enhanced">
                                    <div className="form-group">
                                        <label htmlFor="name">
                                            <i className="fas fa-user"></i> Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={contactFormData.name}
                                            onChange={handleContactInputChange}
                                            placeholder="John Doe"
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">
                                            <i className="fas fa-envelope"></i> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={contactFormData.email}
                                            onChange={handleContactInputChange}
                                            placeholder="john@example.com"
                                            required
                                            className="form-input"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">
                                            <i className="fas fa-comment-dots"></i> Your Message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows="5"
                                            value={contactFormData.message}
                                            onChange={handleContactInputChange}
                                            placeholder="Tell us about your dream Sri Lankan tour..."
                                            required
                                            className="form-textarea"
                                        ></textarea>
                                    </div>

                                    <div className="form-options">
                                        <div className="preferred-contact">
                                            <i className="fab fa-whatsapp"></i>
                                            <span>We'll reply via WhatsApp</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="submit-btn-enhanced">
                                        <i className="fab fa-whatsapp"></i>
                                        Send via WhatsApp
                                        <i className="fas fa-arrow-right"></i>
                                    </button>

                                    <p className="form-note">
                                        <i className="fas fa-lock"></i> Your information is secure and will only be used to respond to your inquiry
                                    </p>
                                </form>
                            </div>
                        </div>

                        <div className="quick-inquiry">
                            <h3><i className="fas fa-bolt"></i> Quick Inquiry</h3>
                            <div className="quick-buttons">
                                <button
                                    onClick={() => {
                                        const message = "Hi! I'm interested in your tour packages. Can you help me plan my Sri Lanka trip?";
                                        window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-umbrella-beach"></i> Tour Packages
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! I'd like to know more about your vehicle rentals. What vehicles do you have available?";
                                        window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-car"></i> Vehicle Rental
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! Can you share more information about your drivers and their experience?";
                                        window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-users"></i> Driver Service
                                </button>
                                <button
                                    onClick={() => {
                                        const message = "Hi! I need a custom itinerary for my Sri Lanka tour. Can you help?";
                                        window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
                                    }}
                                    className="quick-btn"
                                >
                                    <i className="fas fa-map-marked-alt"></i> Custom Tour
                                </button>
                            </div>
                        </div>

                        {/* Why Choose Us Section - New Addition */}
                        <div className="why-choose-us-section">
                            <h3 className="section-title">
                                <i className="fas fa-check-circle"></i> Why Choose Zayaan Tours?
                            </h3>
                            <div className="features-grid-enhanced">
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon1"><i className="fas fa-user-tie"></i></div>
                                    <h4>100% Personal Driver Service</h4>
                                    <p>Your personal driver will be with you throughout the journey, ensuring a private and tailored experience.</p>
                                </div>
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon2"><i className="fas fa-car-side"></i></div>
                                    <h4>Good & Clean Vehicles</h4>
                                    <p>Well-maintained, comfortable, and spotless vehicles for a premium travel experience.</p>
                                </div>
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon3"><i className="fas fa-road"></i></div>
                                    <h4>No Kilometer Limit Per Day</h4>
                                    <p>Explore freely without worrying about extra charges. No hidden fees or mileage restrictions.</p>
                                </div>
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon4"><i className="fas fa-medal"></i></div>
                                    <h4>100% Satisfaction Guaranteed</h4>
                                    <p>Your happiness is our priority. We go above and beyond to ensure an unforgettable journey.</p>
                                </div>
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon5"><i className="fas fa-map-marked-alt"></i></div>
                                    <h4>Local Experts</h4>
                                    <p>Our drivers are knowledgeable locals who will share hidden gems and authentic experiences.</p>
                                </div>
                                <div className="feature-card-enhanced">
                                    <div className="feature-icon6"><i className="fas fa-shield-alt"></i></div>
                                    <h4>Your Safety Our Priority</h4>
                                    <p>Fully licensed, insured, and safety-certified vehicles with professional drivers.</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Section - New Addition */}
                        <div className="social-media-section">
                            <h3><i className="fas fa-share-alt"></i> Follow Our Adventures</h3>
                            <div className="social-icons-container">
                                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon-link1 instagram-icon" aria-label="Follow us on Instagram">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" className="social-icon-link2 tiktok-icon" aria-label="Follow us on TikTok">
                                    <i className="fab fa-tiktok"></i>
                                </a>
                                <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="social-icon-link3 youtube-icon" aria-label="Subscribe on YouTube">
                                    <i className="fab fa-youtube"></i>
                                </a>
                            </div>
                            <p className="social-follow-text">Join our community for travel inspiration, tips, and exclusive offers!</p>
                        </div>

                        <div className="map-section">
                            <h3><i className="fas fa-map-marker-alt"></i> Explore Sri Lanka</h3>
                            <div className="map-container">
                                <iframe
                                    title="Sri Lanka Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4047277.479412064!2d79.56546606379061!3d7.873053671188431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593cf65a1e9d%3A0xe13da4b400e2d38c!2sSri%20Lanka!5e0!3m2!1sen!2slk!4v1700000000000!5m2!1sen!2slk"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <footer>
                <p>© 2026 Tour Guide SriLanka — Premium Driver & Tour Experts</p>
                <div className="footer-social">
                    <a href="https://wa.me/94774120009" target="_blank" rel="noopener noreferrer">
                        <i className="fab fa-whatsapp"></i>
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default HomePage;