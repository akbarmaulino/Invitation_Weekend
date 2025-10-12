// js/summary.js (Logika untuk halaman summary.html - FINAL Share Gambar)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; 

/* ====== Supabase Config ====== */
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

const selectionList = document.getElementById('selectionList');
const tripDayDisplay = document.getElementById('tripDayDisplay');
const tripDateDisplay = document.getElementById('tripDateDisplay');
const secretMessageDisplay = document.getElementById('secretMessageDisplay');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); 
const ticketDiv = document.getElementById('ticket');

// --- PENGATURAN AWAL & DATA LOADING (Sama seperti sebelumnya) ---

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


// ============== FUNGSI BARU: Menyimpan Riwayat ke Supabase ==============
async function saveTripHistory(day, date, selections, message) {
    const tripDateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    if (!supabase) {
        console.error("Supabase client not initialized.");
        return;
    }

    const { error } = await supabase
        .from('trip_history') // Pastikan ini nama tabel Anda
        .insert({
            trip_day: day,
            trip_date: tripDateString,
            selection_json: selections,
            secret_message: message,
        });

    if (error) {
        console.error("Gagal menyimpan riwayat tiket:", error.message);
    } else {
        console.log(`Riwayat tiket pada ${tripDateString} berhasil disimpan!`);
    }
}
// ========================================================================


function loadSummary() {
    const selectedDays = JSON.parse(localStorage.getItem('tripDays') || '[]');
    const selections = JSON.parse(localStorage.getItem('tripSelections') || '[]');
    const secretMessage = localStorage.getItem('secretMessage') || '';

    if (selectedDays.length === 0 || selections.length === 0) {
        // Jangan alert, langsung redirect agar lebih smooth
        console.warn('Data rencana trip tidak ditemukan. Kembali ke halaman utama.');
        window.location.href = 'index.html'; 
        return;
    }

    const mainDay = selectedDays[0];
    const tripDate = getTripDate(mainDay);
    
    tripDayDisplay.textContent = mainDay;
    tripDateDisplay.textContent = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    selectionList.innerHTML = '';
    
    // =================================================================
    // START: PERBAIKAN UTAMA DI SINI
    // =================================================================
    selections.forEach(item => {
        const li = document.createElement('li');
        // Gunakan item.name yang sudah tersimpan dari main.js
        // Format: Nama Ide (Sub-tipe)
        li.textContent = `${item.name} (${item.subtype})`; 
        selectionList.appendChild(li);
    });
    // =================================================================
    // END: PERBAIKAN UTAMA
    // =================================================================
    
    if (secretMessage) {
        secretMessageDisplay.textContent = secretMessage + ' 🎤';
        secretMessageDisplay.style.display = 'block';
    } else {
        secretMessageDisplay.style.display = 'none';
    }
    
    // UBAH TAMPILAN TOMBOL SHARE
    shareBtn.textContent = '📲 Share Tiket (WA/Foto)';
    shareBtn.classList.remove('secondary');
    shareBtn.classList.add('primary'); 
    
    // PANGGIL FUNGSI BARU DI SINI: Menyimpan data ke riwayat
    saveTripHistory(mainDay, tripDate, selections, secretMessage);
}


// --- FUNGSI SHARE KARCIS SEBAGAI GAMBAR KE WA/SOSMED ---
// ... (Kode shareBtn.addEventListener dan fungsi downloadCanvas tidak diubah) ...
shareBtn.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        return;
    }
    
    shareBtn.textContent = 'Memproses Gambar... ⏳';
    shareBtn.disabled = true;
    
    let canvas;
    try {
        canvas = await html2canvas(ticketDiv, { 
            scale: 3, 
            useCORS: true, 
            logging: true 
        });

        if (canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas gagal dibuat.');
        }
        
    } catch (error) {
        console.error('Pembuatan Canvas Gagal:', error);
        alert('Gagal membuat gambar karcis. Coba tekan "Download Tiket" terlebih dahulu.');
        shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
        shareBtn.disabled = false;
        return;
    }

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], 'dummy.png')] })) {
        
        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert('Gagal konversi gambar. Silakan coba tombol Download.');
                return;
            }
            
            const file = new File([blob], 'karcis-trip-ciaaa.png', { type: 'image/png' });
            
            try {
                await navigator.share({
                    files: [file],
                    title: 'Karcis Weekend Pass Ciaaa ❤️ Lino',
                    text: 'Ini karcis trip kita! Cek lampiran fotonya ya!',
                });
            } catch (error) {
                console.log('Gagal membagikan file, mencoba fallback download:', error);
                alert('Gagal membagikan langsung. Silakan tekan tombol "Download Tiket", lalu kirim manual dari galeri.');
                downloadCanvas(canvas); 
            }
        }, 'image/png');
        
    } else {
        alert('Browser Anda tidak mendukung share gambar langsung. Silakan tekan tombol "Download Tiket" dan kirim foto dari galeri/folder download Anda.');
        downloadCanvas(canvas); 
    }
    
    shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
    shareBtn.disabled = false;
});


function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'karcis-trip-ciaaa.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

downloadBtn.addEventListener('click', () => {
    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        return;
    }

    downloadBtn.textContent = 'Memproses Gambar... ⏳';
    downloadBtn.disabled = true;
    
    html2canvas(ticketDiv, { 
        scale: 3, 
        useCORS: true, 
    }).then(canvas => {
        downloadCanvas(canvas);
    }).catch(error => {
        console.error('Download Gagal:', error);
        alert('Gagal membuat gambar karcis. Cek console browser Anda.');
    }).finally(() => {
        downloadBtn.textContent = '🖼️ Download Tiket';
        downloadBtn.disabled = false;
    });
});


// Init
loadSummary();