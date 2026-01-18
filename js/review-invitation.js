// js/review-invitation.js
// Handle review dari invitation link

import { supabase } from './supabaseClient.js';
import { 
    validateInvitationToken, 
    incrementInvitationUse 
} from './invitation-utils.js';
import {
    getPublicImageUrl,
    uploadImages,
    uploadVideo,
    formatTanggalIndonesia,
    showModal,
    hideModal
} from './utils.js';

let currentUser = { id: 'anon' };
let currentInvitation = null;
let currentTrip = null;
let activitiesToReview = [];
let currentActivityIndex = 0;
let currentRating = 0;
let reviewerName = '';
let completedReviews = [];

// UI References
const loadingEl = document.getElementById('loadingInvitation');
const errorEl = document.getElementById('invitationError');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const detailsEl = document.getElementById('invitationDetails');
const inviterNameDisplay = document.getElementById('inviterNameDisplay');
const tripTitleDisplay = document.getElementById('tripTitleDisplay');
const tripDateDisplay = document.getElementById('tripDateDisplay');
const tripActivitiesCount = document.getElementById('tripActivitiesCount');
const invitationMessageDisplay = document.getElementById('invitationMessageDisplay');
const activitiesList = document.getElementById('activitiesList');
const reviewerNameInput = document.getElementById('reviewerNameInvitation');
const startReviewBtn = document.getElementById('startReviewBtn');

const reviewModal = document.getElementById('reviewActivityModal');
const activityNameDisplay = document.getElementById('activityNameDisplay');
const activityReviewForm = document.getElementById('activityReviewForm');
const currentIdeaId = document.getElementById('currentIdeaId');
const currentTripId = document.getElementById('currentTripId');
const activityStarRating = document.getElementById('activityStarRating');
const activityReviewText = document.getElementById('activityReviewText');
const activityReviewPhoto = document.getElementById('activityReviewPhoto');
const activityReviewVideo = document.getElementById('activityReviewVideo');
const activityReviewPhotoPreview = document.getElementById('activityReviewPhotoPreview');
const activityReviewVideoPreview = document.getElementById('activityReviewVideoPreview');
const activityReviewStatus = document.getElementById('activityReviewStatus');
const closeReviewActivity = document.getElementById('closeReviewActivity');
const skipActivity = document.getElementById('skipActivity');

const completionScreen = document.getElementById('completionScreen');
const completionSummary = document.getElementById('completionSummary');

// ============================================================
// MAIN LOGIC
// ============================================================

async function initInvitationPage() {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
        showError('Link Tidak Valid', 'Link undangan tidak lengkap atau rusak.');
        return;
    }
    
    // Validate token
    const validation = await validateInvitationToken(token);
    
    if (!validation.valid) {
        showError('Link Tidak Valid', validation.error);
        return;
    }
    
    currentInvitation = validation.invitation;
    currentTrip = validation.trip;
    
    // Display invitation details
    displayInvitationDetails();
}

function showError(title, message) {
    loadingEl.style.display = 'none';
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorEl.style.display = 'block';
}

function displayInvitationDetails() {
    loadingEl.style.display = 'none';
    detailsEl.style.display = 'block';
    
    // Header info
    inviterNameDisplay.textContent = currentInvitation.inviter_name || 'Seseorang';
    
    const tripDate = formatTanggalIndonesia(currentTrip.trip_date);
    tripTitleDisplay.textContent = `Trip ${tripDate} (${currentTrip.trip_day})`;
    tripDateDisplay.textContent = tripDate;
    
    // Show invitation message if exists
    if (currentInvitation.invitation_message) {
        invitationMessageDisplay.style.display = 'block';
        invitationMessageDisplay.querySelector('p').textContent = 
            `"${currentInvitation.invitation_message}"`;
    }
    
    // Activities list
    activitiesToReview = currentTrip.selection_json || [];
    tripActivitiesCount.textContent = `${activitiesToReview.length} aktivitas`;
    
    renderActivitiesList();
}

function renderActivitiesList() {
    activitiesList.innerHTML = '';
    
    activitiesToReview.forEach((activity, index) => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <span class="activity-number">${index + 1}</span>
            <div class="activity-info">
                <span class="activity-name">${activity.name}</span>
                <span class="activity-category">${activity.category} / ${activity.subtype}</span>
            </div>
        `;
        activitiesList.appendChild(item);
    });
}

// ============================================================
// START REVIEW FLOW
// ============================================================

function startReviewFlow() {
    reviewerName = reviewerNameInput.value.trim();
    
    if (!reviewerName) {
        alert('⚠️ Masukkan nama kamu dulu ya!');
        reviewerNameInput.focus();
        return;
    }
    
    // Save reviewer name to localStorage
    localStorage.setItem('lastReviewerName', reviewerName);
    
    // Increment invitation use count
    incrementInvitationUse(currentInvitation.id);
    
    // Hide details, start reviewing
    detailsEl.style.display = 'none';
    currentActivityIndex = 0;
    showNextActivity();
}

function showNextActivity() {
    if (currentActivityIndex >= activitiesToReview.length) {
        // All done!
        showCompletionScreen();
        return;
    }
    
    const activity = activitiesToReview[currentActivityIndex];
    
    // Reset form
    activityReviewForm.reset();
    activityReviewPhotoPreview.innerHTML = '';
    activityReviewVideoPreview.innerHTML = '';
    activityReviewStatus.textContent = '';
    currentRating = 0;
    
    // Set current activity
    activityNameDisplay.textContent = activity.name;
    currentIdeaId.value = activity.idea_id;
    currentTripId.value = currentTrip.id;
    
    // Render stars
    setupStarRating(0);
    
    // Show modal
    showModal(reviewModal);
}

function setupStarRating(initialRating) {
    activityStarRating.innerHTML = '';
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
        
        activityStarRating.appendChild(star);
    }
}

// ============================================================
// SUBMIT REVIEW
// ============================================================

async function handleReviewSubmit(e) {
    e.preventDefault();
    
    const ideaId = currentIdeaId.value;
    const tripId = currentTripId.value;
    const reviewText = activityReviewText.value.trim();
    const photoFiles = activityReviewPhoto.files;
    const videoFile = activityReviewVideo.files[0];
    
    if (currentRating === 0) {
        activityReviewStatus.textContent = '⚠️ Beri minimal 1 bintang!';
        return;
    }
    
    activityReviewStatus.textContent = '⏳ Menyimpan review...';
    const submitBtn = activityReviewForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    
    // Upload photos
    let photoUrls = [];
    if (photoFiles.length > 0) {
        photoUrls = await uploadImages(photoFiles, currentUser.id, 'review');
    }
    
    // Upload video
    let videoUrl = null;
    if (videoFile) {
        activityReviewStatus.textContent = '🎬 Uploading video...';
        videoUrl = await uploadVideo(videoFile, currentUser.id, 'review');
        
        if (!videoUrl) {
            activityReviewStatus.textContent = '❌ Gagal upload video';
            submitBtn.disabled = false;
            return;
        }
    }
    
    // Prepare review data
    const reviewData = {
        idea_id: ideaId,
        trip_id: tripId,
        user_id: currentUser.id,
        review_text: reviewText || null,
        rating: currentRating,
        photo_url: photoUrls.length > 0 ? photoUrls : null,
        video_url: videoUrl,
        reviewer_name: reviewerName,
        created_at: new Date().toISOString()
    };

    // Check if review already exists
    const { data: existingReview, error: checkError } = await supabase
        .from('idea_reviews')
        .select('id')
        .eq('idea_id', ideaId)
        .eq('trip_id', tripId)
        .eq('reviewer_name', reviewerName)
        .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing review:', checkError);
        activityReviewStatus.textContent = '❌ Gagal cek review: ' + checkError.message;
        submitBtn.disabled = false;
        return;
    }

    let error;

    if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
            .from('idea_reviews')
            .update(reviewData)
            .eq('id', existingReview.id);
        error = updateError;
    } else {
        // Insert new review
        const { error: insertError } = await supabase
            .from('idea_reviews')
            .insert([reviewData]);
        error = insertError;
    }

    if (error) {
        console.error('Error saving review:', error);
        activityReviewStatus.textContent = '❌ Gagal menyimpan: ' + error.message;
        submitBtn.disabled = false;
        return;
    }
    
    // ✅ SUCCESS - Track completed review
    completedReviews.push({
        name: activitiesToReview[currentActivityIndex].name,
        rating: currentRating
    });
    
    activityReviewStatus.textContent = '✅ Review tersimpan!';
    
    // Next activity
    setTimeout(() => {
        hideModal(reviewModal);
        currentActivityIndex++;
        showNextActivity();
    }, 1000);
}

function skipCurrentActivity() {
    currentActivityIndex++;
    hideModal(reviewModal);
    showNextActivity();
}

// ============================================================
// COMPLETION SCREEN
// ============================================================

function showCompletionScreen() {
    detailsEl.style.display = 'none';
    completionScreen.style.display = 'block';
    
    // Render summary
    completionSummary.innerHTML = '';
    
    if (completedReviews.length === 0) {
        completionSummary.innerHTML = '<p>Kamu belum memberikan review 🙈</p>';
    } else {
        completedReviews.forEach(review => {
            const stars = '⭐'.repeat(review.rating);
            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
                <span class="summary-name">${review.name}</span>
                <span class="summary-rating">${stars}</span>
            `;
            completionSummary.appendChild(item);
        });
    }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initInvitationPage();
    
    // Start review button
    if (startReviewBtn) {
        startReviewBtn.addEventListener('click', startReviewFlow);
    }
    
    // Close modal
    if (closeReviewActivity) {
        closeReviewActivity.addEventListener('click', () => {
            if (confirm('Yakin mau keluar? Review belum selesai.')) {
                hideModal(reviewModal);
            }
        });
    }
    
    // Skip activity
    if (skipActivity) {
        skipActivity.addEventListener('click', skipCurrentActivity);
    }
    
    // Submit review
    if (activityReviewForm) {
        activityReviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Photo preview
    if (activityReviewPhoto) {
        activityReviewPhoto.addEventListener('change', (e) => {
            activityReviewPhotoPreview.innerHTML = '';
            const files = e.target.files;
            for (let i = 0; i < Math.min(files.length, 5); i++) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    activityReviewPhotoPreview.appendChild(img);
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }
    
    // Video preview
    if (activityReviewVideo) {
        activityReviewVideo.addEventListener('change', (e) => {
            activityReviewVideoPreview.innerHTML = '';
            const file = e.target.files[0];
            if (file) {
                // Validate
                const maxSize = 50 * 1024 * 1024;
                if (file.size > maxSize) {
                    alert('Video terlalu besar! Maksimal 50MB.');
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
                    activityReviewVideoPreview.appendChild(video);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Pre-fill reviewer name if saved
    const savedName = localStorage.getItem('lastReviewerName');
    if (savedName && reviewerNameInput) {
        reviewerNameInput.value = savedName;
    }
});