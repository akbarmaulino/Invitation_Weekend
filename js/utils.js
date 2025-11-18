// js/utils.js
// ============================================================
// SHARED UTILITY FUNCTIONS
// Fungsi-fungsi yang dipakai di main.js dan history.js
// ============================================================

import { supabase } from './supabaseClient.js';

// ============================================================
// IMAGE HANDLING
// ============================================================

/**
 * Mengubah photo URL (path Supabase atau URL public) menjadi URL public yang valid
 * @param {string|Array} photoUrl - URL foto atau array URL
 * @returns {string} Public URL yang valid atau placeholder
 */
export function getPublicImageUrl(photoUrl) {
    let urlToProcess = photoUrl;
    
    // Handle array (ambil elemen pertama)
    if (Array.isArray(photoUrl)) {
        if (photoUrl.length === 0) {
            return 'images/placeholder.jpg';
        }
        urlToProcess = photoUrl[0];
    }

    // Handle null/undefined/empty
    if (!urlToProcess || typeof urlToProcess !== 'string' || urlToProcess === '') {
        return 'images/placeholder.jpg';
    }

    // Kalau sudah URL public (http/https), langsung return
    if (urlToProcess.startsWith('http')) {
        return urlToProcess;
    }
    
    // Konversi Supabase storage path ke public URL
    try {
        const { data } = supabase.storage
            .from('trip-ideas-images')
            .getPublicUrl(urlToProcess);
        return data.publicUrl || urlToProcess;
    } catch (e) {
        console.error("Error getting public URL:", e);
        return urlToProcess;
    }
}

/**
 * Render multiple photo URLs menjadi HTML img tags
 * @param {string|Array} photoUrls - URL foto atau array URL
 * @param {string} className - CSS class untuk img tag
 * @returns {string} HTML string dengan img tags
 */
export function renderPhotoUrls(photoUrls, className = 'review-photo') {
    let urls = photoUrls;
    
    // Konversi string tunggal menjadi array (backward compatibility)
    if (typeof urls === 'string' && urls.length > 0) {
        urls = [urls];
    } else if (!Array.isArray(urls)) {
        return '';
    }
    
    if (urls.length === 0) {
        return '';
    }

    let html = '<div class="review-photos-container">';
    urls.forEach(url => {
        const publicUrl = getPublicImageUrl(url);
        // Skip placeholder di array
        if (publicUrl !== 'images/placeholder.jpg') {
            html += `<img src="${publicUrl}" alt="Foto Review" class="${className}">`;
        }
    });
    html += '</div>';
    return html;
}

/**
 * Upload single image ke Supabase Storage
 * @param {File} file - File object dari input
 * @param {string} userId - User ID untuk folder path
 * @param {string} subfolder - Optional subfolder (default: '')
 * @returns {Promise<string|null>} Public URL atau null jika gagal
 */
export async function uploadImage(file, userId = 'anon', subfolder = '') {
    if (!file) return null;
    
    const folderPath = subfolder ? `${userId}/${subfolder}` : userId;
    const path = `${folderPath}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage
        .from('trip-ideas-images')
        .upload(path, file);

    if (error) {
        console.error('Supabase Storage upload error', error);
        return null;
    }
    
    const { data: publicUrlData } = supabase.storage
        .from('trip-ideas-images')
        .getPublicUrl(path);

    return publicUrlData.publicUrl;
}

/**
 * Upload multiple images ke Supabase Storage
 * @param {FileList|Array<File>} files - File objects dari input
 * @param {string} userId - User ID untuk folder path
 * @param {string} subfolder - Optional subfolder (default: 'review')
 * @returns {Promise<Array<string>>} Array of public URLs
 */
export async function uploadImages(files, userId = 'anon', subfolder = 'review') {
    if (!files || files.length === 0) return [];
    
    const uploadedUrls = [];
    
    for (const file of files) {
        const url = await uploadImage(file, userId, subfolder);
        if (url) {
            uploadedUrls.push(url);
        }
    }

    return uploadedUrls;
}

// ============================================================
// DATE & TIME FORMATTING
// ============================================================

/**
 * Format tanggal ke bahasa Indonesia
 * @param {string|Date} date - Tanggal
 * @returns {string} Tanggal dalam format Indonesia
 */
export function formatTanggalIndonesia(date) {
    return new Date(date).toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Format URL untuk display (remove www, shorten)
 * @param {string} url - URL lengkap
 * @returns {string} URL yang sudah diformat
 */
export function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return url;
    }
}

// ============================================================
// RATING HELPERS
// ============================================================

/**
 * Hitung rata-rata rating dari array reviews
 * @param {Array} reviews - Array of review objects
 * @returns {Object} { average: number, count: number }
 */
export function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
    }
    const sum = reviews.reduce((total, review) => total + (review.rating || 0), 0);
    const average = sum / reviews.length;
    return { 
        average: average.toFixed(1), 
        count: reviews.length 
    };
}

/**
 * Render star icons (★ atau ☆) berdasarkan rating
 * @param {number} rating - Rating number (0-5)
 * @param {boolean} isAverage - Apakah ini average rating (akan dibulatkan)
 * @returns {string} HTML string dengan star icons
 */
export function renderStars(rating, isAverage = true) {
    const roundedRating = isAverage ? Math.round(parseFloat(rating)) : rating;
    const filled = '★'.repeat(roundedRating);
    const empty = '☆'.repeat(5 - roundedRating);
    return `<span class="rating-stars">${filled}${empty}</span>`;
}

// ============================================================
// MODAL UTILITIES
// ============================================================

/**
 * Setup modal close handlers (backdrop click + close button)
 * @param {HTMLElement} modalElement - Modal element
 * @param {Function} onClose - Optional callback saat modal ditutup
 */
export function setupModalClose(modalElement, onClose = null) {
    if (!modalElement) return;

    // Close button handler
    const closeBtn = modalElement.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modalElement.classList.add('hidden');
            modalElement.style.display = 'none';
            if (onClose) onClose();
        });
    }

    // Backdrop click handler
    window.addEventListener('click', (event) => {
        if (event.target === modalElement) {
            modalElement.classList.add('hidden');
            modalElement.style.display = 'none';
            if (onClose) onClose();
        }
    });
}

/**
 * Show modal (remove hidden class)
 * @param {HTMLElement} modalElement - Modal element
 */
export function showModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('hidden');
    modalElement.style.display = 'block';
}

/**
 * Hide modal (add hidden class)
 * @param {HTMLElement} modalElement - Modal element
 */
export function hideModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add('hidden');
    modalElement.style.display = 'none';
}

// ============================================================
// GOOGLE MAPS HELPERS
// ============================================================

/**
 * Convert Google Maps URL ke Embed URL
 * @param {string} mapsUrl - Google Maps URL
 * @returns {string} Embed URL atau empty string
 */
export function convertToEmbedUrl(mapsUrl) {
    // CATATAN: Untuk production, ganti 'YOUR_GOOGLE_MAPS_API_KEY' dengan API key asli
    
    // Format 1: Short link (maps.app.goo.gl)
    if (mapsUrl.includes('maps.app.goo.gl') || mapsUrl.includes('goo.gl/maps')) {
        return ''; // Fallback ke address
    }
    
    // Format 2: Place name
    const placeMatch = mapsUrl.match(/place\/([^\/]+)/);
    if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(placeName)}`;
    }
    
    // Format 3: Coordinates
    const coordMatch = mapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
        const lat = coordMatch[1];
        const lng = coordMatch[2];
        return `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${lat},${lng}&zoom=15`;
    }
    
    // Format 4: Place ID
    const placeIdMatch = mapsUrl.match(/place_id=([^&]+)/);
    if (placeIdMatch) {
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=place_id:${placeIdMatch[1]}`;
    }
    
    return '';
}

// ============================================================
// ALPHABETICAL SORTING
// ============================================================

/**
 * Sort array alphabetically by specified key
 * @param {Array} arr - Array to sort
 * @param {string} key - Object key to sort by (default: 'name')
 * @returns {Array} Sorted array
 */
export function sortAlphabetically(arr, key = 'name') {
    return arr.sort((a, b) => {
        const nameA = (a[key] || '').toLowerCase();
        const nameB = (b[key] || '').toLowerCase();
        return nameA.localeCompare(nameB, 'id-ID');
    });
}

/**
 * Fetch unique reviewer names dari database
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of reviewer names
 */
export async function fetchReviewerNames(userId = 'anon') {
    try {
        const { data: reviews, error } = await supabase
            .from('idea_reviews')
            .select('reviewer_name')
            .eq('user_id', userId)
            .not('reviewer_name', 'is', null);
        
        if (error) throw error;
        
        // Get unique names
        const uniqueNames = [...new Set(reviews.map(r => r.reviewer_name).filter(Boolean))];
        
        // Sort alphabetically
        return uniqueNames.sort((a, b) => a.localeCompare(b, 'id-ID'));
    } catch (error) {
        console.error('Error fetching reviewer names:', error);
        return [];
    }
}

/**
 * Populate reviewer name dropdown
 * @param {HTMLSelectElement} selectElement - Select element
 * @param {Array<string>} names - Array of names
 */
export function populateReviewerNameDropdown(selectElement, names) {
    if (!selectElement) return;
    
    // Clear existing options except first and last (default + custom)
    const firstOption = selectElement.options[0]; // "-- Pilih Nama --"
    const lastOption = selectElement.options[selectElement.options.length - 1]; // "➕ Nama Baru..."
    
    selectElement.innerHTML = '';
    selectElement.appendChild(firstOption);
    
    // Add name options
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        selectElement.appendChild(option);
    });
    
    // Re-add custom option
    selectElement.appendChild(lastOption);
}

/**
 * Setup reviewer name input behavior
 * @param {HTMLSelectElement} selectElement - Select element
 * @param {HTMLInputElement} inputElement - Input element
 */
export function setupReviewerNameInput(selectElement, inputElement) {
    if (!selectElement || !inputElement) return;
    
    selectElement.addEventListener('change', (e) => {
        const value = e.target.value;
        
        if (value === 'custom') {
            inputElement.style.display = 'block';
            inputElement.required = true;
            inputElement.focus();
        } else {
            inputElement.style.display = 'none';
            inputElement.required = false;
            inputElement.value = '';
        }
    });
}

/**
 * Get selected reviewer name (dari dropdown atau input)
 * @param {HTMLSelectElement} selectElement - Select element
 * @param {HTMLInputElement} inputElement - Input element
 * @returns {string|null} Reviewer name or null
 */
export function getSelectedReviewerName(selectElement, inputElement) {
    if (!selectElement) return null;
    
    const selectedValue = selectElement.value;
    
    if (selectedValue === 'custom') {
        return inputElement?.value.trim() || null;
    } else if (selectedValue === '') {
        return null;
    } else {
        return selectedValue;
    }
}

/**
 * Render reviewer name in review display
 * @param {string} reviewerName - Reviewer name
 * @returns {string} HTML string
 */
export function renderReviewerName(reviewerName) {
    if (!reviewerName) return '';
    
    return `
        <div class="reviewer-info" style="
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            background: linear-gradient(135deg, #e1f3ff 0%, #c4e8ff 100%);
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: 8px;
        ">
            <span style="font-size: 1.1em;">👤</span>
            ${reviewerName}
        </div>
    `;
}