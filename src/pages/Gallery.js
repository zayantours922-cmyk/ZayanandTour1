// src/components/Gallery.js - Perfect UI for Public Gallery (FIXED)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { luxelankaService } from '../services/supabaseService';
import '../styles/Gallery.css';

function Gallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [imageLoadError, setImageLoadError] = useState({});

    // Define filteredImages BEFORE using it in useEffect
    const filteredImages = useMemo(() => {
        if (selectedCategory === 'all') return images;
        return images.filter(img => img.category === selectedCategory);
    }, [images, selectedCategory]);

    useEffect(() => {
        fetchImages();
        fetchCategories();
    }, []);

    // Keyboard navigation for lightbox - now filteredImages is defined
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            if (e.key === 'ArrowLeft') navigatePrev();
            if (e.key === 'ArrowRight') navigateNext();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage, selectedIndex, filteredImages]); // filteredImages is now defined

    const fetchImages = async () => {
        setLoading(true);
        try {
            const data = await luxelankaService.getGalleryImages();
            const activeImages = (data || []).filter(img => img.is_active !== false);
            setImages(activeImages);
        } catch (err) {
            console.error(err);
            setError('Unable to load gallery. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await luxelankaService.getGalleryCategories();
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const openLightbox = (img, index) => {
        setSelectedImage(img);
        setSelectedIndex(index);
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        setSelectedImage(null);
        document.body.style.overflow = '';
    };

    const navigatePrev = useCallback(() => {
        if (filteredImages.length === 0) return;
        const newIndex = (selectedIndex - 1 + filteredImages.length) % filteredImages.length;
        setSelectedIndex(newIndex);
        setSelectedImage(filteredImages[newIndex]);
    }, [filteredImages, selectedIndex]);

    const navigateNext = useCallback(() => {
        if (filteredImages.length === 0) return;
        const newIndex = (selectedIndex + 1) % filteredImages.length;
        setSelectedIndex(newIndex);
        setSelectedImage(filteredImages[newIndex]);
    }, [filteredImages, selectedIndex]);

    const handleImageError = (id) => {
        setImageLoadError(prev => ({ ...prev, [id]: true }));
    };

    const getFallbackImage = () => {
        return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"%3E%3Cpath d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 8h-4v4h-4v-4H6V9h4V5h4v4h4v2z"/%3E%3C/svg%3E';
    };

    if (loading) {
        return (
            <div className="gallery-container">
                <div className="gallery-loading">
                    <div className="loading-spinner">
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                        <div className="spinner-ring"></div>
                    </div>
                    <p>Loading beautiful memories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gallery-container">
                <div className="gallery-error">
                    <div>
                        <i className="fas fa-exclamation-triangle"></i>
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchImages}>
                            <i className="fas fa-redo-alt"></i> Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            {/* Hero Section */}
            <div className="gallery-hero">
                <div className="gallery-hero-content">
                    <h1 className="gallery-title">Our Photo Gallery</h1>
                    <p className="gallery-subtitle">Explore our collection of beautiful moments and memories</p>
                </div>
                <div className="gallery-hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64L1440 120L1380 120C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120L0 120Z" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Category Filters */}
            {categories.length > 0 && (
                <div className="gallery-filters-wrapper">
                    <div className="gallery-filters">
                        <button 
                            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
                        >
                            <i className="fas fa-th-large"></i>
                            <span>All Photos</span>
                        </button>
                        {categories.map(category => (
                            <button 
                                key={category}
                                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                <i className="fas fa-tag"></i>
                                <span>{category}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Bar */}
            {filteredImages.length > 0 && (
                <div className="gallery-stats">
                    <div className="stats-content">
                        <i className="fas fa-images"></i>
                        <span>{filteredImages.length} {filteredImages.length === 1 ? 'Photo' : 'Photos'}</span>
                        {selectedCategory !== 'all' && (
                            <span className="stats-category">
                                <i className="fas fa-filter"></i> {selectedCategory}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Gallery Grid */}
            {filteredImages.length === 0 ? (
                <div className="gallery-empty">
                    <div className="empty-content">
                        <div className="empty-icon">
                            <i className="fas fa-camera-retro"></i>
                        </div>
                        <h3>No Photos Yet</h3>
                        <p>Be the first to capture beautiful moments!</p>
                        {selectedCategory !== 'all' && (
                            <button className="empty-reset-btn" onClick={() => setSelectedCategory('all')}>
                                <i className="fas fa-undo"></i> View All Photos
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className="gallery-grid">
                        {filteredImages.map((img, index) => (
                            <div 
                                key={img.id} 
                                className="gallery-item"
                                onClick={() => openLightbox(img, index)}
                                style={{ animationDelay: `${(index % 10) * 0.05}s` }}
                            >
                                <div className="gallery-item-inner">
                                    {!imageLoadError[img.id] ? (
                                        <img 
                                            src={img.image_url} 
                                            alt={img.title || 'Gallery image'} 
                                            loading="lazy"
                                            onError={() => handleImageError(img.id)}
                                        />
                                    ) : (
                                        <div className="image-fallback">
                                            <i className="fas fa-image"></i>
                                            <span>Image unavailable</span>
                                        </div>
                                    )}
                                    <div className="gallery-overlay">
                                        <div className="overlay-content">
                                            {img.title && <h3>{img.title}</h3>}
                                            {img.description && <p>{img.description.substring(0, 60)}</p>}
                                            <span className="view-btn">
                                                <i className="fas fa-search-plus"></i> View
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {img.title && (
                                    <div className="gallery-item-caption">
                                        <i className="fas fa-camera"></i> {img.title}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Lightbox Modal */}
            {selectedImage && (
                <div className="lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                        <i className="fas fa-times"></i>
                    </button>
                    <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); navigatePrev(); }}>
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); navigateNext(); }}>
                        <i className="fas fa-chevron-right"></i>
                    </button>
                    
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <div className="lightbox-image-wrapper">
                            <img 
                                src={selectedImage.image_url} 
                                alt={selectedImage.title || 'Gallery image'} 
                            />
                        </div>
                        <div className="lightbox-info">
                            {selectedImage.title && <h3>{selectedImage.title}</h3>}
                            {selectedImage.description && <p>{selectedImage.description}</p>}
                            <div className="lightbox-meta">
                                <span className="lightbox-counter">
                                    <i className="fas fa-images"></i> {selectedIndex + 1} of {filteredImages.length}
                                </span>
                                {selectedImage.category && (
                                    <span className="lightbox-category">
                                        <i className="fas fa-tag"></i> {selectedImage.category}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Gallery;