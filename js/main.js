// js/main.js (Logika utama)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

/* ====== Supabase Config ====== */
// GANTI DENGAN KREDENSIAL ANDA
const supabaseUrl = "https://rdoywpzkfddvrxrwmvsc.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb3l3cHprZmRkdnJ4cndtdnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDIyNzUsImV4cCI6MjA3NTY3ODI3NX0.CxlF8rihbLEOSef4ItWelqoCVIgr7JL03uGdpNWMKGIU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

let currentUser = { id: 'anon' }; 

// UI refs
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

// Input KUSTOM dan FOTO
const newCategoryInput = document.getElementById('newCategoryInput');
const newSubtypeInput = document.getElementById('newSubtypeInput');
const ideaImageInput = document.getElementById('ideaImageInput'); 

// Cache data
let categoriesCache = [];
let ideasCache = [];


// --- HELPER FUNCTIONS ---

function getSelectedDays(){
    return Array.from(document.querySelectorAll("input[name='hari']:checked")).map(i=>i.value);
}

async function fetchData() {
    const { data: categories, error: catError } = await supabase
        .from('idea_categories')
        .select('*');
    if (catError) { console.error('Supabase fetch categories error', catError); return; }
    categoriesCache = categories;

    const { data: ideas, error: ideaError } = await supabase
        .from('trip_ideas_v2') 
        .select('*')
        .order('created_at', { ascending: false });
    if (ideaError) { console.error('Supabase fetch ideas error', ideaError); return; }
    ideasCache = ideas;
}

async function uploadImage(file){
    if (!file) return null;
    const uid = currentUser.id || 'anon';
    const path = `${uid}/${Date.now()}_${file.name}`;
    
    // Pastikan RLS Storage di bucket 'trip-ideas-images' mengizinkan INSERT untuk peran 'anon'
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


// --- RENDER FUNCTION (DENGAN COLLAPSIBLE) ---

async function renderCategoriesForDay(day){
    if (categoriesCache.length === 0) { await fetchData(); }

    activityArea.innerHTML = '';
    
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
            
            // Tentukan apakah subtype ini memiliki konten
            const hasContent = ideasList.length > 0 || subtype.photo_url;

            if (hasContent) {
                // Gunakan <details> untuk efek collapse
                const details = document.createElement('details');
                details.className = 'subtype-details';

                // Buka jika kontennya sedikit (1 atau 2 item)
                const shouldBeOpen = ideasList.length + (subtype.photo_url ? 1 : 0) <= 2;
                if (shouldBeOpen) {
                    details.setAttribute('open', '');
                }

                // LEVEL 2 SUMMARY (JUDUL)
                const summary = document.createElement('summary');
                summary.textContent = subtype.subtype;
                details.appendChild(summary);

                // LEVEL 3 WRAPPER
                const optionsWrap = document.createElement('div');
                optionsWrap.className = 'options-wrap';
                optionsWrap.dataset.typeKey = subtype.type_key;
                
                // Opsi Level 2 (jika ada foto)
                if (subtype.photo_url) {
                    const div = document.createElement('div');
                    div.className = 'option-item';
                    div.datasetSource = 'subtype'; 
                    div.innerHTML = `
                        <label>
                            <input type="checkbox" 
                                data-cat="${catGroup.category}" 
                                data-subtype="${subtype.subtype}" 
                                data-name="${subtype.subtype}" 
                                data-ideaid="cat-${subtype.type_key}">
                            <img src="${subtype.photo_url}" alt="${subtype.subtype}">
                            <span style="display:block; font-weight:bold;">${subtype.subtype}</span>
                            <small style="display:block; color: #bcd8ff; opacity:0.9">(Pilih Sub-tipe)</small>
                        </label>
                    `;
                    optionsWrap.appendChild(div);
                }

                // Render Level 3 (Ideas/Places)
                ideasList.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'option-item';
                    div.datasetSource = 'idea';
                    div.innerHTML = `
                        <label>
                            <input type="checkbox" 
                                data-cat="${catGroup.category}" 
                                data-subtype="${subtype.subtype}" 
                                data-name="${item.idea_name}" 
                                data-ideaid="${item.id}">
                            <img src="${item.photo_url || 'images/placeholder.jpg'}" alt="${item.idea_name}">
                            <span style="display:block; font-weight:bold;">${item.idea_name}</span>
                            <small style="display:block; color: #bcd8ff; opacity:0.9">(${subtype.subtype})</small>
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

    populateIdeaCategorySelect();
}


// --- EVENT LISTENERS (Open/Close Modal & Change Dropdowns) ---

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


// --- SUBMIT FORM ---

ideaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cat = ideaCategory.value;
    const subtypeVal = ideaSubtype.value;
    const title = ideaTitle.value.trim();
    const day = ideaDay.value; 
    const file = ideaImageInput.files[0]; 

    // Validasi: Jika Level 3 kosong, harus ada kategori/sub-tipe baru atau foto untuk sub-tipe lama
    if (!title && cat !== 'custom' && subtypeVal !== 'custom-new' && !file) {
         alert('Jika Nama Ide kosong, Anda harus membuat Kategori/Sub-tipe baru ATAU menambahkan foto untuk Sub-tipe yang sudah ada.');
         return;
    }
    
    let finalTypeKey = subtypeVal;
    let imageUrl = file ? await uploadImage(file) : null;
    let isNewCombo = false;

    // LOGIKA HANDLING KUSTOM (Level 1 & 2)
    if (cat === 'custom' || subtypeVal === 'custom-new') {
        const newCategoryName = cat === 'custom' ? newCategoryInput.value.trim() : cat;
        const newSubtypeName = subtypeVal === 'custom-new' ? newSubtypeInput.value.trim() : categoriesCache.find(c => c.type_key === subtypeVal)?.subtype;

        if (cat === 'custom' && !newCategoryName) { alert('Nama kategori baru tidak boleh kosong.'); return; }
        if (subtypeVal === 'custom-new' && !newSubtypeName) { alert('Nama sub-tipe baru tidak boleh kosong.'); return; }
        
        finalTypeKey = `${newCategoryName.toLowerCase().replace(/\s/g, '-')}-${newSubtypeName.toLowerCase().replace(/\s/g, '-')}`;
        isNewCombo = !categoriesCache.some(c => c.type_key === finalTypeKey);

        if (isNewCombo) {
            // INSERT BARU (Level 1 & 2)
            const { error: catInsertError } = await supabase
                .from('idea_categories')
                .insert({ 
                    category: newCategoryName, 
                    subtype: newSubtypeName, 
                    icon: '🆕', 
                    type_key: finalTypeKey,
                    photo_url: imageUrl 
                });
            if (catInsertError) {
                 console.error('Gagal insert kategori kustom:', catInsertError);
                 alert('Gagal menyimpan kategori baru. **Pastikan RLS di idea_categories mengizinkan INSERT untuk peran anon!**');
                 return;
            }
            await fetchData(); 
        } 
    } 
    
    // UPDATE FOTO LEVEL 2 (Jika Kategori Lama & Level 3 Kosong & Ada Foto)
    else if (!isNewCombo && imageUrl && !title) {
        // Logika ini hanya berjalan jika tidak ada Level 3 (title)
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


    // INSERT IDEAS (Level 3) HANYA JIKA NAMA IDE (TITLE) DIISI
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
            console.error(err);
            alert('Gagal menyimpan ide Level 3. **Pastikan RLS di trip_ideas_v2 mengizinkan INSERT untuk peran anon!**');
            return;
        }
    }
    
    alert('Idemu tersimpan! 🎉');
    modal.classList.add('hidden');
    ideaForm.reset();
    
    newCategoryInput.style.display = 'none'; 
    newSubtypeInput.style.display = 'none';

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
          ideaId: i.dataset.ideaid || null 
      }));

    if (checked.length === 0) { alert('Pilih minimal satu aktivitas'); return; }

    localStorage.setItem('tripDays', JSON.stringify(days));
    localStorage.setItem('tripSelections', JSON.stringify(checked));
    window.location.href = 'summary.html';
});

// Init
(async function init(){
    await fetchData(); 
    document.querySelectorAll("input[name='hari']").forEach(chk => {
        chk.addEventListener('change', () => {
            const days = getSelectedDays();
            renderCategoriesForDay(days[0] || '');
        });
    });
    renderCategoriesForDay('');
})();