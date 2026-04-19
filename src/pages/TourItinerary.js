// TourItinerary.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
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

  const handleInquiry = () => {
    const message = `Hi! I'm interested in the ${tourData?.title} (${tourData?.duration}). Can you provide more details and availability for this tour?`;
    window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDayInquiry = (day) => {
    const dayInfo = getDayActivities(day);
    const message = `Hi! I'm interested in Day ${day} of the ${tourData?.title} (${tourData?.duration}). Can you provide more details about "${dayInfo.title}" and pricing?`;
    window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
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
         
        </div>
      </div>
    );
  }

  const totalDays = tourData.total_days || tourData.days || 7;

  return (
    <div className="itinerary-page">
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
        <button className="page-back-btn" onClick={() => window.history.back()}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>

      {/* Floating Social Media Icons */}
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
            alt="WhatsApp"
            style={{ width: "80px", height: "80px" }}
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
          <button className="inquiry-button" onClick={handleInquiry}>
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
                <button className="day-inquiry" onClick={() => handleDayInquiry(activeDay)}>
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
            <button className="customize-btn" onClick={handleInquiry}>
              Customize This Tour <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>© 2026 Tour Guide SriLanka— Premium Driver & Tour Experts</p>
        <div className="footer-social">
          <a href="https://wa.me/94774120009" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default TourItinerary;