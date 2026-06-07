import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoundTours from './pages/RoundTours';
import Gallery from './pages/Gallery';
import TourItinerary from './pages/TourItinerary';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './services/supabaseService';

// Protected Route component
function ProtectedAdminRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for hardcoded admin token in localStorage
        const adminToken = localStorage.getItem('adminToken');
        const adminUsername = localStorage.getItem('adminUsername');
        
        if (adminToken && adminUsername) {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Verify if user is admin
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (adminData) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin-login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/round-tours" element={<RoundTours />} />
        <Route path="/round-tour/:id" element={<TourItinerary />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route 
          path="/tours22$admin/*" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;