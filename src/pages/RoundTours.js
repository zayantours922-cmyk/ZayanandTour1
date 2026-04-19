// RoundTours.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import '../styles/RoundTours.css';

function RoundTours() {
  const navigate = useNavigate();
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [tourDurations, setTourDurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleQuickInquiry = (tour, e) => {
    e.stopPropagation();
    const message = `Hi! I'm interested in the ${tour.days}-day tour package (${tour.title}). Can you provide more details and availability?`;
    window.open(`https://wa.me/94774120009?text=${encodeURIComponent(message)}`, '_blank');
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

      {/* Orange Info Bar */}
      <div className="info-bar">
        <div className="info-bar-content">
          <span><i className="fas fa-phone-alt"></i> +94 72 402 4002</span>
          <span><i className="fas fa-clock"></i> 24/7 Support</span>
        </div>
      </div>

      <div className="page-action-row">
        <button className="page-back-btn" onClick={() => window.history.back()} >
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
          <br></br>
          <p>Choose from 5 to 14 days of unforgettable experiences</p>
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
                      <button className="quick-inquiry-btn" onClick={(e) => handleQuickInquiry(tour, e)}>
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

      {/* Footer */}
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

export default RoundTours;