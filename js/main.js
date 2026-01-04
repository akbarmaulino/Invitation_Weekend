import { supabase } from './supabaseClient.js';
import {
    getPublicImageUrl,
    renderPhotoUrls,
    uploadImage,
    uploadImages,
    uploadVideo,           // ✅ TAMBAH INI
    renderVideoUrls,       // ✅ TAMBAH INI
    getPublicVideoUrl,     // ✅ TAMBAH INI
    sortAlphabetically,
    formatUrl,
    formatTanggalIndonesia,
    convertToEmbedUrl,
    setupModalClose,
    showModal,
    hideModal,
    renderReviewerName
} from './utils.js';

let currentUser = { id: 'anon' };


const ideaReviewPhotoPreview = document.getElementById('ideaReviewPhotoPreview');
const ideaReviewVideoInput = document.getElementById('ideaReviewVideoInput');      // ✅ TAMBAH INI
const ideaReviewVideoPreview = document.getElementById('ideaReviewVideoPreview');  // ✅ TAMBAH INI
const locationsListContainer = document.getElementById('locationsListContainer');
const locationItemTemplate = document.getElementById('locationItemTemplate');
const addLocationBtn = document.getElementById('addLocationBtn');
const saveAllLocations = document.getElementById('saveAllLocations');
const ideaCity = document.getElementById('ideaCity');
let citiesCache = []; 
let searchQuery = '';

let currentLocationsData = []; // Array untuk track semua lokasi
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


function filterIdeasBySearch(ideas, query) {
    if (!query || query.trim() === '') return ideas;
    
    const lowerQuery = query.toLowerCase().trim();
    
    return ideas.filter(idea => {
        // Search by: idea name, category, subtype, city
        const ideaName = (idea.idea_name || '').toLowerCase();
        const categoryName = (idea.category_name || '').toLowerCase();
        const subtypeName = (idea.subtype_name || '').toLowerCase();
        const cityId = (idea.city_id || '').toLowerCase();
        
        // Get city name for search
        const city = citiesCache.find(c => c.id === cityId);
        const cityName = (city?.name || '').toLowerCase();
        
        // ✅ KRITIS: Return TRUE jika ada yang match
        return ideaName.includes(lowerQuery) ||
               categoryName.includes(lowerQuery) ||
               subtypeName.includes(lowerQuery) ||
               cityName.includes(lowerQuery);
    });
}

function setupSearchBar() {
    const searchInput = document.getElementById('searchIdeas');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    if (!searchInput) return;
    
    // Input event for search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        
        // ✅ Show/hide clear button
        if (clearSearchBtn) {
            clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
        }
        
        renderCategoriesForDay(tripDateInput.value);
    });
    
    // Clear search button
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            clearSearchBtn.style.display = 'none';
            searchInput.focus(); // Focus back to input
            renderCategoriesForDay(tripDateInput.value);
        });
    }
    
    // ✅ BONUS: Clear search saat ESC key
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            searchQuery = '';
            if (clearSearchBtn) clearSearchBtn.style.display = 'none';
            renderCategoriesForDay(tripDateInput.value);
        }
    });
}

// =================================================================
// ALPHABETICAL SORT
// =================================================================

window.editIdeaInfo = function(ideaId) {
    const idea = ideasCache.find(i => i.id === ideaId);
    if (!idea) {
        alert('Ide tidak ditemukan!');
        return;
    }
    
    if (editInfoIdeaId) editInfoIdeaId.value = ideaId;
    if (editInfoIdeaName) editInfoIdeaName.textContent = idea.idea_name;
    
    // Load locations data
    currentLocationsData = idea.locations || [];
    
    // Jika belum ada lokasi, buat 1 lokasi default
    if (currentLocationsData.length === 0) {
        currentLocationsData = [{
            name: 'Lokasi Utama',
            address: idea.address || '',
            maps_url: idea.maps_url || '',
            phone: idea.phone || '',
            opening_hours: idea.opening_hours || '',
            price_range: idea.price_range || '',
            website: idea.website || '',
            notes: idea.notes || ''
        }];
    }
    
    // Render locations
    renderLocationsList();
    
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
function renderLocationsList() {
    if (!locationsListContainer || !locationItemTemplate) return;
    
    locationsListContainer.innerHTML = '';
    
    currentLocationsData.forEach((location, index) => {
        const locationItem = createLocationItem(location, index);
        locationsListContainer.appendChild(locationItem);
    });
}
if (addLocationBtn) {
    addLocationBtn.addEventListener('click', () => {
        currentLocationsData.push({
            name: `Cabang ${currentLocationsData.length + 1}`,
            address: '',
            maps_url: '',
            phone: '',
            opening_hours: '',
            price_range: '',
            website: '',
            notes: ''
        });
        renderLocationsList();
        
        // Auto scroll ke lokasi baru
        setTimeout(() => {
            if (locationsListContainer) {
                locationsListContainer.scrollTop = locationsListContainer.scrollHeight;
            }
        }, 100);
    });
}

if (saveAllLocations) {
    saveAllLocations.addEventListener('click', async () => {
        const ideaId = editInfoIdeaId.value;
        
        saveAllLocations.disabled = true;
        saveAllLocations.textContent = 'Menyimpan... ⏳';
        
        // Collect data dari semua location items
        const locationItems = locationsListContainer.querySelectorAll('.location-item');
        const locationsArray = [];
        
        locationItems.forEach((item, index) => {
            const name = item.querySelector('.location-name-input').value.trim();
            
            if (!name) {
                alert(`Lokasi ${index + 1}: Nama lokasi tidak boleh kosong!`);
                return;
            }
            
            locationsArray.push({
                name: name,
                address: item.querySelector('.location-address').value.trim() || null,
                maps_url: item.querySelector('.location-maps-url').value.trim() || null,
                phone: item.querySelector('.location-phone').value.trim() || null,
                opening_hours: item.querySelector('.location-opening-hours').value.trim() || null,
                price_range: item.querySelector('.location-price-range').value.trim() || null,
                website: item.querySelector('.location-website').value.trim() || null,
                notes: item.querySelector('.location-notes').value.trim() || null,
            });
        });
        
        if (locationsArray.length === 0) {
            alert('Minimal harus ada 1 lokasi!');
            saveAllLocations.disabled = false;
            saveAllLocations.textContent = '💾 Simpan Semua Lokasi';
            return;
        }
        
        try {
            // Update data di Supabase
            const { error } = await supabase
                .from('trip_ideas_v2')
                .update({ 
                    locations: locationsArray,
                    // Backward compatibility: Update kolom lama dengan data lokasi pertama
                    address: locationsArray[0].address,
                    maps_url: locationsArray[0].maps_url,
                    phone: locationsArray[0].phone,
                    opening_hours: locationsArray[0].opening_hours,
                    price_range: locationsArray[0].price_range,
                    website: locationsArray[0].website,
                    notes: locationsArray[0].notes,
                })
                .eq('id', ideaId);
            
            if (error) throw error;
            
            // Update cache lokal
            const ideaIndex = ideasCache.findIndex(i => i.id === ideaId);
            if (ideaIndex !== -1) {
                ideasCache[ideaIndex].locations = locationsArray;
                // Update kolom lama juga
                ideasCache[ideaIndex].address = locationsArray[0].address;
                ideasCache[ideaIndex].maps_url = locationsArray[0].maps_url;
                ideasCache[ideaIndex].phone = locationsArray[0].phone;
                ideasCache[ideaIndex].opening_hours = locationsArray[0].opening_hours;
                ideasCache[ideaIndex].price_range = locationsArray[0].price_range;
                ideasCache[ideaIndex].website = locationsArray[0].website;
                ideasCache[ideaIndex].notes = locationsArray[0].notes;
            }
            
            alert(`✅ ${locationsArray.length} lokasi berhasil disimpan!`);
            
            // Tutup modal edit
            if (editInfoModal) {
                editInfoModal.classList.add('hidden');
                editInfoModal.style.display = 'none';
            }
            
            // Refresh tampilan detail
            renderIdeaDetailModal(ideaId);
            
        } catch (error) {
            console.error('Error saving locations:', error);
            alert('Gagal menyimpan lokasi: ' + error.message);
        } finally {
            saveAllLocations.disabled = false;
            saveAllLocations.textContent = '💾 Simpan Semua Lokasi';
        }
    });
}


function createLocationItem(locationData, index) {
    const template = locationItemTemplate.content.cloneNode(true);
    const container = template.querySelector('.location-item');
    
    container.dataset.locationIndex = index;
    
    // Populate fields
    container.querySelector('.location-name-input').value = locationData.name || '';
    container.querySelector('.location-address').value = locationData.address || '';
    container.querySelector('.location-maps-url').value = locationData.maps_url || '';
    container.querySelector('.location-phone').value = locationData.phone || '';
    container.querySelector('.location-opening-hours').value = locationData.opening_hours || '';
    container.querySelector('.location-price-range').value = locationData.price_range || '';
    container.querySelector('.location-website').value = locationData.website || '';
    container.querySelector('.location-notes').value = locationData.notes || '';
    
    // Delete button handler
    const deleteBtn = container.querySelector('.btn-delete-location');
    deleteBtn.addEventListener('click', () => {
        if (currentLocationsData.length === 1) {
            alert('Minimal harus ada 1 lokasi!');
            return;
        }
        
        if (confirm(`Hapus lokasi "${locationData.name}"?`)) {
            currentLocationsData.splice(index, 1);
            renderLocationsList();
        }
    });
    
    return container;
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
    // 1. Ambil Cities (Master Data)
    const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .order('display_order', { ascending: true });
    
    if (citiesError) { 
        console.error('Supabase fetch cities error', citiesError); 
    }
    citiesCache = cities || [];
    
    // 2. Ambil Kategori
    const { data: categories, error: catError } = await supabase
        .from('idea_categories')
        .select('*');
    if (catError) { console.error('Supabase fetch categories error', catError); }
    categoriesCache = categories || [];

    // 3. Ambil Ide (dengan city_id)
    const { data: ideas, error: ideaError } = await supabase
        .from('trip_ideas_v2') 
        .select(`
            *,
            idea_categories (
                category, 
                subtype, 
                icon, 
                photo_url
            )
        `)
        .order('created_at', { ascending: false });
        
    if (ideaError) { 
        console.error('Supabase fetch ideas error', ideaError); 
    }
    
    ideasCache = (ideas || []).map(idea => ({
        ...idea,
        category_name: idea.idea_categories.category,
        subtype_name: idea.idea_categories.subtype,
        icon: idea.idea_categories.icon,
        photo_url_category: idea.idea_categories.photo_url,
    }));
    
    // De-duplikasi
    const uniqueIdeasMap = new Map();
    ideasCache.forEach(idea => {
        if (idea.idea_name) {
            const key = `${idea.type_key}_${idea.idea_name.toLowerCase().trim()}`;
            if (!uniqueIdeasMap.has(key)) {
                uniqueIdeasMap.set(key, idea);
            }
        } else {
            uniqueIdeasMap.set(idea.id || Date.now(), idea);
        }
    });
    ideasCache = Array.from(uniqueIdeasMap.values());
    
    // 4. Ambil Reviews
    const { data: reviews, error: reviewError } = await supabase
        .from('idea_reviews')
        .select('*'); 
    if (reviewError) { console.error('Supabase fetch reviews error', reviewError); }
    
    allReviews = reviews || []; 
    
    // Calculate ratings
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
    
    // Debug log
    console.log('✅ Data loaded:', {
        cities: citiesCache.length,
        categories: categoriesCache.length,
        ideas: ideasCache.length,
        reviews: allReviews.length
    });
    
    // Populate city dropdown
    populateCityDropdown();
}

function populateCityDropdown() {
    if (!ideaCity) return;
    
    // Clear existing options (keep the first "-- Pilih Kota --")
    ideaCity.innerHTML = '<option value="">-- Pilih Kota --</option>';
    
    citiesCache.forEach(city => {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        ideaCity.appendChild(option);
    });
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
    
    // Generate stars HTML manually (karena perlu half-star support)
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= roundedRating) {
            starsHtml += '<span style="color: gold;">★</span>';
        } else if (i - 0.5 === roundedRating) {
            starsHtml += '<span style="color: gold; opacity: 0.5;">★</span>'; 
        } else {
            starsHtml += '<span style="color: #ccc;">★</span>';
        }
    }

    return `
        <div class="rating-display">
            <span class="star-icon">${starsHtml}</span>
            <span>${ratingData.average} | ${ratingData.count} Review</span>
        </div>
    `;
}
// --- Akhir Fungsi Utility ---

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

    // 2. RENDER MAPS & INFO SECTION
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
        // Fetch trip data
        const tripIds = [...new Set(reviews.map(r => r.trip_id).filter(Boolean))];
        
        const fetchTripsPromise = tripIds.length > 0 
            ? supabase.from('trip_history').select('id, trip_date, trip_day').in('id', tripIds)
            : Promise.resolve({ data: [] });
        
        fetchTripsPromise.then(({ data: trips, error: tripError }) => {
            if (tripError) {
                console.warn('Could not fetch trip dates:', tripError);
            }
            
            // Create trip lookup map
            const tripMap = {};
            (trips || []).forEach(trip => {
                tripMap[trip.id] = trip;
            });
            
            // Sort reviews
            reviews.sort((a, b) => {
                if (!a || !b) return 0; 
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB.getTime() - dateA.getTime(); 
            });

            // ✅ UPDATED: Render reviews with reviewer name
            reviews.forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';

                const reviewStars = '⭐'.repeat(review.rating || 0);
                const reviewPhotoHtml = renderPhotoUrls(review.photo_url, 'review-photo-main');
                const reviewVideoHtml = renderVideoUrls(review.video_url, 'review-video'); // ✅ TAMBAH INI
                
                // ✅ NEW: Render reviewer name
                const reviewerNameHtml = review.reviewer_name 
                    ? renderReviewerName(review.reviewer_name)
                    : '';
                
                // Trip date HTML
                let tripDateHtml = '';
                if (review.trip_id && tripMap[review.trip_id]) {
                    const trip = tripMap[review.trip_id];
                    const tripDateFormatted = formatTanggalIndonesia(trip.trip_date);
                    tripDateHtml = `<div class="review-trip-date">📅 Trip: ${tripDateFormatted}</div>`;
                }
                
                reviewItem.innerHTML = `
                    ${reviewerNameHtml}
                    <div class="review-rating">${reviewStars}</div>
                    ${tripDateHtml}
                    <p class="review-text">${review.review_text || '(Tidak ada komentar)'}</p>
                    ${reviewPhotoHtml}
                    ${reviewVideoHtml}
                `;

                detailReviewList.appendChild(reviewItem);
            });
            
            if (noReviewsMessage) {
                noReviewsMessage.style.display = 'none';
            }
        });

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
    
    const locations = idea.locations || [];
    
    // Jika tidak ada data locations, fallback ke kolom lama
    if (locations.length === 0 && (idea.address || idea.maps_url)) {
        locations.push({
            name: 'Lokasi Utama',
            address: idea.address,
            maps_url: idea.maps_url,
            phone: idea.phone,
            opening_hours: idea.opening_hours,
            price_range: idea.price_range,
            website: idea.website,
            notes: idea.notes
        });
    }
    
    let html = '';
    
    if (locations.length > 0) {
        html += `
            <div class="multiple-locations-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="margin: 0;">📍 Lokasi (${locations.length} Cabang)</h4>
                    <button class="btn secondary small" onclick="editIdeaInfo('${idea.id}')" style="padding: 6px 12px; font-size: 0.85em;">
                        ✏️ Kelola Lokasi
                    </button>
                </div>
        `;
        
        locations.forEach((location, index) => {
            const isFirst = index === 0;
            const hasLocationData = location.address || location.maps_url;
            const hasInfoData = location.phone || location.opening_hours || location.price_range || location.website || location.notes;
            
            let mapsEmbedUrl = '';
            if (location.maps_url) {
                mapsEmbedUrl = convertToEmbedUrl(location.maps_url);
            } else if (location.address) {
                const encodedAddress = encodeURIComponent(location.address);
                mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
            }
            
            html += `
                <details class="location-accordion" ${isFirst ? 'open' : ''}>
                    <summary class="location-accordion-summary">
                        ${location.name || `Lokasi ${index + 1}`}
                    </summary>
                    <div class="location-accordion-content">
            `;
            
            // Address & Maps
            if (hasLocationData) {
                if (location.address) {
                    html += `
                        <div class="address-display">
                            <p>📍 ${location.address}</p>
                        </div>
                    `;
                }
                
                if (mapsEmbedUrl) {
                    html += `
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
                    `;
                }
                
                if (location.maps_url) {
                    html += `
                        <a href="${location.maps_url}" target="_blank" class="btn-open-maps">
                            🗺️ Buka di Google Maps
                        </a>
                    `;
                }
            }
            
            // Info Detail
            if (hasInfoData) {
                html += `<div class="info-section-inline"><h5>ℹ️ Informasi Detail</h5><div class="info-grid">`;
                
                if (location.phone) {
                    html += `
                        <div class="info-item">
                            <span class="info-label">📞 Telepon:</span>
                            <span class="info-value"><a href="tel:${location.phone}">${location.phone}</a></span>
                        </div>
                    `;
                }
                
                if (location.opening_hours) {
                    html += `
                        <div class="info-item">
                            <span class="info-label">🕐 Jam Buka:</span>
                            <span class="info-value">${location.opening_hours}</span>
                        </div>
                    `;
                }
                
                if (location.price_range) {
                    html += `
                        <div class="info-item">
                            <span class="info-label">💰 Kisaran Harga:</span>
                            <span class="info-value">${location.price_range}</span>
                        </div>
                    `;
                }
                
                if (location.website) {
                    html += `
                        <div class="info-item">
                            <span class="info-label">🌐 Website:</span>
                            <span class="info-value"><a href="${location.website}" target="_blank">${formatUrl(location.website)}</a></span>
                        </div>
                    `;
                }
                
                if (location.notes) {
                    html += `
                        <div class="info-item full-width">
                            <span class="info-label">📝 Catatan:</span>
                            <span class="info-value">${location.notes}</span>
                        </div>
                    `;
                }
                
                html += `</div></div>`;
            }
            
            html += `
                    </div>
                </details>
            `;
        });
        
        html += `</div>`;
    } else {
        // No locations at all
        html = `
            <div class="no-info-message">
                <p>💡 <strong>Info lokasi belum ditambahkan.</strong></p>
                <button class="btn secondary" onclick="editIdeaInfo('${idea.id}')" style="margin-top: 10px;">
                    ✏️ Tambah Lokasi
                </button>
            </div>
        `;
    }
    
    mapsInfoContainer.innerHTML = html;
    
    // Setup accordion behavior (hanya 1 terbuka)
    setupLocationAccordion();
}

function setupLocationAccordion() {
    document.querySelectorAll('.location-accordion').forEach(accordion => {
        accordion.addEventListener('toggle', (e) => {
            if (e.target.open) {
                // Tutup semua accordion lain
                document.querySelectorAll('.location-accordion').forEach(other => {
                    if (other !== e.target && other.open) {
                        other.open = false;
                    }
                });
            }
        });
    });
}


// =================================================================
// 2. RENDERING IDEAS (FIX LOGIKA DUPLIKASI ANTAR LEVEL)
// =================================================================

// js/main.js (PATCH: Membuat Kategori Utama Collapsible)

// ... (Import dan variabel lainnya tetap sama) ...

// =================================================================
// 2. RENDERING IDEAS (FIX: Kategori Utama juga Collapsible)
// =================================================================
// ✅ FUNGSI BARU: Filter subtype dropdown dengan search
function setupSubtypeSearch() {
    const subtypeSearchInput = document.getElementById('subtypeSearch');
    const ideaSubtype = document.getElementById('ideaSubtype');
    
    if (!subtypeSearchInput || !ideaSubtype) return;
    
    subtypeSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        // Filter options
        Array.from(ideaSubtype.options).forEach(option => {
            const text = option.textContent.toLowerCase();
            
            if (text.includes(query)) {
                option.style.display = '';
            } else {
                option.style.display = 'none';
            }
        });
    });
}

function renderCategoryBadge(catGroup, cityId) {
    const count = countSelectedInCategoryForCity(catGroup, cityId);
    
    // KRITIS: Pastikan badge selalu render ulang
    if (count > 0) {
        return `<span class="selection-badge">${count}</span>`;
    }
    return '';
}
function renderCategoriesForDay(selectedDate) {
    activityArea.innerHTML = '';
    
    if (!selectedDate && ideasCache.length > 0) {
        activityArea.innerHTML = '<p class="info-message">☝️ **Pilih tanggal trip Anda di atas** untuk melihat opsi aktivitas yang tersedia!</p>';
        return;
    }
    
    // ✅ Filter by search (FIXED - make sure this is called)
    let filteredIdeas = filterIdeasBySearch(ideasCache, searchQuery);
    
    // Handle no results
    if (searchQuery && searchQuery.trim() !== '' && filteredIdeas.length === 0) {
        activityArea.innerHTML = `
            <div class="no-results-message">
                <p>🔍 Tidak ada hasil untuk "<strong>${searchQuery}</strong>"</p>
                <small>Coba kata kunci lain atau periksa ejaan</small>
            </div>
        `;
        return;
    }
    
    // Group data
    const groupedCategories = categoriesCache.reduce((acc, current) => {
        const key = current.category;
        if (!acc[key]) { acc[key] = { category: key, subtypes: [] }; }
        acc[key].subtypes.push(current);
        return acc;
    }, {});

    const ideasBySubtype = filteredIdeas.reduce((acc, current) => {
        const key = current.type_key;
        const isDayMatch = current.day_of_week === '' || current.day_of_week === null || current.day_of_week === undefined;
        
        if (isDayMatch) { (acc[key] = acc[key] || []).push(current); }
        return acc;
    }, {});
    
    const ideasByCity = filteredIdeas.reduce((acc, idea) => {
        const cityKey = idea.city_id || 'no-city';
        if (!acc[cityKey]) {
            acc[cityKey] = [];
        }
        acc[cityKey].push(idea);
        return acc;
    }, {});
    
    // Sort cities alphabetically
    const sortedCities = [
        ...sortAlphabetically(citiesCache, 'name'),
        { id: 'no-city', name: 'Tanpa Kota', display_order: 9999 }
    ];
    
    // Show search results info
    if (searchQuery && searchQuery.trim() !== '') {
        const totalResults = filteredIdeas.length;
        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-results-info';
        searchInfo.innerHTML = `
            <p>🔍 Ditemukan <strong>${totalResults}</strong> hasil untuk "<strong>${searchQuery}</strong>"</p>
        `;
        activityArea.appendChild(searchInfo);
    }
    
    // Render per city
    sortedCities.forEach(city => {
        const ideasInCity = ideasByCity[city.id] || [];
        
        if (ideasInCity.length === 0) return;
        
        const cityCard = document.createElement('div');
        cityCard.className = `city-card ${city.id === 'no-city' ? 'no-city-group' : ''}`;
        
        cityCard.innerHTML = `
            <details class="city-details" open>
                <summary>${city.name}</summary>
                <div class="city-content"></div>
            </details>
        `;
        
        const cityContent = cityCard.querySelector('.city-content');
        
        // Sort categories alphabetically
        const sortedCategoryGroups = sortAlphabetically(
            Object.values(groupedCategories), 
            'category'
        );
        
        sortedCategoryGroups.forEach(catGroup => {
            const card = document.createElement('div');
            card.className = 'category-card';
            
            const icon = catGroup.subtypes[0]?.icon || '📍';
            
            const categoryBadge = renderCategoryBadge(catGroup, city.id);

            card.innerHTML = `
                <details class="category-details" open>
                    <summary class="category-summary">
                        ${icon} ${catGroup.category} ${categoryBadge}
                    </summary>
                    <div class="subtypes-wrap"></div>
                </details>
            `;
            
            const subtypesWrap = card.querySelector('.subtypes-wrap');
            let hasContentInCity = false;

            // Sort subtypes alphabetically
            const sortedSubtypes = catGroup.subtypes.sort((a, b) => 
                a.subtype.localeCompare(b.subtype, 'id-ID')
            );

            sortedSubtypes.forEach(subtype => {
                const ideasList = (ideasBySubtype[subtype.type_key] || [])
                    .filter(idea => (idea.city_id || 'no-city') === city.id);
                
                const hasIdeas = ideasList.length > 0;
                const hasLevel2Photo = !!subtype.photo_url;
                
                const selectedCountInSubtype = countSelectedInSubtypeForCity(subtype.type_key, ideasList);
                const subtypeBadge = selectedCountInSubtype > 0 ? `<span class="selection-badge small">${selectedCountInSubtype}</span>` : '';
                
                if (hasIdeas || (hasLevel2Photo && !hasIdeas)) {
                    hasContentInCity = true;
                    
                    const details = document.createElement('details');
                    details.className = 'subtype-details';
                    details.setAttribute('open', '');
                    
                    const summary = document.createElement('summary');
                    // ✅ KRITIS: REMOVE ICON - Hanya text dan badge!
                    summary.textContent = subtype.subtype + ' '; // Text only, no icon!
                    
                    // Append badge jika ada (sebagai DOM element, bukan innerHTML)
                    if (subtypeBadge) {
                        const badgeSpan = document.createElement('span');
                        badgeSpan.className = 'selection-badge small';
                        badgeSpan.textContent = selectedCountInSubtype;
                        summary.appendChild(badgeSpan);
                    }


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
                        // Sort ideas alphabetically
                        const sortedIdeasList = ideasList.sort((a, b) => 
                            a.idea_name.localeCompare(b.idea_name, 'id-ID')
                        );
                        
                        sortedIdeasList.forEach(item => {
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

            if (hasContentInCity) {
                cityContent.appendChild(card);
            }
        });
        
        if (cityContent.children.length > 0) {
            activityArea.appendChild(cityCard);
        }
    });

    setupImageClickHandlers();
    setupDetailsCollapse();
    setupCategoryCollapse();
    populateIdeaCategorySelect();
    renderSelectedActivitiesPanel();
}
function renderSubtypeBadge(typeKey, ideasList) {
    const count = countSelectedInSubtypeForCity(typeKey, ideasList);
    
    if (count > 0) {
        return `<span class="selection-badge small">${count}</span>`;
    }
    return '';
}
function countSelectedInSubtypeForCity(typeKey, ideasList) {
    let count = 0;
    const level2Id = `cat-${typeKey}`;
    if (selectedIdeaIds.has(level2Id)) count++;
    
    ideasList.forEach(idea => {
        if (selectedIdeaIds.has(idea.id)) count++;
    });
    
    return count;
}



function countSelectedInCategoryForCity(catGroup, cityId) {
    let count = 0;
    catGroup.subtypes.forEach(subtype => {
        const level2Id = `cat-${subtype.type_key}`;
        if (selectedIdeaIds.has(level2Id)) count++;
        
        const ideasInSubtype = ideasCache.filter(i => 
            i.type_key === subtype.type_key && 
            (i.city_id || 'no-city') === cityId
        );
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
    if (!itemData) {
        console.warn('Item data not found for ideaId:', ideaId);
        return;
    }
    
    // ✅ STEP 1: Buka CITY accordion (Level 0) dulu
    const cityCards = document.querySelectorAll('.city-card');
    let targetCityCard = null;
    
    cityCards.forEach(cityCard => {
        const cityDetails = cityCard.querySelector('.city-details');
        if (!cityDetails) return;
        
        // Cek apakah di city ini ada kategori yang match
        const categoryCardsInCity = cityCard.querySelectorAll('.category-card');
        categoryCardsInCity.forEach(categoryCard => {
            const categoryDetails = categoryCard.querySelector('.category-details');
            if (!categoryDetails) return;
            
            const categorySummary = categoryDetails.querySelector('summary.category-summary');
            if (!categorySummary) return;
            
            // Extract category name (remove icon, badge, extra spaces)
            let categoryText = categorySummary.textContent.trim();
            // Remove leading icon/emoji
            categoryText = categoryText.replace(/^[^\w\s]+\s*/, '');
            // Remove trailing badge (numbers in parentheses or standalone)
            categoryText = categoryText.replace(/\s*\d+\s*$/, '').trim();
            
            if (categoryText === itemData.category) {
                targetCityCard = cityCard;
                
                // ✅ BUKA city accordion
                cityDetails.open = true;
                
                // ✅ STEP 2: Buka category accordion (Level 1)
                categoryDetails.open = true;
                
                // ✅ STEP 3: Buka subtype accordion (Level 2)
                const subtypeDetailsArray = categoryCard.querySelectorAll('.subtype-details');
                subtypeDetailsArray.forEach(subtypeDetail => {
                    const subtypeSummary = subtypeDetail.querySelector('summary');
                    if (!subtypeSummary) return;
                    
                    // Extract subtype name (remove icon, badge, extra spaces)
                    let subtypeText = subtypeSummary.textContent.trim();
                    // Remove leading icon/emoji
                    subtypeText = subtypeText.replace(/^[^\w\s]+\s*/, '');
                    // Remove trailing badge
                    subtypeText = subtypeText.replace(/\s*\d+\s*$/, '').trim();
                    
                    if (subtypeText === itemData.subtype) {
                        subtypeDetail.open = true;
                    }
                });
            }
        });
    });
    
    // ✅ STEP 4: Wait untuk accordion animation selesai, baru scroll
    setTimeout(() => {
        const targetItem = document.querySelector(`.option-item[data-ideaid="${ideaId}"]`);
        if (targetItem) {
            // Scroll dengan offset agar tidak tertutup header sticky
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const elementPosition = targetItem.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight - 20; // Extra 20px padding
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // ✅ STEP 5: Highlight dengan animation
            targetItem.classList.add('highlight-flash');
            setTimeout(() => {
                targetItem.classList.remove('highlight-flash');
            }, 2000); // 2 detik highlight
        } else {
            console.warn('Target item not found in DOM:', ideaId);
        }
    }, 300); // Tunggu 300ms untuk accordion animation
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
document.addEventListener('DOMContentLoaded', () => {
    // ... (existing code) ...
    
    setupSearchBar();
    setupSubtypeSearch(); // ✅ NEW
});
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
    const isEditMode = localStorage.getItem('editMode') === 'true';
    const editTripId = localStorage.getItem('editTripId');
    
    if (isEditMode && editTripId) {
        // Show edit mode indicator
        showEditModeIndicator(editTripId);
    }

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

// ============================================================
// EDIT MODE INDICATOR
// ============================================================

function showEditModeIndicator(tripId) {
    // Create indicator banner
    const indicator = document.createElement('div');
    indicator.className = 'edit-mode-indicator';
    indicator.id = 'editModeIndicator';
    
    indicator.innerHTML = `
        <div class="indicator-content">
            <span class="indicator-icon">✏️</span>
            <div class="indicator-text">
                <strong>Mode Edit Trip</strong>
                <small>Anda sedang mengubah trip yang sudah ada. Tambah/kurangi aktivitas, lalu Generate ulang.</small>
            </div>
            <button class="btn-cancel-edit" id="cancelEditMode">❌ Batal Edit</button>
        </div>
    `;
    
    // Insert setelah header
    const header = document.querySelector('header');
    header.after(indicator);
    
    // Handler untuk cancel edit
    document.getElementById('cancelEditMode').addEventListener('click', () => {
        if (confirm('Batalkan edit dan kembali ke mode normal?')) {
            localStorage.removeItem('editMode');
            localStorage.removeItem('editTripId');
            window.location.reload();
        }
    });
}

function populateIdeaSubtypeSelect(selectedCategory, filterCity = null) {
    ideaSubtype.innerHTML = '';
    
    if (selectedCategory === 'custom') {
        const opt = document.createElement('option');
        opt.value = 'custom-new';
        opt.textContent = 'Tambahkan Sub-tipe Baru...';
        ideaSubtype.appendChild(opt);
        toggleNewSubtypeInput(ideaSubtype.value);
        return;
    }
    
    // Filter subtypes berdasarkan category DAN city (jika dipilih)
    const subtypes = categoriesCache.filter(c => {
        // Filter by category
        if (c.category !== selectedCategory) return false;
        
        // ✅ KRITIS: Filter by city jika user sudah pilih kota
        if (filterCity) {
            // Asumsi: subtype mengandung nama kota atau ada di cities table
            // Option 1: Jika subtype format: "Fast Food - Jakarta"
            const containsCity = c.subtype.toLowerCase().includes(filterCity.toLowerCase());
            
            // Option 2: Jika subtype adalah nama kota langsung
            const isExactCity = c.subtype.toLowerCase() === filterCity.toLowerCase();
            
            // Option 3: Cek dari city_id di categoriesCache (jika ada)
            const matchesCityId = c.city_id === filterCity;
            
            // Return true jika salah satu kondisi terpenuhi
            return containsCity || isExactCity || matchesCityId;
        }
        
        return true;  // Jika tidak ada filter city, tampilkan semua
    });
    
    // ✅ FALLBACK: Jika tidak ada subtype yang match, tampilkan semua
    const finalSubtypes = subtypes.length > 0 ? subtypes : 
        categoriesCache.filter(c => c.category === selectedCategory);
    
    finalSubtypes.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub.type_key;
        opt.textContent = sub.subtype;
        ideaSubtype.appendChild(opt);
    });
    
    // Add custom option
    const custom = document.createElement('option');
    custom.value = 'custom-new';
    custom.textContent = 'Tambahkan Sub-tipe Baru...';
    ideaSubtype.appendChild(custom);
    
    toggleNewSubtypeInput(ideaSubtype.value);
}

if (ideaCity) {
    ideaCity.addEventListener('change', (e) => {
        const selectedCity = e.target.value;  // 'jakarta', 'bandung', atau ''
        const selectedCategory = ideaCategory.value;
        
        if (selectedCategory) {
            // Re-populate subtype dengan filter city
            const cityName = selectedCity ? 
                citiesCache.find(c => c.id === selectedCity)?.name : 
                null;
            
            populateIdeaSubtypeSelect(selectedCategory, cityName);
        }
    });
}

ideaCategory.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;
    const selectedCityId = ideaCity?.value;
    
    // Get city name dari ID
    const cityName = selectedCityId ? 
        citiesCache.find(c => c.id === selectedCityId)?.name : 
        null;
    
    // Populate subtype dengan filter city
    populateIdeaSubtypeSelect(selectedCategory, cityName);
    toggleNewCategoryInput(selectedCategory);
});

// --- Event Listeners lainnya ---



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
    const cityId = ideaCity.value || null; // ✅ NEW: Get city_id
    
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
    let imageUrl = file ? await uploadImage(file, currentUser.id || 'anon') : null;
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
            // ✅ FIX: Hanya save foto jika TIDAK ADA nama ide (pure kategori baru)
            // Kalau ada nama ide, foto akan di-save ke trip_ideas_v2 di bawah
            const categoryPhotoUrl = (!title && imageUrl) ? imageUrl : null;
            
            const { error: catInsertError } = await supabase
                .from('idea_categories')
                .insert({ 
                    category: finalCategoryName, 
                    subtype: finalSubtypeName, 
                    icon: '🆕', 
                    type_key: finalTypeKey,
                    photo_url: categoryPhotoUrl, // ✅ NULL jika ada nama ide
                });

            if (catInsertError) {
                console.error('Gagal insert kategori kustom:', catInsertError);
                handleFailure(`Gagal menyimpan kategori baru: ${catInsertError.message}`);
                return;
            }
            await fetchData();
        }
    }

    // UPDATE foto kategori HANYA jika pure kategori tanpa nama ide
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

    // Save nama ide (Level 3) - foto akan di-save di sini jika ada nama
    if (title) {
        const doc = {
            idea_name: title,
            type_key: finalTypeKey, 
            day_of_week: "", 
            photo_url: imageUrl, // ✅ Foto di-save di trip_ideas_v2
            city_id: cityId,
            ...detailInfo
        };
        
        try {
            const { error } = await supabase
              .from('trip_ideas_v2') 
              .insert([doc]);

            if (error) throw error;
        } catch (err) {
            console.error('Gagal insert ide Level 3:', err);
            handleFailure(`Gagal menyimpan ide: ${err.message}`);
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

    // ✅ BARU: Jangan hapus editMode dan editTripId, biar summary.js tahu ini mode edit
    
    window.location.href = 'summary.html';
});


// ============================================================
// BUG FIX: ACCORDION CONTROLS - COLLAPSE ALL (DIPERBAIKI)
// Ganti fungsi collapseAllDetails() yang ada dengan ini
// ============================================================

function setupAccordionControls() {
    const collapseBtn = document.getElementById('collapseAllBtn');
    
    console.log('🔍 Accordion Controls:', {
        collapseBtn: collapseBtn ? 'Found ✅' : 'NOT FOUND ❌'
    });
    
    // ✅ Return early jika tombol tidak ada
    if (!collapseBtn) {
        console.warn('⚠️ Collapse button not found, skipping accordion controls setup');
        return;
    }
    
    // ✅ Helper: Collapse all details
    function collapseAllDetails() {
        const allDetails = document.querySelectorAll('.city-details, .category-details, .subtype-details');
        
        console.log('📁 Collapsing', allDetails.length, 'accordions');
        
        allDetails.forEach(detail => {
            detail.open = false;
            detail.removeAttribute('open');
        });
        
        console.log('✅ Collapse complete');
    }
    
    // ✅ Collapse All Button Event
    collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        collapseBtn.disabled = true;
        collapseBtn.textContent = '⏳ Menutup...';
        
        // Collapse dengan slight delay untuk visual feedback
        setTimeout(() => {
            collapseAllDetails();
            localStorage.setItem('accordionState', 'collapsed');
            
            collapseBtn.disabled = false;
            collapseBtn.textContent = '➖ Tutup Semua';
        }, 100);
    });
    
    console.log('✅ Accordion controls initialized (Collapse only)');
}

// Restore accordion state from localStorage (IMPROVED)
function restoreAccordionState() {
    const savedState = localStorage.getItem('accordionState');
    
    if (savedState === 'collapsed') {
        // Tutup semua level
        setTimeout(() => {
            document.querySelectorAll('.city-details, .category-details, .subtype-details').forEach(detail => {
                detail.open = false;
                detail.removeAttribute('open');
            });
            console.log('✅ Restored: All collapsed');
        }, 100);
    }
    // ✅ Jika tidak ada state atau state lain, biarkan default (open)
    // Default behavior dari HTML <details open> akan jalan
}

// ============================================================
// NAVIGATION: History Button Handler
// ============================================================

function setupNavigationHandlers() {
    const historyNavBtn = document.getElementById('historyNavBtn');
    const viewHistoryBtn = document.getElementById('viewHistoryBtn');
    
    if (historyNavBtn && viewHistoryBtn) {
        historyNavBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Trigger modal history yang sudah ada
            viewHistoryBtn.click();
        });
    }
}
// Init
// Init
(async function init(){
    await fetchData(); 
    
    loadInitialState();
    const isEditMode = localStorage.getItem('editMode') === 'true';
    if (isEditMode) {
        generateBtn.innerHTML = '🔄 Update Trip (Generate Ulang)';
        generateBtn.classList.add('edit-mode-button');
    }
    startCountdown();
    
    // NEW: Setup accordion controls
    setupAccordionControls();
    restoreAccordionState();
    setupNavigationHandlers();
    
    // ✅ TAMBAHKAN CODE INI DI SINI (SEBELUM CLOSING })(); )
    // Video preview handler
    if (ideaReviewVideoInput && ideaReviewVideoPreview) {
        ideaReviewVideoInput.addEventListener('change', (e) => {
            ideaReviewVideoPreview.innerHTML = '';
            
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
                    video.style.marginTop = '10px';
                    ideaReviewVideoPreview.appendChild(video);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
})(); // <-- INI TETAP ADA, JANGAN DIHAPUS