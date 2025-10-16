// js/history.js (REVISI FINAL: Filter Tanggal Aktif + Tampilkan Multiple Foto Review)

import { supabase } from './supabaseClient.js'; 
let currentUser = { id: 'anon' }; 

// Deklarasi variabel referensi global 
let viewHistoryBtn, historyListModal, historyList, historyDetailModal, 
    cancelReview, historyDetailList, historyModalTitle, historySecretMessage, 
    ideaReviewModal, reviewIdeaName, ideaReviewForm, reviewIdeaId, reviewTripId, 
    ideaReviewText, ideaReviewPhotoInput, ideaReviewPhotoPreview, ideaReviewStatus, 
    submitIdeaReviewBtn, cancelIdeaReview, ideaReviewRatingDiv,
    closeHistoryListModal, backToHistoryList,
    // START: VARIABEL BARU UNTUK FILTER TANGGAL
    filterStartDate, filterEndDate, applyHistoryFilterBtn; 
    // END: VARIABEL BARU

let currentRating = 0;
let currentTrip = null; 
let allReviewsCache = []; 


// =========================================================
// 1. UTILITY & RENDER
// =========================================================
async function uploadImages(files){
    if (!files || files.length === 0) return [];
    const uid = currentUser.id || 'anon';
    const uploadedUrls = [];
    
    for (const file of files) {
        // Tambah subfolder 'review' dan gunakan timestamp untuk keunikan
        const path = `${uid}/review/${Date.now()}_${file.name}`; 
        
        const { error } = await supabase.storage
          .from('trip-ideas-images') 
          .upload(path, file);

        if (error) {
            console.error(`Supabase Storage upload error for ${file.name}`, error);
            continue; 
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('trip-ideas-images')
          .getPublicUrl(path);

        uploadedUrls.push(publicUrlData.publicUrl);
    }

    return uploadedUrls; // Mengembalikan ARRAY of public URLs
}

function formatTanggalIndonesia(date) {
    return new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

// FUNGSI GANTI: getPublicImageUrl (Digunakan untuk mendapatkan URL dari path Supabase, tapi sekarang berhati-hati saat memproses Array)
// KRITIS: Fungsi ini sekarang hanya akan mengolah *satu* URL yang diberikan, dan tidak otomatis mengambil elemen pertama Array. 
// Rendering Array harus ditangani oleh pemanggil fungsi (misalnya: renderPhotoUrls).
function getPublicImageUrl(photoUrl) {
    let urlToProcess = photoUrl;
    
    // Handle Null, Undefined, atau nilai falsy lainnya
    if (!urlToProcess) {
        return 'images/placeholder.jpg';
    }

    // KRITIS: Pastikan urlToProcess benar-benar string sebelum memanggil startsWith
    if (typeof urlToProcess !== 'string' || urlToProcess === '') {
        return 'images/placeholder.jpg';
    }

    // Proses URL
    if (urlToProcess.startsWith('http')) return urlToProcess; 
    
    // Logic untuk Supabase path
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

// FUNGSI BARU: Untuk me-render banyak URL foto
function renderPhotoUrls(photoUrls, className = 'review-photo') {
    let urls = photoUrls;
    
    // Jika hanya string tunggal (skema lama), ubah menjadi array
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
        // Panggil getPublicImageUrl untuk memastikan URL publik yang valid
        const publicUrl = getPublicImageUrl(url);
        // Abaikan placeholder jika ini adalah array
        if (publicUrl !== 'images/placeholder.jpg') {
            html += `<img src="${publicUrl}" alt="Foto Review" class="${className}">`;
        }
    });
    html += '</div>';
    return html;
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

    // KRITIS: Gunakan fungsi renderPhotoUrls BARU
    const reviewPhotoHtml = isReviewedInThisTrip ? renderPhotoUrls(currentTripReview.photo_url) : '';

    return `
        <div class="idea-detail-item">
            <div class="idea-header">
                <div class="idea-icon">==========================================</div>
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
                    ${reviewPhotoHtml} 
                </div>
            ` : ''}
        </div>
    `;
}


// =========================================================
// 2. DATA FETCHING (DENGAN FILTER TANGGAL)
// =========================================================

async function loadHistory(startDate = null, endDate = null) { 
    if (!historyList) return;
    historyList.innerHTML = '<p>Memuat riwayat trip...</p>';
    
    let query = supabase
        .from('trip_history')
        .select('*')
        .eq('user_id', currentUser.id || 'anon')
        .order('trip_date', { ascending: false });

    // START: LOGIKA FILTER TANGGAL BARU
    if (startDate) {
        // Filter trip yang TANGGALNYA LEBIH BESAR atau SAMA DENGAN start date
        query = query.gte('trip_date', startDate); 
    }
    if (endDate) {
        // Filter trip yang TANGGALNYA LEBIH KECIL atau SAMA DENGAN end date
        query = query.lte('trip_date', endDate);
    }
    // END: LOGIKA FILTER TANGGAL BARU
    
    // 1. Ambil semua trip history
    const { data: trips, error: tripError } = await query; // <-- Eksekusi query dengan filter

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
    
    // Tampilkan pesan jika filter menghasilkan 0 data
    if (!trips || trips.length === 0) {
        // Cek apakah filter diterapkan
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
        
        // KRITIS: Tampilkan pratinjau foto review yang sudah ada (handle array)
        if (ideaReviewPhotoPreview) {
            let photoUrls = existingReview.photo_url;

            // Jika hanya string tunggal, ubah menjadi array
            if (typeof photoUrls === 'string' && photoUrls.length > 0) {
                photoUrls = [photoUrls];
            } else if (!Array.isArray(photoUrls)) {
                photoUrls = [];
            }
            
            if (photoUrls.length > 0) {
                photoUrls.forEach((url, index) => {
                    const publicUrl = getPublicImageUrl(url);
                    // Pastikan bukan placeholder
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
    // START PERUBAHAN KRITIS: Menggunakan ID baru dari tombol penutup Modal Riwayat Trip
    closeHistoryListModal = document.getElementById('closeHistoryListBtn'); 
    // END PERUBAHAN KRITIS
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
    
    // START: INISIALISASI UI FILTER BARU
    filterStartDate = document.getElementById('filterStartDate');
    filterEndDate = document.getElementById('filterEndDate');
    applyHistoryFilterBtn = document.getElementById('applyHistoryFilterBtn');
    // END: INISIALISASI UI FILTER BARU
    
    
    // Handler untuk kembali ke daftar trip (digunakan di beberapa tempat)
    const backToHistoryListHandler = () => {
        // Reset filter
        if (filterStartDate) filterStartDate.value = '';
        if (filterEndDate) filterEndDate.value = '';

        if (historyDetailModal) {
            historyDetailModal.classList.add('hidden');
            historyDetailModal.style.display = 'none';
        }
        
        loadHistory(); 
        if (historyListModal) {
            historyListModal.classList.remove('hidden'); 
            historyListModal.style.display = 'block';
        }
    };


    // 1. Tampil Modal Riwayat List
    if (viewHistoryBtn && historyListModal) { 
        viewHistoryBtn.addEventListener('click', () => {
            historyListModal.style.display = 'block'; 
            historyListModal.classList.remove('hidden');
            loadHistory(); // Memuat tanpa filter saat pertama kali dibuka
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


    // 3. Tutup Modal Detail/Review (Tombol Batal atau Kembali ke Daftar Trip)
    if (cancelReview) {
        cancelReview.addEventListener('click', backToHistoryListHandler);
    }
    
    if (backToHistoryList) {
        backToHistoryList.addEventListener('click', backToHistoryListHandler);
    }


    // 4. Tutup Modal Review Per Ide (Kembali ke Detail Trip)
    if (cancelIdeaReview && ideaReviewModal && historyDetailModal) {
        cancelIdeaReview.addEventListener('click', () => {
            ideaReviewModal.classList.add('hidden');
            ideaReviewModal.style.display = 'none'; 
    
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            } else {
                backToHistoryListHandler();
            }
        });
    }

    // KRITIS: 5. Listener untuk Terapkan Filter Tanggal
    if (applyHistoryFilterBtn) {
        applyHistoryFilterBtn.addEventListener('click', () => {
            const start = filterStartDate.value;
            const end = filterEndDate.value;

            if (!start && end) {
                alert('Jika Anda mengisi "Sampai Tanggal", Anda harus mengisi "Dari Tanggal" juga.');
                return;
            }
            
            // Panggil loadHistory dengan filter yang dipilih
            loadHistory(start, end);
        });
    }

    // 6. GLOBAL LISTENER: Tutup modal saat klik di luar konten modal (backdrop)
    window.addEventListener('click', (event) => {
        // ... (Logika backdrop tetap sama) ...
        if (historyListModal && event.target === historyListModal) {
            historyListModal.classList.add('hidden');
            historyListModal.style.display = 'none';
        }
        if (historyDetailModal && event.target === historyDetailModal) {
            backToHistoryListHandler(); // Kembali ke daftar trip
        }
        if (ideaReviewModal && event.target === ideaReviewModal) {
            ideaReviewModal.classList.add('hidden');
            ideaReviewModal.style.display = 'none'; 
            if (currentTrip) {
                showTripDetails(currentTrip.id);
            }
        }
    });

    // 7. Submit Review 
    if (ideaReviewForm) {
        ideaReviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const ideaId = reviewIdeaId.value;
            const tripId = reviewTripId.value;
            const reviewText = ideaReviewText.value.trim();
            const rating = currentRating;
            const fileList = ideaReviewPhotoInput.files; // KRITIS: Ambil SEMUA FileList

            if (rating === 0) {
                if (ideaReviewStatus) ideaReviewStatus.textContent = 'Beri minimal 1 bintang!';
                return;
            }

            if (ideaReviewStatus) ideaReviewStatus.textContent = 'Memproses...';
            if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = true;

            // --- 1. PROSES PENGAMBILAN & UPLOAD FOTO ---
            
            // Cari review yang sudah ada untuk mendapatkan URL foto lama
            const existingReview = allReviewsCache.find(r => r.idea_id == ideaId && r.trip_id == tripId);
            const oldPhotoUrl = existingReview?.photo_url; 
            
            let uploadedUrls = [];
            
            if (fileList.length > 0) {
                // Panggil fungsi uploadImages (yang menangani multiple file)
                uploadedUrls = await uploadImages(fileList); 
                
                if (uploadedUrls.length === 0) {
                    ideaReviewStatus.textContent = 'Gagal mengupload foto. Coba lagi.';
                    if (submitIdeaReviewBtn) submitIdeaReviewBtn.disabled = false;
                    return;
                }
                
                // LOGIKA PENGHAPUSAN FOTO LAMA:
                // Kita berasumsi setiap upload baru menggantikan semua foto lama.
                // KRITIS: Hati-hati dengan penghapusan. Supabase getPublicUrl mengembalikan URL penuh, 
                // sementara fungsi remove membutuhkan path storage.
                
                // Saat ini, kita mempertahankan LOGIKA Anda: 
                // 1. Jika skema lama adalah STRING tunggal (path Supabase), hapus.
                // 2. Jika skema lama adalah ARRAY (URL publik), lewatkan penghapusan karena path Supabase tidak tersedia.
                // **PENTING**: Jika Anda ingin menghapus foto lama yang merupakan ARRAY URL publik, Anda perlu mengimplementasikan
                // fungsi untuk mengekstrak path storage dari URL publik tersebut, tapi untuk saat ini, kita ikuti logika yang ada.
                let pathsToRemove = [];
                if (typeof oldPhotoUrl === 'string' && oldPhotoUrl.length > 0 && !oldPhotoUrl.startsWith('http')) {
                    // Jika skema lama adalah String tunggal (path Supabase), hapus.
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
                // Jika pengguna tidak memilih file baru, pertahankan URL foto lama
                if (existingReview?.photo_url) {
                    uploadedUrls = existingReview.photo_url;
                }
            }


            // --- 2. PROSES SIMPAN REVIEW (UPSERT) ---
            const reviewData = {
                idea_id: ideaId,
                trip_id: tripId,
                user_id: currentUser.id || 'anon',
                review_text: reviewText || null,
                rating: rating || 0,
                // KRITIS: Simpan ARRAY of URL jika ada, atau kembalikan ke String lama/null
                photo_url: Array.isArray(uploadedUrls) && uploadedUrls.length > 0 ? uploadedUrls : (typeof uploadedUrls === 'string' ? uploadedUrls : null),
                created_at: new Date().toISOString() // Pertahankan created_at Anda
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


    // Di dalam fungsi setupEventListeners()
// KRITIS: GANTI BLOK INI (Sesuai dengan kode Anda yang sudah benar untuk pratinjau multi-foto)
    if (ideaReviewPhotoInput) {
        ideaReviewPhotoInput.addEventListener('change', (e) => {
            if (!ideaReviewPhotoPreview) return;
            ideaReviewPhotoPreview.innerHTML = '';
            
            const files = e.target.files; // KRITIS: Ambil SEMUA file
            if (files.length > 0) {
                // Tampilkan semua pratinjau
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
                        img.style.marginRight = '10px'; // Jarak antar foto
                        img.style.marginBottom = '10px';
                        img.style.display = 'inline-block'; // Agar bisa bersebelahan
                        ideaReviewPhotoPreview.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }   
// LANJUTKAN KE BLOK SUBMIT

});