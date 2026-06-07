// RoundTours.js - Updated with Full Quick Inquiry Modal
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, luxelankaService } from '../services/supabaseService';
import '../styles/RoundTours.css';

function RoundTours() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [tourDurations, setTourDurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Quick Inquiry Modal State
  const [showQuickInquiry, setShowQuickInquiry] = useState(false);
  const [inquiryItemType, setInquiryItemType] = useState('');
  const [inquiryItemName, setInquiryItemName] = useState('');
  const [selectedTourForInquiry, setSelectedTourForInquiry] = useState(null);
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

  useEffect(() => {
    fetchRoundTours();
  }, []);

  const fetchRoundTours = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roundtours')
        .select('*')
        .order('days', { ascending: true });
      
      if (error) throw error;
      
      console.log('Round tours loaded:', data);
      setTourDurations(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching round tours:', error);
      setError('Failed to load tours. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTourClick = (tour) => {
    navigate(`/round-tour/${tour.id}`);
  };

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

  // Open Quick Inquiry Modal
  const openQuickInquiry = (tour, e) => {
    e.stopPropagation();
    setInquiryItemType('Round Tour');
    setInquiryItemName(tour.title);
    setSelectedTourForInquiry(tour);
    setQuickInquiryData({
      name: '',
      country: '',
      email: '',
      arrivalDate: '',
      departureDate: '',
      noOfAdults: '1',
      hotelCategory: 'budget',
      message: `I'm interested in the ${tour.days}-day round tour: ${tour.title}\n\nPlease provide me with more details, itinerary, and pricing.`
    });
    setShowQuickInquiry(true);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickInquiry = () => {
    setShowQuickInquiry(false);
    setInquiryItemType('');
    setInquiryItemName('');
    setSelectedTourForInquiry(null);
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

  const handleQuickInquirySubmit = async (e) => {
    e.preventDefault();
    setQuickInquirySubmitting(true);

    const whatsappMessage = `*NEW ROUND TOUR INQUIRY*\n\n` +
      `*Tour:* ${inquiryItemName}\n` +
      `*Duration:* ${selectedTourForInquiry?.days || 'N/A'} Days\n\n` +
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
      `*Sent from Tour Guide SriLanka Website - Round Tours Page*`;

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
        inquiry_type: 'Round Tour Inquiry',
        item_name: inquiryItemName,
        created_at: new Date().toISOString()
      };
      await luxelankaService.submitQuickContact?.(supabaseData);
      console.log('Round tour inquiry saved to Supabase');
    } catch (error) {
      console.error('Error saving round tour inquiry:', error);
    }

    window.open(whatsappUrl, '_blank');
    alert(`Thank you! Your inquiry about ${inquiryItemName} has been sent. We will contact you shortly via WhatsApp.`);
    closeQuickInquiry();
    setQuickInquirySubmitting(false);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Tours</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-glass-round">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const uniqueDurations = Array.from(new Set(tourDurations.map(t => Number(t.days))))
    .filter(days => !Number.isNaN(days))
    .sort((a, b) => a - b);

  const filteredTours = selectedDuration 
    ? tourDurations.filter(t => Number(t.days) === selectedDuration) 
    : tourDurations;

  return (
    <div className="round-tours-page">
      {/* QUICK INQUIRY MODAL - Same as Contact Form */}
      {showQuickInquiry && (
        <div className="inquiry-modal-overlay" onClick={closeQuickInquiry}>
          <div className="inquiry-modal-container quick-inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inquiry-modal-header">
              <h2><i className="fas fa-paper-plane"></i> Round Tour Inquiry</h2>
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
                    rows="4" 
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

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">🌴 Tour Guide SriLanka</div>
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
            <Link to="/" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-home"></i> Home
            </Link>
            <Link to="/#packages" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-umbrella-beach"></i> Tour Packages
            </Link>
            <Link to="/round-tours" className="glass-nav-btn active" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-map-marked-alt"></i> Round Tours
            </Link>
            <Link to="/#vehicle" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-car"></i> Vehicle Packages
            </Link>
            <Link to="/#tourPackages" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-suitcase-rolling"></i> Special Tours
            </Link>
            <Link to="/#reviews" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-star"></i> Reviews
            </Link>
            <Link to="/#gallery" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-images"></i> Gallery
            </Link>
            <Link to="/#contact" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-envelope"></i> Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Top Info Bar */}
      <div className="info-bar">
        <div className="info-bar-content">
          <span><i className="fas fa-phone-alt"></i> +94 72 402 4002</span>
          <span><i className="fas fa-clock"></i> 24/7 Support</span>
        </div>
      </div>

      <div className="page-action-row">
        <button className="page-back-btn" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </div>

      {/* Floating Social Icons */}
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

      {/* Hero Section */}
      <div className="tours-hero">
        <div className="hero-overlay">
          <h1>Round Tours in Sri Lanka</h1>
          <p>Discover the pearl of the Indian Ocean with our carefully crafted tour packages</p>
          <div className="hero-badge">
            <i className="fas fa-star"></i> 5 to 14 Days Customizable Tours
          </div>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="duration-filter">
        <div className="filter-container">
          <h3>Select Tour Duration</h3>
          <div className="duration-buttons">
            {uniqueDurations.length > 0 ? (
              uniqueDurations.map(days => (
                <button
                  key={days}
                  className={`duration-btn ${selectedDuration === days ? 'active' : ''}`}
                  onClick={() => setSelectedDuration(selectedDuration === days ? null : days)}
                >
                  <span className="days">{days}</span>
                  <span className="nights">Days</span>
                </button>
              ))
            ) : (
              <div className="no-durations-message">No duration filters available yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="tours-container">
        <div className="tours-header">
          <h2>Our Round Tour Packages</h2>
          <br />
          <p>Choose from {uniqueDurations.length > 0 ? uniqueDurations[0] : '5'} to {uniqueDurations.length > 0 ? uniqueDurations[uniqueDurations.length - 1] : '14'} days of unforgettable experiences</p>
        </div>

        <div className="tours-grid">
          {filteredTours.length > 0 ? (
            filteredTours.map(tour => (
              <div key={tour.id} className="tour-card" onClick={() => handleTourClick(tour)}>
                <div className="tour-image">
                  <img src={tour.image_url} alt={tour.title} onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Tour+Image';
                  }} />
                  <div className="tour-badge">{tour.duration}</div>
                </div>
                <div className="tour-content">
                  <h3>{tour.title}</h3>
                  <p className="tour-description">{tour.description}</p>
                  <div className="tour-footer">
                    <div className="tour-price">
                      <span className="price">
                        {tour.price !== '' && tour.price != null ? tour.price : 'Contact for price'}
                      </span>
                      {tour.price !== '' && tour.price != null && (
                        <span className="per-person">per person</span>
                      )}
                    </div>
                    <div className="tour-actions">
                      <button className="view-details-btn">View Details →</button>
                      <button className="quick-inquiry-btn" onClick={(e) => openQuickInquiry(tour, e)}>
                        <i className="fab fa-whatsapp"></i> Quick Inquiry
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tours-message">
              <p>No tours found for the selected duration. Try a different duration!</p>
            </div>
          )}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="why-choose-section">
        <h2>Why Choose Our Round Tours?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-map-marked-alt"></i>
            <h3>Customizable Itineraries</h3>
            <p>Tailor your tour to match your preferences and interests</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-car"></i>
            <h3>Private Transport</h3>
            <p>Comfortable vehicles with professional drivers</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-hotel"></i>
            <h3>Handpicked Hotels</h3>
            <p>Carefully selected accommodations for your comfort</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-headset"></i>
            <h3>24/7 Support</h3>
            <p>Round-the-clock assistance throughout your journey</p>
          </div>
        </div>
      </div>

      {/* ENHANCED FOOTER WITH QUICK LINKS */}
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
                <Link to="/" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-home"></i> Home
                </Link>
              </li>
              <li>
                <Link to="/#packages" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-umbrella-beach"></i> Things To Do
                </Link>
              </li>
              <li>
                <Link to="/round-tours" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-map-marked-alt"></i> Round Tours
                </Link>
              </li>
              <li>
                <Link to="/#vehicle" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-car"></i> Vehicle Packages
                </Link>
              </li>
              <li>
                <Link to="/#tourPackages" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-suitcase-rolling"></i> Tour Packages
                </Link>
              </li>
              <li>
                <Link to="/#reviews" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-star"></i> Reviews
                </Link>
              </li>
              <li>
                <Link to="/#gallery" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-images"></i> Gallery
                </Link>
              </li>
              <li>
                <Link to="/#quickContact" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-bolt"></i> Quick Contact
                </Link>
              </li>
              <li>
                <Link to="/#longInquiry" className="footer-link-btn" onClick={scrollToTop}>
                  <i className="fas fa-file-alt"></i> Plan Your Tour
                </Link>
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
          <p>© 2026 Tour Guide SriLanka — Premium Driver & Tour Experts. All rights reserved.</p>
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

export default RoundTours;