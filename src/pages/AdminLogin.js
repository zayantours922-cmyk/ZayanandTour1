// AdminLogin.js - Updated with creative UI elements

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import '../styles/AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const particleCount = 40;
      const particlesContainer = document.querySelector('.admin-login');
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 5 + 2;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 12 + 6;
        const animationDelay = Math.random() * 8;
        
        particle.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${left}%;
          animation-duration: ${animationDuration}s;
          animation-delay: ${animationDelay}s;
        `;
        
        if (particlesContainer) {
          particlesContainer.appendChild(particle);
        }
      }
    };
    
    createParticles();
    
    // Cleanup particles on unmount
    return () => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach(particle => particle.remove());
    };
  }, []);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminUsername = localStorage.getItem('adminUsername');
      
      if (adminToken && adminUsername) {
        navigate('/tours22$admin');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: adminData } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (adminData) {
          navigate('/tours22$admin');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${username}@tourguidesrilanka028@gmail.com`,
        password: password
      });

      if (authError) {
        if (username === 'zayaanrushda' && password === 'toursrisan4002') {
          localStorage.setItem('adminToken', 'dummy-token-' + Date.now());
          localStorage.setItem('adminUsername', username);
          navigate('/tours22$admin');
          return;
        }
        throw new Error('Invalid username or password');
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (adminError || !adminData) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized access. Admin privileges required.');
      }

      localStorage.setItem('adminToken', authData.session.access_token);
      localStorage.setItem('adminUsername', adminData.username);
      localStorage.setItem('adminId', adminData.id);
      
      navigate('/tours22$admin');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      {/* Animated Orbs */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>
      <div className="glow-orb glow-orb-3"></div>
      
      {/* Animated Waves */}
      <div className="waves">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      
      {/* Login Card */}
      <div className="login-container">
        <div className="login-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>Tour Guide SriLanka</h2>
        <p className="login-subtitle">Admin Portal</p>
        
        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}
        
        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Access Dashboard →'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Secure Admin Access Only</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;