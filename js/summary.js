// js/summary.js (REVISI TOTAL: Memastikan Load Summary & INSERT trip_history dengan user_id)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';
import { SUPABASE_CONFIG } from './config.js'; 
// Asumsi Anda sudah memuat html2canvas di summary.html

/* ====== Supabase Config ====== */
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
let currentUser = { id: 'anon' }; // Default user

const selectionList = document.getElementById('selectionList');
const tripDayDisplay = document.getElementById('tripDayDisplay');
const tripDateDisplay = document.getElementById('tripDateDisplay');
const secretMessageDisplay = document.getElementById('secretMessageDisplay');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); 
const ticketDiv = document.getElementById('ticket');

// --- PENGATURAN AWAL & DATA LOADING ---

/**
 * Menghitung tanggal weekend berikutnya berdasarkan hari yang dipilih.
 * Ini memastikan tanggal yang ditampilkan di tiket konsisten.
 */
function getTripDate(dayOfWeek) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Minggu, 6 = Sabtu
    const targetDayMap = { 'Minggu': 0, 'Sabtu': 6 };
    const targetDay = targetDayMap[dayOfWeek];

    let date = new Date(today);
    let diff = targetDay - currentDay;
    if (diff < 0) {
        diff += 7; // Pindah ke minggu depan
    } else if (diff === 0 && today.getHours() >= 18) {
        // Jika hari ini Sabtu/Minggu dan sudah jam 6 sore, pindah ke minggu depan
        diff = 7;
    }
    date.setDate(today.getDate() + diff);
    return date; 
} 

/**
 * Menyimpan data trip ke tabel trip_history di Supabase.
 */
async function saveTripHistory(day, date, selections, message) { 
    const tripDateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
    if (!supabase) { 
        console.error('Supabase client is not initialized.');
        return;
    }

    const userId = currentUser.id || 'anon';
    // KRITIS: Memberikan nama trip yang informatif
    const tripName = `Trip: ${day} - ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`; 

    console.log('Mencoba menyimpan trip:', { userId, tripName, selections });
    
    // Pastikan kolom user_id, trip_name, selection_json di database sudah benar
    const { error } = await supabase
        .from('trip_history')
        .insert({
            trip_name: tripName,
            trip_day: day,
            trip_date: tripDateString,
            selection_json: selections, // KRITIS: Menyimpan array selections
            secret_message: message,
            user_id: userId, // KRITIS: Menyimpan user_id
        });
        
    if (error) {
        console.error('Error saving trip history:', error);
        alert('Gagal menyimpan riwayat perjalanan: ' + error.message);
    } else {
        console.log('Riwayat perjalanan berhasil disimpan.');
    }
}


/**
 * Fungsi utama untuk memuat data dari localStorage dan merender tiket.
 */
function loadSummary() {
    // KRITIS: Ambil data dari localStorage
    const tripDaysRaw = localStorage.getItem('tripDays');
    const tripSelectionsRaw = localStorage.getItem('tripSelections');
    const secretMessage = localStorage.getItem('secretMessage') || 'Tidak ada pesan rahasia.';
    
    let tripDays = [];
    let tripSelections = [];

    try {
        tripDays = tripDaysRaw ? JSON.parse(tripDaysRaw) : [];
        tripSelections = tripSelectionsRaw ? JSON.parse(tripSelectionsRaw) : [];
    } catch (e) {
        console.error('Gagal parsing data dari localStorage:', e);
    }

    // KRITIS: Pengecekan data harus kuat
    if (!tripDays || tripDays.length === 0 || !tripSelections || tripSelections.length === 0) {
        console.error('Tidak ada data trip yang ditemukan di localStorage.');
        // Jika data kosong, sembunyikan tiket dan tampilkan pesan
        ticketDiv.innerHTML = '<p class="error-message">❌ Gagal memuat data tiket. Coba buat rencana trip baru.</p>';
        downloadBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        
        // Alihkan kembali setelah beberapa detik jika benar-benar kosong
        setTimeout(() => {
            if (!tripDays.length && !tripSelections.length) {
                // window.location.href = 'index.html'; 
            }
        }, 3000);
        return;
    }

    const dayOfWeek = tripDays.join(' & ');
    // Gunakan elemen pertama dari array tripDays untuk menghitung tanggal
    const tripDate = getTripDate(tripDays[0]); 

    // Update UI
    tripDayDisplay.textContent = dayOfWeek;
    // Format tanggal untuk tampilan yang cantik
    tripDateDisplay.textContent = tripDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    secretMessageDisplay.textContent = secretMessage;
    
    // Render list aktivitas
    selectionList.innerHTML = tripSelections.map(item => `
        <li>
            <span class="activity-type">${item.subtype || 'Aktivitas'}</span>
            <span class="activity-name">${item.name || 'Nama Tempat'}</span>
        </li>
    `).join('');

    // KRITIS: Simpan ke Supabase saat halaman Summary di-load
    saveTripHistory(dayOfWeek, tripDate, tripSelections, secretMessage);
    
    // Hapus data lokal setelah berhasil disimpan (opsional, tapi disarankan)
    // localStorage.removeItem('tripDays');
    // localStorage.removeItem('tripSelections');
    // localStorage.removeItem('secretMessage');
}

// --- FUNGSI SHARE & DOWNLOAD (Tidak berubah) ---

// Fungsi downloadCanvas dan shareCanvas
function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'karcis-trip-ciaaa.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

async function shareCanvas(canvas) {
    shareBtn.textContent = 'Memproses Gambar... ⏳';
    shareBtn.disabled = true;

    // ... (Logika share gambar seperti kode Anda sebelumnya)
    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
        shareBtn.disabled = false;
        return;
    }

    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], "karcis-trip-ciaaa.png", { type: "image/png" });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Karcis Trip Romantis Kita! ❤️',
                text: 'Ini rencana trip yang aku buat untuk kita. Cekidot!'
            });
        } else {
            console.warn('Gagal membagikan file, mencoba fallback download.');
            alert('Gagal membagikan langsung. Silakan tekan tombol "Download Tiket", lalu kirim manual dari galeri.');
            downloadCanvas(canvas);
        }
    } catch (error) {
        console.error('Share Gagal:', error);
        alert('Gagal membagikan. Silakan tekan tombol "Download Tiket" dan kirim foto dari galeri/folder download Anda.');
        downloadCanvas(canvas);
    }
    
    shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
    shareBtn.disabled = false;
}

// Event Listeners
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
        downloadBtn.textContent = '🖼️ Download Tiket';
        downloadBtn.disabled = false;
    }).catch(error => {
        console.error('Download Gagal:', error);
        alert('Gagal mendownload gambar.');
        downloadBtn.textContent = '🖼️ Download Tiket';
        downloadBtn.disabled = false;
    });
});

shareBtn.addEventListener('click', () => {
    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        return;
    }
    
    html2canvas(ticketDiv, {
        scale: 3, 
        useCORS: true, 
    }).then(canvas => {
        shareCanvas(canvas);
    }).catch(error => {
        console.error('Share Gagal:', error);
        alert('Gagal membuat gambar untuk dibagikan.');
    });
});

// Panggil fungsi utama saat DOM sudah siap
document.addEventListener('DOMContentLoaded', loadSummary);