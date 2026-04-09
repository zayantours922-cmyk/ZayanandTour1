import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/TourItinerary.css';

function TourItinerary() {
  const { days } = useParams();
  const navigate = useNavigate();
  const [tourData, setTourData] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch tour data based on duration
  useEffect(() => {
    const fetchTourData = async () => {
      setLoading(true);
      try {
        const data = await getTourData(days);
        setTourData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load itinerary. Please try again.');
        console.error('Error loading tour data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [days]);

  const getTourData = async (duration) => {
    const tourDataMap = {
      '7': {
        title: "7 Days - Cultural & Nature Explorer",
        duration: "7 Days / 6 Nights",
        price: "$650",
        description: "Perfect for first-time visitors. Experience the cultural triangle, hill country, and beautiful beaches.",
        totalDays: 7
      },
      '8': {
        title: "8 Days - Heritage & Wildlife Journey",
        duration: "8 Days / 7 Nights",
        price: "$750",
        description: "Extended tour with more wildlife safaris and cultural experiences.",
        totalDays: 8
      },
      '9': {
        title: "9 Days - Complete Island Experience",
        duration: "9 Days / 8 Nights",
        price: "$850",
        description: "Comprehensive tour covering all major attractions across the island.",
        totalDays: 9
      },
      '10': {
        title: "10 Days - Ultimate Sri Lanka Adventure",
        duration: "10 Days / 9 Nights",
        price: "$950",
        description: "In-depth exploration with more time at each destination.",
        totalDays: 10
      },
      '11': {
        title: "11 Days - Luxury & Culture Fusion",
        duration: "11 Days / 10 Nights",
        price: "$1200",
        description: "Premium accommodations with exclusive experiences.",
        totalDays: 11
      },
      '12': {
        title: "12 Days - Off the Beaten Path",
        duration: "12 Days / 11 Nights",
        price: "$1100",
        description: "Discover hidden gems and less touristy locations.",
        totalDays: 12
      },
      '13': {
        title: "13 Days - Deep Cultural Immersion",
        duration: "13 Days / 12 Nights",
        price: "$1250",
        description: "Extended cultural experience with local interactions.",
        totalDays: 13
      },
      '14': {
        title: "14 Days - Grand Sri Lanka Tour",
        duration: "14 Days / 13 Nights",
        price: "$1450",
        description: "Complete two-week journey covering every major region.",
        totalDays: 14
      }
    };

    return tourDataMap[duration] || tourDataMap['7'];
  };

  const getDayActivities = (dayNumber) => {
    // Base activities for first 7 days
    const baseActivities = {
      1: {
        title: "Arrival & Sigiriya - Ancient Rock Fortress",
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Arrival at Colombo International Airport",
          "Meet & greet by your personal driver",
          "Transfer to Sigiriya (approx 3.5 hours)",
          "Check-in at hotel",
          "Evening village tour with traditional Sri Lankan dinner",
          "Overnight stay in Sigiriya"
        ]
      },
      2: {
        title: "Sigiriya & Polonnaruwa - Ancient Cities",
        image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: [
          "Early morning Sigiriya Lion Rock climb",
          "Ancient rock fortress exploration",
          "Water gardens and ancient frescoes",
          "Visit Polonnaruwa ancient city",
          "Gal Vihara rock temple",
          "Evening leisure time at hotel"
        ]
      },
      3: {
        title: "Dambulla & Kandy - Cultural Capital",
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
        activities: [
          "Dambulla Cave Temple (UNESCO site)",
          "Spice Garden tour with aromatherapy",
          "Matale Hindu Temple",
          "Arrival in Kandy - last kingdom of Sri Lanka",
          "Temple of the Tooth Relic",
          "Kandyan Cultural Dance Show"
        ]
      },
      4: {
        title: "Kandy to Nuwara Eliya - Tea Country",
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Royal Botanical Gardens (Peradeniya)",
          "Tea factory and plantation visit",
          "Ramboda Waterfalls",
          "Arrival in Nuwara Eliya (Little England)",
          "Gregory Lake stroll",
          "Strawberry farm visit"
        ]
      },
      5: {
        title: "Nuwara Eliya to Ella - Scenic Train Ride",
        image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: [
          "Scenic train ride to Ella (most beautiful train journey)",
          "Nine Arch Bridge",
          "Little Adam's Peak hike",
          "Ravana Falls",
          "Ella Gap viewpoint",
          "Evening relaxation"
        ]
      },
      6: {
        title: "Yala Safari & Mirissa Beach",
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
        activities: [
          "Early morning Yala National Park safari",
          "Wildlife spotting - leopards, elephants, bears",
          "Transfer to Mirissa",
          "Beach relaxation",
          "Coconut Tree Hill sunset view",
          "Fresh seafood dinner"
        ]
      },
      7: {
        title: "Whale Watching & Galle Fort",
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Whale watching excursion (seasonal - Nov to April)",
          "Visit Galle Dutch Fort (UNESCO site)",
          "Lighthouse and ramparts walk",
          "Turtle Hatchery visit",
          "Departure preparation"
        ]
      }
    };

    // Extended activities for days beyond 7
    const extendedActivities = {
      8: {
        title: "Bentota Water Sports & Madu River",
        image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: [
          "Water sports at Bentota Beach",
          "Jet skiing and banana boat rides",
          "Madu River boat safari",
          "Mangrove forest exploration",
          "Fish therapy experience",
          "Beach relaxation"
        ]
      },
      9: {
        title: "Colombo City Tour",
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
        activities: [
          "Gangaramaya Temple",
          "Independence Square",
          "Galle Face Green",
          "Local market shopping",
          "Traditional Sri Lankan lunch",
          "Colombo Museum"
        ]
      },
      10: {
        title: "Anuradhapura Ancient City",
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Sri Maha Bodhi Tree (2600 years old)",
          "Ruwanwelisaya Stupa",
          "Abhayagiri Monastery",
          "Mihintale Rock Temple",
          "Ancient reservoirs and gardens"
        ]
      },
      11: {
        title: "Trincomalee & East Coast",
        image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: [
          "Koneswaram Temple",
          "Swami Rock viewpoint",
          "Pigeon Island snorkeling",
          "Nilaveli Beach",
          "Dolphin watching"
        ]
      },
      12: {
        title: "Jaffna - Tamil Culture",
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
        activities: [
          "Nallur Kandaswamy Temple",
          "Jaffna Fort",
          "Local market experience",
          "Cashew nut tasting",
          "Cultural performances"
        ]
      },
      13: {
        title: "Sinharaja Rainforest",
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Rainforest trekking",
          "Bird watching (endemic species)",
          "Waterfall visit",
          "Butterfly watching",
          "Medicinal plant tour"
        ]
      },
      14: {
        title: "Departure Day",
        image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
        activities: [
          "Last minute souvenir shopping",
          "Transfer to Colombo Airport",
          "Final memories of Sri Lanka",
          "Departure with wonderful experiences"
        ]
      }
    };

    if (dayNumber <= 7) {
      return baseActivities[dayNumber] || {
        title: `Day ${dayNumber} - Sri Lanka Exploration`,
        image: "https://images.pexels.com/photos/753626/pexels-photo-753626.jpeg",
        activities: [
          "Explore local attractions",
          "Cultural experiences",
          "Scenic viewpoints",
          "Local cuisine tasting",
          "Optional activities available"
        ]
      };
    } else if (dayNumber <= 14) {
      return extendedActivities[dayNumber] || {
        title: `Day ${dayNumber} - Extended Exploration`,
        image: "https://images.pexels.com/photos/1603650/sigiriya-lion-rock-sri-lanka-1603650.jpg",
        activities: [
          "Customized activities based on your preferences",
          "Local cultural experiences",
          "Hidden gems exploration",
          "Traditional cuisine tasting",
          "Contact your driver for personalized recommendations"
        ]
      };
    }
    
    return {
      title: `Day ${dayNumber} - Adventure Day`,
      image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
      activities: [
        "Morning exploration",
        "Afternoon activities",
        "Evening relaxation",
        "Cultural immersion"
      ]
    };
  };

  const handleInquiry = () => {
    const message = `Hi! I'm interested in the ${tourData?.title} (${tourData?.duration}). Can you provide more details and availability for this tour?`;
    window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDayInquiry = (day) => {
    const message = `Hi! I'm interested in Day ${day} of the ${tourData?.title} (${tourData?.duration}). Can you provide more details about this day's activities and pricing?`;
    window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your itinerary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Itinerary</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-glass-round">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return null;
  }

  const totalDays = tourData.totalDays;

  return (
    <div className="itinerary-page">
      {/* Main Navigation Bar - Top */}
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo">🌴 Luxe Lanka Tours</div>
          <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <i className="fas fa-bars"></i>
          </button>
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
          <span><i className="fas fa-phone-alt"></i> +94 72 533 5460</span>
          <span><i className="fas fa-envelope"></i> hello@luxelanka.com</span>
          <span><i className="fas fa-clock"></i> 24/7 Support</span>
        </div>
      </div>

      {/* Floating Social Media Icons */}
      <div className="floating-social">
        <a
          href="https://wa.me/94725335460"
          target="_blank"
          rel="noopener noreferrer"
          className="float-glass-btn whatsapp"
          aria-label="Chat on WhatsApp"
        >
          <img
            src="https://static.vecteezy.com/system/resources/previews/024/398/617/non_2x/whatsapp-logo-icon-isolated-on-transparent-background-free-png.png"
            alt="WhatsApp"
          />
        </a>
        <a
          href="https://instagram.com/luxelanka"
          target="_blank"
          rel="noopener noreferrer"
          className="float-glass-btn instagram"
          aria-label="Follow on Instagram"
        >
          <img
            src="https://static.vecteezy.com/system/resources/thumbnails/018/930/413/small/instagram-logo-instagram-icon-transparent-free-png.png"
            alt="Instagram"
          />
        </a>
      </div>

      <main className="itinerary-content">
        <button className="back-button" onClick={() => navigate('/round-tours')}>
          <i className="fas fa-arrow-left"></i> Back to Tours
        </button>

        {/* Header Section */}
        <div className="itinerary-header">
          <h1>{tourData.title}</h1>
          <div className="tour-meta">
            <span><i className="fas fa-clock"></i> {tourData.duration}</span>
            <span><i className="fas fa-tag"></i> {tourData.price}</span>
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
        <p>© 2025 Luxe Lanka — Premium Driver & Tour Experts</p>
        <div className="footer-social">
          <a href="https://wa.me/94725335460" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-whatsapp"></i>
          </a>
          <a href="https://instagram.com/luxelanka" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="mailto:hello@luxelanka.com">
            <i className="fas fa-envelope"></i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default TourItinerary;