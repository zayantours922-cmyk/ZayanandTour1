import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import '../styles/Admin.css';

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    let videoId = null;
    
    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        videoId = urlParams.get('v');
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/shorts/')) {
        videoId = url.split('shorts/')[1]?.split('?')[0];
    }
    
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    return url;
};

// Admin Packages Component
function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', image_url: '', category: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      alert('Error fetching packages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase
          .from('packages')
          .update(formData)
          .eq('id', editing);
        
        if (error) throw error;
        alert('Package updated successfully!');
      } else {
        const { error } = await supabase
          .from('packages')
          .insert([formData]);
        
        if (error) throw error;
        alert('Package added successfully!');
      }
      resetForm();
      fetchPackages();
    } catch (error) {
      alert('Error saving package: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        const { error } = await supabase
          .from('packages')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchPackages();
        alert('Package deleted successfully!');
      } catch (error) {
        alert('Error deleting package: ' + error.message);
      }
    }
  };

  const handleEdit = (pkg) => {
    setEditing(pkg.id);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      price: pkg.price,
      image_url: pkg.image_url,
      category: pkg.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: '', description: '', price: '', image_url: '', category: '' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-umbrella-beach"></i> Manage Packages</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Package
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Package' : 'Add New Package'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading packages...</div>
      ) : (
        <div className="admin-list">
          {packages.map(pkg => (
            <div key={pkg.id} className="admin-item">
              <img src={pkg.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} alt={pkg.title} className="item-image" />
              <div className="item-info">
                <h3>{pkg.title}</h3>
                <p>{pkg.description}</p>
                <span className="price">
                  {pkg.price !== '' && pkg.price != null ? `$${pkg.price}` : 'Contact for price'}
                </span>
                <small>Category: {pkg.category}</small>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleEdit(pkg)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(pkg.id)}><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Vehicles Component
function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', description: '', price_per_day: '', image_url: '', category: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Error fetching vehicles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const { error } = await supabase
          .from('vehicles')
          .update(formData)
          .eq('id', editing);
        
        if (error) throw error;
        alert('Vehicle updated successfully!');
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert([formData]);
        
        if (error) throw error;
        alert('Vehicle added successfully!');
      }
      resetForm();
      fetchVehicles();
    } catch (error) {
      alert('Error saving vehicle: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchVehicles();
        alert('Vehicle deleted successfully!');
      } catch (error) {
        alert('Error deleting vehicle: ' + error.message);
      }
    }
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle.id);
    setFormData({
      name: vehicle.name,
      description: vehicle.description,
      price_per_day: vehicle.price_per_day,
      image_url: vehicle.image_url,
      category: vehicle.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', description: '', price_per_day: '', image_url: '', category: '' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-car"></i> Manage Vehicles</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per Day ($)</label>
                  <input type="number" step="0.01" value={formData.price_per_day} onChange={(e) => setFormData({...formData, price_per_day: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading vehicles...</div>
      ) : (
        <div className="admin-list">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="admin-item">
              <img src={vehicle.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} alt={vehicle.name} className="item-image" />
              <div className="item-info">
                <h3>{vehicle.name}</h3>
                <p>{vehicle.description}</p>
                <span className="price">
                  {vehicle.price_per_day !== '' && vehicle.price_per_day != null ? `$${vehicle.price_per_day}/day` : 'Contact for price'}
                </span>
                <small>Category: {vehicle.category}</small>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleEdit(vehicle)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(vehicle.id)}><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Drivers Component
// Admin Drivers Component - With Base64 Image Storage (No Storage Bucket Needed)
function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bio: '', experience_years: '', specialty: '', image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      alert('Error fetching drivers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large! Please select an image under 2MB.');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }
      
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData({...formData, image_url: ''});
    }
  };

  // Convert file to Base64 (no storage bucket needed!)
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let imageUrl = formData.image_url;
    
    if (selectedFile) {
      try {
        setUploading(true);
        imageUrl = await convertToBase64(selectedFile);
      } catch (error) {
        alert('Error processing image: ' + error.message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }
    
    const driverData = {
      name: formData.name,
      bio: formData.bio,
      experience_years: parseInt(formData.experience_years),
      specialty: formData.specialty,
      image_url: imageUrl || null,
      updated_at: new Date().toISOString()
    };
    
    try {
      if (editing) {
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editing);
        
        if (error) throw error;
        alert('Driver updated successfully!');
      } else {
        driverData.created_at = new Date().toISOString();
        const { error } = await supabase
          .from('drivers')
          .insert([driverData]);
        
        if (error) throw error;
        alert('Driver added successfully!');
      }
      resetForm();
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Error saving driver: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        const { error } = await supabase
          .from('drivers')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchDrivers();
        alert('Driver deleted successfully!');
      } catch (error) {
        alert('Error deleting driver: ' + error.message);
      }
    }
  };

  const handleEdit = (driver) => {
    setEditing(driver.id);
    setFormData({
      name: driver.name,
      bio: driver.bio || '',
      experience_years: driver.experience_years || '',
      specialty: driver.specialty || '',
      image_url: driver.image_url || ''
    });
    setImagePreview(driver.image_url);
    setSelectedFile(null);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ name: '', bio: '', experience_years: '', specialty: '', image_url: '' });
    setSelectedFile(null);
    setImagePreview(null);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-users"></i> Manage Drivers</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Driver
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <div className="form-header">
              <h3>{editing ? 'Edit Driver' : 'Add New Driver'}</h3>
              <button className="close-modal" onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Bio *</label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                  required 
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years) *</label>
                  <input 
                    type="number" 
                    value={formData.experience_years} 
                    onChange={(e) => setFormData({...formData, experience_years: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Specialty *</label>
                  <input 
                    type="text" 
                    value={formData.specialty} 
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              
              {/* Image Upload Section */}
              <div className="form-group">
                <label>Driver Photo</label>
                <div className="image-upload-area">
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview-img" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview(null);
                          setSelectedFile(null);
                          setFormData({...formData, image_url: ''});
                        }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  )}
                  
                  <div className="upload-options">
                    <label className="upload-btn">
                      <i className="fas fa-cloud-upload-alt"></i> Choose from Device
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    
                    <span className="upload-divider">OR</span>
                    
                    <div className="url-input-container">
                      <input 
                        type="url" 
                        placeholder="Enter image URL from web"
                        value={formData.image_url}
                        onChange={(e) => {
                          setFormData({...formData, image_url: e.target.value});
                          setImagePreview(e.target.value);
                          setSelectedFile(null);
                        }} 
                        className="url-input"
                      />
                    </div>
                  </div>
                  
                  {uploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '50%' }}></div>
                      </div>
                      <span>Processing image...</span>
                    </div>
                  )}
                  
                  <small className="form-hint">
                    <i className="fas fa-info-circle"></i> 
                    Supported formats: JPG, PNG, GIF, WebP. Max size: 2MB. Images are stored directly in database.
                  </small>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Processing...' : (editing ? 'Update Driver' : 'Save Driver')}
                </button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading drivers...</div>
      ) : (
        <div className="admin-list">
          {drivers.map(driver => (
            <div key={driver.id} className="admin-item">
              <div className="driver-avatar">
                <img 
                  src={driver.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} 
                  alt={driver.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                  }}
                />
              </div>
              <div className="item-info">
                <h3>{driver.name}</h3>
                <p className="driver-bio">{driver.bio}</p>
                <div className="driver-meta">
                  <span className="badge"><i className="fas fa-calendar-alt"></i> {driver.experience_years} years</span>
                  <span className="badge"><i className="fas fa-tag"></i> {driver.specialty}</span>
                </div>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleEdit(driver)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(driver.id)}><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// Admin Videos Component - FIXED with YouTube embed handling
function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', youtube_url: '', category: ''
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process videos to add embed URL for preview
      const processedVideos = (data || []).map(video => ({
        ...video,
        embed_url: getYouTubeEmbedUrl(video.youtube_url)
      }));
      
      setVideos(processedVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      alert('Error fetching videos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate YouTube URL
    const embedUrl = getYouTubeEmbedUrl(formData.youtube_url);
    if (!embedUrl && formData.youtube_url) {
      alert('Please enter a valid YouTube URL');
      return;
    }
    
    try {
      const videoData = {
        title: formData.title,
        youtube_url: formData.youtube_url,
        category: formData.category,
        embed_code: embedUrl
      };
      
      if (editing) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editing);
        
        if (error) throw error;
        alert('Video updated successfully!');
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([videoData]);
        
        if (error) throw error;
        alert('Video added successfully!');
      }
      resetForm();
      fetchVideos();
    } catch (error) {
      alert('Error saving video: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        const { error } = await supabase
          .from('videos')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchVideos();
        alert('Video deleted successfully!');
      } catch (error) {
        alert('Error deleting video: ' + error.message);
      }
    }
  };

  const handleEdit = (video) => {
    setEditing(video.id);
    setFormData({
      title: video.title,
      youtube_url: video.youtube_url,
      category: video.category
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setFormData({ title: '', youtube_url: '', category: '' });
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2><i className="fas fa-video"></i> Manage Videos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <i className="fas fa-plus"></i> Add Video
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container">
            <h3>{editing ? 'Edit Video' : 'Add New Video'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>YouTube URL *</label>
                <input type="url" value={formData.youtube_url} onChange={(e) => setFormData({...formData, youtube_url: e.target.value})} required placeholder="https://www.youtube.com/watch?v=..." />
                <small className="form-hint">Paste any YouTube URL (watch, youtu.be, embed, shorts)</small>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                  <option value="">Select Category</option>
                  <option value="home">Home Page</option>
                  <option value="tour">Tour Videos</option>
                  <option value="vehicle">Vehicle Videos</option>
                  <option value="driver">Driver Stories</option>
                </select>
              </div>
              
              {/* Preview of how the video will look */}
              {formData.youtube_url && (
                <div className="video-preview-section">
                  <label>Preview:</label>
                  <div className="video-preview">
                    <iframe
                      src={getYouTubeEmbedUrl(formData.youtube_url)}
                      title="Video Preview"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading videos...</div>
      ) : (
        <div className="admin-list">
          {videos.map(video => (
            <div key={video.id} className="admin-item">
              <div className="video-thumbnail">
                <iframe
                  src={video.embed_url || getYouTubeEmbedUrl(video.youtube_url)}
                  title={video.title}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="item-info">
                <h3>{video.title}</h3>
                <p><i className="fas fa-tag"></i> Category: {video.category}</p>
                <p><i className="fab fa-youtube"></i> YouTube URL: <a href={video.youtube_url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleEdit(video)}><i className="fas fa-edit"></i> Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(video.id)}><i className="fas fa-trash"></i> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Reviews Component
function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Error fetching reviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchReviews();
        alert('Review deleted successfully!');
      } catch (error) {
        alert('Error deleting review: ' + error.message);
      }
    }
  };

  const handleApprove = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchReviews();
      alert(`Review ${!currentStatus ? 'approved' : 'unapproved'} successfully!`);
    } catch (error) {
      alert('Error updating review: ' + error.message);
    }
  };

  return (
    <div className="admin-section">
      <h2><i className="fas fa-star"></i> Manage Reviews</h2>
      {loading ? (
        <div className="loading-spinner">Loading reviews...</div>
      ) : (
        <div className="admin-list">
          {reviews.map(review => (
            <div key={review.id} className="admin-item">
              <div className="item-info">
                <h3>{review.name}</h3>
                <div className="rating">{'⭐'.repeat(review.rating)}</div>
                <p>{review.text}</p>
                <div className="review-status">
                  Status: {review.is_approved ? '✅ Approved' : '⏳ Pending Approval'}
                </div>
                <small><i className="fas fa-calendar-alt"></i> {new Date(review.created_at).toLocaleDateString()}</small>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleApprove(review.id, review.is_approved)}>
                  <i className="fas fa-check-circle"></i> {review.is_approved ? 'Unapprove' : 'Approve'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(review.id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Messages Component
function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contactmessages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Error fetching messages: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const { error } = await supabase
          .from('contactmessages')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchMessages();
        alert('Message deleted successfully!');
      } catch (error) {
        alert('Error deleting message: ' + error.message);
      }
    }
  };

  const handleMarkRead = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('contactmessages')
        .update({ is_read: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchMessages();
      alert(`Message marked as ${!currentStatus ? 'read' : 'unread'}!`);
    } catch (error) {
      alert('Error updating message: ' + error.message);
    }
  };

  return (
    <div className="admin-section">
      <h2><i className="fas fa-envelope"></i> Contact Messages</h2>
      {loading ? (
        <div className="loading-spinner">Loading messages...</div>
      ) : (
        <div className="admin-list">
          {messages.map(message => (
            <div key={message.id} className={`admin-item ${!message.is_read ? 'unread-message' : ''}`}>
              <div className="item-info">
                <h3>{message.name} {!message.is_read && <span className="new-badge">NEW</span>}</h3>
                <p><i className="fas fa-envelope"></i> {message.email}</p>
                <p><i className="fas fa-comment"></i> {message.message}</p>
                <small><i className="fas fa-clock"></i> {new Date(message.created_at).toLocaleString()}</small>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleMarkRead(message.id, message.is_read)}>
                  <i className="fas fa-check-double"></i> {message.is_read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button className="btn-delete" onClick={() => handleDelete(message.id)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Round Tours Component
function AdminRoundTours() {
  const [roundTours, setRoundTours] = useState([]);
  const [editingTour, setEditingTour] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    days: '', title: '', duration: '', price: '', description: '', image_url: '', total_days: ''
  });
  const [itineraryDays, setItineraryDays] = useState([]);

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
      setRoundTours(data || []);
    } catch (error) {
      console.error('Error fetching round tours:', error);
      alert('Error fetching tours: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItineraryChange = (index, field, value) => {
    const updatedDays = [...itineraryDays];
    updatedDays[index] = { ...updatedDays[index], [field]: value };
    setItineraryDays(updatedDays);
  };

  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, { day_number: itineraryDays.length + 1, title: '', image_url: '', activities: [] }]);
  };

  const removeItineraryDay = (index) => {
    const updatedDays = itineraryDays.filter((_, i) => i !== index);
    updatedDays.forEach((day, idx) => { day.day_number = idx + 1; });
    setItineraryDays(updatedDays);
  };

  const addActivity = (dayIndex) => {
    const updatedDays = [...itineraryDays];
    if (!updatedDays[dayIndex].activities) updatedDays[dayIndex].activities = [];
    updatedDays[dayIndex].activities.push('');
    setItineraryDays(updatedDays);
  };

  const updateActivity = (dayIndex, activityIndex, value) => {
    const updatedDays = [...itineraryDays];
    updatedDays[dayIndex].activities[activityIndex] = value;
    setItineraryDays(updatedDays);
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const updatedDays = [...itineraryDays];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setItineraryDays(updatedDays);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { 
        ...formData, 
        days: parseInt(formData.days), 
        total_days: parseInt(formData.total_days),
        itinerary: JSON.stringify(itineraryDays)
      };
      
      if (editingTour) {
        const { error } = await supabase
          .from('roundtours')
          .update(dataToSend)
          .eq('id', editingTour.id);
        
        if (error) throw error;
        alert('Round tour updated successfully!');
      } else {
        const { error } = await supabase
          .from('roundtours')
          .insert([dataToSend]);
        
        if (error) throw error;
        alert('Round tour created successfully!');
      }
      resetForm();
      fetchRoundTours();
    } catch (error) {
      alert('Error saving round tour: ' + error.message);
    }
  };

  const handleEdit = async (tour) => {
    setEditingTour(tour);
    setFormData({
      days: tour.days,
      title: tour.title,
      duration: tour.duration,
      price: tour.price,
      description: tour.description || '',
      image_url: tour.image_url || '',
      total_days: tour.total_days
    });
    
    if (tour.itinerary) {
      try {
        const itinerary = JSON.parse(tour.itinerary);
        setItineraryDays(itinerary);
      } catch (e) {
        setItineraryDays([]);
      }
    } else {
      setItineraryDays([]);
    }
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this round tour? This will also delete all itinerary days.')) {
      try {
        const { error } = await supabase
          .from('roundtours')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchRoundTours();
        alert('Round tour deleted successfully!');
      } catch (error) {
        alert('Error deleting tour: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingTour(null);
    setShowForm(false);
    setFormData({ days: '', title: '', duration: '', price: '', description: '', image_url: '', total_days: '' });
    setItineraryDays([]);
  };

  if (loading) return <div className="loading-spinner">Loading tours...</div>;

  return (
    <div className="admin-round-tours">
      <div className="section-header">
        <h2><i className="fas fa-map-marked-alt"></i> Manage Round Tours</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}><i className="fas fa-plus"></i> Add Round Tour</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="form-container form-container-large">
            <div className="form-header">
              <h3>{editingTour ? 'Edit Round Tour' : 'Create New Round Tour'}</h3>
              <button className="close-modal" onClick={resetForm}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Days *</label>
                  <input type="number" name="days" value={formData.days} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Total Days *</label>
                  <input type="number" name="total_days" value={formData.total_days} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Duration *</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleInputChange} required placeholder="e.g., 7 Days / 6 Nights" />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="text" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., $650" />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} required></textarea>
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input type="url" name="image_url" value={formData.image_url} onChange={handleInputChange} required />
              </div>
              
              <h4><i className="fas fa-calendar-alt"></i> Itinerary Days</h4>
              {itineraryDays.map((day, idx) => (
                <div key={idx} className="itinerary-day-card">
                  <div className="day-header">
                    <h5>Day {day.day_number}</h5>
                    <button type="button" className="btn-danger-small" onClick={() => removeItineraryDay(idx)}>
                      <i className="fas fa-trash"></i> Remove Day
                    </button>
                  </div>
                  <div className="form-group">
                    <label>Day Title</label>
                    <input type="text" value={day.title} onChange={(e) => handleItineraryChange(idx, 'title', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Day Image URL</label>
                    <input type="url" value={day.image_url} onChange={(e) => handleItineraryChange(idx, 'image_url', e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="form-group">
                    <label>Activities</label>
                    {day.activities && day.activities.map((activity, actIdx) => (
                      <div key={actIdx} className="activity-item">
                        <input type="text" value={activity} onChange={(e) => updateActivity(idx, actIdx, e.target.value)} placeholder="Activity description" />
                        <button type="button" className="btn-icon" onClick={() => removeActivity(idx, actIdx)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                    <button type="button" className="btn-secondary-small" onClick={() => addActivity(idx)}>
                      <i className="fas fa-plus"></i> Add Activity
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={addItineraryDay}>
                <i className="fas fa-plus"></i> Add Day
              </button>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Tour</button>
                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-list">
        {roundTours.map(tour => (
          <div key={tour.id} className="admin-item">
            <img src={tour.image_url || 'https://via.placeholder.com/80x80?text=No+Image'} alt={tour.title} className="item-image" />
            <div className="item-info">
              <h3>{tour.title}</h3>
              <p>
                {tour.duration} - {tour.price !== '' && tour.price != null ? tour.price : 'Contact for price'}
              </p>
              <small>{tour.description?.substring(0, 100)}...</small>
            </div>
            <div className="item-actions">
              <button className="btn-edit" onClick={() => handleEdit(tour)}><i className="fas fa-edit"></i> Edit</button>
              <button className="btn-delete" onClick={() => handleDelete(tour.id)}><i className="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Admin Dashboard
function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('packages');
  const [username, setUsername] = useState('');
  
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminName = localStorage.getItem('adminUsername');
    if (!token) {
      navigate('/admin-login');
    } else {
      setUsername(adminName || 'Admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-container">
          <div className="logo-area">
            <i className="fas fa-crown" style={{ color: '#ff7b2c', fontSize: '1.5rem' }}></i>
            <h2>Luxe Lanka Admin</h2>
            <span className="admin-badge">Welcome, {username}</span>
          </div>
          <div className="admin-nav-links">
            <button onClick={() => setActiveTab('packages')} className={activeTab === 'packages' ? 'active' : ''}>
              <i className="fas fa-umbrella-beach"></i> Packages
            </button>
            <button onClick={() => setActiveTab('vehicles')} className={activeTab === 'vehicles' ? 'active' : ''}>
              <i className="fas fa-car"></i> Vehicles
            </button>
            <button onClick={() => setActiveTab('drivers')} className={activeTab === 'drivers' ? 'active' : ''}>
              <i className="fas fa-users"></i> Drivers
            </button>
            <button onClick={() => setActiveTab('videos')} className={activeTab === 'videos' ? 'active' : ''}>
              <i className="fas fa-video"></i> Videos
            </button>
            <button onClick={() => setActiveTab('roundtours')} className={activeTab === 'roundtours' ? 'active' : ''}>
              <i className="fas fa-map-marked-alt"></i> Round Tours
            </button>
            <button onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? 'active' : ''}>
              <i className="fas fa-star"></i> Reviews
            </button>
            <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'active' : ''}>
              <i className="fas fa-envelope"></i> Messages
            </button>
            <button onClick={handleLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="admin-content">
        {activeTab === 'packages' && <AdminPackages />}
        {activeTab === 'vehicles' && <AdminVehicles />}
        {activeTab === 'drivers' && <AdminDrivers />}
        {activeTab === 'videos' && <AdminVideos />}
        {activeTab === 'roundtours' && <AdminRoundTours />}
        {activeTab === 'reviews' && <AdminReviews />}
        {activeTab === 'messages' && <AdminMessages />}
      </div>
    </div>
  );
}

export default AdminDashboard;