// js/history.js (Revisi: Review Per Trip & Kalkulasi Rata-Rata)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; 

/* ====== Supabase Config dan Referensi UI ====== */
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
let currentUser = { id: 'anon' }; 

// UI Refs Modal History
const viewHistoryBtn = document.getElementById('viewHistoryBtn'); 
const historyListModal = document.getElementById('historyListModal'); 
const closeHistoryListModal = document.getElementById('closeHistoryListModal'); 
const historyList = document.getElementById('historyList'); 
const historyDetailModal = document.getElementById('historyDetailModal'); 
const cancelReview = document.getElementById('cancelReview'); 
const historyDetailList = document.getElementById('historyDetailList');
const historyModalTitle = document.getElementById('historyModalTitle');
const historySecretMessage = document.getElementById('historySecretMessage');

// UI Refs Modal Review Per Ide
const ideaReviewModal = document.getElementById('ideaReviewModal');
const reviewIdeaName = document.getElementById('reviewIdeaName');
const ideaReviewForm = document.getElementById('ideaReviewForm');
const reviewIdeaId = document.getElementById('reviewIdeaId');
const reviewTripId = document.getElementById('reviewTripId'); // PERUBAHAN: Tambah ini di HTML
const ideaReviewText = document.getElementById('ideaReviewText');
const ideaReviewPhotoInput = document.getElementById('ideaReviewPhotoInput');
const ideaReviewPhotoPreview = document.getElementById('ideaReviewPhotoPreview');
const ideaReviewStatus = document.getElementById('ideaReviewStatus');
const submitIdeaReviewBtn = document.getElementById('submitIdeaReviewBtn');
const cancelIdeaReview = document.getElementById('cancelIdeaReview');

// Star Rating Global State
let currentRating = 0;
const ideaReviewRatingDiv = document.getElementById('ideaReviewRating');

// =========================================================
// 1. UTILITY & RENDER
// =========================================================

function formatTanggalIndonesia(date) {
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateAverageRating(allReviewsForIdea) {
    if (!allReviewsForIdea || allReviewsForIdea.length === 0) {
        return { average: 0, count: 0 };
    }
    const sum = allReviewsForIdea.reduce((total, review) => total + (review.rating || 0), 0);
    const average = (sum / allReviewsForIdea.length);
    return { 
        average: average.toFixed(1), // Satu angka di belakang koma
        count: allReviewsForIdea.length 
    };
}

function renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews) {
    // Current Trip Review: Review spesifik untuk IdeaID ini di TripID ini.
    const isReviewedInThisTrip = currentTripReview !== null;
    const reviewInTripHtml = `<span class="rating-stars">${'★'.repeat(currentTripReview?.rating || 0)}${'☆'.repeat(5 - (currentTripReview?.rating || 0))}</span>`;
    const buttonText = isReviewedInThisTrip ? 'Ubah Review Trip ⭐' : 'Beri Review Trip ⭐';
    
    // Global Review: Rata-rata dari SEMUA review untuk IdeaID ini.
    const { average, count } = calculateAverageRating(allIdeaReviews);
    const globalRatingHtml = `<span class="rating-stars">${'★'.repeat(Math.round(average))}${'☆'.repeat(5 - Math.round(average))}</span>`;

    return `
        <div class="idea-detail-item">
            <div class="idea-header">
                <div class="idea-icon">${idea.icon || '📍'}</div>
                <div>
                    <h4>${idea.name}</h4>
                    <p class="idea-subtitle">${idea.cat} / ${idea.subtype}</p>
                </div>
            </div>

            <div class="review-global-summary">
                <p><strong>Rata-Rata Global:</strong> ${globalRatingHtml} (${average} dari ${count} ulasan)</p>
                <p><strong>Ulasan Trip Ini:</strong> 
                    ${isReviewedInThisTrip ? reviewInTripHtml : 'Belum diulas di trip ini.'}
                </p>
            </div>

            <button class="btn secondary small review-btn" 
                    data-idea-id="${idea.ideaId}" 
                    data-idea-name="${idea.name}"
                    data-trip-id="${tripId}">
                ${buttonText}
            </button>

            ${isReviewedInThisTrip ? `
                <div class="review-content">
                    <p><strong>Review Anda di Trip Ini:</strong> ${currentTripReview.review_text || '-'}</p>
                    ${currentTripReview.photo_url ? `<img src="${currentTripReview.photo_url}" alt="Foto Review" class="review-photo">` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// =========================================================
// 2. FUNGSI PERSISTENSI REVIEW PER TRIP
// =========================================================

function openIdeaReviewModal(ideaId, ideaName, tripId) {
    // 1. Reset Form & State
    ideaReviewForm.reset();
    ideaReviewStatus.textContent = '';
    currentRating = 0;
    ideaReviewPhotoPreview.innerHTML = '';
    
    // 2. Set Idea ID dan Trip ID
    reviewIdeaId.value = ideaId;
    reviewIdeaName.textContent = ideaName;
    reviewTripId.value = tripId; // KRITIS: Simpan Trip ID

    // 3. Ambil Review SPESIFIK yang Sudah Ada (Berdasarkan IdeaID & TripID)
    supabase
        .from('idea_reviews')
        .select('*')
        .eq('idea_id', ideaId)
        .eq('user_id', currentUser.id)
        .eq('trip_id', tripId) // KRITIS: Filter berdasarkan Trip ID
        .single()
        .then(({ data, error }) => {
            if (data) {
                // Isi form dengan data review trip ini
                ideaReviewText.value = data.review_text || '';
                currentRating = data.rating || 0;
                
                // Set bintang di UI
                document.querySelectorAll('.star').forEach(star => {
                    const starValue = parseInt(star.dataset.value);
                    star.textContent = starValue <= currentRating ? '★' : '☆';
                });
                
                if (data.photo_url) {
                    ideaReviewPhotoPreview.innerHTML = `<img src="${data.photo_url}" alt="Foto Review Lama" style="max-height: 150px; object-fit: contain;">`;
                }
                submitIdeaReviewBtn.textContent = 'Ubah Review Trip ✨';

            } else {
                // Tidak ada review lama untuk trip ini
                document.querySelectorAll('.star').forEach(star => star.textContent = '☆');
                submitIdeaReviewBtn.textContent = 'Kirim Review Trip ✨';
            }
            
            // 4. Tampilkan Modal
            ideaReviewModal.classList.remove('hidden');
        })
        .catch(err => {
            console.error('Gagal memuat review lama:', err);
            ideaReviewModal.classList.remove('hidden');
        });
}

// =========================================================
// 3. FUNGSI UTAMA DISPLAY TRIP DETAILS
// =========================================================

async function showTripDetails(tripId) {
    historyDetailList.innerHTML = '';
    historyDetailModal.classList.remove('hidden');
    historyListModal.classList.add('hidden');
    historyDetailModal.dataset.tripId = tripId; 

    // 1. Ambil Data Riwayat Trip
    const { data: tripData, error: tripError } = await supabase
        .from('trip_history')
        .select('*')
        .eq('id', tripId)
        .single();

    if (tripError || !tripData) {
        historyDetailList.innerHTML = '<p>Gagal memuat detail trip.</p>';
        return;
    }

    const selections = tripData.selection_json || [];
    historyModalTitle.textContent = `Riwayat Trip: ${tripData.trip_day}`;
    historySecretMessage.innerHTML = tripData.secret_message ? `<p class="secret-message-detail">Pesan Rahasia: ${tripData.secret_message}</p>` : '';

    const ideaIdsInTrip = selections.map(s => s.ideaId).filter(id => id);

    // 2. Ambil SEMUA Data Review Terkait (untuk semua ideaIds)
    // KRITIS: Kita harus ambil SEMUA review untuk kalkulasi rata-rata global
    let allReviewsData = [];
    if (ideaIdsInTrip.length > 0) {
        const { data: reviews, error: reviewsError } = await supabase
            .from('idea_reviews')
            .select('*')
            .in('idea_id', ideaIdsInTrip)
            .eq('user_id', currentUser.id);
        
        if (reviewsError) {
            console.error("Gagal memuat semua reviews:", reviewsError);
        } else {
            allReviewsData = reviews;
        }
    }
    
    // Map reviews menjadi { ideaId: [review1, review2, ...], ... } untuk rata-rata global
    const allReviewsMap = allReviewsData.reduce((map, review) => {
        if (!map[review.idea_id]) {
            map[review.idea_id] = [];
        }
        map[review.idea_id].push(review);
        return map;
    }, {});

    // Map reviews menjadi { ideaId: reviewObject } untuk review SPESIFIK trip ini
    const currentTripReviewsMap = allReviewsData
        .filter(review => review.trip_id === tripId)
        .reduce((map, review) => {
            map[review.idea_id] = review;
            return map;
        }, {});


    // 3. Render HTML
    let htmlContent = '';
    const daysSelected = (tripData.trip_day || '').split(' & ').map(d => d.trim());
    
    // Tampilkan pemisah hari
    daysSelected.forEach(day => {
        htmlContent += `<h3 class="day-separator">Aktivitas ${day}</h3>`;
    });
    
    htmlContent += `<div class="all-ideas-list">`;
    selections.forEach(idea => {
        const currentTripReview = currentTripReviewsMap[idea.ideaId] || null;
        const allIdeaReviews = allReviewsMap[idea.ideaId] || [];
        
        // KRITIS: Panggil renderIdeaDetail dengan data review spesifik & global
        htmlContent += renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews);
    });
    htmlContent += `</div>`;
    
    historyDetailList.innerHTML = htmlContent;

    // 4. Event Listener untuk Tombol Review
    document.querySelectorAll('.review-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const ideaId = e.target.dataset.ideaId;
            const ideaName = e.target.dataset.ideaName;
            const tripId = e.target.dataset.tripId; // Ambil Trip ID dari tombol
            
            openIdeaReviewModal(ideaId, ideaName, tripId);
        });
    });
}


// =========================================================
// 4. FUNGSI SUBMIT REVIEW
// =========================================================

async function handleIdeaReviewSubmit(e) {
    e.preventDefault();
    
    const ideaId = reviewIdeaId.value;
    const tripId = reviewTripId.value; // KRITIS: Ambil Trip ID dari hidden input
    const reviewText = ideaReviewText.value.trim();
    const rating = currentRating;
    
    if (!ideaId || !tripId) {
        alert('Data trip atau ide tidak lengkap. Coba muat ulang.');
        return;
    }

    if (rating === 0) {
        alert('Mohon berikan rating minimal 1 bintang.');
        return;
    }

    ideaReviewStatus.textContent = 'Mengirim review...';
    submitIdeaReviewBtn.disabled = true;

    // Logika upload foto dihilangkan untuk fokus pada konsep inti.
    let photoUrl = null; 
    
    const reviewData = {
        idea_id: ideaId,
        user_id: currentUser.id, // 'anon'
        trip_id: tripId, // KRITIS: Tambahkan Trip ID
        review_text: reviewText,
        rating: rating,
        photo_url: photoUrl
    };

    try {
        // Menggunakan UPSERT dengan ON CONFLICT (idea_id, user_id, trip_id)
        // Ini memastikan hanya ada satu review per idea_id per user_id PER TRIP_ID
        const { error } = await supabase
            .from('idea_reviews')
            .upsert(
                reviewData,
                { 
                    onConflict: 'idea_id, user_id, trip_id', // KRITIS: Tiga kolom untuk conflict
                    columns: 'review_text, rating, photo_url, created_at' // Tambahkan created_at untuk update timestamp
                }
            );

        if (error) {
            console.error('Error submitting review:', error);
            alert(`Gagal mengirim review: ${error.message}.`);
            ideaReviewStatus.textContent = `Gagal: ${error.message}`;
            
        } else {
            alert('Review berhasil disimpan/diubah! 🎉');
            ideaReviewModal.classList.add('hidden');
            
            // Refresh detail trip agar review baru muncul dan kalkulasi terupdate
            if (tripId) {
                showTripDetails(tripId);
            }
        }
    } catch (e) {
        console.error('Exception during review submission:', e);
        alert('Terjadi kesalahan tak terduga saat mengirim review.');
        ideaReviewStatus.textContent = `Kesalahan: ${e.message}`;
    }

    submitIdeaReviewBtn.disabled = false;
}

// ... (Fungsi loadHistory dan setupStarRating sama) ...
async function loadHistory() {
    // ... (Kode loadHistory lama)
    const { data: trips, error } = await supabase
        .from('trip_history')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        historyList.innerHTML = '<p>Gagal memuat riwayat: ' + error.message + '</p>';
        return;
    }

    if (trips.length === 0) {
        historyList.innerHTML = '<p>Anda belum membuat riwayat trip. Silakan buat satu!</p>';
        return;
    }

    historyList.innerHTML = trips.map(trip => `
        <div class="history-item" data-id="${trip.id}">
            <h4>${trip.trip_day} (${formatTanggalIndonesia(trip.created_at)})</h4>
            <p>${trip.selection_json.length} Aktivitas | ${trip.secret_message ? 'Ada Pesan Rahasia' : 'Tidak Ada Pesan'}</p>
        </div>
    `).join('');
    
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => showTripDetails(item.dataset.id));
    });
}

function setupStarRating() {
    if (!ideaReviewRatingDiv) return;
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.dataset.value = i;
        star.textContent = '☆'; 
        star.addEventListener('click', () => {
            currentRating = i;
            document.querySelectorAll('.star').forEach(s => {
                const starValue = parseInt(s.dataset.value);
                s.textContent = starValue <= currentRating ? '★' : '☆';
            });
        });
        ideaReviewRatingDiv.appendChild(star);
    }
}


// =========================================================
// 5. EVENT LISTENERS
// =========================================================

// 1. Tampil Modal Riwayat List
if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
        loadHistory();
        historyListModal.classList.remove('hidden');
    });
}

// 2. Tutup Modal Riwayat List
if (closeHistoryListModal) {
    closeHistoryListModal.addEventListener('click', () => {
        historyListModal.classList.add('hidden');
    });
}

// 3. Tutup Modal Detail/Review (Kembali ke List)
if (cancelReview) {
    cancelReview.addEventListener('click', () => {
        historyDetailModal.classList.add('hidden');
        loadHistory(); 
        historyListModal.classList.remove('hidden'); 
    });
}

// 4. Tutup Modal Review Per Ide
if (cancelIdeaReview) {
    cancelIdeaReview.addEventListener('click', () => {
        ideaReviewModal.classList.add('hidden');
    });
}

// 5. Submit Form Review Per Ide
if (ideaReviewForm) {
    ideaReviewForm.addEventListener('submit', handleIdeaReviewSubmit);
}

// Init
setupStarRating();