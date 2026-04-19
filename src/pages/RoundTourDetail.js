import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import '../styles/RoundTourDetail.css';

function RoundTourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTourDetails();
  }, [id]);

  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/round-tours/${id}`);
      setTour(response.data.tour);
      setItinerary(response.data.itinerary || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching tour details:', error);
      setError('Failed to load tour details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInquiry = () => {
    const message = `Hi! I'm interested in the ${tour.days}-day tour package: ${tour.title}. Can you provide more details and availability?`;
    window.open(`https://wa.me/94725335460?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tour details...</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="error-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>Error Loading Tour</h2>
          <p>{error || 'Tour not found'}</p>
          <button onClick={() => navigate('/round-tours')} className="btn-glass-round">
            Back to Tours
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tour-detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${tour.image_url})` }}>
        <div className="hero-overlay">
          <Link to="/round-tours" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Tours
          </Link>
          <h1>{tour.title}</h1>
          <p>{tour.description}</p>
          <div className="tour-meta">
            <span className="meta-item">
              <i className="fas fa-calendar-alt"></i> {tour.duration}
            </span>
            {tour.price !== '' && tour.price != null && (
              <span className="meta-item">
                <i className="fas fa-tag"></i> {tour.price} per person
              </span>
            )}
          </div>
          <button onClick={handleInquiry} className="inquiry-btn">
            <i className="fab fa-whatsapp"></i> Inquire Now
          </button>
        </div>
      </div>

      <div className="itinerary-section">
        <h2>Tour Itinerary</h2>
        <div className="itinerary-timeline">
          {itinerary.map((day, index) => (
            <div key={day.id || index} className="itinerary-day">
              <div className="day-number">Day {day.day_number}</div>
              <div className="day-content">
                <h3>{day.title}</h3>
                {day.image_url && <img src={day.image_url} alt={day.title} />}
                <div className="activities">
                  {day.activities && (typeof day.activities === 'string' ? JSON.parse(day.activities) : day.activities).map((activity, i) => (
                    <div key={i} className="activity-item">
                      <i className="fas fa-check-circle"></i>
                      <span>{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-section">
        <h3>Ready to Explore Sri Lanka?</h3>
        <p>Book your {tour.days}-day adventure today!</p>
        <button onClick={handleInquiry} className="cta-btn">
          <i className="fab fa-whatsapp"></i> Book Now on WhatsApp
        </button>
      </div>
    </div>
  );
}

export default RoundTourDetail;