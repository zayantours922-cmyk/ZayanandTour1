// TourItinerary.js - Updated with Quick Inquiry Modal
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, luxelankaService } from '../services/supabaseService';
import '../styles/TourItinerary.css';

function TourItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [itineraryDays, setItineraryDays] = useState([]);

  // Quick Inquiry Modal State
  const [showQuickInquiry, setShowQuickInquiry] = useState(false);
  const [inquiryItemType, setInquiryItemType] = useState('');
  const [inquiryItemName, setInquiryItemName] = useState('');
  const [inquiryDay, setInquiryDay] = useState(null);
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

  // Fetch tour data based on ID
  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        // Fetch tour details
        const { data: tour, error: tourError } = await supabase
          .from('roundtours')
          .select('*')
          .eq('id', id)
          .single();

        if (tourError) throw tourError;
        
        setTourData(tour);
        
        // Parse itinerary if exists
        if (tour.itinerary) {
          try {
            const parsedItinerary = JSON.parse(tour.itinerary);
            setItineraryDays(parsedItinerary);
          } catch (e) {
            console.error('Error parsing itinerary:', e);
            setItineraryDays([]);
          }
        } else {
          // Generate default itinerary if none exists
          generateDefaultItinerary(tour);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading tour data:', err);
        setError('Failed to load itinerary. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTourData();
    }
  }, [id]);

  const generateDefaultItinerary = (tour) => {
    const days = tour.total_days || tour.days || 7;
    const defaultDays = [];
    
    const defaultActivities = {
      1: {
        title: "Arrival & Transfer to Hotel",
        activities: [
          "Arrival at Colombo International Airport",
          "Meet & greet by your personal driver",
          "Transfer to hotel",
          "Check-in and relaxation",
          "Welcome dinner"
        ]
      },
      2: {
        title: "Sigiriya & Ancient City Exploration",
        activities: [
          "Early morning Sigiriya Lion Rock climb",
          "Ancient rock fortress exploration",
          "Water gardens and ancient frescoes",
          "Village tour with traditional lunch"
        ]
      },
      3: {
        title: "Kandy - Cultural Capital",
        activities: [
          "Visit Dambulla Cave Temple",
          "Spice Garden tour",
          "Arrival in Kandy",
          "Temple of the Tooth Relic",
          "Kandyan Cultural Dance Show"
        ]
      },
      4: {
        title: "Nuwara Eliya - Tea Country",
        activities: [
          "Royal Botanical Gardens",
          "Tea factory and plantation visit",
          "Ramboda Waterfalls",
          "Arrival in Nuwara Eliya",
          "Gregory Lake stroll"
        ]
      },
      5: {
        title: "Ella - Scenic Beauty",
        activities: [
          "Scenic train ride to Ella",
          "Nine Arch Bridge visit",
          "Little Adam's Peak hike",
          "Ravana Falls",
          "Ella Gap viewpoint"
        ]
      },
      6: {
        title: "Yala National Park Safari",
        activities: [
          "Early morning Yala safari",
          "Wildlife spotting - leopards, elephants",
          "Transfer to beach area",
          "Beach relaxation",
          "Sunset view"
        ]
      },
      7: {
        title: "Galle Fort & Departure",
        activities: [
          "Visit Galle Dutch Fort",
          "Lighthouse and ramparts walk",
          "Turtle Hatchery visit",
          "Transfer to airport",
          "Departure with wonderful memories"
        ]
      }
    };
    
    for (let i = 1; i <= days; i++) {
      if (defaultActivities[i]) {
        defaultDays.push({
          day_number: i,
          title: defaultActivities[i].title,
          image_url: "",
          activities: defaultActivities[i].activities
        });
      } else {
        defaultDays.push({
          day_number: i,
          title: `Day ${i} - Sri Lanka Exploration`,
          image_url: "",
          activities: [
            "Explore local attractions",
            "Cultural experiences",
            "Scenic viewpoints",
            "Local cuisine tasting"
          ]
        });
      }
    }
    
    setItineraryDays(defaultDays);
  };

  const getDayActivities = (dayNumber) => {
    const day = itineraryDays.find(d => d.day_number === dayNumber);
    if (day) {
      return {
        title: day.title,
        image: day.image_url || "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: Array.isArray(day.activities) ? day.activities : 
                   (typeof day.activities === 'string' ? JSON.parse(day.activities) : [])
      };
    }
    
    // Fallback
    return {
      title: `Day ${dayNumber} - Sri Lanka Exploration`,
      image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
      activities: [
        "Explore local attractions",
        "Cultural experiences",
        "Scenic viewpoints",
        "Local cuisine tasting"
      ]
    };
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

  // Open Quick Inquiry Modal for Full Tour
  const openQuickInquiry = () => {
    setInquiryItemType('Round Tour');
    setInquiryItemName(tourData?.title || 'Tour');
    setInquiryDay(null);
    setQuickInquiryData({
      name: '',
      country: '',
      email: '',
      arrivalDate: '',
      departureDate: '',
      noOfAdults: '1',
      hotelCategory: 'budget',
      message: `I'm interested in the round tour: ${tourData?.title}\n\nDuration: ${tourData?.duration}\n\nPlease provide me with more details and pricing.`
    });
    setShowQuickInquiry(true);
    document.body.style.overflow = 'hidden';
  };

  // Open Quick Inquiry Modal for Specific Day
  const openDayInquiry = (day) => {
    const dayInfo = getDayActivities(day);
    setInquiryItemType('Round Tour Day');
    setInquiryItemName(`${tourData?.title} - Day ${day}`);
    setInquiryDay(day);
    setQuickInquiryData({
      name: '',
      country: '',
      email: '',
      arrivalDate: '',
      departureDate: '',
      noOfAdults: '1',
      hotelCategory: 'budget',
      message: `I'm interested in Day ${day} of the ${tourData?.title} tour.\n\nDay ${day}: ${dayInfo.title}\n\nPlease provide me with more details and pricing for this specific day.`
    });
    setShowQuickInquiry(true);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickInquiry = () => {
    setShowQuickInquiry(false);
    setInquiryItemType('');
    setInquiryItemName('');
    setInquiryDay(null);
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

    const dayInfo = inquiryDay ? getDayActivities(inquiryDay) : null;
    const dayText = inquiryDay 
      ? `\n\n*Specific Day:* Day ${inquiryDay} - ${dayInfo?.title || ''}`
      : '';

    const whatsappMessage = `*NEW ${inquiryItemType.toUpperCase()} INQUIRY*%0A%0A` +
      `*Tour:* ${inquiryItemName}${dayText}%0A%0A` +
      `*Personal Information:*%0A` +
      `*Name:* ${quickInquiryData.name}%0A` +
      `*Country:* ${quickInquiryData.country || 'Not specified'}%0A` +
      `*Email:* ${quickInquiryData.email}%0A%0A` +
      `*Travel Details:*%0A` +
      `*Arrival Date:* ${quickInquiryData.arrivalDate || 'Not specified'}%0A` +
      `*Departure Date:* ${quickInquiryData.departureDate || 'Not specified'}%0A` +
      `*Number of Pax:* ${quickInquiryData.noOfAdults || '1'} Adults%0A%0A` +
      `*Hotel Category:* ${getHotelCategoryLabel(quickInquiryData.hotelCategory || 'budget')}%0A%0A` +
      `*Special Requests/Message:*%0A${quickInquiryData.message || 'None'}%0A%0A` +
      `*Sent from Tour Guide SriLanka Website - Tour Itinerary Page*`;

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
        inquiry_type: inquiryItemType,
        item_name: inquiryItemName,
        created_at: new Date().toISOString()
      };
      await luxelankaService.submitQuickContact?.(supabaseData);
      console.log('Tour inquiry saved to Supabase');
    } catch (error) {
      console.error('Error saving tour inquiry:', error);
    }

    window.open(whatsappUrl, '_blank');
    alert(`Thank you! Your inquiry about ${inquiryItemName} has been sent. We will contact you shortly via WhatsApp.`);
    closeQuickInquiry();
    setQuickInquirySubmitting(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your itinerary...</p>
      </div>
    );
  }

  if (error || !tourData) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Itinerary</h2>
          <p>{error || 'Tour not found'}</p>
          <button onClick={() => navigate('/round-tours')} className="btn-glass-round">
            Back to Round Tours
          </button>
        </div>
      </div>
    );
  }

  const totalDays = tourData.total_days || tourData.days || 7;

  return (
    <div className="itinerary-page">
      {/* QUICK INQUIRY MODAL - Same as Contact Form */}
      {showQuickInquiry && (
        <div className="inquiry-modal-overlay" onClick={closeQuickInquiry}>
          <div className="inquiry-modal-container quick-inquiry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inquiry-modal-header">
              <h2><i className="fas fa-paper-plane"></i> Tour Inquiry</h2>
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

      {/* Main Navigation Bar - Top */}
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
            <Link to="/#drivers" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-users"></i> About Drivers
            </Link>
            <Link to="/#reviews" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-star"></i> Reviews
            </Link>
            <Link to="/#contact" className="glass-nav-btn" onClick={() => setMobileMenuOpen(false)}>
              <i className="fas fa-envelope"></i> Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Orange Info Bar - Below Main Navigation */}
      <div className="info-bar">
        <div className="info-bar-content">
          <span><i className="fas fa-phone-alt"></i> +94 72 402 4002</span>
          <span><i className="fas fa-clock"></i> 24/7 Support</span>
        </div>
      </div>

      <div className="page-action-row">
        <button className="page-back-btn" onClick={() => navigate('/round-tours')}>
          <i className="fas fa-arrow-left"></i> Back to Round Tours
        </button>
      </div>

      {/* Floating Social Media Icons */}
      <div className="floating-social2">
        <a
          href="https://wa.me/94724024002"
          target="_blank"
          rel="noopener noreferrer"
          className="float-glass-btn whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
            alt="WhatsApp"
            style={{ width: "98px", height: "98px" }}
          />
        </a>
      </div>

      <div className="floating-social1">
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=tourguidesrilanka234@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="float-glass-btn email"
          aria-label="Send Email"
        >
          <img
            src="https://cdn3d.iconscout.com/3d/free/thumb/free-gmail-3d-icon-png-download-7250524.png"
            style={{ width: "98px", height: "98px" }}
            alt="Email"
          />
        </a>
      </div>

      <main className="itinerary-content">
        {/* Header Section */}
        <div className="itinerary-header">
          <h1>{tourData.title}</h1>
          <div className="tour-meta">
            <span><i className="fas fa-clock"></i> {tourData.duration}</span>
            {tourData.price !== '' && tourData.price != null && (
              <span><i className="fas fa-tag"></i> {tourData.price}</span>
            )}
            <span><i className="fas fa-map-marker-alt"></i> Sri Lanka</span>
          </div>
          <p className="description">{tourData.description}</p>
          <button className="inquiry-button" onClick={openQuickInquiry}>
            <i className="fab fa-whatsapp"></i> Inquire About This Tour
          </button>
        </div>

        {/* Day Navigation */}
        <div className="itinerary-days">
          <div className="day-navigation">
            {[...Array(totalDays)].map((_, index) => {
              const dayNumber = index + 1;
              return (
                <button
                  key={dayNumber}
                  className={`day-nav-btn ${activeDay === dayNumber ? 'active' : ''}`}
                  onClick={() => setActiveDay(dayNumber)}
                >
                  Day {dayNumber}
                </button>
              );
            })}
          </div>

          {/* Active Day Content */}
          <div className="day-detail">
            <div className="day-image">
              <img 
                src={getDayActivities(activeDay).image} 
                alt={`Day ${activeDay} - ${getDayActivities(activeDay).title}`}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg';
                }}
              />
            </div>
            <div className="day-content">
              <h3>Day {activeDay}: {getDayActivities(activeDay).title}</h3>
              <ul className="activities-list">
                {getDayActivities(activeDay).activities.map((activity, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
              <div className="day-actions">
                <button className="day-inquiry" onClick={() => openDayInquiry(activeDay)}>
                  <i className="fab fa-whatsapp"></i> Inquire About Day {activeDay}
                </button>
                <button className="share-day" onClick={() => {
                  const message = `Check out Day ${activeDay} of the ${tourData.title} tour: ${getDayActivities(activeDay).title}`;
                  navigator.clipboard.writeText(message);
                  alert('Day details copied to clipboard!');
                }}>
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="tour-summary">
          <h3>Tour Highlights</h3>
          <div className="highlights-grid">
            <div className="highlight-item">
              <i className="fas fa-hotel"></i>
              <span>Premium Accommodations</span>
            </div>
            <div className="highlight-item">
              <i className="fas fa-car"></i>
              <span>Private Vehicle & Driver</span>
            </div>
            <div className="highlight-item">
              <i className="fas fa-utensils"></i>
              <span>Authentic Local Cuisine</span>
            </div>
            <div className="highlight-item">
              <i className="fas fa-camera"></i>
              <span>Photo Opportunities</span>
            </div>
            <div className="highlight-item">
              <i className="fas fa-hiking"></i>
              <span>Guided Excursions</span>
            </div>
            <div className="highlight-item">
              <i className="fas fa-water"></i>
              <span>Scenic Landscapes</span>
            </div>
          </div>
        </div>

        {/* Package Includes */}
        <div className="includes-section">
          <h3><i className="fas fa-gift"></i> Package Includes</h3>
          <div className="includes-grid">
            <div><i className="fas fa-check-circle"></i> Private air-conditioned vehicle</div>
            <div><i className="fas fa-check-circle"></i> English-speaking driver/guide</div>
            <div><i className="fas fa-check-circle"></i> Accommodation with breakfast</div>
            <div><i className="fas fa-check-circle"></i> Airport pickup and drop-off</div>
            <div><i className="fas fa-check-circle"></i> Fuel and parking charges</div>
            <div><i className="fas fa-check-circle"></i> 24/7 customer support</div>
            <div><i className="fas fa-check-circle"></i> Local SIM card with data</div>
            <div><i className="fas fa-check-circle"></i> Bottled water during tours</div>
          </div>
        </div>

        {/* Flexible Booking */}
        <div className="flexible-booking">
          <div className="flexible-content">
            <i className="fas fa-calendar-alt"></i>
            <div>
              <h4>Flexible Booking</h4>
              <p>Customize your itinerary, add or remove days, and tailor the tour to your preferences</p>
            </div>
            <button className="customize-btn" onClick={openQuickInquiry}>
              Customize This Tour <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2026 Tour Guide SriLanka — Premium Driver & Tour Experts</p>
        <div className="footer-social">
          <a href="https://wa.me/94724024002" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="https://www.instagram.com/toursguidesrilanka" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com/share/1DnjLAS8ds/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default TourItinerary;