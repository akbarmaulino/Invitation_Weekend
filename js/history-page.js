// js/history-page.js - Standalone History Page Logic

import { supabase } from './supabaseClient.js';
import {
    getPublicImageUrl,
    renderPhotoUrls,
    uploadImages,
    uploadVideo,
    renderVideoUrls,
    getPublicVideoUrl,
    formatTanggalIndonesia,
    calculateAverageRating,
    renderStars,
    showModal,
    hideModal,
    fetchReviewerNames,
    populateReviewerNameDropdown,
    setupReviewerNameInput,
    getSelectedReviewerName,
    renderReviewerName
} from './utils.js';

import { 
    createTripInvitation, 
    getTripInvitationStats 
} from './invitation-utils.js';


let reviewerNames = [];
let currentUser = { id: 'anon' };
let allTrips = [];
let allReviews = [];
let allIdeas = [];
let currentRating = 0;
let selectedTripId = null;


let invitationModal, invitationForm, inviterName, invitedEmail, 
    invitationMessage, maxUses, invitationTripId, invitationResult, 
    generatedInvitationUrl, invitationStatus, closeInvitationModal, 
    cancelInvitation, generateInvitationBtn, copyInvitationBtn;

// ============================================================
// DATA FETCHING
// ============================================================

async function fetchAllData(startDate = null, endDate = null) {
    try {
        // Fetch trips with filter
        let tripsQuery = supabase
            .from('trip_history')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('trip_date', { ascending: false });
        
        if (startDate) tripsQuery = tripsQuery.gte('trip_date', startDate);
        if (endDate) tripsQuery = tripsQuery.lte('trip_date', endDate);
        
        const { data: trips, error: tripsError } = await tripsQuery;
        if (tripsError) throw tripsError;
        allTrips = trips || [];
        
        const tripIds = allTrips.map(trip => trip.id);

        // Fetch all reviews
        const { data: reviews, error: reviewsError } = await supabase
            .from('idea_reviews')
            .select('*')
            .in('trip_id', tripIds);
        if (reviewsError) throw reviewsError;
        allReviews = reviews || [];
        
        // Fetch ideas for names
        const { data: ideas, error: ideasError } = await supabase
            .from('trip_ideas_v2')
            .select('id, idea_name');
        if (ideasError) throw ideasError;
        allIdeas = ideas || [];
        
        return true;
    } catch (error) {
        console.error('Error fetching data:', error);
        return false;
    }
}

// ============================================================
// CALCULATIONS
// ============================================================

function calculateStats() {
    const totalTrips = allTrips.length;
    const totalReviews = allReviews.length;
    
    // Unique places
    const uniquePlaces = new Set();
    allTrips.forEach(trip => {
        trip.selection_json.forEach(item => {
            if (item.idea_id) uniquePlaces.add(item.idea_id);
        });
    });
    
    return {
        totalTrips,
        totalReviews,
        uniquePlaces: uniquePlaces.size
    };
}

function calculateTripProgress(trip) {
    if (!trip.selection_json || trip.selection_json.length === 0) {
        return { 
            totalActivities: 0, 
            reviewedActivities: 0, 
            totalReviews: 0,
            percentage: 0, 
            status: 'empty' 
        };
    }
    
    const totalActivities = trip.selection_json.length;
    
    // ✅ Hitung jumlah TOTAL REVIEWS di trip ini
    const totalReviews = allReviews.filter(review => 
        review.trip_id == trip.id
    ).length;
    
    // ✅ Hitung jumlah ACTIVITIES yang sudah direview (minimal 1 review)
    const reviewedActivities = trip.selection_json.filter(activity => {
        return allReviews.some(review => 
            review.trip_id == trip.id && 
            review.idea_id == activity.idea_id
        );
    }).length;
    
    const percentage = Math.round((reviewedActivities / totalActivities) * 100);
    
    let status = 'none';
    if (reviewedActivities === totalActivities) {
        status = 'complete';
    } else if (reviewedActivities > 0) {
        status = 'partial';
    }
    
    return {
        totalActivities,      // Total aktivitas
        reviewedActivities,   // Aktivitas yang sudah direview
        totalReviews,         // Total semua reviews
        percentage,           // Persentase completion
        status
    };
}

// ============================================================
// RENDERING
// ============================================================

function renderStats(stats) {
    document.getElementById('totalTripsCount').textContent = stats.totalTrips;
    document.getElementById('totalReviewsCount').textContent = stats.totalReviews;
    document.getElementById('uniquePlacesCount').textContent = stats.uniquePlaces;
}

// ============================================================
// SUCCESS NOTIFICATION setelah update trip
// ============================================================

function showUpdateSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'update-success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <div class="notification-text">
                <strong>Trip Berhasil Diupdate!</strong>
                <small>Perubahan sudah tersimpan</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function renderTimeline() {
    const timeline = document.getElementById('tripTimeline');
    const loadingEl = document.getElementById('loadingHistory');
    const emptyState = document.getElementById('emptyState');
    
    loadingEl.style.display = 'none';
    
    if (allTrips.length === 0) {
        timeline.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    timeline.style.display = 'block';
    timeline.innerHTML = '';
    
    allTrips.forEach((trip, index) => {
        const progress = calculateTripProgress(trip);
        const dateFormatted = formatTanggalIndonesia(trip.trip_date);
        
        // Badge status
        let badgeClass = 'badge-none';
        let badgeText = '📝 Belum Review';

        if (progress.status === 'complete') {
            badgeClass = 'badge-complete';
            badgeText = `✅ Lengkap (${progress.totalReviews} reviews)`;  // ✅ Show review count
        } else if (progress.status === 'partial') {
            badgeClass = 'badge-partial';
            badgeText = `⏳ ${progress.reviewedActivities}/${progress.totalActivities} (${progress.totalReviews} reviews)`;  // ✅ Show both
        }
        
        // Activities preview (first 5)
        const activitiesPreview = trip.selection_json
            .slice(0, 5)
            .map(item => `<span class="activity-tag">${item.name}</span>`)
            .join('');
        
        const moreCount = trip.selection_json.length - 5;
        const moreTag = moreCount > 0 ? `<span class="activity-tag">+${moreCount} lainnya</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'trip-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.dataset.tripId = trip.id;
        
        card.innerHTML = `
            <div class="trip-header">
                <div class="trip-date-info">
                    <h3>${dateFormatted}</h3>
                    <p class="trip-meta">${trip.trip_day} • ${trip.selection_json.length} aktivitas</p>
                </div>
                <div class="trip-actions">
                    <span class="trip-status-badge ${badgeClass}">${badgeText}</span>
                    <button class="btn secondary small btn-invite-friend" data-trip-id="${trip.id}">
                        ✉️ Undang Teman
                    </button>
                    <button class="btn secondary small btn-edit-trip" data-trip-id="${trip.id}">
                        ✏️ Edit Trip
                    </button>
                    <button class="btn secondary small btn-view-detail" data-trip-id="${trip.id}">
                        👁️ Detail
                    </button>
                    <button class="btn primary small btn-view-ticket" data-trip-id="${trip.id}">
                        🎫 Lihat Tiket
                    </button>
                </div>
            </div>
            
            <div class="trip-summary">
                <div class="summary-item">
                    <span class="item-value">${progress.totalActivities}</span>
                    <span class="item-label">Aktivitas</span>
                </div>
                <div class="summary-item">
                    <span class="item-value">${progress.totalReviews}</span>
                    <span class="item-label">Reviews</span>
                </div>
                <div class="summary-item">
                    <span class="item-value">${progress.reviewedActivities}/${progress.totalActivities}</span>
                    <span class="item-label">Reviewed</span>
                </div>
                <div class="summary-item">
                    <span class="item-value">${progress.percentage}%</span>
                    <span class="item-label">Complete</span>
                </div>
            </div>
            
            <div class="review-progress">
                <div class="progress-label">
                    <span>Activities Reviewed</span>
                    <span>${progress.reviewedActivities} / ${progress.totalActivities}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress.percentage}%"></div>
                </div>
            </div>
            
            <div class="activities-preview">
                ${activitiesPreview}
                ${moreTag}
            </div>
        `;
        
        timeline.appendChild(card);
    });
    
    // Setup event listeners
    setupTimelineEventListeners();
}

function setupTimelineEventListeners() {
    // Edit Trip buttons
    document.querySelectorAll('.btn-edit-trip').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tripId = e.currentTarget.dataset.tripId;
            editTrip(tripId);
        });
    });
    
    // View Detail buttons
    document.querySelectorAll('.btn-view-detail').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tripId = e.currentTarget.dataset.tripId;
            showTripDetail(tripId);
        });
    });
    
    // View Ticket buttons
    document.querySelectorAll('.btn-view-ticket').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tripId = e.currentTarget.dataset.tripId;
            regenerateTicket(tripId);
        });
    });
    
    // ✅ NEW: Invite Friend buttons
    document.querySelectorAll('.btn-invite-friend').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tripId = e.currentTarget.dataset.tripId;
            showInvitationModal(tripId);
        });
    });
}

// ============================================================
// TRIP DETAIL MODAL
// ============================================================

function showTripDetail(tripId) {
    const trip = allTrips.find(t => t.id == tripId);
    if (!trip) return;
    
    selectedTripId = tripId;
    
    const modal = document.getElementById('tripDetailModal');
    const title = document.getElementById('detailTripTitle');
    const secretMsg = document.getElementById('detailSecretMessage');
    const activitiesList = document.getElementById('detailActivitiesList');
    
    title.textContent = `Trip ${formatTanggalIndonesia(trip.trip_date)} (${trip.trip_day})`;
    secretMsg.textContent = trip.secret_message || 'Tidak ada pesan rahasia';
    
    // Render activities
    activitiesList.innerHTML = '';
    
    trip.selection_json.forEach(activity => {
        // ✅ FIX: Get ALL reviews untuk activity ini di trip ini
        const reviewsForActivity = allReviews.filter(r => 
            r.trip_id == tripId && 
            r.idea_id == activity.idea_id
        );
        
        const item = document.createElement('div');
        item.className = 'activity-detail-item';
        
        // ✅ NEW: Render SEMUA reviews
        let reviewsHtml = '';
        
        if (reviewsForActivity.length > 0) {
            reviewsHtml = '<div class="all-reviews-section">';
            
            reviewsForActivity.forEach(review => {
                reviewsHtml += `
                    <div class="review-section">
                        ${renderReviewerName(review.reviewer_name)}
                        <div class="review-rating">${'⭐'.repeat(review.rating || 0)}</div>
                        <p class="review-text-content">${review.review_text || '(Tidak ada komentar)'}</p>
                        ${renderPhotoUrls(review.photo_url, 'review-photo')}
                        ${renderVideoUrls(review.video_url, 'review-video')}
                        <button class="btn secondary small btn-edit-review" 
                                data-idea-id="${activity.idea_id}" 
                                data-trip-id="${tripId}"
                                data-idea-name="${activity.name}"
                                data-reviewer-name="${review.reviewer_name}">
                            ✏️ Edit Review Ini
                        </button>
                    </div>
                `;
            });
            
            reviewsHtml += '</div>';
        }
        
        // Button untuk tambah review baru
        const addReviewBtn = `
            <button class="btn primary small btn-add-review" 
                    data-idea-id="${activity.idea_id}" 
                    data-trip-id="${tripId}"
                    data-idea-name="${activity.name}">
                ⭐ Tambah Review
            </button>
        `;
        
        item.innerHTML = `
            <div class="activity-header">
                <div>
                    <div class="activity-name">${activity.name}</div>
                    <div class="activity-category">${activity.category} / ${activity.subtype}</div>
                </div>
            </div>
            ${reviewsHtml}
            ${reviewsForActivity.length === 0 ? '<p style="color: var(--color-muted); margin: 10px 0;">Belum ada review</p>' : ''}
            ${addReviewBtn}
        `;
        
        activitiesList.appendChild(item);
    });
    
    // Setup review buttons
    setupReviewButtons();
    
    // ✅ Setup edit review buttons (untuk edit review spesifik per reviewer)
    document.querySelectorAll('.btn-edit-review').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.currentTarget.dataset.ideaId;
            const ideaName = e.currentTarget.dataset.ideaName;
            const tripId = e.currentTarget.dataset.tripId;
            const reviewerName = e.currentTarget.dataset.reviewerName;
            
            console.log('✏️ Edit review:', { ideaId, tripId, reviewerName });
            
            // Find specific review
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId && 
                r.reviewer_name == reviewerName
            );
            
            if (existingReview) {
                showReviewModal(ideaId, tripId, ideaName, existingReview);
            } else {
                console.error('Review not found!', { ideaId, tripId, reviewerName });
            }
        });
    });
    
    showModal(modal);
}

function setupReviewButtons() {
    document.querySelectorAll('.btn-add-review, .btn-edit-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ideaId = e.currentTarget.dataset.ideaId;
            const tripId = e.currentTarget.dataset.tripId;
            const ideaName = e.currentTarget.dataset.ideaName;
            
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId
            );
            
            showReviewModal(ideaId, tripId, ideaName, existingReview);
        });
    });
}

// ============================================================
// REVIEW MODAL
// ============================================================

async function showReviewModal(ideaId, tripId, ideaName, existingReview = null) {
    const modal = document.getElementById('reviewModal');
    const placeName = document.getElementById('reviewPlaceName');
    const form = document.getElementById('reviewForm');
    const ideaIdInput = document.getElementById('reviewIdeaId');
    const tripIdInput = document.getElementById('reviewTripId');
    const reviewText = document.getElementById('reviewText');
    const photoInput = document.getElementById('reviewPhoto');
    const photoPreview = document.getElementById('reviewPhotoPreview');
    const statusMsg = document.getElementById('reviewStatus');
    const videoInput = document.getElementById('reviewVideo');
    const videoPreview = document.getElementById('reviewVideoPreview');
    
    // Reviewer name inputs
    const reviewerSelect = document.getElementById('reviewerNameSelectHistory');
    const reviewerInput = document.getElementById('reviewerNameInputHistory');
    
    placeName.textContent = ideaName;
    ideaIdInput.value = ideaId;
    tripIdInput.value = tripId;
    
    // Reset
form.reset();
if (photoPreview) photoPreview.innerHTML = '';
if (videoPreview) videoPreview.innerHTML = '';  // ✅ FIX: Check null dulu
if (statusMsg) statusMsg.textContent = '';
currentRating = 0;
    
    // Load dan populate reviewer names
    reviewerNames = await fetchReviewerNames(currentUser.id);
    if (reviewerSelect) {
        populateReviewerNameDropdown(reviewerSelect, reviewerNames);
        setupReviewerNameInput(reviewerSelect, reviewerInput);
    }
    
    // If editing existing review
    if (existingReview) {
        reviewText.value = existingReview.review_text || '';
        currentRating = existingReview.rating || 0;
        
        // Set reviewer name
        if (reviewerSelect && existingReview.reviewer_name) {
            const optionExists = Array.from(reviewerSelect.options).some(
                opt => opt.value === existingReview.reviewer_name
            );
            
            if (optionExists) {
                reviewerSelect.value = existingReview.reviewer_name;
            } else {
                reviewerSelect.value = 'custom';
                if (reviewerInput) {
                    reviewerInput.style.display = 'block';
                    reviewerInput.value = existingReview.reviewer_name;
                }
            }
        }
        
        // Show existing photos
        let photoUrls = existingReview.photo_url;
        if (typeof photoUrls === 'string' && photoUrls.length > 0) {
            photoUrls = [photoUrls];
        } else if (!Array.isArray(photoUrls)) {
            photoUrls = [];
        }
        
        photoUrls.forEach(url => {
            const publicUrl = getPublicImageUrl(url);
            if (publicUrl !== 'images/placeholder.jpg') {
                const img = document.createElement('img');
                img.src = publicUrl;
                photoPreview.appendChild(img);
            }
        });
        
        // Show existing video
        if (existingReview.video_url) {
            const videoUrl = getPublicVideoUrl(existingReview.video_url);
            if (videoUrl) {
                const video = document.createElement('video');
                video.src = videoUrl;
                video.controls = true;
                video.style.maxWidth = '300px';
                video.style.maxHeight = '200px';
                video.style.borderRadius = '8px';
                videoPreview.appendChild(video);
            }
        }
    }
    
    // Render stars
    setupStarRating(currentRating);
    
    // Hide trip detail modal
    hideModal(document.getElementById('tripDetailModal'));
    
    showModal(modal);
}

function setupStarRating(initialRating) {
    const container = document.getElementById('reviewStarRating');
    container.innerHTML = '';
    currentRating = initialRating;
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = 'star clickable';
        star.dataset.value = i;
        star.textContent = i <= currentRating ? '★' : '☆';
        star.style.cursor = 'pointer';
        star.style.fontSize = '2em';
        star.style.color = 'gold';
        
        star.addEventListener('click', () => {
            currentRating = i;
            setupStarRating(i);
        });
        
        container.appendChild(star);
    }
}

// ============================================================
// REGENERATE TICKET
// ============================================================
// ============================================================
// EDIT TRIP - Load trip ke home page untuk di-edit
// ============================================================

function editTrip(tripId) {
    const trip = allTrips.find(t => t.id == tripId);
    if (!trip) {
        alert('Trip tidak ditemukan!');
        return;
    }
    
    // Konfirmasi dulu
    if (!confirm(`Edit trip tanggal ${formatTanggalIndonesia(trip.trip_date)}?\n\nAnda bisa menambah/mengurangi aktivitas.`)) {
        return;
    }
    
    // Convert trip data ke format localStorage
    const selections = trip.selection_json.map(item => ({
        ideaId: item.idea_id || `cat-${item.name}`,
        name: item.name,
        cat: item.category,
        subtype: item.subtype
    }));
    
    // Save ke localStorage dengan flag edit mode
    localStorage.setItem('editMode', 'true');
    localStorage.setItem('editTripId', tripId);
    localStorage.setItem('tripDate', trip.trip_date);
    localStorage.setItem('tripSelections', JSON.stringify(selections));
    localStorage.setItem('secretMessage', trip.secret_message || '');
    
    // Redirect ke home page
    window.location.href = 'index.html';
}

function regenerateTicket(tripId) {
    const trip = allTrips.find(t => t.id == tripId);
    if (!trip) return;
    
    // Convert to localStorage format
    const selections = trip.selection_json.map(item => ({
        ideaId: item.idea_id || `cat-${item.name}`,
        name: item.name,
        cat: item.category,
        subtype: item.subtype
    }));
    
    // ✅ TAMBAH: Set mode VIEW ONLY (jangan save ke DB lagi)
    localStorage.setItem('viewOnlyMode', 'true'); // ✅ KUNCI: Flag view only
    localStorage.setItem('existingTripId', tripId); // ✅ Save ID untuk reference
    
    localStorage.setItem('tripDate', trip.trip_date);
    localStorage.setItem('tripSelections', JSON.stringify(selections));
    localStorage.setItem('secretMessage', trip.secret_message || '');
    
    window.location.href = 'summary.html';
}


// ============================================================
// EVENT LISTENERS
// ============================================================

// ============================================================
// INVITATION MODAL
// ============================================================

function showInvitationModal(tripId) {
    const trip = allTrips.find(t => t.id == tripId);
    if (!trip) return;
    
    // Reset form
    if (invitationForm) invitationForm.reset();
    if (invitationResult) invitationResult.style.display = 'none';
    if (invitationStatus) invitationStatus.textContent = '';
    
    // Set trip ID
    if (invitationTripId) invitationTripId.value = tripId;
    
    // Pre-fill inviter name dari localStorage jika ada
    const lastInviterName = localStorage.getItem('lastInviterName');
    if (lastInviterName && inviterName) {
        inviterName.value = lastInviterName;
    }
    
    showModal(invitationModal);
}

async function handleInvitationSubmit(e) {
    e.preventDefault();
    
    const tripId = invitationTripId.value;
    const name = inviterName.value.trim();
    const email = invitedEmail.value.trim() || null;
    const message = invitationMessage.value.trim() || null;
    const uses = parseInt(maxUses.value);
    
    if (!name) {
        invitationStatus.textContent = '⚠️ Nama kamu harus diisi!';
        return;
    }
    
    // Save inviter name untuk next time
    localStorage.setItem('lastInviterName', name);
    
    // Disable button
    generateInvitationBtn.disabled = true;
    generateInvitationBtn.textContent = '⏳ Membuat link...';
    invitationStatus.textContent = '';
    
    // Create invitation
    const result = await createTripInvitation({
        tripId: tripId,
        inviterName: name,
        invitedEmail: email,
        message: message,
        maxUses: uses
    });
    
    if (result.success) {
        // Show success result
        invitationResult.style.display = 'block';
        generatedInvitationUrl.value = result.invitationUrl;
        
        invitationStatus.textContent = '';
        
        // Auto-select URL for easy copy
        generatedInvitationUrl.select();
        
        // Change button text
        generateInvitationBtn.textContent = '✅ Link Berhasil Dibuat!';
        
    } else {
        invitationStatus.textContent = '❌ Gagal membuat link: ' + result.error;
        generateInvitationBtn.disabled = false;
        generateInvitationBtn.textContent = '🔗 Generate Link Undangan';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    const closeTripDetail = document.getElementById('closeTripDetail');
    const backToList = document.getElementById('backToList');
    const regenerateTicketBtn = document.getElementById('regenerateTicketBtn');
    const closeReviewModal = document.getElementById('closeReviewModal');
    const cancelReview = document.getElementById('cancelReview');
    const reviewForm = document.getElementById('reviewForm');
    const reviewPhoto = document.getElementById('reviewPhoto');
    const tripUpdated = localStorage.getItem('tripUpdated');
    const updatedTripId = localStorage.getItem('updatedTripId');
    invitationModal = document.getElementById('invitationModal');
    invitationForm = document.getElementById('invitationForm');
    inviterName = document.getElementById('inviterName');
    invitedEmail = document.getElementById('invitedEmail');
    invitationMessage = document.getElementById('invitationMessage');
    maxUses = document.getElementById('maxUses');
    invitationTripId = document.getElementById('invitationTripId');
    invitationResult = document.getElementById('invitationResult');
    generatedInvitationUrl = document.getElementById('generatedInvitationUrl');
    invitationStatus = document.getElementById('invitationStatus');
    closeInvitationModal = document.getElementById('closeInvitationModal');
    cancelInvitation = document.getElementById('cancelInvitation');
    generateInvitationBtn = document.getElementById('generateInvitationBtn');
    copyInvitationBtn = document.getElementById('copyInvitationBtn');
    
    // Initial load
    const success = await fetchAllData();
    if (success) {
        const stats = calculateStats();
        renderStats(stats);
        renderTimeline();
    }
    if (tripUpdated === 'true' && updatedTripId) {
        // Show success notification
        showUpdateSuccessNotification();
        
        // Scroll to updated trip (optional)
        setTimeout(() => {
            const updatedCard = document.querySelector(`.trip-card[data-trip-id="${updatedTripId}"]`);
            if (updatedCard) {
                updatedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                updatedCard.classList.add('trip-updated-highlight');
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    updatedCard.classList.remove('trip-updated-highlight');
                }, 3000);
            }
        }, 500);
        
        // Clear flags
        localStorage.removeItem('tripUpdated');
        localStorage.removeItem('updatedTripId');
    }
    
    // Apply filter
    applyFilterBtn.addEventListener('click', async () => {
        const start = filterStartDate.value;
        const end = filterEndDate.value;
        
        document.getElementById('loadingHistory').style.display = 'flex';
        document.getElementById('tripTimeline').style.display = 'none';
        
        const success = await fetchAllData(start, end);
        if (success) {
            const stats = calculateStats();
            renderStats(stats);
            renderTimeline();
        }
    });
    
    // Reset filter
    resetFilterBtn.addEventListener('click', async () => {
        filterStartDate.value = '';
        filterEndDate.value = '';
        
        document.getElementById('loadingHistory').style.display = 'flex';
        document.getElementById('tripTimeline').style.display = 'none';
        
        const success = await fetchAllData();
        if (success) {
            const stats = calculateStats();
            renderStats(stats);
            renderTimeline();
        }
    });
    
    // Close trip detail modal
    closeTripDetail.addEventListener('click', () => {
        hideModal(document.getElementById('tripDetailModal'));
    });
    
    backToList.addEventListener('click', () => {
        hideModal(document.getElementById('tripDetailModal'));
    });
    
    // Regenerate ticket from detail modal
    regenerateTicketBtn.addEventListener('click', () => {
        if (selectedTripId) {
            regenerateTicket(selectedTripId);
        }
    });
    
    // Close review modal
    closeReviewModal.addEventListener('click', () => {
        hideModal(document.getElementById('reviewModal'));
        if (selectedTripId) {
            showTripDetail(selectedTripId);
        }
    });
    
    cancelReview.addEventListener('click', () => {
        hideModal(document.getElementById('reviewModal'));
        if (selectedTripId) {
            showTripDetail(selectedTripId);
        }
    });
    
    // Photo preview
    reviewPhoto.addEventListener('change', (e) => {
        const preview = document.getElementById('reviewPhotoPreview');
        preview.innerHTML = '';
        
        const files = e.target.files;
        for (let i = 0; i < Math.min(files.length, 5); i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Video preview
    const reviewVideo = document.getElementById('reviewVideo');
    if (reviewVideo) {
        reviewVideo.addEventListener('change', (e) => {
            const preview = document.getElementById('reviewVideoPreview');
            if (!preview) return;
            
            preview.innerHTML = '';
            
            const file = e.target.files[0];
            if (file) {
                // Validate size
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    alert('Video terlalu besar! Maksimal 50MB.');
                    e.target.value = '';
                    return;
                }
                
                // Validate type
                const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Format video tidak didukung! Gunakan MP4, MOV, atau WEBM.');
                    e.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const video = document.createElement('video');
                    video.src = event.target.result;
                    video.controls = true;
                    video.style.maxWidth = '300px';
                    video.style.maxHeight = '200px';
                    video.style.borderRadius = '8px';
                    preview.appendChild(video);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Submit review
    // Submit review
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ideaId = document.getElementById('reviewIdeaId').value;
        const tripId = document.getElementById('reviewTripId').value;
        const reviewText = document.getElementById('reviewText').value.trim();
        const files = document.getElementById('reviewPhoto').files;
        const statusMsg = document.getElementById('reviewStatus');
        const submitBtn = reviewForm.querySelector('button[type="submit"]');
        const videoFile = document.getElementById('reviewVideo').files[0];
        
        const reviewerSelect = document.getElementById('reviewerNameSelectHistory');
        const reviewerInput = document.getElementById('reviewerNameInputHistory');
        const reviewerName = getSelectedReviewerName(reviewerSelect, reviewerInput);
        
        if (currentRating === 0) {
            statusMsg.textContent = '⚠️ Beri minimal 1 bintang!';
            return;
        }
        
        if (!reviewerName) {
            statusMsg.textContent = '⚠️ Pilih atau masukkan nama reviewer!';
            return;
        }
        
        statusMsg.textContent = '⏳ Menyimpan review...';
        submitBtn.disabled = true;
        
        // Upload photos
        let photoUrls = [];
        if (files.length > 0) {
            photoUrls = await uploadImages(files, currentUser.id, 'review');
        } else {
            // Keep old photos if exists
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId &&
                r.reviewer_name == reviewerName
            );
            if (existingReview?.photo_url) {
                photoUrls = existingReview.photo_url;
            }
        }
        
        // Upload video
        let videoUrl = null;
        if (videoFile) {
            statusMsg.textContent = '🎬 Uploading video...';
            videoUrl = await uploadVideo(videoFile, currentUser.id, 'review');
            
            if (!videoUrl) {
                statusMsg.textContent = '❌ Failed to upload video';
                submitBtn.disabled = false;
                return;
            }
            
            // Delete old video if exists
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId &&
                r.reviewer_name == reviewerName
            );
            
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
            // Keep old video if exists
            const existingReview = allReviews.find(r => 
                r.trip_id == tripId && 
                r.idea_id == ideaId &&
                r.reviewer_name == reviewerName
            );
            if (existingReview?.video_url) {
                videoUrl = existingReview.video_url;
            }
        }
        
        const reviewData = {
            idea_id: ideaId,
            trip_id: tripId,
            user_id: currentUser.id,
            review_text: reviewText || null,
            rating: currentRating,
            photo_url: Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : null,
            video_url: videoUrl,
            reviewer_name: reviewerName,
            created_at: new Date().toISOString()
        };
        
        try {
            // ✅ FIX: Correct onConflict dengan reviewer_name
            const { error } = await supabase
                .from('idea_reviews')
                .upsert([reviewData], { 
                    onConflict: 'idea_id,trip_id,reviewer_name',  // ✅ FIXED!
                    ignoreDuplicates: false 
                });
            
            if (error) throw error;
            
            statusMsg.textContent = '✅ Review berhasil disimpan!';
            
            // Reload data
            await fetchAllData();
            const stats = calculateStats();
            renderStats(stats);
            renderTimeline();
            
            setTimeout(() => {
                hideModal(document.getElementById('reviewModal'));
                showTripDetail(tripId);
            }, 1000);
            
        } catch (error) {
            console.error('Error saving review:', error);
            statusMsg.textContent = '❌ Gagal menyimpan: ' + error.message;
        } finally {
            submitBtn.disabled = false;
        }
    });
    // ✅ NEW: Invitation modal events
    if (closeInvitationModal) {
        closeInvitationModal.addEventListener('click', () => {
            hideModal(invitationModal);
        });
    }
    
    if (cancelInvitation) {
        cancelInvitation.addEventListener('click', () => {
            hideModal(invitationModal);
        });
    }
    
    if (invitationForm) {
        invitationForm.addEventListener('submit', handleInvitationSubmit);
    }
    
    if (copyInvitationBtn) {
        copyInvitationBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(generatedInvitationUrl.value);
                copyInvitationBtn.textContent = '✅ Copied!';
                
                setTimeout(() => {
                    copyInvitationBtn.textContent = '📋 Copy';
                }, 2000);
            } catch (err) {
                alert('Gagal copy. Silakan copy manual dengan Ctrl+C');
            }
        });
    }
});