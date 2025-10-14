// js/history.js (REVISI FINAL: Memastikan Inisialisasi & Tampilan Modal Instan)

import { supabase } from './supabaseClient.js'; 
let currentUser = { id: 'anon' }; 

// Deklarasi variabel referensi global 
let viewHistoryBtn, historyListModal, historyList, historyDetailModal, 
    cancelReview, historyDetailList, historyModalTitle, historySecretMessage, 
    ideaReviewModal, reviewIdeaName, ideaReviewForm, reviewIdeaId, reviewTripId, 
    ideaReviewText, ideaReviewPhotoInput, ideaReviewPhotoPreview, ideaReviewStatus, 
    submitIdeaReviewBtn, cancelIdeaReview, ideaReviewRatingDiv,
    closeHistoryListModal, backToHistoryList; // <-- Tambah backToHistoryList

let currentRating = 0;
let currentTrip = null; 
let allReviewsCache = []; 


// =========================================================
// 1. UTILITY & RENDER
// =========================================================

function formatTanggalIndonesia(date) {
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getPublicImageUrl(photoUrl) {
    if (!photoUrl) return 'images/placeholder.jpg';
    if (photoUrl.startsWith('http')) return photoUrl;
    try {
        // Asumsi nama bucket Supabase Storage adalah 'trip-ideas-images'
        const { data } = supabase.storage
            .from('trip-ideas-images') 
            .getPublicUrl(photoUrl);
        return data.publicUrl || photoUrl; 
    } catch (e) {
        console.error("Error getting public URL:", e);
        return photoUrl;
    }
}

function calculateAverageRating(allReviewsForIdea) {
    if (!allReviewsForIdea || allReviewsForIdea.length === 0) {
        return { average: 0, count: 0 };
    }
    const sum = allReviewsForIdea.reduce((total, review) => total + (review.rating || 0), 0);
    const average = (sum / allReviewsForIdea.length);
    return { 
        average: average.toFixed(1), 
        count: allReviewsForIdea.length 
    };
}

function renderStars(rating, isAverage = true) {
    const roundedRating = isAverage ? Math.round(parseFloat(rating)) : rating;
    const filled = '★'.repeat(roundedRating);
    const empty = '☆'.repeat(5 - roundedRating);
    return `<span class="rating-stars">${filled}${empty}</span>`;
}


function renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews) {
    const isReviewedInThisTrip = currentTripReview !== null;
    const reviewInTripHtml = renderStars(currentTripReview?.rating || 0, false);
    const buttonText = isReviewedInThisTrip ? 'Ubah Review Trip ⭐' : 'Beri Review Trip ⭐';
    
    const { average, count } = calculateAverageRating(allIdeaReviews);
    const globalRatingHtml = renderStars(average);

    return `
        <div class="idea-detail-item">
            <div class="idea-header">
                <div class="idea-icon">${idea.icon || '📍'}</div>
                <div>
                    <h4>${idea.name}</h4>
                    <p class="idea-subtitle">${idea.category} / ${idea.subtype}</p>
                </div>
            </div>

            <div class="review-global-summary">
                <p><strong>Rata-Rata Global:</strong> ${globalRatingHtml} (${average} dari ${count} ulasan)</p>
                <p><strong>Ulasan Trip Ini:</strong> 
                    ${isReviewedInThisTrip ? reviewInTripHtml : 'Belum diulas di trip ini.'}
                </p>
            </div>

            <button class="btn secondary small review-btn-handler" 
                    data-idea-id="${idea.idea_id}" 
                    data-idea-name="${idea.name}"
                    data-trip-id="${tripId}">
                ${buttonText}
            </button>

            ${isReviewedInThisTrip ? `
                <div class="review-content">
                    <p><strong>Review Anda di Trip Ini:</strong> ${currentTripReview.review_text || '-'}</p>
                    ${currentTripReview.photo_url ? `<img src="${getPublicImageUrl(currentTripReview.photo_url)}" alt="Foto Review" class="review-photo">` : ''}
                </div>
            ` : ''}
        </div>
    `;
}


// =========================================================
// 2. DATA FETCHING (Hanya memuat data, tanpa mengatur display)
// =========================================================

async function loadHistory() {
    if (!historyList) return;
    historyList.innerHTML = '<p>Memuat riwayat trip...</p>';
    
    // 1. Ambil semua trip history
    const { data: trips, error: tripError } = await supabase
        .from('trip_history')
        .select('*')
        .eq('user_id', currentUser.id || 'anon')
        .order('trip_date', { ascending: false });

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

function renderHistoryList(trips) {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (!trips || trips.length === 0) {
        historyList.innerHTML = '<p>Belum ada riwayat trip tersimpan.</p>';
        return;
    }

    trips.forEach(trip => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.dataset.tripId = trip.id;
        item.innerHTML = `
            <h4>Trip ${formatTanggalIndonesia(trip.trip_date)} (${trip.trip_day})</h4>
            <p>${trip.selection_json.length} aktivitas terpilih.</p>
        `;
        
        item.addEventListener('click', () => showTripDetails(trip.id));
        historyList.appendChild(item);
    });
}


async function showTripDetails(tripId) {
    // Sembunyikan list, tampilkan detail
    if (historyListModal) {
        historyListModal.classList.add('hidden');
        historyListModal.style.display = 'none'; 
    }
    
    if (historyDetailModal) {
        historyDetailModal.classList.remove('hidden');
        historyDetailModal.style.display = 'block'; 
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

    currentTrip = trip; // Simpan trip yang sedang dilihat
    
    // Update header modal detail
    if (historyModalTitle) historyModalTitle.textContent = `Trip ${formatTanggalIndonesia(trip.trip_date)} (${trip.trip_day})`;
    if (historySecretMessage) historySecretMessage.textContent = trip.secret_message || 'Tidak ada pesan rahasia.';
    
    historyDetailList.innerHTML = '';
    
    // 2. Filter reviews yang relevan untuk trip ini
    const reviewsForThisTrip = allReviewsCache.filter(r => r.trip_id == tripId);
    
    trip.selection_json.forEach(idea => {
        // Cari review spesifik untuk ide ini di trip ini
        const currentTripReview = reviewsForThisTrip.find(r => r.idea_id == idea.idea_id) || null;
        
        // Cari semua review untuk ide ini (global)
        const allIdeaReviews = allReviewsCache.filter(r => r.idea_id == idea.idea_id);

        const ideaDetailHtml = renderIdeaDetail(tripId, idea, currentTripReview, allIdeaReviews);
        historyDetailList.innerHTML += ideaDetailHtml;
    });
    
    // KRITIS: Tambahkan listener untuk tombol review yang baru di-render
    document.querySelectorAll('.review-btn-handler').forEach(button => {
        button.addEventListener('click', (e) => {
            const ideaId = e.currentTarget.dataset.ideaId;
            const ideaName = e.currentTarget.dataset.ideaName;
            const tripId = e.currentTarget.dataset.tripId;
            
            // Cari review yang sudah ada
            const existingReview = reviewsForThisTrip.find(r => r.idea_id == ideaId);

            showReviewModal(tripId, ideaId, ideaName, existingReview);
        });
    });
}


function showReviewModal(tripId, ideaId, ideaName, existingReview = null) {
    if (historyDetailModal) {
        historyDetailModal.classList.add('hidden');
        historyDetailModal.style.display = 'none'; 
    }

    if (ideaReviewModal) {
        ideaReviewModal.classList.remove('hidden');
        ideaReviewModal.style.display = 'block';
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
    
    // Isi form jika ada review yang sudah ada
    if (existingReview) {
        if (ideaReviewText) ideaReviewText.value = existingReview.review_text || '';
        currentRating = existingReview.rating || 0;
        
        if (existingReview.photo_url && ideaReviewPhotoPreview) {
            ideaReviewPhotoPreview.innerHTML = `<img src="${getPublicImageUrl(existingReview.photo_url)}" alt="Review Photo Preview" style="max-width: 100px; height: auto; border-radius: 4px;">`;
        }
        if (submitIdeaReviewBtn) submitIdeaReviewBtn.textContent = 'Ubah Review ✨';
    } else {
        if (submitIdeaReviewBtn) submitIdeaReviewBtn.textContent = 'Kirim Review ✨';
    }

    // Render ulang bintang dengan rating yang sudah ada
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
            // Update tampilan semua bintang
            document.querySelectorAll('#ideaReviewRatingDiv .star').forEach(s => {
                const starValue = parseInt(s.dataset.value);
                s.textContent = starValue <= currentRating ? '★' : '☆';
            });
        });
        container.appendChild(star);
    }
}


// =========================================================
// 4. MAIN INIT & EVENT LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi semua referensi UI
    viewHistoryBtn = document.getElementById('viewHistoryBtn'); 
    historyListModal = document.getElementById('historyListModal'); 
    closeHistoryListModal = document.getElementById('closeHistoryListModal'); 
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
    backToHistoryList = document.getElementById('backToHistoryList'); // <-- Ambil referensi tombol baru

    
    // 1. Tampil Modal Riwayat List
    if (viewHistoryBtn && historyListModal) { 
        viewHistoryBtn.addEventListener('click', () => {
            historyListModal.style.display = 'block'; 
            historyListModal.classList.remove('hidden');
            loadHistory(); 
        });
    }

    // 2. Tutup Modal Riwayat List (Tombol X/Tutup)
    if (closeHistoryListModal && historyListModal) {
        closeHistoryListModal.addEventListener('click', () => {
            historyListModal.classList.add('hidden');
            historyListModal.style.display = 'none'; 
        });
    }
    
    // 2.5 Tutup Modal Riwayat List (Tombol Batal di bawah)
    const cancelHistoryList = document.getElementById('cancelHistoryList');
    if (cancelHistoryList && historyListModal) {
        cancelHistoryList.addEventListener('click', () => {
            historyListModal.classList.add('hidden');
            historyListModal.style.display = 'none'; 
        });
    }

    // 3. Tutup Modal Detail/Review (Tombol X atau Kembali ke Daftar Trip)
    const detailModalCloseHandler = () => {
        historyDetailModal.classList.add('hidden');
        historyDetailModal.style.display = 'none'; 
        loadHistory(); 
        historyListModal.classList.remove('hidden'); 
        historyListModal.style.display = 'block'; 
    };

    if (cancelReview) {
        cancelReview.addEventListener('click', detailModalCloseHandler);
    }
    
    // KRITIS: Menambahkan event listener untuk tombol 'Kembali ke Daftar Trip'
    if (backToHistoryList) {
        backToHistoryList.addEventListener('click', detailModalCloseHandler);
    }

    // 4. Tutup Modal Review Per Ide (Kembali ke Detail Trip)
    if (cancelIdeaReview && ideaReviewModal && historyDetailModal) {
        cancelIdeaReview.addEventListener('click', () => {
            ideaReviewModal.classList.add('hidden');
            ideaReviewModal.style.display = 'none'; 
    
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            } else {
                historyDetailModal.classList.add('hidden');
                historyDetailModal.style.display = 'none';
                historyListModal.classList.remove('hidden');
                historyListModal.style.display = 'block';
            }
        });
    }

    // 5. GLOBAL LISTENER: Tutup modal saat klik di luar konten modal (backdrop)
    window.addEventListener('click', (event) => {
        // ... (Logika backdrop tetap sama) ...
        if (historyListModal && event.target === historyListModal) {
            historyListModal.classList.add('hidden');
            historyListModal.style.display = 'none';
        }
        if (historyDetailModal && event.target === historyDetailModal) {
            detailModalCloseHandler();
        }
        if (ideaReviewModal && event.target === ideaReviewModal) {
            ideaReviewModal.classList.add('hidden');
            ideaReviewModal.style.display = 'none'; 
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            }
        }
    });

    // 6. Submit Review 
    if (ideaReviewForm) {
        ideaReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ideaId = reviewIdeaId.value;
            const tripId = reviewTripId.value;
            const reviewText = ideaReviewText.value.trim();
            const rating = currentRating;
            const imageFile = ideaReviewPhotoInput.files[0];

            if (rating === 0) {
                if (ideaReviewStatus) ideaReviewStatus.textContent = 'Beri minimal 1 bintang!';
                return;
            }

            if (ideaReviewStatus) ideaReviewStatus.textContent = 'Memproses...';
            if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = true;

            let photoUrl = null;
            
            const existingReview = allReviewsCache.find(r => r.idea_id == ideaId && r.trip_id == tripId);
            const oldPhotoUrl = existingReview?.photo_url;
            
            // --- Proses Upload Foto ---
            if (imageFile) {
                const fileExtension = imageFile.name.split('.').pop();
                const path = `${currentUser.id}/review-${tripId}-${ideaId}-${Date.now()}.${fileExtension}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('trip-ideas-images') 
                    .upload(path, imageFile, {
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) {
                    console.error('Supabase photo upload error', uploadError);
                    if (ideaReviewStatus) ideaReviewStatus.textContent = `Gagal upload foto: ${uploadError.message}`;
                    if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false;
                    return;
                }
                photoUrl = uploadData.path; 
                
                if (oldPhotoUrl && oldPhotoUrl !== photoUrl) {
                     const { error: removeError } = await supabase.storage
                        .from('trip-ideas-images')
                        .remove([oldPhotoUrl]);
                    if (removeError) {
                         console.warn('Gagal menghapus foto lama:', removeError);
                    }
                }

            } else {
                photoUrl = oldPhotoUrl || null; 
            }


            // --- Proses Simpan Review (UPSERT) ---
            const { error } = await supabase
                .from('idea_reviews')
                .upsert({ 
                    idea_id: ideaId, 
                    trip_id: tripId, 
                    user_id: currentUser.id,
                    rating: rating,
                    review_text: reviewText,
                    photo_url: photoUrl,
                    created_at: new Date().toISOString()
                }, { 
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
            
            // Muat ulang cache review
            const { data: reviews, error: reviewError } = await supabase.from('idea_reviews').select('*');
            if (!reviewError) allReviewsCache = reviews;

            setTimeout(() => {
                if (ideaReviewModal) {
                    ideaReviewModal.classList.add('hidden');
                    ideaReviewModal.style.display = 'none';
                }
                
                showTripDetails(tripId);
            }, 1000);
        });
    }


    // Event listener untuk preview foto di modal review
    if (ideaReviewPhotoInput) {
        ideaReviewPhotoInput.addEventListener('change', (e) => {
            if (!ideaReviewPhotoPreview) return;
            ideaReviewPhotoPreview.innerHTML = '';
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    ideaReviewPhotoPreview.innerHTML = `<img src="${event.target.result}" alt="Review Photo Preview" style="max-width: 100px; height: auto; border-radius: 4px;">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

});