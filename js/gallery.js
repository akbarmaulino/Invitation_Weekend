// js/gallery.js - Photo Gallery Logic

import { supabase } from './supabaseClient.js';

let currentUser = { id: 'anon' };
let allPhotos = [];
let filteredPhotos = [];
let lightbox = null;

// ============================================================
// DATA FETCHING
// ============================================================

async function fetchAllPhotos() {
    try {
        // Fetch all reviews dengan photos
        const { data: reviews, error: reviewError } = await supabase
            .from('idea_reviews')
            .select('*')
            .eq('user_id', currentUser.id)
            .not('photo_url', 'is', null);
        
        if (reviewError) throw reviewError;
        
        // Fetch trip data untuk setiap review
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
        
        // Process photos
        const photos = [];
        reviews.forEach(review => {
            let photoUrls = review.photo_url;
            
            // Convert string ke array jika perlu
            if (typeof photoUrls === 'string' && photoUrls.length > 0) {
                photoUrls = [photoUrls];
            } else if (!Array.isArray(photoUrls)) {
                photoUrls = [];
            }
            
            // Process setiap foto
            photoUrls.forEach(url => {
                const publicUrl = getPublicImageUrl(url);
                if (publicUrl && publicUrl !== 'images/placeholder.jpg') {
                    const trip = tripMap[review.trip_id];
                    photos.push({
                        url: publicUrl,
                        ideaId: review.idea_id,
                        tripId: review.trip_id,
                        tripDate: trip ? trip.trip_date : null,
                        tripDay: trip ? trip.trip_day : null,
                        rating: review.rating || 0,
                        reviewText: review.review_text || '',
                        createdAt: review.created_at
                    });
                }
            });
        });
        
        // Fetch idea names
        const ideaIds = [...new Set(photos.map(p => p.ideaId).filter(Boolean))];
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
                
                // Add place names to photos
                photos.forEach(photo => {
                    photo.placeName = ideaMap[photo.ideaId] || 'Unknown Place';
                });
            }
        }
        
        // Get category info from trip_history selection_json
        photos.forEach(photo => {
            const trip = tripMap[photo.tripId];
            if (trip && trip.selection_json) {
                // Cari di selection_json berdasarkan idea_id (stored as string di selection_json)
                // Perlu load full trip data dengan selection_json
            }
        });
        
        // Fetch full trip data untuk get category
        if (tripIds.length > 0) {
            const { data: fullTrips, error: fullTripError } = await supabase
                .from('trip_history')
                .select('*')
                .in('id', tripIds);
            
            if (!fullTripError && fullTrips) {
                photos.forEach(photo => {
                    const trip = fullTrips.find(t => t.id === photo.tripId);
                    if (trip && trip.selection_json) {
                        const item = trip.selection_json.find(i => i.idea_id == photo.ideaId);
                        if (item) {
                            photo.category = item.category || 'Uncategorized';
                            photo.subtype = item.subtype || '';
                        }
                    }
                });
            }
        }
        
        allPhotos = photos;
        return photos;
    } catch (error) {
        console.error('Error fetching photos:', error);
        return [];
    }
}

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
        filtered = filtered.filter(p => p.tripId == tripFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    // Filter by rating
    if (ratingFilter !== 'all') {
        const minRating = parseInt(ratingFilter);
        filtered = filtered.filter(p => p.rating >= minRating);
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

function renderPhotoGrid(photos) {
    const grid = document.getElementById('photoGrid');
    const noPhotos = document.getElementById('noPhotosMessage');
    
    if (!photos || photos.length === 0) {
        grid.innerHTML = '';
        noPhotos.style.display = 'flex';
        return;
    }
    
    noPhotos.style.display = 'none';
    
    grid.innerHTML = photos.map((photo, index) => {
        const stars = '⭐'.repeat(photo.rating || 0);
        const tripDateFormatted = photo.tripDate 
            ? new Date(photo.tripDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';
        
        return `
            <a href="${photo.url}" 
               class="photo-item glightbox" 
               data-gallery="gallery"
               data-title="${photo.placeName}"
               data-description="${photo.reviewText || ''}"
               data-glightbox="description: .photo-desc-${index}">
                <img src="${photo.url}" alt="${photo.placeName}" loading="lazy">
                <div class="photo-overlay">
                    <div class="photo-info">
                        <h4>${photo.placeName}</h4>
                        <p class="photo-rating">${stars}</p>
                    </div>
                </div>
                <div class="photo-desc-${index}" style="display: none;">
                    <div class="lightbox-description">
                        <h3>${photo.placeName}</h3>
                        <p class="lightbox-meta">
                            ${stars} ${photo.rating}/5 • ${tripDateFormatted}
                        </p>
                        ${photo.category ? `<p class="lightbox-category">📍 ${photo.category} - ${photo.subtype}</p>` : ''}
                        ${photo.reviewText ? `<p class="lightbox-review">"${photo.reviewText}"</p>` : ''}
                    </div>
                </div>
            </a>
        `;
    }).join('');
    
    // Re-init lightbox
    initLightbox();
}

function renderStats(photos) {
    const photoCount = document.getElementById('photoCount');
    const tripCount = document.getElementById('tripCount');
    const placeCount = document.getElementById('placeCount');
    
    const uniqueTrips = new Set(photos.map(p => p.tripId).filter(Boolean));
    const uniquePlaces = new Set(photos.map(p => p.ideaId).filter(Boolean));
    
    photoCount.innerHTML = `<strong>${photos.length}</strong> foto`;
    tripCount.innerHTML = `<strong>${uniqueTrips.size}</strong> trip`;
    placeCount.innerHTML = `<strong>${uniquePlaces.size}</strong> tempat`;
}

function populateFilters(photos) {
    // Populate trip filter
    const tripFilter = document.getElementById('tripFilter');
    const uniqueTrips = {};
    photos.forEach(p => {
        if (p.tripId && p.tripDate) {
            uniqueTrips[p.tripId] = {
                date: p.tripDate,
                day: p.tripDay
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
    const uniqueCategories = [...new Set(photos.map(p => p.category).filter(Boolean))];
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
    
    // Fetch photos
    const photos = await fetchAllPhotos();
    
    if (photos.length === 0) {
        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';
        document.getElementById('noPhotosMessage').style.display = 'flex';
        return;
    }
    
    // Populate filters
    populateFilters(photos);
    
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