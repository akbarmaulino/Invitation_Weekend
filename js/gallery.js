// js/gallery.js - Photo Gallery Logic

import { supabase } from './supabaseClient.js';

let currentUser = { id: 'anon' };
let allPhotos = [];
let filteredPhotos = [];
let lightbox = null;

// ============================================================
// UTILITY: Get Public Image URL
// ============================================================
function getPublicImageUrl(photoUrl) {
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl === '') {
        return null;
    }
    if (photoUrl.startsWith('http')) {
        return photoUrl;
    }
    try {
        const { data } = supabase.storage
            .from('trip-ideas-images')
            .getPublicUrl(photoUrl);
        return data.publicUrl || null;
    } catch (e) {
        console.error("Error getting public URL:", e);
        return null;
    }
}

// ============================================================
// DATA FETCHING
// ============================================================
async function fetchAllPhotos() {
    try {
        console.log('🔍 Fetching media (photos + videos)...');
        
        // Fetch reviews dengan photos ATAU videos
        const { data: reviews, error: reviewError } = await supabase
            .from('idea_reviews')
            .select('*')
            .eq('user_id', currentUser.id)
            .or('photo_url.not.is.null,video_url.not.is.null');
        
        if (reviewError) throw reviewError;
        
        console.log('✅ Reviews fetched:', reviews?.length || 0);
        
        // Fetch trip data
        const tripIds = [...new Set(reviews.map(r => r.trip_id).filter(Boolean))];
        const { data: trips, error: tripError } = await supabase
            .from('trip_history')
            .select('id, trip_date, trip_day')
            .in('id', tripIds);
        
        if (tripError) throw tripError;
        
        // Create trip lookup
        const tripMap = {};
        (trips || []).forEach(trip => {
            tripMap[trip.id] = trip;
        });
        
        // Process media (photos + videos)
        const media = [];
        
        reviews.forEach(review => {
            const trip = tripMap[review.trip_id];
            
            // ========== PROCESS PHOTOS ==========
            let photoUrls = review.photo_url;
            
            if (typeof photoUrls === 'string' && photoUrls.length > 0) {
                photoUrls = [photoUrls];
            } else if (!Array.isArray(photoUrls)) {
                photoUrls = [];
            }
            
            photoUrls.forEach(url => {
                const publicUrl = getPublicImageUrl(url);
                if (publicUrl && publicUrl !== 'images/placeholder.jpg') {
                    media.push({
                        url: publicUrl,
                        type: 'photo',
                        ideaId: review.idea_id,
                        tripId: review.trip_id,
                        tripDate: trip ? trip.trip_date : null,
                        tripDay: trip ? trip.trip_day : null,
                        rating: review.rating || 0,
                        reviewText: review.review_text || '',
                        createdAt: review.created_at,
                        placeName: null
                    });
                }
            });
            
            // ========== PROCESS VIDEOS ==========
            if (review.video_url) {
                let videoUrls = review.video_url;
                
                if (typeof videoUrls === 'string' && videoUrls.length > 0) {
                    videoUrls = [videoUrls];
                } else if (!Array.isArray(videoUrls)) {
                    videoUrls = [];
                }
                
                videoUrls.forEach(url => {
                    if (url && url !== '') {
                        media.push({
                            url: url,
                            type: 'video',
                            ideaId: review.idea_id,
                            tripId: review.trip_id,
                            tripDate: trip ? trip.trip_date : null,
                            tripDay: trip ? trip.trip_day : null,
                            rating: review.rating || 0,
                            reviewText: review.review_text || '',
                            createdAt: review.created_at,
                            placeName: null
                        });
                    }
                });
            }
        });
        
        console.log('📊 Media processed:', {
            photos: media.filter(m => m.type === 'photo').length,
            videos: media.filter(m => m.type === 'video').length,
            total: media.length
        });
        
        // Fetch idea names
        const ideaIds = [...new Set(media.map(m => m.ideaId).filter(Boolean))];
        if (ideaIds.length > 0) {
            const { data: ideas, error: ideaError } = await supabase
                .from('trip_ideas_v2')
                .select('id, idea_name, type_key')
                .in('id', ideaIds);
            
            if (!ideaError && ideas) {
                const ideaMap = {};
                ideas.forEach(idea => {
                    ideaMap[idea.id] = idea.idea_name;
                });
                
                media.forEach(item => {
                    item.placeName = ideaMap[item.ideaId] || 'Unknown Place';
                });
            }
        }
        
        // Get category info
        const tripIdsWithMedia = [...new Set(media.map(m => m.tripId).filter(Boolean))];
        if (tripIdsWithMedia.length > 0) {
            const { data: fullTrips, error: fullTripError } = await supabase
                .from('trip_history')
                .select('*')
                .in('id', tripIdsWithMedia);
            
            if (!fullTripError && fullTrips) {
                media.forEach(item => {
                    const trip = fullTrips.find(t => t.id === item.tripId);
                    if (trip && trip.selection_json) {
                        const selectionItem = trip.selection_json.find(i => i.idea_id == item.ideaId);
                        if (selectionItem) {
                            item.category = selectionItem.category || 'Uncategorized';
                            item.subtype = selectionItem.subtype || '';
                        }
                    }
                });
            }
        }
        
        allPhotos = media;
        return media;
        
    } catch (error) {
        console.error('❌ Error fetching media:', error);
        return [];
    }
}

// ============================================================
// FILTERING & SORTING
// ============================================================
function applyFilters() {
    const tripFilter = document.getElementById('tripFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = [...allPhotos];
    
    // Filter by trip
    if (tripFilter !== 'all') {
        filtered = filtered.filter(m => m.tripId == tripFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(m => m.category === categoryFilter);
    }
    
    // Filter by rating
    if (ratingFilter !== 'all') {
        const minRating = parseInt(ratingFilter);
        filtered = filtered.filter(m => m.rating >= minRating);
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch(sortFilter) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'rating-desc':
                return b.rating - a.rating;
            case 'rating-asc':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });
    
    filteredPhotos = filtered;
    return filtered;
}

// ============================================================
// RENDERING
// ============================================================
function renderPhotoGrid(media) {
    const grid = document.getElementById('photoGrid');
    const noPhotos = document.getElementById('noPhotosMessage');
    
    if (!media || media.length === 0) {
        grid.innerHTML = '';
        noPhotos.style.display = 'flex';
        return;
    }
    
    noPhotos.style.display = 'none';
    
    grid.innerHTML = media.map((item, index) => {
        const stars = '⭐'.repeat(item.rating || 0);
        const tripDateFormatted = item.tripDate 
            ? new Date(item.tripDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';
        
        if (item.type === 'video') {
            // Render video item
            return `
                <div class="photo-item video-item" data-type="video">
                    <video 
                        src="${item.url}" 
                        controls 
                        preload="metadata"
                        class="gallery-video"
                        onplay="this.parentElement.classList.add('playing')"
                        onpause="this.parentElement.classList.remove('playing')"
                        onended="this.parentElement.classList.remove('playing')"
                    ></video>
                    <div class="photo-overlay">
                        <div class="photo-info">
                            <h4>${item.placeName || 'Video'}</h4>
                            <p class="photo-rating">${stars}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Render photo item
            return `
                <a href="${item.url}" 
                   class="photo-item glightbox" 
                   data-gallery="gallery"
                   data-title="${item.placeName}"
                   data-description="${item.reviewText || ''}"
                   data-glightbox="description: .photo-desc-${index}">
                    <img src="${item.url}" alt="${item.placeName}" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-info">
                            <h4>${item.placeName}</h4>
                            <p class="photo-rating">${stars}</p>
                        </div>
                    </div>
                    <div class="photo-desc-${index}" style="display: none;">
                        <div class="lightbox-description">
                            <h3>${item.placeName}</h3>
                            <p class="lightbox-meta">
                                ${stars} ${item.rating}/5 • ${tripDateFormatted}
                            </p>
                            ${item.category ? `<p class="lightbox-category">📍 ${item.category} - ${item.subtype}</p>` : ''}
                            ${item.reviewText ? `<p class="lightbox-review">"${item.reviewText}"</p>` : ''}
                        </div>
                    </div>
                </a>
            `;
        }
    }).join('');
    
    // Re-init lightbox
    initLightbox();
}

function renderStats(media) {
    const photoCount = document.getElementById('photoCount');
    const tripCount = document.getElementById('tripCount');
    const placeCount = document.getElementById('placeCount');
    
    const uniqueTrips = new Set(media.map(m => m.tripId).filter(Boolean));
    const uniquePlaces = new Set(media.map(m => m.ideaId).filter(Boolean));
    
    const photoTotal = media.filter(m => m.type === 'photo').length;
    const videoTotal = media.filter(m => m.type === 'video').length;
    
    photoCount.innerHTML = `<strong>${photoTotal}</strong> foto • <strong>${videoTotal}</strong> video`;
    tripCount.innerHTML = `<strong>${uniqueTrips.size}</strong> trip`;
    placeCount.innerHTML = `<strong>${uniquePlaces.size}</strong> tempat`;
}

function populateFilters(media) {
    // Populate trip filter
    const tripFilter = document.getElementById('tripFilter');
    const uniqueTrips = {};
    media.forEach(m => {
        if (m.tripId && m.tripDate) {
            uniqueTrips[m.tripId] = {
                date: m.tripDate,
                day: m.tripDay
            };
        }
    });
    
    Object.entries(uniqueTrips)
        .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))
        .forEach(([tripId, trip]) => {
            const dateFormatted = new Date(trip.date).toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            });
            const option = document.createElement('option');
            option.value = tripId;
            option.textContent = `Trip ${dateFormatted}`;
            tripFilter.appendChild(option);
        });
    
    // Populate category filter
    const categoryFilter = document.getElementById('categoryFilter');
    const uniqueCategories = [...new Set(media.map(m => m.category).filter(Boolean))];
    uniqueCategories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// ============================================================
// LIGHTBOX
// ============================================================
function initLightbox() {
    if (lightbox) {
        lightbox.destroy();
    }
    
    lightbox = GLightbox({
        selector: '.glightbox',
        touchNavigation: true,
        loop: true,
        autoplayVideos: false,
        zoomable: true,
        draggable: true,
        closeButton: true,
        closeOnOutsideClick: true
    });
}

// ============================================================
// MAIN FUNCTION
// ============================================================
async function loadGallery() {
    const loadingEl = document.getElementById('loadingGallery');
    const contentEl = document.getElementById('galleryContent');
    
    // Show loading
    loadingEl.style.display = 'flex';
    contentEl.style.display = 'none';
    
    // Fetch media
    const media = await fetchAllPhotos();
    
    if (media.length === 0) {
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        document.getElementById('noPhotosMessage').style.display = 'flex';
        return;
    }
    
    // Populate filters
    populateFilters(media);
    
    // Apply filters & render
    const filtered = applyFilters();
    renderPhotoGrid(filtered);
    renderStats(filtered);
    
    // Show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load gallery
    loadGallery();
    
    // Filter listeners
    ['tripFilter', 'categoryFilter', 'ratingFilter', 'sortFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                const filtered = applyFilters();
                renderPhotoGrid(filtered);
                renderStats(filtered);
            });
        }
    });
    
    // Reset button
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('tripFilter').value = 'all';
            document.getElementById('categoryFilter').value = 'all';
            document.getElementById('ratingFilter').value = 'all';
            document.getElementById('sortFilter').value = 'date-desc';
            
            const filtered = applyFilters();
            renderPhotoGrid(filtered);
            renderStats(filtered);
        });
    }
});