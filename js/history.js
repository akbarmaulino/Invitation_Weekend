// js/history.js (UPDATED: No Duplicate Functions, Using utils.js)

import { supabase } from './supabaseClient.js';
import {
    getPublicImageUrl,
    renderPhotoUrls,
    uploadImages,
    formatTanggalIndonesia,
    calculateAverageRating,
    renderStars,
    setupModalClose,
    showModal,
    hideModal,
    fetchReviewerNames,
    populateReviewerNameDropdown,
    setupReviewerNameInput,
    getSelectedReviewerName,
    renderReviewerName
} from './utils.js';

let currentUser = { id: 'anon' }; 

// Deklarasi variabel referensi global 
let viewHistoryBtn, historyListModal, historyList, historyDetailModal, 
    cancelReview, historyDetailList, historyModalTitle, historySecretMessage, 
    ideaReviewModal, reviewIdeaName, ideaReviewForm, reviewIdeaId, reviewTripId, 
    ideaReviewText, ideaReviewPhotoInput, ideaReviewPhotoPreview, ideaReviewStatus, 
    submitIdeaReviewBtn, cancelIdeaReview, ideaReviewRatingDiv,
    closeHistoryListModal, backToHistoryList,
    filterStartDate, filterEndDate, applyHistoryFilterBtn; 
let reviewerNames = [];
let currentRating = 0;
let currentTrip = null; 
let allReviewsCache = []; 

// =========================================================
// DATA FETCHING & RENDERING
// =========================================================

async function loadHistory(startDate = null, endDate = null) { 
    if (!historyList) return;
    historyList.innerHTML = '<p>Memuat riwayat trip...</p>';
    
    let query = supabase
        .from('trip_history')
        .select('*')
        .eq('user_id', currentUser.id || 'anon')
        .order('trip_date', { ascending: false });

    // Filter tanggal
    if (startDate) {
        query = query.gte('trip_date', startDate); 
    }
    if (endDate) {
        query = query.lte('trip_date', endDate);
    }
    
    // 1. Ambil semua trip history
    const { data: trips, error: tripError } = await query;

    if (tripError) {
        console.error('Error fetching trip history:', tripError);
        historyList.innerHTML = `<p style="color: var(--color-error);">Gagal memuat riwayat trip: ${tripError.message}</p>`;
        return;
    }

    // 2. Ambil semua review sekaligus
    const { data: reviews, error: reviewError } = await supabase
        .from('idea_reviews')
        .select('*');
        
    if (reviewError) {
        console.error('Error fetching all reviews:', reviewError);
    }
    allReviewsCache = reviews || [];
    
    renderHistoryList(trips);
}
// ============================================================
// HELPER: Calculate Review Progress
// ============================================================

function calculateReviewProgress(trip) {
    if (!trip.selection_json || trip.selection_json.length === 0) {
        return { total: 0, reviewed: 0, percentage: 0, status: 'empty' };
    }
    
    const totalActivities = trip.selection_json.length;
    
    // Hitung berapa aktivitas yang sudah direview
    const reviewedActivities = trip.selection_json.filter(activity => {
        // Cari review untuk aktivitas ini di trip ini
        const hasReview = allReviewsCache.find(review => 
            review.trip_id == trip.id && 
            review.idea_id == activity.idea_id
        );
        return !!hasReview;
    }).length;
    
    const percentage = Math.round((reviewedActivities / totalActivities) * 100);
    
    let status = 'none'; // Belum ada review
    if (reviewedActivities === totalActivities) {
        status = 'complete'; // Semua selesai
    } else if (reviewedActivities > 0) {
        status = 'partial'; // Sebagian
    }
    
    return {
        total: totalActivities,
        reviewed: reviewedActivities,
        percentage: percentage,
        status: status
    };
}

function renderHistoryList(trips) {
    if (!historyList) return;
    historyList.innerHTML = '';
    
    if (!trips || trips.length === 0) {
        const isFiltered = (filterStartDate && filterStartDate.value) || (filterEndDate && filterEndDate.value);
        let message = 'Belum ada riwayat trip tersimpan.';
        if (isFiltered) {
            message = 'Tidak ada riwayat trip dalam rentang tanggal yang dipilih.';
        }
        historyList.innerHTML = `<p>${message}</p>`;
        return;
    }

    trips.forEach(trip => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.dataset.tripId = trip.id;
        
        // ✅ BARU: Hitung review progress
        const progress = calculateReviewProgress(trip);
        
        // ✅ BARU: Generate badge HTML
        let badgeHtml = '';
        let statusClass = '';
        
        switch(progress.status) {
            case 'complete':
                badgeHtml = '<span class="review-badge badge-complete">✅ Selesai Review</span>';
                statusClass = 'status-complete';
                break;
            case 'partial':
                badgeHtml = `<span class="review-badge badge-partial">⏳ ${progress.reviewed}/${progress.total} Review</span>`;
                statusClass = 'status-partial';
                break;
            case 'none':
                badgeHtml = '<span class="review-badge badge-none">📝 Belum Review</span>';
                statusClass = 'status-none';
                break;
            case 'empty':
                badgeHtml = '<span class="review-badge badge-empty">⚠️ Tidak Ada Aktivitas</span>';
                statusClass = 'status-empty';
                break;
        }
        
        // ✅ BARU: Progress bar HTML
        const progressBarHtml = progress.total > 0 ? `
            <div class="review-progress-bar">
                <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
            </div>
        ` : '';
        
        // ✅ BARU: Tambah status class ke item
        item.classList.add(statusClass);
        
        item.innerHTML = `
            <div class="history-item-header">
                <div class="history-item-info">
                    <div class="trip-header-row">
                        <h4>Trip ${formatTanggalIndonesia(trip.trip_date)} (${trip.trip_day})</h4>
                        ${badgeHtml}
                    </div>
                    <p>${trip.selection_json.length} aktivitas terpilih.</p>
                    ${progressBarHtml}
                </div>
                <button class="btn-regenerate-ticket" data-trip-id="${trip.id}" title="Lihat Tiket Trip Ini">
                    🎫 Lihat Tiket
                </button>
            </div>
        `;
        
        // Click handler untuk area info
        const infoArea = item.querySelector('.history-item-info');
        infoArea.addEventListener('click', () => showTripDetails(trip.id));
        infoArea.style.cursor = 'pointer';
        
        // Click handler untuk tombol re-generate
        const regenBtn = item.querySelector('.btn-regenerate-ticket');
        regenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            regenerateTicket(trip);
        });
        
        historyList.appendChild(item);
    });
}

// ============================================================
// FUNGSI BARU: Regenerate Ticket dari History
// ============================================================

function regenerateTicket(trip) {
    // Convert trip data ke format localStorage
    const selections = trip.selection_json.map(item => ({
        ideaId: item.idea_id || `cat-${item.name}`,
        name: item.name,
        cat: item.category,
        subtype: item.subtype
    }));
    
    // Save ke localStorage
    localStorage.setItem('tripDate', trip.trip_date);
    localStorage.setItem('tripSelections', JSON.stringify(selections));
    localStorage.setItem('secretMessage', trip.secret_message || '');
    
    // Redirect ke summary.html
    window.location.href = 'summary.html';
}

async function showTripDetails(tripId) {
    // Sembunyikan list, tampilkan detail
    if (historyListModal) {
        hideModal(historyListModal);
    }
    
    if (historyDetailModal) {
        showModal(historyDetailModal);
        if (historyDetailList) {
            historyDetailList.innerHTML = '<p>Memuat detail trip...</p>';
        }
    } else {
        return;
    }

    // 1. Ambil detail trip
    const { data: trip, error: tripError } = await supabase
        .from('trip_history')
        .select('*')
        .eq('id', tripId)
        .single();
    
    if (tripError) {
        console.error('Error fetching trip detail:', tripError);
        historyDetailList.innerHTML = `<p style="color: var(--color-error);">Gagal memuat detail trip: ${tripError.message}</p>`;
        return;
    }

    currentTrip = trip;
    
    // Update header modal detail
    if (historyModalTitle) historyModalTitle.textContent = `Trip ${formatTanggalIndonesia(trip.trip_date)} (${trip.trip_day})`;
    if (historySecretMessage) historySecretMessage.textContent = trip.secret_message || 'Tidak ada pesan rahasia.';
    
    historyDetailList.innerHTML = '';
    
    // 2. Filter reviews untuk trip ini
    const reviewsForThisTrip = allReviewsCache.filter(r => r.trip_id == tripId);
    
// ✅ FIX: Build HTML array dulu, baru inject sekali
const ideaDetailsArray = [];

trip.selection_json.forEach(idea => {
    const currentTripReview = reviewsForThisTrip.find(r => r.idea_id == idea.idea_id) || null;
    const allIdeaReviews = allReviewsCache.filter(r => r.idea_id == idea.idea_id);
    const ideaDetailHtml = renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews);
    ideaDetailsArray.push(ideaDetailHtml);
});

// Inject semua sekaligus
historyDetailList.innerHTML = ideaDetailsArray.join('');
    
    // Setup event listeners untuk tombol review
    document.querySelectorAll('.review-btn-handler').forEach(button => {
        button.addEventListener('click', (e) => {
            const ideaId = e.currentTarget.dataset.ideaId;
            const ideaName = e.currentTarget.dataset.ideaName;
            const tripId = e.currentTarget.dataset.tripId;
            
            // ✅ NEW: Tidak auto-load existing review, biar user pilih nama dulu
            showReviewModal(ideaId, tripId, ideaName, null);
        });
    });

    // ✅ NEW: Handler untuk edit review spesifik
    document.querySelectorAll('.btn-edit-review').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.currentTarget.dataset.ideaId;
            const ideaName = e.currentTarget.dataset.ideaName;
            const tripId = e.currentTarget.dataset.tripId;
            const reviewerName = e.currentTarget.dataset.reviewerName;
            
            // Find specific review
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId && 
                r.reviewer_name == reviewerName
            );
            
            showReviewModal(ideaId, tripId, ideaName, existingReview);
        });
    });
    const { data: freshReviews, error: reviewError } = await supabase
        .from('idea_reviews')
        .select('*');
        
    if (!reviewError) {
        allReviews = freshReviews || [];
        console.log('✅ Reviews refreshed:', allReviews.length);
    }
}

function renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews) {
    // Filter reviews untuk idea ini di trip ini
    const reviewsForThisIdeaInTrip = allReviews.filter(r => 
        r.trip_id == tripId && 
        r.idea_id == idea.idea_id
    );
    
    // ✅ DEBUG LOG
    console.log('🔍 Rendering idea:', idea.name);
    console.log('📝 Reviews for this idea in trip:', reviewsForThisIdeaInTrip);
    console.log('📊 Count:', reviewsForThisIdeaInTrip.length);
    
    const hasAnyReview = reviewsForThisIdeaInTrip.length > 0;
    
    // Calculate average rating dari semua reviews
    const { average, count } = calculateAverageRating(allIdeaReviews);
    const globalRatingHtml = renderStars(average);
    
    // Button text
    const buttonText = '⭐ Beri/Edit Review';
    
    // ✅ NEW: Render SEMUA reviews untuk aktivitas ini
    let allReviewsHtml = '';
    
    if (hasAnyReview) {
        allReviewsHtml = `
            <div class="all-reviews-section">
                <h5 style="margin-top: 20px; margin-bottom: 10px; color: var(--color-primary);">
                    👥 Semua Review untuk ${idea.name}:
                </h5>
        `;
        
        reviewsForThisIdeaInTrip.forEach(review => {
            const reviewerNameHtml = renderReviewerName(review.reviewer_name);
            const reviewStarsHtml = renderStars(review.rating, false);
            const reviewPhotoHtml = renderPhotoUrls(review.photo_url, 'review-photo');
            const reviewVideoHtml = renderVideoUrls(review.video_url, 'review-video');
            
            allReviewsHtml += `
                <div class="review-item-card">
                    ${reviewerNameHtml}
                    <div class="review-rating">${reviewStarsHtml}</div>
                    <p class="review-text-content">${review.review_text || '(Tidak ada komentar)'}</p>
                    ${reviewPhotoHtml}
                    ${reviewVideoHtml}
                    <button class="btn secondary small btn-edit-review" 
                            data-idea-id="${idea.idea_id}" 
                            data-trip-id="${tripId}"
                            data-idea-name="${idea.name}"
                            data-reviewer-name="${review.reviewer_name}">
                        ✏️ Edit Review Ini
                    </button>
                </div>
            `;
        });
        
        allReviewsHtml += '</div>';
    }

    return `
        <div class="idea-detail-item">
            <div class="idea-header">
                <div class="idea-icon">📍</div>
                <div>
                    <h4>${idea.name}</h4>
                    <p class="idea-subtitle">${idea.category} / ${idea.subtype}</p>
                </div>
            </div>

            <div class="review-global-summary">
                <p><strong>Rata-Rata Global:</strong> ${globalRatingHtml} (${average} dari ${count} ulasan)</p>
                <p><strong>Review di Trip Ini:</strong> 
                    ${hasAnyReview ? `${reviewsForThisIdeaInTrip.length} review` : 'Belum ada review'}
                </p>
            </div>

            <button class="btn secondary small review-btn-handler" 
                    data-idea-id="${idea.idea_id}" 
                    data-idea-name="${idea.name}"
                    data-trip-id="${tripId}">
                ${buttonText}
            </button>

            ${allReviewsHtml}
        </div>
    `;
}

// =========================================================
// REVIEW MODAL
// =========================================================

async function showReviewModal(tripId, ideaId, ideaName, existingReview = null) {
    if (historyDetailModal) {
        hideModal(historyDetailModal);
    }

    if (ideaReviewModal) {
        showModal(ideaReviewModal);
    } else {
        return;
    }

    if (reviewIdeaName) reviewIdeaName.textContent = ideaName;
    if (reviewTripId) reviewTripId.value = tripId;
    if (reviewIdeaId) reviewIdeaId.value = ideaId;
    
    // Reset form
    if (ideaReviewForm) ideaReviewForm.reset();
    if (ideaReviewPhotoInput) ideaReviewPhotoInput.value = '';
    if (ideaReviewPhotoPreview) ideaReviewPhotoPreview.innerHTML = '';
    if (ideaReviewStatus) ideaReviewStatus.textContent = '';
    currentRating = 0;
    
    // ✅ NEW: Load dan populate reviewer names
    reviewerNames = await fetchReviewerNames(currentUser.id);
    const reviewerSelect = document.getElementById('reviewerNameSelect');
    const reviewerInput = document.getElementById('reviewerNameInput');
    
    if (reviewerSelect) {
        populateReviewerNameDropdown(reviewerSelect, reviewerNames);
        setupReviewerNameInput(reviewerSelect, reviewerInput);
    }
    
    // Isi form jika ada review yang sudah ada
    if (existingReview) {
        if (ideaReviewText) ideaReviewText.value = existingReview.review_text || '';
        currentRating = existingReview.rating || 0;
        
        // ✅ NEW: Set reviewer name
        if (reviewerSelect && existingReview.reviewer_name) {
            // Cek apakah nama ada di dropdown
            const optionExists = Array.from(reviewerSelect.options).some(
                opt => opt.value === existingReview.reviewer_name
            );
            
            if (optionExists) {
                reviewerSelect.value = existingReview.reviewer_name;
            } else {
                // Jika nama tidak ada, set ke custom dan isi input
                reviewerSelect.value = 'custom';
                if (reviewerInput) {
                    reviewerInput.style.display = 'block';
                    reviewerInput.value = existingReview.reviewer_name;
                }
            }
        }
        
        // Tampilkan preview foto existing
        if (ideaReviewPhotoPreview) {
            let photoUrls = existingReview.photo_url;

            if (typeof photoUrls === 'string' && photoUrls.length > 0) {
                photoUrls = [photoUrls];
            } else if (!Array.isArray(photoUrls)) {
                photoUrls = [];
            }
            
            if (photoUrls.length > 0) {
                photoUrls.forEach((url, index) => {
                    const publicUrl = getPublicImageUrl(url);
                    if (publicUrl !== 'images/placeholder.jpg') {
                        const img = document.createElement('img');
                        img.src = publicUrl;
                        img.alt = `Review Photo Preview ${index+1}`;
                        img.style.maxWidth = '100px'; 
                        img.style.height = 'auto'; 
                        img.style.borderRadius = '4px';
                        img.style.marginRight = '10px';
                        img.style.marginBottom = '10px';
                        img.style.display = 'inline-block';
                        ideaReviewPhotoPreview.appendChild(img);
                    }
                });
            }
        }
        
        if (submitIdeaReviewBtn) submitIdeaReviewBtn.textContent = 'Ubah Review ✨';
    } else {
        if (submitIdeaReviewBtn) submitIdeaReviewBtn.textContent = 'Kirim Review ✨';
    }

    // Render ulang bintang
    if (ideaReviewRatingDiv) setupStarRating(ideaReviewRatingDiv, currentRating);
}

function setupStarRating(container, initialRating) {
    container.innerHTML = '';
    currentRating = initialRating;
    
    const maxRating = 5;
    
    for (let i = 1; i <= maxRating; i++) {
        const star = document.createElement('span');
        star.className = 'star clickable';
        star.dataset.value = i;
        star.textContent = i <= currentRating ? '★' : '☆'; 
        
        star.addEventListener('click', () => {
            currentRating = i;
            document.querySelectorAll('#ideaReviewRatingDiv .star').forEach(s => {
                const starValue = parseInt(s.dataset.value);
                s.textContent = starValue <= currentRating ? '★' : '☆';
            });
        });
        container.appendChild(star);
    }
}

// =========================================================
// EVENT LISTENERS SETUP
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi UI references
    viewHistoryBtn = document.getElementById('viewHistoryBtn'); 
    historyListModal = document.getElementById('historyListModal'); 
    closeHistoryListModal = document.getElementById('closeHistoryListBtn'); 
    historyList = document.getElementById('historyList'); 
    historyDetailModal = document.getElementById('historyDetailModal'); 
    cancelReview = document.getElementById('cancelReview'); 
    historyDetailList = document.getElementById('historyDetailList');
    historyModalTitle = document.getElementById('historyModalTitle');
    historySecretMessage = document.getElementById('historySecretMessage');
    ideaReviewModal = document.getElementById('ideaReviewModal');
    reviewIdeaName = document.getElementById('reviewIdeaName');
    ideaReviewForm = document.getElementById('ideaReviewForm');
    reviewIdeaId = document.getElementById('reviewIdeaId');
    reviewTripId = document.getElementById('reviewTripId'); 
    ideaReviewText = document.getElementById('ideaReviewText');
    ideaReviewPhotoInput = document.getElementById('ideaReviewPhotoInput');
    ideaReviewPhotoPreview = document.getElementById('ideaReviewPhotoPreview');
    ideaReviewStatus = document.getElementById('ideaReviewStatus');
    submitIdeaReviewBtn = document.getElementById('submitIdeaReviewBtn');
    cancelIdeaReview = document.getElementById('cancelIdeaReview');
    ideaReviewRatingDiv = document.getElementById('ideaReviewRatingDiv');
    backToHistoryList = document.getElementById('backToHistoryList'); 
    filterStartDate = document.getElementById('filterStartDate');
    filterEndDate = document.getElementById('filterEndDate');
    applyHistoryFilterBtn = document.getElementById('applyHistoryFilterBtn');
    
    // Handler untuk kembali ke daftar trip
    const backToHistoryListHandler = () => {
        if (filterStartDate) filterStartDate.value = '';
        if (filterEndDate) filterEndDate.value = '';

        if (historyDetailModal) {
            hideModal(historyDetailModal);
        }
        
        loadHistory(); 
        if (historyListModal) {
            showModal(historyListModal);
        }
    };

    // 1. Tampil Modal Riwayat List
    if (viewHistoryBtn && historyListModal) { 
        viewHistoryBtn.addEventListener('click', () => {
            showModal(historyListModal);
            loadHistory();
        });
    }

    // 2. Setup modal close handlers menggunakan utils
    if (historyListModal) {
        setupModalClose(historyListModal);
    }
    
    if (historyDetailModal) {
        setupModalClose(historyDetailModal, backToHistoryListHandler);
    }
    
    if (ideaReviewModal) {
        setupModalClose(ideaReviewModal, () => {
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            }
        });
    }

    // 3. Close buttons
    if (closeHistoryListModal && historyListModal) {
        closeHistoryListModal.addEventListener('click', () => {
            hideModal(historyListModal);
        });
    }
    
    if (cancelReview) {
        cancelReview.addEventListener('click', backToHistoryListHandler);
    }
    
    if (backToHistoryList) {
        backToHistoryList.addEventListener('click', backToHistoryListHandler);
    }

    // 4. Cancel review modal
    if (cancelIdeaReview && ideaReviewModal && historyDetailModal) {
        cancelIdeaReview.addEventListener('click', () => {
            hideModal(ideaReviewModal);
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            } else {
                backToHistoryListHandler();
            }
        });
    }

    // 5. Apply filter
    if (applyHistoryFilterBtn) {
        applyHistoryFilterBtn.addEventListener('click', () => {
            const start = filterStartDate.value;
            const end = filterEndDate.value;

            if (!start && end) {
                alert('Jika Anda mengisi "Sampai Tanggal", Anda harus mengisi "Dari Tanggal" juga.');
                return;
            }
            
            loadHistory(start, end);
        });
    }

    // 6. Submit Review 
    if (ideaReviewForm) {
        ideaReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ideaId = reviewIdeaId.value;
            const tripId = reviewTripId.value;
            const reviewText = ideaReviewText.value.trim();
            const rating = currentRating;
            const photoFiles = ideaReviewPhotoInput.files;
            const videoFile = ideaReviewVideoInput.files[0]; // ✅ TAMBAH INI
            
            // ✅ NEW: Get reviewer name
            const reviewerSelect = document.getElementById('reviewerNameSelect');
            const reviewerInput = document.getElementById('reviewerNameInput');
            const reviewerName = getSelectedReviewerName(reviewerSelect, reviewerInput);

            if (rating === 0) {
                if (ideaReviewStatus) ideaReviewStatus.textContent = 'Beri minimal 1 bintang!';
                return;
            }
            
            // ✅ NEW: Validasi nama reviewer (opsional, tapi direkomendasikan)
            if (!reviewerName) {
                if (ideaReviewStatus) ideaReviewStatus.textContent = '⚠️ Pilih atau masukkan nama reviewer!';
                return;
            }

            if (ideaReviewStatus) ideaReviewStatus.textContent = 'Memproses...';
            if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = true;

            // Upload photos
            const existingReview = allReviewsCache.find(r => r.idea_id == ideaId && r.trip_id == tripId);
            const oldPhotoUrl = existingReview?.photo_url; 
            
            let uploadedUrls = [];
            
            if (fileList.length > 0) {
                uploadedUrls = await uploadImages(fileList, currentUser.id || 'anon', 'review'); 
                
                if (uploadedUrls.length === 0) {
                    ideaReviewStatus.textContent = 'Gagal mengupload foto. Coba lagi.';
                    if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false;
                    return;
                }
                
                // Hapus foto lama (jika ada)
                let pathsToRemove = [];
                if (typeof oldPhotoUrl === 'string' && oldPhotoUrl.length > 0 && !oldPhotoUrl.startsWith('http')) {
                    pathsToRemove.push(oldPhotoUrl);
                }
                
                if (pathsToRemove.length > 0) {
                    const { error: removeError } = await supabase.storage
                        .from('trip-ideas-images')
                        .remove(pathsToRemove); 
                    if (removeError) {
                        console.warn('Gagal menghapus foto lama:', removeError);
                    }
                }
                
            } else {
            if (existingReview?.photo_url) {
                uploadedPhotoUrls = existingReview.photo_url;
            }
        }

        // ✅ TAMBAH CODE INI - Upload video
        let uploadedVideoUrl = null;
        if (videoFile) {
            if (ideaReviewStatus) ideaReviewStatus.textContent = '🎬 Mengupload video...';
            
            uploadedVideoUrl = await uploadVideo(videoFile, currentUser.id || 'anon', 'review');
            
            if (!uploadedVideoUrl) {
                ideaReviewStatus.textContent = '❌ Gagal upload video. Coba lagi.';
                if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false;
                return;
            }
            
            // Delete old video if exists
            if (existingReview?.video_url && typeof existingReview.video_url === 'string' && !existingReview.video_url.startsWith('http')) {
                try {
                    await supabase.storage
                        .from('trip-videos')
                        .remove([existingReview.video_url]);
                } catch (e) {
                    console.warn('Failed to delete old video:', e);
                }
            }
        } else {
            // Keep existing video if not uploading new one
            if (existingReview?.video_url) {
                uploadedVideoUrl = existingReview.video_url;
            }
        }

        // Existing reviewData code continues here...
        const reviewData = {
                idea_id: ideaId,
                trip_id: tripId,
                user_id: currentUser.id || 'anon',
                review_text: reviewText || null,
                rating: rating || 0,
                photo_url: Array.isArray(uploadedPhotoUrls) && uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
                reviewer_name: reviewerName,
                created_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('idea_reviews')
                .upsert([reviewData], { 
                    onConflict: 'idea_id, trip_id',
                    ignoreDuplicates: false 
                });

            if (error) {
                console.error('Supabase review submit error', error);
                if (ideaReviewStatus) ideaReviewStatus.textContent = `Gagal menyimpan review. Error: ${error.message}`;
                if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false;
                return;
            }

            if (ideaReviewStatus) ideaReviewStatus.textContent = 'Review tersimpan! 🎉';
            
            // Reload cache
            const { data: reviews, error: reviewError } = await supabase.from('idea_reviews').select('*');
            if (!reviewError) allReviewsCache = reviews;

            if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false; 

            setTimeout(() => {
                if (ideaReviewModal) {
                    hideModal(ideaReviewModal);
                }
                showTripDetails(tripId);
            }, 1000);
        });
    }

    // 7. Photo preview
    if (ideaReviewPhotoInput) {
        ideaReviewPhotoInput.addEventListener('change', (e) => {
            if (!ideaReviewPhotoPreview) return;
            ideaReviewPhotoPreview.innerHTML = '';
            
            const files = e.target.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = `Review Photo Preview ${i+1}`;
                        img.style.maxWidth = '100px'; 
                        img.style.height = 'auto'; 
                        img.style.borderRadius = '4px';
                        img.style.marginRight = '10px';
                        img.style.marginBottom = '10px';
                        img.style.display = 'inline-block';
                        ideaReviewPhotoPreview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }
});