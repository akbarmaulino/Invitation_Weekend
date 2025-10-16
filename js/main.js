// js/main.js (Logika utama - Seleksi Click vs Detail Button)

import { supabase } from './supabaseClient.js'; 

let currentUser = { id: 'anon' }; 

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

function getPublicImageUrl(photoUrl) {
    if (!photoUrl) return 'images/placeholder.jpg';
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl; 
    }

    if (photoUrl.startsWith('images/')) {
        return photoUrl;
    }
    
    try {
        const { data } = supabase.storage
            .from('trip-ideas-images') 
            .getPublicUrl(photoUrl);
        
        return data.publicUrl;
    } catch (e) {
        console.error('FAILED to convert path to public URL:', photoUrl, e);
        return photoUrl; 
    }
}


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

// FUNGSI INI AKAN DIPANGGIL OLEH TOMBOL DETAIL
function renderIdeaDetailModal(ideaId) {
    // Logic untuk Ide Level 2 (cat-...) tidak memiliki modal detail
    if (ideaId.startsWith('cat-')) return; 

    const idea = ideasCache.find(i => i.id === ideaId);
    if (!idea) return;

    const reviews = allReviews.filter(r => r.idea_id === ideaId);
    const ratingData = ideaRatings[ideaId];

    // 1. Update Header
    detailIdeaName.textContent = idea.idea_name;
    detailIdeaImage.src = getPublicImageUrl(idea.photo_url);
    detailIdeaImage.onerror = () => detailIdeaImage.src = 'images/placeholder.jpg'; 

    // 2. Update Rating Summary
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
        noReviewsMessage.style.display = 'none';
    } else {
        detailRatingSummary.innerHTML = `
            <span class="avg-rating">N/A</span>
            <span>Belum ada review</span>
        `;
        noReviewsMessage.style.display = 'block';
    }

    // 3. Update Review List
    detailReviewList.innerHTML = '';
    if (reviews.length > 0) {
        reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 

        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';

            const reviewStars = '⭐'.repeat(review.rating || 0);
            const reviewPhotoHtml = review.photo_url ? 
                `<div class="review-photo-preview"><img src="${getPublicImageUrl(review.photo_url)}" alt="Review Photo"></div>` : 
                '';

            reviewItem.innerHTML = `
                <div class="review-rating">${reviewStars}</div>
                <p class="review-text">${review.review_text || '(Tidak ada komentar)'}</p>
                ${reviewPhotoHtml}
            `;
            detailReviewList.appendChild(reviewItem);
        });
        noReviewsMessage.style.display = 'none';
    } else {
        const noReviewEl = document.createElement('p');
        noReviewEl.className = 'info-message';
        noReviewEl.textContent = 'Belum ada ulasan untuk ide ini.';
        detailReviewList.appendChild(noReviewEl);
    }

    // 4. Tampilkan Modal
    ideaDetailModal.classList.remove('hidden');
    setupImageClickHandlers(); 
}

// =================================================================
// 2. RENDERING IDEAS (FIX LOGIKA DUPLIKASI ANTAR LEVEL)
// =================================================================

function renderCategoriesForDay(selectedDate){
    
    activityArea.innerHTML = ''; // Sudah ada di sini
    
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
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const icon = catGroup.subtypes[0]?.icon || '📍';
        card.innerHTML = `<h3>${icon} ${catGroup.category}</h3><div class="subtypes-wrap"></div>`;
        const subtypesWrap = card.querySelector('.subtypes-wrap');

        catGroup.subtypes.forEach(subtype => {
            const ideasList = ideasBySubtype[subtype.type_key] || [];
            
            // Variabel untuk menentukan apakah detail harus ditampilkan
            const hasIdeas = ideasList.length > 0;
            const hasLevel2Photo = !!subtype.photo_url;
            
            // KRITIS: HANYA RENDER details JIKA: 
            // 1. Ada Ide Level 3 (Ide/Tempat spesifik), ATAU 
            // 2. Ada Foto Level 2 TAPI TIDAK ADA Ide Level 3 (untuk kartu Sub-tipe generik).
            if (hasIdeas || (hasLevel2Photo && !hasIdeas)) {
                
                const details = document.createElement('details');
                details.className = 'subtype-details';
                details.setAttribute('open', ''); 
                
                const summary = document.createElement('summary');
                summary.textContent = subtype.subtype;
                details.appendChild(summary);

                const optionsWrap = document.createElement('div');
                optionsWrap.className = 'options-wrap';
                optionsWrap.dataset.typeKey = subtype.type_key;
                
                // Opsi Level 2 (Sub-tipe) HANYA dirender jika TIDAK ADA Ide Level 3 (untuk mencegah duplikasi)
                if (hasLevel2Photo && !hasIdeas) { 
                    const itemId = `cat-${subtype.type_key}`; 
                    const isSelected = selectedIdeaIds.has(itemId); 
                    
                    optionsWrap.innerHTML += `
                        <div class="option-item ${isSelected ? 'selected' : ''}" data-ideaid="${itemId}">
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

                // Render Level 3 (Ideas/Places)
                if (hasIdeas) { // Pastikan hanya render Level 3 jika ada datanya
                    ideasList.forEach(item => {
                        const itemId = item.id;
                        const isSelected = selectedIdeaIds.has(itemId);
                        
                        const ratingHtml = createRatingDisplay(item.id);

                        optionsWrap.innerHTML += `
                            <div class="option-item ${isSelected ? 'selected' : ''}" data-ideaid="${itemId}">
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
    populateIdeaCategorySelect();
}

// =================================================================
// 3. EVENT LISTENERS
// =================================================================

function saveProgress() {
    // Konversi Set menjadi Array untuk disimpan di localStorage
    const selectionsArray = Array.from(selectedIdeaIds).map(ideaId => {
        const idea = ideasCache.find(i => i.id === ideaId);
        
        // Handle Level 2 item jika tidak ditemukan di ideasCache
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

    // Simpan array seleksi, bukan Set
    localStorage.setItem('tripSelections', JSON.stringify(selectionsArray));
    localStorage.setItem('secretMessage', secretMessage.value);
    localStorage.setItem('tripDate', tripDateInput.value); 
    
    // Update count display
    if (activityCount) {
        activityCount.textContent = selectedIdeaIds.size;
    }
}

// KRITIS: EVENT DELEGATION BARU
activityArea.addEventListener('click', (e) => {
    const optionItem = e.target.closest('.option-item');
    if (!optionItem) return;

    // Cek apakah yang diklik adalah tombol detail (Mata)
    const isDetailButton = e.target.closest('.view-detail-btn');

    if (isDetailButton) {
        const ideaId = isDetailButton.dataset.ideaid;
        // Pemicu Modal Detail
        renderIdeaDetailModal(ideaId);
        // Penting: RETURN agar status seleksi TIDAK diubah
        return; 
    }
    
    // Jika BUKAN tombol detail, maka ini adalah klik untuk Toggle Seleksi
    
    const ideaId = optionItem.dataset.ideaid;
    if (!ideaId) return;

    if (selectedIdeaIds.has(ideaId)) {
        // Deselect: Hapus dari Set dan hapus kelas 'selected'
        selectedIdeaIds.delete(ideaId);
        optionItem.classList.remove('selected');
    } else {
        // Select: Tambahkan ke Set dan tambahkan kelas 'selected'
        selectedIdeaIds.add(ideaId);
        optionItem.classList.add('selected');
    }
    
    // Simpan progress
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
    
    // === START: PENCEGAHAN DOUBLE SUBMIT ===
    if (submitIdeaBtn) {
        submitIdeaBtn.disabled = true;
        submitIdeaBtn.textContent = 'Menyimpan... ⏳'; 
    }
    // === END: PENCEGAHAN DOUBLE SUBMIT ===
    
    const cat = ideaCategory.value;
    const subtypeVal = ideaSubtype.value;
    const title = ideaTitle.value.trim();
    const file = ideaImageInput.files[0]; 
    
    let finalTypeKey = subtypeVal;
    let imageUrl = file ? await uploadImage(file) : null;
    let isNewCombo = false;
    
    // --- Error handling (Pastikan tombol di-enable lagi jika gagal) ---
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
        const doc = {
            idea_name: title,
            type_key: finalTypeKey, 
            day_of_week: "", 
            photo_url: imageUrl, 
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
        
        // PENTING: Jika ide Level 3 baru dibuat, selalu fetch data terbaru
        await fetchData();
    }
    
    // --- SUKSES ---
    alert('Idemu tersimpan! 🎉');
    modal.classList.add('hidden');
    ideaForm.reset();
    
    if (newCategoryInput) { newCategoryInput.style.display = 'none'; newCategoryInput.value = ''; }
    if (newSubtypeInput) { newSubtypeInput.style.display = 'none'; newSubtypeInput.value = ''; }
    
    // KRITIS: Panggil renderCategoriesForDay HANYA sekali setelah fetchData()
    renderCategoriesForDay(tripDateInput.value);
    
    // === PENGEMBALIAN STATUS TOMBOL ===
    if (submitIdeaBtn) {
        submitIdeaBtn.disabled = false;
        submitIdeaBtn.textContent = 'Simpan Ide'; 
    }
    // === END PENGEMBALIAN STATUS TOMBOL ===
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