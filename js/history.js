// js/history.js (FIXED RLS Storage & Modal Tampilan)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; 

/* (SEMUA REF DAN VARIABEL SAMA) */
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
const ideaReviewText = document.getElementById('ideaReviewText');
const ideaReviewPhotoInput = document.getElementById('ideaReviewPhotoInput');
const ideaReviewPhotoPreview = document.getElementById('ideaReviewPhotoPreview');
const ideaReviewStatus = document.getElementById('ideaReviewStatus');
const cancelIdeaReview = document.getElementById('cancelIdeaReview');

// Rating UI Refs
const ideaReviewRating = document.getElementById('ideaReviewRating'); 
let selectedRating = 0; 

// UI Ref Tambahan (Image Zoom Modal)
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close-btn');


/* ====== HELPER FUNCTIONS ====== */

function openModalWithImage(event) {
    const imgSrc = event.target.src;
    modalImage.src = imgSrc;
    imageModal.style.display = 'block';
}

if (closeBtn) {
    closeBtn.onclick = function() {
        imageModal.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == imageModal) {
        imageModal.style.display = "none";
    }
}

function renderStars(ratingValue) {
    const fullStar = '★'; 
    const emptyStar = '☆'; 
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += (i <= ratingValue ? fullStar : emptyStar);
    }
    return `<span class="rating-stars" data-rating="${ratingValue}">${stars}</span>`;
}


async function loadIdeaReview(ideaId) {
    if (!ideaId) return { review_text: null, photo_url: null, rating: 0 };

    const { data, error } = await supabase
        .from('idea_reviews')
        .select('review_text, photo_url, rating')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Gagal memuat review ide:', error.message);
        return { review_text: null, photo_url: null, rating: 0 };
    }

    return data[0] || { review_text: null, photo_url: null, rating: 0 };
}

async function uploadReviewPhoto(file, ideaId) {
    if (!file) return null;
    const bucketName = 'trip_reviews'; 
    const filePath = `idea_reviews/${ideaId}_${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
        .from(bucketName) 
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
        // Pesan error diperbarui agar lebih informatif
        throw new Error(`Gagal mengupload foto. Pastikan bucket 'trip_reviews' ada di Supabase Storage dan RLS diaktifkan. Detail: ${uploadError.message}`);
    }
    
    const { data: publicUrlData } = supabase.storage
        .from(bucketName) 
        .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
}


/* ====== LOGIKA UTAMA RIWAYAT ====== */

async function loadHistory() {
    historyList.innerHTML = '<p>Memuat riwayat... ⏳</p>';
    
    // PENCEGAHAN KONFLIK: Sembunyikan modal detail saat memuat list
    historyDetailModal.classList.add('hidden'); 
    
    const { data: history, error } = await supabase
        .from('trip_history')
        .select('id, trip_date, selection_json, secret_message') 
        .order('trip_date', { ascending: false }); 

    if (error) {
        historyList.innerHTML = `<p style="color: var(--color-error);">Gagal memuat riwayat: ${error.message}</p>`;
        return;
    }

    if (history.length === 0) {
        historyList.innerHTML = '<p>Belum ada riwayat tiket yang dibuat.</p>';
        return;
    }

    historyList.innerHTML = '';
    
    const historyWithReviewStatus = await Promise.all(history.map(async (item) => {
        const ideaIds = item.selection_json ? item.selection_json.map(s => s.ideaId).filter(id => id && id.length > 5) : [];
        let totalIdeas = ideaIds.length;
        let reviewedCount = 0;
        
        if (totalIdeas > 0) {
            const reviewChecks = await Promise.all(ideaIds.map(id => loadIdeaReview(id)));
            reviewedCount = reviewChecks.filter(r => r.review_text || r.photo_url || r.rating > 0).length;
        }

        const isReviewed = totalIdeas > 0 && reviewedCount === totalIdeas;
        const reviewText = totalIdeas > 0 
            ? `${reviewedCount}/${totalIdeas} Aktivitas Direview` 
            : 'Tidak ada aktivitas tercatat.';

        return {
            ...item,
            reviewStatus: reviewText,
            isReviewed: isReviewed
        };
    }));


    historyWithReviewStatus.forEach(item => {
        const date = new Date(item.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.dataset.id = item.id;
        itemDiv.innerHTML = `
            <h4>🗓️ Trip pada Tanggal: ${date}</h4>
            <p>Aktivitas: <strong>${item.selection_json ? item.selection_json.length : 0}</strong></p>
            <small style="color: ${item.isReviewed ? 'green' : 'red'};">${item.reviewStatus}</small>
        `;
        
        itemDiv.addEventListener('click', () => {
            document.querySelectorAll('.history-item').forEach(i => i.removeAttribute('data-active'));
            itemDiv.setAttribute('data-active', 'true'); 
            historyListModal.classList.add('hidden'); 
            showHistoryDetail(item); 
        });
        historyList.appendChild(itemDiv);
    });
}

async function showHistoryDetail(tripData) {
    historyDetailList.innerHTML = ''; 
    
    const date = new Date(tripData.trip_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    historyModalTitle.textContent = `Detail Trip: ${date}`;
    historySecretMessage.textContent = tripData.secret_message || "Tidak ada pesan rahasia.";
    
    if (tripData.selection_json) {
        const itemsWithReviews = await Promise.all(tripData.selection_json.map(async (item) => {
            const review = await loadIdeaReview(item.ideaId); 
            return { ...item, review };
        }));

        itemsWithReviews.forEach(item => {
            const li = document.createElement('li');
            li.className = 'review-item';
            
            const reviewText = item.review.review_text || 'Belum ada review.';
            const reviewPhoto = item.review.photo_url 
                ? `<img src="${item.review.photo_url}" alt="Review Foto" style="cursor: pointer;">` 
                : '';
            
            const ratingDisplay = item.review.rating > 0 
                ? `<p style="font-size: 1.2em; margin: 0 0 5px 0;">${renderStars(item.review.rating)}</p>` 
                : '';

            li.innerHTML = `
                <div style="font-weight: bold;">${item.name} (${item.subtype})</div>
                <div class="review-status">${item.review.review_text || item.review.photo_url || item.review.rating > 0 ? '✅ Direview' : '❌ Belum Direview'}</div>
                <div class="review-content">
                    ${ratingDisplay}
                    <p style="white-space: pre-wrap; margin: 0;">${reviewText}</p>
                    ${reviewPhoto}
                </div>
                <button class="btn secondary btn-small review-btn" 
                        data-idea-id="${item.ideaId}" 
                        data-idea-name="${item.name}">
                    ${item.review.review_text || item.review.photo_url || item.review.rating > 0 ? 'Edit Review' : 'Tulis Review'}
                </button>
                <hr style="border: none; border-top: 1px dashed var(--color-secondary); margin: 10px 0;">
            `;
            historyDetailList.appendChild(li);
        });
        
        document.querySelectorAll('.review-btn').forEach(btn => {
            btn.addEventListener('click', handleReviewButtonClick);
        });
    }

    historyDetailModal.classList.remove('hidden');
}


/* ====== LOGIKA MODAL REVIEW PER IDE ====== */

async function handleReviewButtonClick(e) {
    const ideaId = e.target.dataset.ideaId;
    const ideaName = e.target.dataset.ideaName;
    
    showIdeaReviewModal(ideaId, ideaName);
}

function setupRatingListeners() {
    if (!ideaReviewRating) return;

    ideaReviewRating.innerHTML = ''; 

    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.textContent = '☆';
        star.dataset.value = i;
        star.classList.add('star');
        star.addEventListener('click', () => {
            selectedRating = i;
            updateStarDisplay(i);
        });
        star.addEventListener('mouseover', () => {
            updateStarDisplay(i, true); 
        });
        star.addEventListener('mouseout', () => {
            updateStarDisplay(selectedRating); 
        });
        ideaReviewRating.appendChild(star);
    }
}

function updateStarDisplay(rating, isHover = false) {
    document.querySelectorAll('.star').forEach(star => {
        const starValue = parseInt(star.dataset.value);
        star.textContent = starValue <= rating ? '★' : '☆';
    });
}

async function showIdeaReviewModal(ideaId, ideaName) {
    ideaReviewForm.reset();
    ideaReviewPhotoPreview.innerHTML = '';
    ideaReviewStatus.textContent = '';
    reviewIdeaId.value = ideaId;
    reviewIdeaName.textContent = ideaName;
    
    const existingReview = await loadIdeaReview(ideaId);
    
    ideaReviewText.value = existingReview.review_text || '';
    selectedRating = existingReview.rating || 0; 
    updateStarDisplay(selectedRating); 
    
    if (existingReview.photo_url) {
        const img = document.createElement('img');
        img.src = existingReview.photo_url;
        img.style.maxWidth = '100%';
        ideaReviewPhotoPreview.appendChild(img);
        ideaReviewStatus.textContent = "Review foto yang sudah ada. Unggah baru untuk mengganti.";
        ideaReviewStatus.style.color = 'gray';
    } else {
        ideaReviewStatus.textContent = "Anda belum me-review tempat ini.";
        ideaReviewStatus.style.color = 'gray';
    }

    ideaReviewModal.classList.remove('hidden');
}

async function handleIdeaReviewSubmit(e) {
    e.preventDefault();
    const ideaId = reviewIdeaId.value;
    const review = ideaReviewText.value;
    const rating = selectedRating; 
    const photoFile = ideaReviewPhotoInput.files[0];
    let photoUrl = null;

    if (!review && !photoFile && rating === 0) {
        ideaReviewStatus.textContent = "Tuliskan review, berikan rating, atau unggah foto terlebih dahulu.";
        ideaReviewStatus.style.color = 'red';
        return;
    }
    
    const submitBtn = document.getElementById('submitIdeaReviewBtn');
    submitBtn.textContent = 'Memproses... ⏳';
    submitBtn.disabled = true;

    try {
        if (photoFile) {
            photoUrl = await uploadReviewPhoto(photoFile, ideaId);
        }

        const insertObject = { 
            idea_id: ideaId, 
            review_text: review, 
            rating: rating, 
            user_id: currentUser.id 
        };
        if (photoUrl) {
             insertObject.photo_url = photoUrl;
        }
        
        await supabase.from('idea_reviews').delete().eq('idea_id', ideaId).eq('user_id', currentUser.id);

        const { error: insertError } = await supabase
            .from('idea_reviews')
            .insert(insertObject);

        if (insertError) throw insertError;

        ideaReviewStatus.textContent = 'Review berhasil disimpan! ✨';
        ideaReviewStatus.style.color = 'green';
        
        const activeTripItem = document.querySelector('.history-item[data-active="true"]');
        if (activeTripItem) {
             const { data: tripData } = await supabase.from('trip_history').select('*').eq('id', activeTripItem.dataset.id).single();
             showHistoryDetail(tripData); 
        }

    } catch (error) {
        console.error('Gagal submit review ide:', error);
        // Tampilkan error yang lebih spesifik
        ideaReviewStatus.textContent = `${error.message}`; 
        ideaReviewStatus.style.color = 'red';
    } finally {
        submitBtn.textContent = 'Kirim Review ✨';
        submitBtn.disabled = false;
        
        setTimeout(() => { 
            if(ideaReviewStatus.style.color === 'green') {
                ideaReviewModal.classList.add('hidden'); 
            }
        }, 3000); 
    }
}


/* ====== SETUP EVENT LISTENERS ====== */

function setupHistoryEventListeners() {
    // 1. Tampilkan Modal Riwayat List
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
    
    // 6. Handle klik pada foto review di detail trip (untuk zoom)
    if (historyDetailModal) {
        historyDetailModal.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG' && e.target.closest('.review-content')) {
                openModalWithImage({ target: e.target });
            }
        });
    }
    
    setupRatingListeners();
}

// Inisialisasi Listener
setupHistoryEventListeners();