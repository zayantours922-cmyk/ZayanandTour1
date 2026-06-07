// src/components/AdminGallery.js - Optimized for Mobile Speed
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { luxelankaService } from '../services/supabaseService';
import '../styles/AdminGallery.css';

function AdminGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isUploadingComplete, setIsUploadingComplete] = useState(false);
    
    const desktopFileInputRef = useRef(null);
    const uploadAbortControllerRef = useRef(null);
    const uploadTimeoutRef = useRef(null);

    useEffect(() => {
        fetchImages();
        return () => {
            if (uploadAbortControllerRef.current) {
                uploadAbortControllerRef.current.abort();
            }
            if (uploadTimeoutRef.current) {
                clearTimeout(uploadTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Auto-hide loading state after upload completes
    useEffect(() => {
        if (isUploadingComplete) {
            const timer = setTimeout(() => {
                setIsUploadingComplete(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isUploadingComplete]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const data = await luxelankaService.getGalleryImages();
            if (Array.isArray(data)) {
                setImages(data);
            } else {
                setImages([]);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
            showNotification('Failed to load gallery images', 'error');
            setImages([]);
        } finally {
            // Small delay to ensure smooth transition
            setTimeout(() => {
                setLoading(false);
            }, 300);
        }
    };

    // Optimized: Compress image before upload for mobile
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    // Calculate new dimensions (max 1200px for mobile speed)
                    let width = img.width;
                    let height = img.height;
                    const maxWidth = 1200;
                    const maxHeight = 1200;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    
                    // Create canvas for compression
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Compress with 0.7 quality for faster uploads
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.7);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    // Super fast upload with compression and queue management
    const uploadImages = async (files) => {
        if (!files.length) return;
        
        // Abort any ongoing upload
        if (uploadAbortControllerRef.current) {
            uploadAbortControllerRef.current.abort();
        }
        
        const abortController = new AbortController();
        uploadAbortControllerRef.current = abortController;
        
        setUploading(true);
        setUploadProgress(0);
        setIsUploadingComplete(false);
        
        try {
            const totalFiles = files.length;
            let completed = 0;
            let failed = 0;
            
            // Process uploads in smaller batches for mobile (3 at a time)
            const batchSize = 3;
            const batches = [];
            for (let i = 0; i < files.length; i += batchSize) {
                batches.push(files.slice(i, i + batchSize));
            }
            
            for (const batch of batches) {
                // Check for abort
                if (abortController.signal.aborted) break;
                
                // Process batch in parallel
                const batchPromises = batch.map(async (file) => {
                    try {
                        // Compress image for faster upload
                        const compressedBlob = await compressImage(file);
                        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
                        const base64Image = await convertToBase64(compressedFile);
                        
                        if (abortController.signal.aborted) {
                            throw new Error('Upload cancelled');
                        }
                        
                        await luxelankaService.addMultipleGalleryImages([base64Image]);
                        
                        completed++;
                        const progress = Math.round((completed / totalFiles) * 100);
                        setUploadProgress(progress);
                        return { success: true, file: file.name };
                    } catch (error) {
                        failed++;
                        completed++;
                        const progress = Math.round((completed / totalFiles) * 100);
                        setUploadProgress(progress);
                        if (error.name !== 'AbortError') {
                            console.error(`Failed to upload ${file.name}:`, error);
                        }
                        return { success: false, file: file.name, error };
                    }
                });
                
                await Promise.allSettled(batchPromises);
            }
            
            const successCount = totalFiles - failed;
            
            if (successCount > 0) {
                const message = successCount === totalFiles 
                    ? `Success! ${totalFiles} photo${totalFiles > 1 ? 's' : ''} uploaded` 
                    : `${successCount} of ${totalFiles} photo${totalFiles > 1 ? 's' : ''} uploaded successfully`;
                showNotification(message, successCount === totalFiles ? 'success' : 'warning');
                
                // Refresh gallery immediately
                await fetchImages();
            }
            
            if (failed === totalFiles && totalFiles > 0) {
                showNotification('Upload failed. Please try again.', 'error');
            }
            
            // Mark upload as complete to hide loading
            setIsUploadingComplete(true);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                showNotification('Upload cancelled', 'info');
            } else {
                console.error('Error uploading images:', error);
                showNotification('Upload failed. Please try again.', 'error');
            }
        } finally {
            // Clear timeout if exists
            if (uploadTimeoutRef.current) {
                clearTimeout(uploadTimeoutRef.current);
            }
            
            // Hide upload progress after a short delay
            uploadTimeoutRef.current = setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                uploadAbortControllerRef.current = null;
            }, 500);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            
            const timeout = setTimeout(() => {
                reader.abort();
                reject(new Error('File reading timeout'));
            }, 8000);
            
            reader.onloadend = () => clearTimeout(timeout);
        });
    };

    const validateFiles = (files) => {
        const validFiles = [];
        const errors = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name} is not an image file`);
            } else if (file.size > 10 * 1024 * 1024) { // Increased to 10MB
                errors.push(`${file.name} exceeds 10MB limit`);
            } else {
                validFiles.push(file);
            }
        }

        return { validFiles, errors };
    };

    const handleFileSelect = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const { validFiles, errors } = validateFiles(files);
        
        if (errors.length > 0) {
            showNotification(errors[0], 'error');
            if (validFiles.length === 0) return;
        }

        await uploadImages(validFiles);
        
        // Reset file input
        if (desktopFileInputRef.current) {
            desktopFileInputRef.current.value = '';
        }
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;
        
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            showNotification('Please drop only image files', 'error');
            return;
        }
        
        const { validFiles, errors } = validateFiles(imageFiles);
        
        if (errors.length > 0) {
            showNotification(errors[0], 'error');
        }
        
        if (validFiles.length > 0) {
            await uploadImages(validFiles);
        }
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this photo? This action cannot be undone.')) {
            try {
                await luxelankaService.deleteGalleryImage(id);
                showNotification('Photo deleted successfully', 'success');
                setSelectedImages(prev => prev.filter(selectedId => selectedId !== id));
                fetchImages();
            } catch (error) {
                showNotification('Failed to delete photo', 'error');
            }
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedImages.length === 0) {
            showNotification('Select photos to delete', 'warning');
            return;
        }
        
        if (window.confirm(`Delete ${selectedImages.length} selected photo${selectedImages.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
            try {
                await luxelankaService.deleteMultipleGalleryImages(selectedImages);
                showNotification(`${selectedImages.length} photo${selectedImages.length > 1 ? 's' : ''} deleted`, 'success');
                setSelectedImages([]);
                fetchImages();
            } catch (error) {
                showNotification('Failed to delete photos', 'error');
            }
        }
    };

    const toggleSelect = (id) => {
        setSelectedImages(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedImages.length === filteredImages.length && filteredImages.length > 0) {
            setSelectedImages([]);
        } else {
            setSelectedImages(filteredImages.map(img => img.id));
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const clearSelection = () => {
        setSelectedImages([]);
        setMobileMenuOpen(false);
    };

    const cancelUpload = () => {
        if (uploadAbortControllerRef.current) {
            uploadAbortControllerRef.current.abort();
            showNotification('Upload cancelled', 'info');
        }
    };

    // Mobile file selection trigger
    const triggerMobileFileSelect = () => {
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = 'image/jpeg,image/png,image/gif,image/webp';
        tempInput.multiple = true;
        tempInput.style.display = 'none';
        
        tempInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                const { validFiles, errors } = validateFiles(files);
                if (errors.length > 0) {
                    showNotification(errors[0], 'error');
                }
                if (validFiles.length > 0) {
                    await uploadImages(validFiles);
                }
            }
            document.body.removeChild(tempInput);
        });
        
        document.body.appendChild(tempInput);
        tempInput.click();
    };

    const filteredImages = images.filter(img => 
        img.id.toString().includes(searchTerm.toLowerCase()) ||
        (img.created_at && new Date(img.created_at).toLocaleDateString().includes(searchTerm))
    );

    const ImageCard = ({ image }) => (
        <div className={`gallery-card-modern ${selectedImages.includes(image.id) ? 'selected' : ''}`}>
            <div className="card-image-wrapper">
                <img 
                    src={image.image_url} 
                    alt={`Gallery ${image.id}`}
                    loading="lazy"
                    onClick={() => toggleSelect(image.id)}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 8h-4v4h-4v-4H6V9h4V5h4v4h4v2z"/></svg>';
                    }}
                />
                <div className="image-overlay">
                    <div className="overlay-actions">
                        <button 
                            className="action-btn delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(image.id);
                            }}
                            title="Delete"
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                        <button 
                            className={`action-btn select-btn ${selectedImages.includes(image.id) ? 'selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(image.id);
                            }}
                            title={selectedImages.includes(image.id) ? "Deselect" : "Select"}
                        >
                            <i className={`fas ${selectedImages.includes(image.id) ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </button>
                    </div>
                    <div className="image-info">
                        <div className="image-date">
                            <i className="far fa-calendar-alt"></i>
                            {new Date(image.created_at).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {viewMode === 'list' && (
                <div className="card-footer">
                    <span className="card-filename">Photo ID: {image.id}</span>
                    <div className="card-actions">
                        <button 
                            className="card-action-btn delete-card"
                            onClick={() => handleDelete(image.id)}
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-gallery-modern">
            {/* Notification */}
            {notification && (
                <div className={`notification notification-${notification.type} show`}>
                    <div className="notification-content">
                        <i className={`fas ${
                            notification.type === 'success' ? 'fa-check-circle' : 
                            notification.type === 'error' ? 'fa-exclamation-circle' : 
                            notification.type === 'warning' ? 'fa-exclamation-triangle' :
                            'fa-info-circle'
                        }`}></i>
                        <span>{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="gallery-header-modern">
                <div className="header-content">
                    <div className="title-section">
                        <div className="icon-wrapper">
                            <i className="fas fa-images"></i>
                        </div>
                        <div>
                            <h1>Photo Gallery</h1>
                            <p>Manage your travel memories</p>
                        </div>
                    </div>
                    <div className="stats-badge">
                        <i className="fas fa-camera"></i>
                        <span>{images.length} {images.length === 1 ? 'Photo' : 'Photos'}</span>
                    </div>
                </div>
            </div>

            {/* Upload Area - Only show when not uploading or just completed */}
            {!uploading && (
                <div 
                    className={`upload-area-modern ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="upload-content-modern">
                        <div className="upload-icon-animation">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <div className="upload-ripple"></div>
                        </div>
                        <h3>Drop photos here</h3>
                        <p>or</p>
                        <label className="upload-btn-modern">
                            <i className="fas fa-plus-circle"></i>
                            Choose Photos
                            <input 
                                ref={desktopFileInputRef}
                                type="file" 
                                accept="image/jpeg,image/png,image/gif,image/webp" 
                                multiple
                                onChange={handleFileSelect} 
                                style={{ display: 'none' }} 
                            />
                        </label>
                        <div className="upload-requirements">
                            <span><i className="fas fa-image"></i> JPG, PNG, GIF, WebP</span>
                            <span><i className="fas fa-weight-hanging"></i> Up to 10MB</span>
                            <span><i className="fas fa-layer-group"></i> Multiple photos</span>
                            <span><i className="fas fa-compress"></i> Auto-compressed</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Progress Modal - Shows during upload */}
            {uploading && (
                <div className="upload-progress-modern">
                    <div className="progress-container">
                        <div className="progress-circle">
                            <svg viewBox="0 0 36 36">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                </defs>
                                <path className="progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path 
                                    className="progress-fill" 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    style={{ strokeDashoffset: 100 - uploadProgress }}
                                />
                            </svg>
                            <div className="progress-percentage">
                                {uploadProgress}%
                            </div>
                        </div>
                        <p>Uploading... {uploadProgress}% complete</p>
                        <button className="cancel-upload-btn" onClick={cancelUpload}>
                            <i className="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar - Desktop */}
            {images.length > 0 && !uploading && (
                <>
                    {/* Desktop Toolbar */}
                    <div className="gallery-toolbar desktop-toolbar">
                        <div className="toolbar-left">
                            <div className="view-toggle">
                                <button 
                                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <i className="fas fa-th"></i>
                                    <span className="view-label">Grid</span>
                                </button>
                                <button 
                                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <i className="fas fa-list"></i>
                                    <span className="view-label">List</span>
                                </button>
                            </div>
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search photos..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="search-clear" onClick={() => setSearchTerm('')}>
                                        <i className="fas fa-times-circle"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="toolbar-right">
                            {selectedImages.length > 0 && (
                                <div className="selection-info">
                                    <button className="selection-clear" onClick={clearSelection} title="Clear selection">
                                        <i className="fas fa-times"></i>
                                    </button>
                                    <span>{selectedImages.length} selected</span>
                                    <button className="delete-selected-btn" onClick={handleDeleteMultiple}>
                                        <i className="fas fa-trash-alt"></i>
                                        Delete
                                    </button>
                                </div>
                            )}
                            <button className="add-photo-btn" onClick={() => desktopFileInputRef.current?.click()}>
                                <i className="fas fa-plus"></i>
                                <span>Add Photos</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Toolbar */}
                    <div className="gallery-toolbar mobile-toolbar">
                        <div className="mobile-toolbar-top">
                            <div className="search-box-mobile">
                                <i className="fas fa-search"></i>
                                <input 
                                    type="text" 
                                    placeholder="Search photos..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                className="menu-toggle-btn"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-ellipsis-v'}`}></i>
                            </button>
                        </div>
                        
                        {mobileMenuOpen && (
                            <div className="mobile-menu">
                                <div className="view-toggle-mobile">
                                    <button 
                                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => {
                                            setViewMode('grid');
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <i className="fas fa-th"></i> Grid
                                    </button>
                                    <button 
                                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => {
                                            setViewMode('list');
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <i className="fas fa-list"></i> List
                                    </button>
                                </div>
                                {selectedImages.length > 0 && (
                                    <div className="mobile-selection-actions">
                                        <span>{selectedImages.length} selected</span>
                                        <button onClick={clearSelection}>Clear</button>
                                        <button className="delete-selected" onClick={handleDeleteMultiple}>
                                            Delete All
                                        </button>
                                    </div>
                                )}
                                <button 
                                    className="mobile-add-btn"
                                    onClick={triggerMobileFileSelect}
                                >
                                    <i className="fas fa-plus"></i> Add Photos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Selection Bar for Mobile when items selected */}
                    {selectedImages.length > 0 && !mobileMenuOpen && (
                        <div className="mobile-selection-bar">
                            <span>{selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} selected</span>
                            <button onClick={clearSelection}>Cancel</button>
                            <button className="delete-btn-mobile" onClick={handleDeleteMultiple}>
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <div className="loading-spinner-modern">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading your gallery...</p>
                </div>
            )}

            {/* Gallery Display */}
            {!loading && !uploading && (
                <>
                    {filteredImages.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <div className="empty-icon">
                                    <i className="fas fa-camera-retro"></i>
                                </div>
                                <h3>No Photos Yet</h3>
                                <p>{searchTerm ? "No matching photos found" : "Start by uploading your beautiful memories!"}</p>
                                {!searchTerm && (
                                    <button className="upload-empty-btn" onClick={() => desktopFileInputRef.current?.click()}>
                                        <i className="fas fa-upload"></i>
                                        Upload Your First Photo
                                    </button>
                                )}
                                {searchTerm && (
                                    <button className="upload-empty-btn" onClick={() => setSearchTerm('')}>
                                        <i className="fas fa-undo"></i>
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Select All Bar */}
                            {filteredImages.length > 1 && (
                                <div className="select-all-bar">
                                    <label className="select-all-checkbox">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                        <span>Select All ({filteredImages.length})</span>
                                    </label>
                                </div>
                            )}
                            
                            {/* Gallery Grid/List */}
                            <div className={`gallery-grid-modern ${viewMode}`}>
                                {filteredImages.map(image => (
                                    <ImageCard key={image.id} image={image} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Footer Stats */}
            {images.length > 0 && !loading && !uploading && filteredImages.length > 0 && (
                <div className="gallery-footer">
                    <div className="footer-stats">
                        <div className="stat-item">
                            <i className="fas fa-images"></i>
                            <span>{filteredImages.length} of {images.length}</span>
                        </div>
                        {selectedImages.length > 0 && (
                            <div className="stat-item">
                                <i className="fas fa-check-circle"></i>
                                <span>{selectedImages.length} selected</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminGallery;