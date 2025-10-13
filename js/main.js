// js/main.js (Logika utama - Setelah dipisah ke history.js)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; // <-- Import Config

/* ====== Supabase Config ====== */
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

let currentUser = { id: 'anon' }; 

// UI refs (Hanya yang terkait fungsi utama)
const activityArea = document.getElementById('activityArea');
const generateBtn = document.getElementById('generateBtn');
const addIdeaBtn = document.getElementById('addIdeaBtn');
const modal = document.getElementById('modal');
const ideaForm = document.getElementById('ideaForm');
const ideaCategory = document.getElementById('ideaCategory');
const ideaSubtype = document.getElementById('ideaSubtype');
const ideaDay = document.getElementById('ideaDay');
const ideaTitle = document.getElementById('ideaTitle'); 
const cancelIdea = document.getElementById('cancelIdea');
const countdownDisplay = document.getElementById('countdownDisplay'); 
const secretMessage = document.getElementById('secretMessage'); 
const activityCount = document.getElementById('activityCount');
const countDisplay = document.getElementById('countDisplay');

// Modal Refs untuk Image Zoom 
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeBtn = document.querySelector('.close-btn');

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

// Cache data
let categoriesCache = [];
let ideasCache = [];
let ideaRatings = {}; // { 'idea_id': { average: 4.5, count: 10 } }
// NEW: Cache semua review
let allReviews = []; 


// =================================================================
// START: HELPER FUNCTIONS
// =================================================================

function getTripDate(dayOfWeek) {
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
    return date; 
}

function startCountdown() {
    const targetSabtu = getTripDate('Sabtu').getTime();
    const targetMinggu = getTripDate('Minggu').getTime();
    const targetTime = Math.min(targetSabtu, targetMinggu);
    
    const targetDayName = new Date(targetTime).toLocaleDateString('id-ID', { weekday: 'long' });

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
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
    return Array.from(document.querySelectorAll("input[name='hari']:checked")).map(i=>i.value);
}

// FUNGSI UTAMA UNTUK MENGAMBIL DATA DAN MENGHITUNG RATING
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
        .select('*')
        .order('created_at', { ascending: false });
    if (ideaError) { console.error('Supabase fetch ideas error', ideaError); }
    ideasCache = ideas || [];
    
    // 3. Ambil Semua Review (Untuk rating rata-rata dan detail modal)
    const { data: reviews, error: reviewError } = await supabase
        .from('idea_reviews')
        .select('*'); // Ambil semua data review
    if (reviewError) { console.error('Supabase fetch reviews error', reviewError); }
    
    allReviews = reviews || []; // Simpan semua review
    
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

    // Hitung Rata-rata Akhir dan simpan ke ideaRatings
    ideaRatings = {};
    for (const id in ratingsMap) {
        const { total, count } = ratingsMap[id];
        ideaRatings[id] = {
            average: (total / count).toFixed(1), // Dibulatkan satu desimal
            count: count
        };
    }
}

/**
 * Helper untuk penanganan path gambar (Lokal vs Supabase)
 */
function getPublicImageUrl(photoUrl) {
    if (!photoUrl) return 'images/placeholder.jpg';
    
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://')) {
        return photoUrl; 
    }

    if (photoUrl.startsWith('images/')) {
        return photoUrl;
    }
    
    try {
        // Asumsi bucket 'trip-ideas-images' untuk ide trip
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


// --- Image Modal Handlers (Zoom) ---

function setupImageClickHandlers() {
    document.querySelectorAll('#activityArea img').forEach(img => {
        img.removeEventListener('click', openModalWithImage);
        img.addEventListener('click', openModalWithImage);
        img.style.cursor = 'pointer'; 
    });
    
    // NEW: Review detail image click
    document.querySelectorAll('#detailReviewList img').forEach(img => {
        img.removeEventListener('click', openModalWithImage);
        img.addEventListener('click', openModalWithImage);
        img.style.cursor = 'pointer';
    });
}

function openModalWithImage(event) {
    // Stop propagation agar tidak memicu event di parent (misalnya View Detail button)
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

window.onclick = function(event) {
    if (event.target == imageModal) {
        imageModal.style.display = "none";
    }
    // NEW: Tutup modal detail jika klik di luar
    if (event.target == ideaDetailModal) {
        ideaDetailModal.classList.add('hidden');
    }
}

// --- AUTO COLLAPSE LOGIC ---

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
 * Membuat tampilan rating bintang (misalnya: '⭐️⭐️⭐️⭐️ (4.5) | 12 Review')
 * @param {string} ideaId - ID dari ide (trip_ideas_v2.id).
 * @returns {string} HTML untuk rating.
 */
function createRatingDisplay(ideaId) {
    const ratingData = ideaRatings[ideaId];
    
    if (!ratingData || ratingData.count === 0) {
        return '<span class="rating-display muted">Belum ada review</span>';
    }

    const avg = parseFloat(ratingData.average);
    const fullStars = Math.round(avg);
    const starIcon = '⭐'; // Emoji bintang

    // Membuat string bintang penuh
    const stars = starIcon.repeat(fullStars); 

    return `<span class="rating-display"><span class="star-icon">${stars}</span> (${ratingData.average}) | ${ratingData.count} Review</span>`;
}

// NEW: RENDER IDEA DETAIL MODAL
function renderIdeaDetailModal(ideaId) {
    const idea = ideasCache.find(i => i.id === ideaId);
    if (!idea) return;

    const reviews = allReviews.filter(r => r.idea_id === ideaId);
    const ratingData = ideaRatings[ideaId];

    // 1. Update Header
    detailIdeaName.textContent = idea.idea_name;
    detailIdeaImage.src = getPublicImageUrl(idea.photo_url);
    detailIdeaImage.onerror = () => detailIdeaImage.src = 'images/placeholder.jpg'; 

    // 2. Update Rating Summary
    if (ratingData && ratingData.count > 0) {
        const avg = parseFloat(ratingData.average);
        const fullStars = Math.round(avg);
        const starsHtml = '⭐'.repeat(fullStars);

        detailRatingSummary.innerHTML = `
            <span class="avg-rating">${starsHtml} ${avg}</span>
            <span>dari ${ratingData.count} Review</span>
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
        reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Terbaru di atas

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
        detailReviewList.appendChild(noReviewsMessage);
    }

    // 4. Tampilkan Modal
    ideaDetailModal.classList.remove('hidden');
    setupImageClickHandlers(); // Re-setup handler untuk foto review
}

// --- RENDER FUNCTION (FILTRASI BERDASARKAN HARI) ---

function renderCategoriesForDay(day){
    
    activityArea.innerHTML = '';
    
    const savedSelections = JSON.parse(localStorage.getItem('savedSelections') || '{}');

    const groupedCategories = categoriesCache.reduce((acc, current) => {
        const key = current.category;
        if (!acc[key]) { acc[key] = { category: key, subtypes: [] }; }
        acc[key].subtypes.push(current);
        return acc;
    }, {});

    const ideasBySubtype = ideasCache.reduce((acc, current) => {
        const key = current.type_key;
        const isDayMatch = !day || current.day_of_week === day || current.day_of_week === '';
        if (isDayMatch) { (acc[key] = acc[key] || []).push(current); }
        return acc;
    }, {});

    Object.values(groupedCategories).forEach(catGroup => {
        const card = document.createElement('div');
        card.className = 'category-card';
        
        const icon = catGroup.subtypes[0]?.icon || '📍';
        card.innerHTML = `<h3>${icon} ${catGroup.category}</h3><div class="subtypes-wrap"></div>`;
        const subtypesWrap = card.querySelector('.subtypes-wrap');

        catGroup.subtypes.forEach(subtype => {
            const ideasList = ideasBySubtype[subtype.type_key] || [];
            
            const isLevel2DayMatch = !day || subtype.day_of_week === day || subtype.day_of_week === '' || !subtype.day_of_week;
            const hasContent = ideasList.length > 0 || (subtype.photo_url && isLevel2DayMatch);

            if (hasContent) {
                const details = document.createElement('details');
                details.className = 'subtype-details';
                details.setAttribute('open', ''); 
                
                const summary = document.createElement('summary');
                summary.textContent = subtype.subtype;
                details.appendChild(summary);

                const optionsWrap = document.createElement('div');
                optionsWrap.className = 'options-wrap';
                optionsWrap.dataset.typeKey = subtype.type_key;
                
                // Opsi Level 2 (jika ada foto di tabel idea_categories)
                if (subtype.photo_url && isLevel2DayMatch) {
                    const div = document.createElement('div');
                    div.className = 'option-item';
                    const itemId = `cat-${subtype.type_key}`; 
                    const isChecked = savedSelections[itemId] === true; 
                    
                    div.innerHTML = `
                        <label>
                            <input type="checkbox" 
                                data-cat="${catGroup.category}" 
                                data-subtype="${subtype.subtype}" 
                                data-name="${subtype.subtype}" 
                                data-ideaid="${itemId}"
                                ${isChecked ? 'checked' : ''}>
                            <img src="${getPublicImageUrl(subtype.photo_url)}" alt="${subtype.subtype}">
                            <div class="idea-text-info">
                                <span style="display:block; font-weight:bold;">${subtype.subtype}</span>
                                <small style="display:block; color: var(--color-muted); opacity:0.9">(Pilih Sub-tipe)</small>
                            </div>
                        </label>
                         `;
                    optionsWrap.appendChild(div);
                }

                // Render Level 3 (Ideas/Places)
                ideasList.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'option-item';
                    const itemId = item.id;
                    const isChecked = savedSelections[itemId] === true; 
                    
                    // PANGGIL FUNGSI RATING BARU
                    const ratingHtml = createRatingDisplay(item.id);

                    div.innerHTML = `
                        <button class="view-detail-btn" data-ideaid="${itemId}" title="Lihat Detail & Review">👁️</button>
                        <label>
                            <input type="checkbox" 
                                data-cat="${catGroup.category}" 
                                data-subtype="${subtype.subtype}" 
                                data-name="${item.idea_name}" 
                                data-ideaid="${itemId}"
                                ${isChecked ? 'checked' : ''}>
                            <img src="${getPublicImageUrl(item.photo_url)}" alt="${item.idea_name}">
                            <div class="idea-text-info">
                                <span style="display:block; font-weight:bold;">${item.idea_name}</span>
                                <small style="display:block; color: var(--color-muted); opacity:0.9">(${subtype.subtype})</small>
                                ${ratingHtml} </div>
                        </label>
                    `;
                    optionsWrap.appendChild(div);
                });
                
                details.appendChild(optionsWrap);
                subtypesWrap.appendChild(details);
            }
        });

        if (subtypesWrap.children.length > 0) {
            activityArea.appendChild(card);
        }
    });

    document.querySelectorAll('#activityArea input[type="checkbox"]').forEach(chk => {
        chk.addEventListener('change', saveProgress);
    });

    // NEW: Tambahkan event listener untuk tombol view detail
    document.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Penting agar tidak memilih checkbox
            const ideaId = e.currentTarget.dataset.ideaid;
            renderIdeaDetailModal(ideaId);
        });
    });

    setupImageClickHandlers(); 
    setupDetailsCollapse();
    populateIdeaCategorySelect();
}

// --- SAVE PROGRESS ---
function saveProgress() {
    const selections = {};
    let count = 0;
    document.querySelectorAll('#activityArea input[type="checkbox"]').forEach(chk => {
        if (chk.checked) {
            selections[chk.dataset.ideaid] = true;
            count++;
        }
    });
    localStorage.setItem('savedSelections', JSON.stringify(selections));
    localStorage.setItem('secretMessage', secretMessage.value);
    
    // Update count display
    countDisplay.textContent = count;
    activityCount.style.display = count > 0 ? 'block' : 'none';
}

function loadInitialState() {
    secretMessage.value = localStorage.getItem('secretMessage') || '';
    secretMessage.addEventListener('input', saveProgress);
    
    const tripDays = JSON.parse(localStorage.getItem('tripDays') || '[]');
    document.querySelectorAll("input[name='hari']").forEach(chk => {
        if (tripDays.includes(chk.value)) {
             chk.checked = true;
        }
    });

    const currentDays = getSelectedDays();
    renderCategoriesForDay(currentDays[0] || '');
    
    // Panggil saveProgress sekali untuk menginisialisasi hitungan
    saveProgress();
}

// =================================================================
// START: EVENT LISTENERS UTAMA
// =================================================================

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
    newCategoryInput.style.display = 'none'; 
    newSubtypeInput.style.display = 'none'; 
});

// NEW: Close Detail Modal
if (closeDetailModal) {
    closeDetailModal.addEventListener('click', () => {
        ideaDetailModal.classList.add('hidden');
    });
}


// --- SUBMIT FORM ---

ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cat = ideaCategory.value;
    const subtypeVal = ideaSubtype.value;
    const title = ideaTitle.value.trim();
    const day = ideaDay.value; 
    const file = ideaImageInput.files[0]; 
    
    let finalTypeKey = subtypeVal;
    let imageUrl = file ? await uploadImage(file) : null;
    let isNewCombo = false;

    if (!title && cat !== 'custom' && subtypeVal !== 'custom-new' && !file) {
         alert('Nama Ide kosong, dan tidak ada Kategori/Sub-tipe baru atau foto untuk Sub-tipe yang sudah ada.');
         return;
    }
    
    let finalCategoryName;
    if (cat === 'custom') {
        finalCategoryName = newCategoryInput.value.trim();
        if (!finalCategoryName) { alert('Nama kategori baru tidak boleh kosong.'); return; }
    } else {
        finalCategoryName = ideaCategory.options[ideaCategory.selectedIndex].text;
    }

    let finalSubtypeName;
    if (subtypeVal === 'custom-new') {
        finalSubtypeName = newSubtypeInput.value.trim();
        if (!finalSubtypeName) { alert('Nama sub-tipe baru tidak boleh kosong.'); return; }
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
                 alert(`Gagal menyimpan kategori baru. Error Supabase: ${catInsertError.message}. Cek Console!`);
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
            alert('Gagal memperbarui foto sub-tipe.');
            return;
        }
        await fetchData(); 
    }

    if (title) {
        const doc = {
            idea_name: title,
            type_key: finalTypeKey, 
            day_of_week: day || "", 
            photo_url: imageUrl, 
        };
        
        try {
            const { error } = await supabase
              .from('trip_ideas_v2') 
              .insert([doc]);

            if (error) throw error;
        } catch (err) {
            console.error('Gagal insert ide Level 3:', err);
            alert(`Gagal menyimpan ide Level 3. Error Supabase: ${err.message}.`);
            return;
        }
    }
    
    alert('Idemu tersimpan! 🎉');
    modal.classList.add('hidden');
    ideaForm.reset();

    await fetchData();
    const days = getSelectedDays();
    renderCategoriesForDay(days[0] || '');
});

// Generate ticket
generateBtn.addEventListener('click', () => {
    const days = getSelectedDays();
    if (days.length === 0) { alert('Pilih minimal satu hari dulu'); return; }

    const checked = Array.from(document.querySelectorAll('#activityArea input[type="checkbox"]:checked'))
      .map(i => ({ 
          cat: i.dataset.cat, 
          subtype: i.dataset.subtype, 
          name: i.dataset.name, 
          ideaId: i.dataset.ideaid || null // PENTING: data-ideaid adalah ID unik
      }));

    if (checked.length === 0) { alert('Pilih minimal satu aktivitas'); return; }

    // Simpan ke localStorage
    localStorage.setItem('tripDays', JSON.stringify(days));
    localStorage.setItem('tripSelections', JSON.stringify(checked));
    localStorage.setItem('secretMessage', secretMessage.value);

    window.location.href = 'summary.html';
});


// Init
(async function init(){
    await fetchData(); 
    
    document.querySelectorAll("input[name='hari']").forEach(chk => {
        chk.addEventListener('change', () => {
            const days = getSelectedDays();
            localStorage.setItem('tripDays', JSON.stringify(days)); 
            renderCategoriesForDay(days[0] || '');
        });
    });
    
    loadInitialState();
    startCountdown();
})();