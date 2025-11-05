// js/main.js (Logika utama - Seleksi Click vs Detail Button)

import { supabase } from './supabaseClient.js'; 

let currentUser = { id: 'anon' }; 


// ✅ TAMBAHKAN REFERENSI UI UNTUK FIELD BARU (di bagian deklarasi variabel)
const ideaAddress = document.getElementById('ideaAddress');
const ideaMapsUrl = document.getElementById('ideaMapsUrl');
const ideaPhone = document.getElementById('ideaPhone');
const ideaOpeningHours = document.getElementById('ideaOpeningHours');
const ideaPriceRange = document.getElementById('ideaPriceRange');
const ideaWebsite = document.getElementById('ideaWebsite');
const ideaNotes = document.getElementById('ideaNotes');
// UI refs (Hanya yang terkait fungsi utama)
const activityArea = document.getElementById('activityArea');
const generateBtn = document.getElementById('generateBtn');
const addIdeaBtn = document.getElementById('addIdeaBtn');
const modal = document.getElementById('modal');
const ideaForm = document.getElementById('ideaForm');
const ideaCategory = document.getElementById('ideaCategory');
const ideaSubtype = document.getElementById('ideaSubtype');
// HILANG: const ideaDay = document.getElementById('ideaDay'); // <-- Dihapus dari UI dan JS
const ideaTitle = document.getElementById('ideaTitle'); 
const cancelIdea = document.getElementById('cancelIdea');
const countdownDisplay = document.getElementById('countdownDisplay'); 
const secretMessage = document.getElementById('secretMessage'); 
const activityCount = document.getElementById('activityCount'); // SPAN untuk angka
const countDisplay = document.getElementById('countDisplay'); // DIV wrapper

// Modal Refs untuk Image Zoom 
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close-btn');
const closeImageModalBtn = document.getElementById('closeImageModal'); // Menggunakan ID yang spesifik

// Input KUSTOM dan FOTO
const newCategoryInput = document.getElementById('newCategoryInput');
const newSubtypeInput = document.getElementById('newSubtypeInput'); 
const ideaImageInput = document.getElementById('ideaImageInput'); 

// NEW: IDEA DETAIL MODAL REFS
const ideaDetailModal = document.getElementById('ideaDetailModal');
const detailIdeaName = document.getElementById('detailIdeaName');
const detailIdeaImage = document.getElementById('detailIdeaImage');
const detailRatingSummary = document.getElementById('detailRatingSummary');
const detailReviewList = document.getElementById('detailReviewList');
const noReviewsMessage = document.getElementById('noReviewsMessage');
const closeDetailModal = document.getElementById('closeDetailModal');

const editInfoModal = document.getElementById('editInfoModal');
const editInfoForm = document.getElementById('editInfoForm');
const editInfoIdeaId = document.getElementById('editInfoIdeaId');
const editInfoIdeaName = document.getElementById('editInfoIdeaName');
const editInfoAddress = document.getElementById('editInfoAddress');
const editInfoMapsUrl = document.getElementById('editInfoMapsUrl');
const editInfoPhone = document.getElementById('editInfoPhone');
const editInfoOpeningHours = document.getElementById('editInfoOpeningHours');
const editInfoPriceRange = document.getElementById('editInfoPriceRange');
const editInfoWebsite = document.getElementById('editInfoWebsite');
const editInfoNotes = document.getElementById('editInfoNotes');
const closeEditInfoModal = document.getElementById('closeEditInfoModal');
const cancelEditInfo = document.getElementById('cancelEditInfo');

// NEW: INPUT TANGGAL TRIP
const tripDateInput = document.getElementById('tripDateInput'); 

// === DITAMBAHKAN UNTUK PENCEGAHAN DOUBLE SUBMIT ===
// Referensi tombol submit form ide (Asumsi memiliki type="submit" di dalam ideaForm)
const submitIdeaBtn = document.querySelector('#ideaForm button[type="submit"]');

// Cache data
let categoriesCache = [];
let ideasCache = [];
let ideaRatings = {}; // { 'idea_id': { average: 4.5, count: 10 } }
let allReviews = []; 

// KRITIS: STATE UNTUK MELACAK IDE YANG DIPILIH
let selectedIdeaIds = new Set();


window.editIdeaInfo = function(ideaId) {
    const idea = ideasCache.find(i => i.id === ideaId);
    if (!idea) {
        alert('Ide tidak ditemukan!');
        return;
    }
    
    // Populate form dengan data yang sudah ada
    if (editInfoIdeaId) editInfoIdeaId.value = ideaId;
    if (editInfoIdeaName) editInfoIdeaName.textContent = idea.idea_name;
    if (editInfoAddress) editInfoAddress.value = idea.address || '';
    if (editInfoMapsUrl) editInfoMapsUrl.value = idea.maps_url || '';
    if (editInfoPhone) editInfoPhone.value = idea.phone || '';
    if (editInfoOpeningHours) editInfoOpeningHours.value = idea.opening_hours || '';
    if (editInfoPriceRange) editInfoPriceRange.value = idea.price_range || '';
    if (editInfoWebsite) editInfoWebsite.value = idea.website || '';
    if (editInfoNotes) editInfoNotes.value = idea.notes || '';
    
    // Tutup modal detail, buka modal edit
    if (ideaDetailModal) {
        ideaDetailModal.classList.add('hidden');
    }
    
    if (editInfoModal) {
        editInfoModal.classList.remove('hidden');
        editInfoModal.style.display = 'block';
    }
};

if (editInfoForm) {
    editInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ideaId = editInfoIdeaId.value;
        const submitBtn = editInfoForm.querySelector('button[type="submit"]');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Menyimpan... ⏳';
        }
        
        // Ambil data dari form
        const updatedInfo = {
            address: editInfoAddress.value.trim() || null,
            maps_url: editInfoMapsUrl.value.trim() || null,
            phone: editInfoPhone.value.trim() || null,
            opening_hours: editInfoOpeningHours.value.trim() || null,
            price_range: editInfoPriceRange.value.trim() || null,
            website: editInfoWebsite.value.trim() || null,
            notes: editInfoNotes.value.trim() || null,
        };
        
        try {
            // Update data di Supabase
            const { error } = await supabase
                .from('trip_ideas_v2')
                .update(updatedInfo)
                .eq('id', ideaId);
            
            if (error) throw error;
            
            // Update cache lokal
            const ideaIndex = ideasCache.findIndex(i => i.id === ideaId);
            if (ideaIndex !== -1) {
                ideasCache[ideaIndex] = {
                    ...ideasCache[ideaIndex],
                    ...updatedInfo
                };
            }
            
            alert('Informasi berhasil diperbarui! 🎉');
            
            // Tutup modal edit
            if (editInfoModal) {
                editInfoModal.classList.add('hidden');
                editInfoModal.style.display = 'none';
            }
            
            // Refresh tampilan detail
            renderIdeaDetailModal(ideaId);
            
        } catch (error) {
            console.error('Error updating info:', error);
            alert('Gagal menyimpan perubahan: ' + error.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '💾 Simpan Perubahan';
            }
        }
    });
}

if (cancelEditInfo && editInfoModal) {
    cancelEditInfo.addEventListener('click', () => {
        editInfoModal.classList.add('hidden');
        editInfoModal.style.display = 'none';
        
        // Kembali ke modal detail
        const ideaId = editInfoIdeaId.value;
        if (ideaId) {
            renderIdeaDetailModal(ideaId);
        }
    });
}

if (editInfoModal) {
    window.addEventListener('click', (event) => {
        if (event.target === editInfoModal) {
            editInfoModal.classList.add('hidden');
            editInfoModal.style.display = 'none';
            
            const ideaId = editInfoIdeaId.value;
            if (ideaId) {
                renderIdeaDetailModal(ideaId);
            }
        }
    });
}

// =================================================================
// 1. UTILITY & DATA FETCHING
// =================================================================

function getNextWeekendDay(dayOfWeek) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Minggu, 6 = Sabtu
    const targetDayMap = { 'Minggu': 0, 'Sabtu': 6 };
    const targetDay = targetDayMap[dayOfWeek];

    let date = new Date(today);
    let diff = targetDay - currentDay;
    if (diff < 0) {
        diff += 7;
    } else if (diff === 0 && today.getHours() >= 18) {
        diff = 7;
    }
    date.setDate(today.getDate() + diff);
    return date.toISOString().split('T')[0]; 
}

function startCountdown() {
    const tripDateString = tripDateInput.value;
    let targetTime;
    let targetDayName = "Hari H";
    
    if (tripDateString) {
        targetTime = new Date(tripDateString).getTime();
        targetDayName = new Date(tripDateString).toLocaleDateString('id-ID', { weekday: 'long' });
    } else {
        const targetSabtu = new Date(getNextWeekendDay('Sabtu')).getTime();
        const targetMinggu = new Date(getNextWeekendDay('Minggu')).getTime();
        targetTime = Math.min(targetSabtu, targetMinggu);
        targetDayName = new Date(targetTime).toLocaleDateString('id-ID', { weekday: 'long' });
    }

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance < 0) {
            clearInterval(interval);
            countdownDisplay.textContent = `Trip sudah dimulai! Selamat bersenang-senang! 🎉`;
            return;
        }

        countdownDisplay.textContent = `Tinggal ${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik lagi menuju ${targetDayName}! ❤️`;
    }, 1000);
}


function getSelectedDays(){
    const date = tripDateInput.value;
    return date ? [date] : [];
}

async function fetchData() {
    // 1. Ambil Kategori
    const { data: categories, error: catError } = await supabase
        .from('idea_categories')
        .select('*');
    if (catError) { console.error('Supabase fetch categories error', catError); }
    categoriesCache = categories || [];

    // 2. Ambil Ide
    const { data: ideas, error: ideaError } = await supabase
        .from('trip_ideas_v2') 
        .select('*, idea_categories (category, subtype, icon, photo_url)') 
        .order('created_at', { ascending: false });
    if (ideaError) { console.error('Supabase fetch ideas error', ideaError); }
    
    ideasCache = (ideas || []).map(idea => ({
        ...idea,
        category_name: idea.idea_categories.category,
        subtype_name: idea.idea_categories.subtype,
        icon: idea.idea_categories.icon,
        photo_url_category: idea.idea_categories.photo_url,
    }));
    
    // START FIX KRITIS: DE-DUPLIKASI DATA DARI ideasCache
    // Ini menangani kasus jika ada ide ganda di trip_ideas_v2 dengan nama yang sama.
    const uniqueIdeasMap = new Map();
    ideasCache.forEach(idea => {
        // Gunakan kombinasi type_key dan idea_name sebagai kunci unik
        if (idea.idea_name) {
            const key = `${idea.type_key}_${idea.idea_name.toLowerCase().trim()}`;
            // Karena data diurutkan berdasarkan created_at DESC, 
            // kita ambil yang pertama (paling baru) jika ada duplikasi
            if (!uniqueIdeasMap.has(key)) {
                uniqueIdeasMap.set(key, idea);
            }
        } else {
            // Jika ada entri tanpa nama (seharusnya tidak terjadi di trip_ideas_v2)
            uniqueIdeasMap.set(idea.id || Date.now(), idea);
        }
    });
    ideasCache = Array.from(uniqueIdeasMap.values());
    // END FIX KRITIS
    
    // 3. Ambil Semua Review 
    const { data: reviews, error: reviewError } = await supabase
        .from('idea_reviews')
        .select('*'); 
    if (reviewError) { console.error('Supabase fetch reviews error', reviewError); }
    
    allReviews = reviews || []; 
    
    const ratingsMap = {};
    (allReviews).forEach(review => {
        const id = review.idea_id;
        const rating = review.rating || 0;
        
        if (!ratingsMap[id]) {
            ratingsMap[id] = { total: 0, count: 0 };
        }
        ratingsMap[id].total += rating;
        ratingsMap[id].count += 1;
    });

    ideaRatings = {};
    for (const id in ratingsMap) {
        const { total, count } = ratingsMap[id];
        ideaRatings[id] = {
            average: (total / count).toFixed(1), 
            count: count
        };
    }
}



// main.js - GANTI TOTAL FUNGSI INI
// function getPublicImageUrl(photoUrl) {
//     let urlToProcess = photoUrl;
    
//    if (Array.isArray(photoUrl)) {
//         if (photoUrl.length === 0) {
//             return 'images/placeholder.jpg';
//         }
//         urlToProcess = photoUrl[0]; // Ambil elemen pertama (String)
//     }

//     // 2. Handle Null, Undefined, atau nilai falsy lainnya
//     if (!urlToProcess) {
//         return 'images/placeholder.jpg';
//     }

//     // 3. KRITIS: Pastikan urlToProcess benar-benar string sebelum memanggil startsWith
//     if (typeof urlToProcess !== 'string' || urlToProcess === '') {
//         return 'images/placeholder.jpg';
//     }

//     // 4. Proses URL
//     if (urlToProcess.startsWith('http')) return urlToProcess; 
    
//     // Logic untuk Supabase path
//     try {
//         const { data } = supabase.storage
//             .from('trip-ideas-images') 
//             .getPublicUrl(urlToProcess);
//         return data.publicUrl || urlToProcess; 
//     } catch (e) {
//         console.error("Error getting public URL:", e);
//         return urlToProcess;
//     }
// }


async function uploadImage(file){
    if (!file) return null;
    const uid = currentUser.id || 'anon';
    const path = `${uid}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage
      .from('trip-ideas-images') 
      .upload(path, file);

    if (error) {
        console.error('Supabase Storage upload error', error);
        alert('Gagal mengupload foto. Cek RLS Storage Anda.');
        return null;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('trip-ideas-images')
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
}

function toggleNewCategoryInput(selectedValue) {
    if (!newCategoryInput) return;
    
    if (selectedValue === 'custom') {
        newCategoryInput.style.display = 'block';
        newCategoryInput.required = true;
    } else {
        newCategoryInput.style.display = 'none';
        newCategoryInput.required = false;
        newCategoryInput.value = '';
    }
}

function toggleNewSubtypeInput(selectedValue) {
    if (!newSubtypeInput) return;
    
    if (selectedValue === 'custom-new') {
        newSubtypeInput.style.display = 'block';
        newSubtypeInput.required = true;
    } else {
        newSubtypeInput.style.display = 'none';
        newSubtypeInput.required = false;
        newSubtypeInput.value = '';
    }
}

function populateIdeaCategorySelect(){
    const uniqueCategories = [...new Set(categoriesCache.map(c => c.category))];
    ideaCategory.innerHTML = '';
    uniqueCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        ideaCategory.appendChild(opt);
    });
    populateIdeaSubtypeSelect(uniqueCategories[0]); 
    const custom = document.createElement('option');
    custom.value = 'custom';
    custom.textContent = 'Tambah kategori baru...';
    ideaCategory.appendChild(custom);
    toggleNewCategoryInput(ideaCategory.value);
}

function populateIdeaSubtypeSelect(selectedCategory){
    ideaSubtype.innerHTML = '';
    if (selectedCategory === 'custom') {
        const opt = document.createElement('option');
        opt.value = 'custom-new';
        opt.textContent = 'Tambahkan Sub-tipe Baru...';
        ideaSubtype.appendChild(opt);
        toggleNewSubtypeInput(ideaSubtype.value); 
        return;
    }
    const subtypes = categoriesCache.filter(c => c.category === selectedCategory);
    subtypes.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.type_key; 
        opt.textContent = sub.subtype;
        ideaSubtype.appendChild(opt);
    });
    const custom = document.createElement('option');
    custom.value = 'custom-new';
    custom.textContent = 'Tambahkan Sub-tipe Baru...';
    ideaSubtype.appendChild(custom);
    toggleNewSubtypeInput(ideaSubtype.value);
}


function setupImageClickHandlers() {
    document.querySelectorAll('#activityArea img').forEach(img => {
        img.removeEventListener('click', openModalWithImage);
        img.addEventListener('click', openModalWithImage);
        img.style.cursor = 'pointer'; 
    });
    
    document.querySelectorAll('#detailReviewList img').forEach(img => {
        img.removeEventListener('click', openModalWithImage);
        img.addEventListener('click', openModalWithImage);
        img.style.cursor = 'pointer';
    });
}

function openModalWithImage(event) {
    // Mencegah klik pada gambar memicu event di elemen parent (.option-item)
    if (event.target.tagName === 'IMG') {
        event.stopPropagation();
    }
    const imgSrc = event.target.src;
    modalImage.src = imgSrc;
    imageModal.style.display = 'block';
}

if (closeBtn) {
    closeBtn.onclick = function() {
        imageModal.style.display = "none";
    }
}

// === FIX MODAL GAMBAR ===
// TUTUP MODAL IMAGE ZOOM
if (closeImageModalBtn && imageModal) {
    closeImageModalBtn.addEventListener('click', () => {
        imageModal.classList.add('hidden');
        imageModal.style.display = 'none'; 
    });
}

window.onclick = function(event) {
    if (event.target == imageModal) {
        imageModal.style.display = "none";
    }
    // NEW: Tutup modal detail jika klik di luar
    if (event.target == ideaDetailModal) {
        ideaDetailModal.classList.add('hidden');
    }
}

function setupDetailsCollapse() {
    document.querySelectorAll('.subtype-details').forEach(details => {
        details.removeEventListener('toggle', handleDetailsToggle); 
        details.addEventListener('toggle', handleDetailsToggle);
    });
}

function handleDetailsToggle(event) {
    const details = event.target;
    if (details.open) {
        const categoryCard = details.closest('.category-card');
        
        categoryCard.querySelectorAll('.subtype-details').forEach(otherDetails => {
            if (otherDetails !== details && otherDetails.open) {
                otherDetails.open = false; 
            }
        });
    }
}

/**
 * Membuat tampilan rating bintang
 */
function createRatingDisplay(ideaId) {
    const ratingData = ideaRatings[ideaId];
    
    if (!ratingData || ratingData.count === 0) {
        return '<div class="rating-display muted">Belum ada review</div>';
    }

    const avg = parseFloat(ratingData.average);
    const roundedRating = Math.round(avg * 2) / 2;
    const starIcon = '★'; 
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            starsHtml += `<span style="color: gold;">${starIcon}</span>`;
        } else if (i - 0.5 === roundedRating) {
            starsHtml += `<span style="color: gold; opacity: 0.5;">${starIcon}</span>`; 
        } else {
            starsHtml += `<span style="color: #ccc;">${starIcon}</span>`;
        }
    }


    return `
        <div class="rating-display">
            <span class="star-icon">${starsHtml}</span>
            <span>${ratingData.average} | ${ratingData.count} Review</span>
        </div>
    `;
}

// main.js (TEMPELKAN DI BAWAH IMPORTS, SEBELUM FUNGSI UTAMA LAINNYA)

// --- Fungsi Utility dari history.js agar bisa dipakai di main.js ---

function getPublicImageUrl(photoUrl) {
    let urlToProcess = photoUrl;
    // KRITIS: Anda harus memastikan 'supabase' client didefinisikan 
    // di main.js agar fungsi ini bekerja, yang sudah Anda lakukan dengan import.
    
    if (!urlToProcess || typeof urlToProcess !== 'string' || urlToProcess === '') {
        return 'images/placeholder.jpg';
    }
    if (urlToProcess.startsWith('http')) return urlToProcess; 
    
    try {
        // Asumsi 'supabase' sudah tersedia via import di main.js
        const { data } = supabase.storage 
            .from('trip-ideas-images') 
            .getPublicUrl(urlToProcess);
        return data.publicUrl || urlToProcess; 
    } catch (e) {
        console.error("Error getting public URL:", e);
        return urlToProcess;
    }
}

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

// --- Akhir Fungsi Utility ---

// ... Lanjutkan dengan fungsi dan event listener lainnya di main.js
// FUNGSI INI AKAN DIPANGGIL OLEH TOMBOL DETAIL
function renderIdeaDetailModal(ideaId) {
    if (ideaId.startsWith('cat-')) return; 

    const idea = ideasCache.find(i => i.id === ideaId);
    if (!idea) return;
    
    let reviews = allReviews.filter(r => r.idea_id === ideaId);
    const ratingData = ideaRatings[ideaId];

    reviews = reviews.filter(r => r && r.created_at); 
    
    // 1. Update Header
    detailIdeaName.textContent = idea.idea_name;
    detailIdeaImage.src = getPublicImageUrl(idea.photo_url);
    detailIdeaImage.onerror = () => detailIdeaImage.src = 'images/placeholder.jpg'; 

    // ✅ 2. RENDER MAPS & INFO SECTION (BARU)
    renderMapsAndInfo(idea);

    // 3. Update Rating Summary
    let avg = 0;
    let reviewCount = 0;

    if (ratingData) {
        avg = parseFloat(ratingData.average);
        reviewCount = ratingData.count;
    }

    if (reviewCount > 0) {
        const fullStars = Math.round(avg);
        const starsHtml = '⭐'.repeat(fullStars);

        detailRatingSummary.innerHTML = `
            <span class="avg-rating">${starsHtml} ${avg.toFixed(1)}</span>
            <span>dari ${reviewCount} Review</span>
        `;
    } else {
        detailRatingSummary.innerHTML = `
            <span class="avg-rating">N/A</span>
            <span>Belum ada review</span>
        `;
    }

    // 4. Update Review List
    detailReviewList.innerHTML = '';

    if (reviews.length > 0) {
        reviews.sort((a, b) => {
            if (!a || !b) return 0; 
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB.getTime() - dateA.getTime(); 
        });

        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';

            const reviewStars = '⭐'.repeat(review.rating || 0);
            const reviewPhotoHtml = renderPhotoUrls(review.photo_url, 'review-photo-main');
            
            reviewItem.innerHTML = `
                <div class="review-rating">${reviewStars}</div>
                <p class="review-text">${review.review_text || '(Tidak ada komentar)'}</p>
                ${reviewPhotoHtml}
            `;

            detailReviewList.appendChild(reviewItem);
        });
        
        if (noReviewsMessage) {
            noReviewsMessage.style.display = 'none';
        }

    } else {
        if (noReviewsMessage) {
            noReviewsMessage.style.display = 'block';
        }
    }

    // 5. Tampilkan Modal
    ideaDetailModal.classList.remove('hidden');
    setupImageClickHandlers(); 
}

// ✅ FUNGSI BARU: Render Maps & Info Section
function renderMapsAndInfo(idea) {
    let mapsInfoContainer = document.getElementById('detailMapsInfo');
    
    if (!mapsInfoContainer) {
        mapsInfoContainer = document.createElement('div');
        mapsInfoContainer.id = 'detailMapsInfo';
        mapsInfoContainer.className = 'detail-maps-info';
        detailIdeaImage.parentNode.insertBefore(mapsInfoContainer, detailIdeaImage.nextSibling);
    }
    
    let html = '';
    
    // ========== GOOGLE MAPS SECTION ==========
    const hasLocation = idea.address || idea.maps_url;
    
    if (hasLocation) {
        let mapsEmbedUrl = '';
        
        if (idea.maps_url) {
            mapsEmbedUrl = convertToEmbedUrl(idea.maps_url);
        } else if (idea.address) {
            const encodedAddress = encodeURIComponent(idea.address);
            mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
        }
        
        html += `
            <div class="maps-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0;">📍 Lokasi</h4>
                    <button class="btn secondary small" onclick="editIdeaInfo('${idea.id}')" style="padding: 6px 12px; font-size: 0.85em;">
                        ✏️ Edit Info
                    </button>
                </div>
                ${idea.address ? `
                    <div class="address-display">
                        <p>📍 ${idea.address}</p>
                    </div>
                ` : ''}
                ${mapsEmbedUrl ? `
                    <div class="maps-container">
                        <iframe
                            width="100%"
                            height="250"
                            frameborder="0"
                            style="border:0; border-radius: 8px;"
                            src="${mapsEmbedUrl}"
                            allowfullscreen>
                        </iframe>
                    </div>
                ` : ''}
                ${idea.maps_url ? `
                    <a href="${idea.maps_url}" target="_blank" class="btn-open-maps">
                        🗺️ Buka di Google Maps
                    </a>
                ` : ''}
            </div>
        `;
    }
    
    // ========== INFO DETAIL SECTION ==========
    const hasInfo = idea.phone || idea.opening_hours || idea.price_range || idea.website || idea.notes;
    
    if (hasInfo) {
        html += `
            <div class="info-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0;">ℹ️ Informasi Detail</h4>
                    ${!hasLocation ? `
                        <button class="btn secondary small" onclick="editIdeaInfo('${idea.id}')" style="padding: 6px 12px; font-size: 0.85em;">
                            ✏️ Edit Info
                        </button>
                    ` : ''}
                </div>
                <div class="info-grid">
        `;
        
        if (idea.phone) {
            html += `
                <div class="info-item">
                    <span class="info-label">📞 Telepon:</span>
                    <span class="info-value">
                        <a href="tel:${idea.phone}">${idea.phone}</a>
                    </span>
                </div>
            `;
        }
        
        if (idea.opening_hours) {
            html += `
                <div class="info-item">
                    <span class="info-label">🕐 Jam Buka:</span>
                    <span class="info-value">${idea.opening_hours}</span>
                </div>
            `;
        }
        
        if (idea.price_range) {
            html += `
                <div class="info-item">
                    <span class="info-label">💰 Kisaran Harga:</span>
                    <span class="info-value">${idea.price_range}</span>
                </div>
            `;
        }
        
        if (idea.website) {
            html += `
                <div class="info-item">
                    <span class="info-label">🌐 Website:</span>
                    <span class="info-value">
                        <a href="${idea.website}" target="_blank">${formatUrl(idea.website)}</a>
                    </span>
                </div>
            `;
        }
        
        if (idea.notes) {
            html += `
                <div class="info-item full-width">
                    <span class="info-label">📝 Catatan:</span>
                    <span class="info-value">${idea.notes}</span>
                </div>
            `;
        }
        
        html += `</div></div>`;
    }
    
    // Jika tidak ada info sama sekali
    if (!hasLocation && !hasInfo) {
        html = `
            <div class="no-info-message">
                <p>💡 <strong>Info lokasi dan detail belum ditambahkan.</strong></p>
                <button class="btn secondary" onclick="editIdeaInfo('${idea.id}')" style="margin-top: 10px;">
                    ✏️ Tambah Info Sekarang
                </button>
            </div>
        `;
    }
    
    mapsInfoContainer.innerHTML = html;
}



// ✅ HELPER: Convert Google Maps URL ke Embed URL
function convertToEmbedUrl(mapsUrl) {
    // CATATAN: Untuk production, Anda HARUS mendapatkan Google Maps API Key
    // dan mengganti 'YOUR_GOOGLE_MAPS_API_KEY' dengan API key Anda
    
    // Deteksi berbagai format Google Maps URL
    
    // Format 1: https://maps.app.goo.gl/xxx (short link)
    if (mapsUrl.includes('maps.app.goo.gl') || mapsUrl.includes('goo.gl/maps')) {
        // Untuk short link, gunakan place search dengan nama tempat
        return ''; // Return kosong, akan fallback ke address
    }
    
    // Format 2: https://www.google.com/maps/place/...
    const placeMatch = mapsUrl.match(/place\/([^\/]+)/);
    if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(placeName)}`;
    }
    
    // Format 3: Coordinates @lat,lng
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
    
    // Fallback: Return original URL (tidak akan berfungsi untuk embed, tapi bisa untuk link)
    return '';
}

// ✅ HELPER: Format URL untuk display
function formatUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return url;
    }
}

// ✅ FUNGSI BARU: Edit Idea Info (akan dibuat terpisah nanti)
function editIdeaInfo(ideaId) {
    alert('Fitur Edit Info akan segera hadir! 🚀\n\nUntuk sementara, Anda bisa menambahkan info saat membuat ide baru.');
    // TODO: Implementasi edit modal
}

// =================================================================
// 2. RENDERING IDEAS (FIX LOGIKA DUPLIKASI ANTAR LEVEL)
// =================================================================

// js/main.js (PATCH: Membuat Kategori Utama Collapsible)

// ... (Import dan variabel lainnya tetap sama) ...

// =================================================================
// 2. RENDERING IDEAS (FIX: Kategori Utama juga Collapsible)
// =================================================================

function renderCategoriesForDay(selectedDate){
    
    activityArea.innerHTML = ''; 
    
    const groupedCategories = categoriesCache.reduce((acc, current) => {
        const key = current.category;
        if (!acc[key]) { acc[key] = { category: key, subtypes: [] }; }
        acc[key].subtypes.push(current);
        return acc;
    }, {});

    const ideasBySubtype = ideasCache.reduce((acc, current) => {
        const key = current.type_key;
        const isDayMatch = current.day_of_week === '' || current.day_of_week === null || current.day_of_week === undefined;
        
        if (isDayMatch) { (acc[key] = acc[key] || []).push(current); }
        return acc;
    }, {});

    if (!selectedDate && ideasCache.length > 0) {
        activityArea.innerHTML = '<p class="info-message">☝️ **Pilih tanggal trip Anda di atas** untuk melihat opsi aktivitas yang tersedia!</p>';
        return;
    }

    Object.values(groupedCategories).forEach(catGroup => {
        // ✅ HITUNG BERAPA ITEM TERPILIH DI KATEGORI INI
        const selectedCountInCategory = countSelectedInCategory(catGroup);
        const categoryBadge = selectedCountInCategory > 0 ? `<span class="selection-badge">${selectedCountInCategory}</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const icon = catGroup.subtypes[0]?.icon || '📍';
        
        card.innerHTML = `
            <details class="category-details" open>
                <summary class="category-summary">
                    ${icon} ${catGroup.category} ${categoryBadge}
                </summary>
                <div class="subtypes-wrap"></div>
            </details>
        `;
        
        const subtypesWrap = card.querySelector('.subtypes-wrap');

        catGroup.subtypes.forEach(subtype => {
            const ideasList = ideasBySubtype[subtype.type_key] || [];
            
            const hasIdeas = ideasList.length > 0;
            const hasLevel2Photo = !!subtype.photo_url;
            
            // ✅ HITUNG BERAPA ITEM TERPILIH DI SUB-TYPE INI
            const selectedCountInSubtype = countSelectedInSubtype(subtype.type_key, ideasList);
            const subtypeBadge = selectedCountInSubtype > 0 ? `<span class="selection-badge small">${selectedCountInSubtype}</span>` : '';
            
            if (hasIdeas || (hasLevel2Photo && !hasIdeas)) {
                
                const details = document.createElement('details');
                details.className = 'subtype-details';
                details.setAttribute('open', ''); 
                
                const summary = document.createElement('summary');
                summary.innerHTML = `${subtype.subtype} ${subtypeBadge}`;
                details.appendChild(summary);

                const optionsWrap = document.createElement('div');
                optionsWrap.className = 'options-wrap';
                optionsWrap.dataset.typeKey = subtype.type_key;
                
                if (hasLevel2Photo && !hasIdeas) { 
                    const itemId = `cat-${subtype.type_key}`; 
                    const isSelected = selectedIdeaIds.has(itemId); 
                    
                    optionsWrap.innerHTML += `
                        <div class="option-item ${isSelected ? 'selected' : ''}" data-ideaid="${itemId}">
                            ${isSelected ? '<span class="checkmark">✓</span>' : ''}
                            <button class="view-detail-btn" data-ideaid="${itemId}" title="Lihat Detail & Review" style="display:none;">👁️</button>
                            <div class="option-item-content">
                                <img src="${getPublicImageUrl(subtype.photo_url)}" alt="${subtype.subtype}">
                                <div class="idea-text-info">
                                    <span style="display:block; font-weight:bold;">${subtype.subtype}</span>
                                    <small style="display:block; color: var(--color-muted); opacity:0.9">(Pilih Sub-tipe)</small>
                                </div>
                            </div>
                        </div>
                    `;
                }

                if (hasIdeas) {
                    ideasList.forEach(item => {
                        const itemId = item.id;
                        const isSelected = selectedIdeaIds.has(itemId);
                        
                        const ratingHtml = createRatingDisplay(item.id);

                        optionsWrap.innerHTML += `
                            <div class="option-item ${isSelected ? 'selected' : ''}" data-ideaid="${itemId}">
                                ${isSelected ? '<span class="checkmark">✓</span>' : ''}
                                <button class="view-detail-btn" data-ideaid="${itemId}" title="Lihat Detail & Review">👁️</button>
                                <div class="option-item-content">
                                    <img src="${getPublicImageUrl(item.photo_url)}" alt="${item.idea_name}">
                                    <div class="idea-text-info">
                                        <span style="display:block; font-weight:bold;">${item.idea_name}</span>
                                        <small style="display:block; color: var(--color-muted); opacity:0.9">(${subtype.subtype})</small>
                                        ${ratingHtml} 
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                }
                
                details.appendChild(optionsWrap);
                subtypesWrap.appendChild(details);
            }
        });

        if (subtypesWrap.children.length > 0) {
            activityArea.appendChild(card);
        }
    });

    setupImageClickHandlers(); 
    setupDetailsCollapse();
    setupCategoryCollapse();
    populateIdeaCategorySelect();
    
    // ✅ RENDER QUICK VIEW PANEL
    renderSelectedActivitiesPanel();
}

function countSelectedInCategory(catGroup) {
    let count = 0;
    catGroup.subtypes.forEach(subtype => {
        // Cek Level 2 (sub-type)
        const level2Id = `cat-${subtype.type_key}`;
        if (selectedIdeaIds.has(level2Id)) count++;
        
        // Cek Level 3 (ideas)
        const ideasInSubtype = ideasCache.filter(i => i.type_key === subtype.type_key);
        ideasInSubtype.forEach(idea => {
            if (selectedIdeaIds.has(idea.id)) count++;
        });
    });
    return count;
}

// ✅ FUNGSI BARU: Hitung item terpilih di sub-type
function countSelectedInSubtype(typeKey, ideasList) {
    let count = 0;
    
    // Cek Level 2
    const level2Id = `cat-${typeKey}`;
    if (selectedIdeaIds.has(level2Id)) count++;
    
    // Cek Level 3
    ideasList.forEach(idea => {
        if (selectedIdeaIds.has(idea.id)) count++;
    });
    
    return count;
}

// ✅ FUNGSI BARU: Render Quick View Panel
function renderSelectedActivitiesPanel() {
    // Cari atau buat container panel
    let panel = document.getElementById('selectedActivitiesPanel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'selectedActivitiesPanel';
        panel.className = 'selected-activities-panel';
        
        // Insert setelah controls, sebelum activityArea
        const controls = document.querySelector('.controls');
        controls.parentNode.insertBefore(panel, controls.nextSibling);
    }
    
    // Jika tidak ada yang dipilih, sembunyikan panel
    if (selectedIdeaIds.size === 0) {
        panel.style.display = 'none';
        return;
    }
    
    panel.style.display = 'block';
    
    // Build list aktivitas terpilih
    let listHtml = '';
    selectedIdeaIds.forEach(ideaId => {
        const itemData = getIdeaDataById(ideaId);
        if (!itemData) return;
        
        listHtml += `
            <div class="selected-item" data-ideaid="${ideaId}">
                <div class="selected-item-info">
                    <span class="selected-item-name">${itemData.name}</span>
                    <span class="selected-item-category">${itemData.category} / ${itemData.subtype}</span>
                </div>
                <div class="selected-item-actions">
                    <button class="btn-locate" data-ideaid="${ideaId}" title="Lihat Lokasi">📍</button>
                    <button class="btn-remove" data-ideaid="${ideaId}" title="Hapus">✕</button>
                </div>
            </div>
        `;
    });
    
    panel.innerHTML = `
        <div class="panel-header">
            <h4>✓ ${selectedIdeaIds.size} Aktivitas Terpilih</h4>
            <button id="clearAllSelections" class="btn-clear-all" title="Hapus Semua">🗑️ Clear Semua</button>
        </div>
        <div class="selected-items-list">
            ${listHtml}
        </div>
    `;
    
    // Setup event listeners untuk tombol di panel
    setupPanelEventListeners();
}

// ✅ FUNGSI BARU: Get data ide by ID
function getIdeaDataById(ideaId) {
    // Cek Level 3 (ideas)
    const idea = ideasCache.find(i => i.id === ideaId);
    if (idea) {
        return {
            name: idea.idea_name,
            category: idea.category_name,
            subtype: idea.subtype_name,
            typeKey: idea.type_key
        };
    }
    
    // Cek Level 2 (category)
    if (ideaId.startsWith('cat-')) {
        const typeKey = ideaId.replace('cat-', '');
        const cat = categoriesCache.find(c => c.type_key === typeKey);
        if (cat) {
            return {
                name: cat.subtype,
                category: cat.category,
                subtype: cat.subtype,
                typeKey: cat.type_key
            };
        }
    }
    
    return null;
}

// ✅ FUNGSI BARU: Setup event listeners untuk panel
function setupPanelEventListeners() {
    // Tombol "Lihat Lokasi"
    document.querySelectorAll('.btn-locate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const ideaId = e.currentTarget.dataset.ideaid;
            scrollToAndHighlightIdea(ideaId);
        });
    });
    
    // Tombol "Hapus" individual
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ideaId = e.currentTarget.dataset.ideaid;
            
            // Hapus dari Set
            selectedIdeaIds.delete(ideaId);
            
            // Update visual di card
            const optionItem = document.querySelector(`.option-item[data-ideaid="${ideaId}"]`);
            if (optionItem) {
                optionItem.classList.remove('selected');
                const checkmark = optionItem.querySelector('.checkmark');
                if (checkmark) checkmark.remove();
            }
            
            saveProgress();
            renderCategoriesForDay(tripDateInput.value); // Re-render untuk update badge
        });
    });
    
    // Tombol "Clear Semua"
    const clearAllBtn = document.getElementById('clearAllSelections');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Hapus semua aktivitas yang dipilih?')) {
                selectedIdeaIds.clear();
                
                // Update semua visual
                document.querySelectorAll('.option-item.selected').forEach(item => {
                    item.classList.remove('selected');
                    const checkmark = item.querySelector('.checkmark');
                    if (checkmark) checkmark.remove();
                });
                
                saveProgress();
                renderCategoriesForDay(tripDateInput.value);
            }
        });
    }
}

// ✅ FUNGSI BARU: Scroll ke dan highlight ide
function scrollToAndHighlightIdea(ideaId) {
    const itemData = getIdeaDataById(ideaId);
    if (!itemData) return;
    
    // 1. Buka kategori dan sub-type yang relevan
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        const categoryDetails = card.querySelector('.category-details');
        const categoryName = categoryDetails.querySelector('summary').textContent.trim().split(' ').slice(1).join(' ').replace(/\d+/g, '').trim();
        
        if (categoryName === itemData.category) {
            categoryDetails.open = true;
            
            // Buka sub-type
            const subtypeDetails = card.querySelectorAll('.subtype-details');
            subtypeDetails.forEach(subDetail => {
                const subtypeName = subDetail.querySelector('summary').textContent.trim().split(' ').slice(0, -1).join(' ').trim();
                if (subtypeName === itemData.subtype) {
                    subDetail.open = true;
                }
            });
        }
    });
    
    // 2. Scroll ke item
    const targetItem = document.querySelector(`.option-item[data-ideaid="${ideaId}"]`);
    if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 3. Highlight sementara
        targetItem.classList.add('highlight-flash');
        setTimeout(() => {
            targetItem.classList.remove('highlight-flash');
        }, 2000);
    }
}
// ✅ FUNGSI BARU: Setup Collapse untuk Kategori Utama
function setupCategoryCollapse() {
    document.querySelectorAll('.category-details').forEach(details => {
        details.removeEventListener('toggle', handleCategoryToggle); 
        details.addEventListener('toggle', handleCategoryToggle);
    });
}

function handleCategoryToggle(event) {
    const details = event.target;
    
    // Jika kategori dibuka, tutup semua sub-tipe di dalamnya
    if (!details.open) {
        const subtypeDetails = details.querySelectorAll('.subtype-details');
        subtypeDetails.forEach(subDetail => {
            subDetail.open = false;
        });
    }
}

// ... (Sisa kode tetap sama) ...

// =================================================================
// 3. EVENT LISTENERS
// =================================================================

function saveProgress() {
    const selectionsArray = Array.from(selectedIdeaIds).map(ideaId => {
        const idea = ideasCache.find(i => i.id === ideaId);
        
        if (!idea && ideaId.startsWith('cat-')) {
            const typeKey = ideaId.replace('cat-', '');
            const cat = categoriesCache.find(c => c.type_key === typeKey);
            return {
                 cat: cat?.category || 'Kategori',
                 subtype: cat?.subtype || 'Sub-tipe',
                 name: cat?.subtype || 'Sub-tipe',
                 ideaId: ideaId
            };
        }

        if (idea) {
             return {
                cat: idea.category_name, 
                subtype: idea.subtype_name, 
                name: idea.idea_name, 
                ideaId: idea.id 
            };
        }
        return null;
    }).filter(item => item !== null);

    localStorage.setItem('tripSelections', JSON.stringify(selectionsArray));
    localStorage.setItem('secretMessage', secretMessage.value);
    localStorage.setItem('tripDate', tripDateInput.value); 
    
    if (activityCount) {
        activityCount.textContent = selectedIdeaIds.size;
    }
    
    // ✅ UPDATE PANEL SETIAP KALI ADA PERUBAHAN
    renderSelectedActivitiesPanel();
}

// =================================================================
// UPDATE: Event Delegation untuk tambah checkmark
// =================================================================

activityArea.addEventListener('click', (e) => {
    const optionItem = e.target.closest('.option-item');
    if (!optionItem) return;

    const isDetailButton = e.target.closest('.view-detail-btn');

    if (isDetailButton) {
        const ideaId = isDetailButton.dataset.ideaid;
        renderIdeaDetailModal(ideaId);
        return; 
    }
    
    const ideaId = optionItem.dataset.ideaid;
    if (!ideaId) return;

    if (selectedIdeaIds.has(ideaId)) {
        selectedIdeaIds.delete(ideaId);
        optionItem.classList.remove('selected');
        
        // ✅ HAPUS CHECKMARK
        const checkmark = optionItem.querySelector('.checkmark');
        if (checkmark) checkmark.remove();
    } else {
        selectedIdeaIds.add(ideaId);
        optionItem.classList.add('selected');
        
        // ✅ TAMBAH CHECKMARK
        if (!optionItem.querySelector('.checkmark')) {
            const checkmark = document.createElement('span');
            checkmark.className = 'checkmark';
            checkmark.textContent = '✓';
            optionItem.insertBefore(checkmark, optionItem.firstChild);
        }
    }
    
    saveProgress();
});


function loadInitialState() {
    secretMessage.value = localStorage.getItem('secretMessage') || '';
    secretMessage.addEventListener('input', saveProgress);
    
    // Muat tanggal dari localStorage
    const savedDate = localStorage.getItem('tripDate');
    if (savedDate) {
         tripDateInput.value = savedDate;
    }
    
    // Muat SELEKSI dari localStorage ke dalam Set
    const storedSelections = localStorage.getItem('tripSelections');
    selectedIdeaIds.clear(); 
    if (storedSelections) {
        try {
            const selections = JSON.parse(storedSelections);
            selections.forEach(s => selectedIdeaIds.add(s.ideaId)); 
        } catch (e) {
            console.error('Failed to parse tripSelections from localStorage', e);
            localStorage.removeItem('tripSelections');
        }
    }
    
    // Render
    renderCategoriesForDay(tripDateInput.value);
    
    // Panggil saveProgress sekali untuk menginisialisasi hitungan
    saveProgress();
}


// --- Event Listeners lainnya ---

ideaCategory.addEventListener('change', (e) => {
    populateIdeaSubtypeSelect(e.target.value);
    toggleNewCategoryInput(e.target.value);
});

ideaSubtype.addEventListener('change', (e) => {
    toggleNewSubtypeInput(e.target.value);
});

addIdeaBtn.addEventListener('click', () => {
    populateIdeaCategorySelect();
    modal.classList.remove('hidden');
});

cancelIdea.addEventListener('click', () => {
    modal.classList.add('hidden');
    ideaForm.reset();
    if (newCategoryInput) { newCategoryInput.style.display = 'none'; newCategoryInput.value = ''; }
    if (newSubtypeInput) { newSubtypeInput.style.display = 'none'; newSubtypeInput.value = ''; }
});

if (closeDetailModal) {
    closeDetailModal.addEventListener('click', () => {
        ideaDetailModal.classList.add('hidden');
    });
}

if (tripDateInput) {
    tripDateInput.addEventListener('change', (e) => {
        saveProgress(); 
        renderCategoriesForDay(e.target.value);
        startCountdown(); 
    });
}


// --- SUBMIT FORM ---

ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (submitIdeaBtn) {
        submitIdeaBtn.disabled = true;
        submitIdeaBtn.textContent = 'Menyimpan... ⏳'; 
    }
    
    const cat = ideaCategory.value;
    const subtypeVal = ideaSubtype.value;
    const title = ideaTitle.value.trim();
    const file = ideaImageInput.files[0]; 
    
    // ✅ AMBIL DATA DETAIL INFO BARU
    const detailInfo = {
        address: ideaAddress?.value.trim() || null,
        maps_url: ideaMapsUrl?.value.trim() || null,
        phone: ideaPhone?.value.trim() || null,
        opening_hours: ideaOpeningHours?.value.trim() || null,
        price_range: ideaPriceRange?.value.trim() || null,
        website: ideaWebsite?.value.trim() || null,
        notes: ideaNotes?.value.trim() || null,
    };
    
    let finalTypeKey = subtypeVal;
    let imageUrl = file ? await uploadImage(file) : null;
    let isNewCombo = false;
    
    const handleFailure = (msg) => {
        alert(msg);
        if (submitIdeaBtn) {
            submitIdeaBtn.disabled = false;
            submitIdeaBtn.textContent = 'Simpan Ide'; 
        }
    }

    if (!title && cat !== 'custom' && subtypeVal !== 'custom-new' && !file) {
         handleFailure('Nama Ide kosong, dan tidak ada Kategori/Sub-tipe baru atau foto untuk Sub-tipe yang sudah ada.');
         return;
    }
    
    let finalCategoryName;
    if (cat === 'custom') {
        finalCategoryName = newCategoryInput.value.trim();
        if (!finalCategoryName) { 
            handleFailure('Nama kategori baru tidak boleh kosong.');
            return; 
        }
    } else {
        finalCategoryName = ideaCategory.options[ideaCategory.selectedIndex].text;
    }

    let finalSubtypeName;
    if (subtypeVal === 'custom-new') {
        finalSubtypeName = newSubtypeInput.value.trim();
        if (!finalSubtypeName) { 
            handleFailure('Nama sub-tipe baru tidak boleh kosong.');
            return; 
        }
    } else {
        finalSubtypeName = ideaSubtype.options[ideaSubtype.selectedIndex].text;
    }

    if (cat === 'custom' || subtypeVal === 'custom-new') {
        finalTypeKey = `${finalCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${finalSubtypeName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        finalTypeKey = finalTypeKey.replace(/--+/g, '-').replace(/^-|-$/g, ''); 

        isNewCombo = !categoriesCache.some(c => c.type_key === finalTypeKey);

        if (isNewCombo) {
            const { error: catInsertError } = await supabase
                .from('idea_categories')
                .insert({ 
                    category: finalCategoryName, 
                    subtype: finalSubtypeName, 
                    icon: '🆕', 
                    type_key: finalTypeKey,
                    photo_url: imageUrl,
                });

            if (catInsertError) {
                 console.error('Gagal insert kategori kustom (idea_categories):', catInsertError);
                 handleFailure(`Gagal menyimpan kategori baru. Error Supabase: ${catInsertError.message}. Cek Console!`);
                 return;
            }
            await fetchData(); 
        } 
    } 
    
    else if (imageUrl && !title) {
        const { error: catUpdateError } = await supabase
            .from('idea_categories')
            .update({ photo_url: imageUrl })
            .eq('type_key', finalTypeKey);
            
        if (catUpdateError) {
            console.error('Gagal update foto level 2:', catUpdateError);
            handleFailure('Gagal memperbarui foto sub-tipe.');
            return;
        }
        await fetchData(); 
    }

    if (title) {
        // ✅ TAMBAHKAN DETAIL INFO KE PAYLOAD
        const doc = {
            idea_name: title,
            type_key: finalTypeKey, 
            day_of_week: "", 
            photo_url: imageUrl,
            // Detail Info Fields
            address: detailInfo.address,
            maps_url: detailInfo.maps_url,
            phone: detailInfo.phone,
            opening_hours: detailInfo.opening_hours,
            price_range: detailInfo.price_range,
            website: detailInfo.website,
            notes: detailInfo.notes,
        };
        
        try {
            const { error } = await supabase
              .from('trip_ideas_v2') 
              .insert([doc]);

            if (error) throw error;
        } catch (err) {
            console.error('Gagal insert ide Level 3:', err);
            handleFailure(`Gagal menyimpan ide Level 3. Error Supabase: ${err.message}.`);
            return;
        }
        
        await fetchData();
    }
    
    alert('Idemu tersimpan! 🎉');
    modal.classList.add('hidden');
    ideaForm.reset();
    
    if (newCategoryInput) { newCategoryInput.style.display = 'none'; newCategoryInput.value = ''; }
    if (newSubtypeInput) { newSubtypeInput.style.display = 'none'; newSubtypeInput.value = ''; }
    
    renderCategoriesForDay(tripDateInput.value);
    
    if (submitIdeaBtn) {
        submitIdeaBtn.disabled = false;
        submitIdeaBtn.textContent = 'Simpan Ide'; 
    }
});
// GENERATE TICKET (Menggunakan Set Ide yang Terpilih)
generateBtn.addEventListener('click', () => {
    const selectedDate = tripDateInput.value;
    if (!selectedDate) { alert('Pilih tanggal trip dulu'); return; }

    const storedSelections = localStorage.getItem('tripSelections');
    let checked = [];
    if (storedSelections) {
        try {
            checked = JSON.parse(storedSelections);
        } catch (e) {
            console.error("Gagal memuat seleksi:", e);
        }
    }

    if (checked.length === 0) { alert('Pilih minimal satu aktivitas'); return; }

    localStorage.setItem('tripDate', selectedDate); 
    localStorage.setItem('tripSelections', JSON.stringify(checked));
    localStorage.setItem('secretMessage', secretMessage.value);

    window.location.href = 'summary.html';
});


// Init
(async function init(){
    await fetchData(); 
    
    loadInitialState();
    startCountdown();
})();