// js/summary.js (REVISI TOTAL: Memastikan Load Summary dengan basis Tanggal & FIX Kolom selection_json)

import { supabase } from './supabaseClient.js'; 
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
 * Menyimpan data trip ke tabel trip_history di Supabase.
 * MENGGUNAKAN KOLOM selection_json.
 */
async function saveTripHistory(tripDateString, selections, message) { 
    
    const isEditMode = localStorage.getItem('editMode') === 'true';
    const editTripId = localStorage.getItem('editTripId');

    // Konversi string tanggal (YYYY-MM-DD) dari localStorage
    const tripDate = new Date(tripDateString);
    const dbDateFormat = tripDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    if (!supabase) { 
        console.error('Supabase client is not initialized.');
        return;
    }

    const userId = currentUser.id || 'anon';
    
    // Map selections ke format yang sesuai untuk kolom selection_json
    const tripDetails = selections.map(s => ({
        idea_id: s.ideaId.startsWith('cat-') ? null : s.ideaId,
        name: s.name,
        category: s.cat,
        subtype: s.subtype
    }));

    if (isEditMode && editTripId) {
        const { error: updateError } = await supabase
            .from('trip_history')
            .update({
                selection_json: tripDetails,
                secret_message: message,
                updated_at: new Date().toISOString()
            })
            .eq('id', editTripId);
        
        if (updateError) {
            console.error('Error updating trip:', updateError);
            alert('❌ Gagal update trip: ' + updateError.message);
        } else {
            console.log('✅ Trip berhasil diupdate!');
            // Clear edit mode flags
            localStorage.removeItem('editMode');
            localStorage.removeItem('editTripId');
        }
        
        return; // Exit function setelah update
    }

    // Cek apakah trip dengan tanggal yang sama sudah ada di DB
    const { data: existingTrips, error: fetchError } = await supabase
        .from('trip_history')
        .select('id')
        .eq('user_id', userId)
        .eq('trip_date', dbDateFormat);

    if (fetchError) {
        console.error('Error fetching trip history:', fetchError);
        return;
    }
    
    // Kolom trip_day di DB Anda adalah 'text', kita isi dengan nama hari
    const tripDayName = tripDate.toLocaleDateString('id-ID', { weekday: 'long' });

    const insertPayload = {
        user_id: userId,
        trip_date: dbDateFormat, 
        trip_day: tripDayName, // Tambahkan kolom trip_day sesuai skema
        selection_json: tripDetails, // <-- FIX KRITIS: Menggunakan kolom yang BENAR
        secret_message: message,
    };
    
    let error = null;

    if (existingTrips && existingTrips.length > 0) {
        // Update trip yang sudah ada (hanya update data yang berubah)
        const tripId = existingTrips[0].id;
        const { error: updateError } = await supabase
            .from('trip_history')
            .update({
                selection_json: tripDetails, // <-- FIX KRITIS
                secret_message: message,
            })
            .eq('id', tripId);
        error = updateError;
        if (!error) console.log('Riwayat perjalanan berhasil diperbarui.');
    } else {
        // Insert trip baru
        const { error: insertError } = await supabase
            .from('trip_history')
            .insert([insertPayload]); // <-- Menggunakan payload yang benar
        error = insertError;
        if (!error) console.log('Riwayat perjalanan berhasil disimpan.');
    }
        
    if (error) {
        console.error('Error saving trip history:', error);
        alert('Gagal menyimpan riwayat perjalanan: ' + error.message);
    }
}


/**
 * Fungsi utama untuk memuat data dari localStorage dan merender tiket.
 */
function loadSummary() {
    // KRITIS: Ambil data TANGGAL TRIP dari 'tripDate' di localStorage
    const tripDateString = localStorage.getItem('tripDate');
    const tripSelectionsRaw = localStorage.getItem('tripSelections');
    const secretMessage = localStorage.getItem('secretMessage') || 'Tidak ada pesan rahasia.';
    
    let tripSelections = [];

    try {
        tripSelections = tripSelectionsRaw ? JSON.parse(tripSelectionsRaw) : [];
    } catch (e) {
        console.error('Gagal parsing data dari localStorage:', e);
    }

    // KRITIS: Pengecekan data harus kuat
    if (!tripDateString || !tripSelections || tripSelections.length === 0) {
        console.error('Tidak ada data trip yang ditemukan di localStorage.');
        ticketDiv.innerHTML = '<p class="error-message">❌ Gagal memuat data tiket. Coba buat rencana trip baru.</p>';
        downloadBtn.style.display = 'none';
        shareBtn.style.display = 'none';
        return;
    }

    // Konversi string tanggal menjadi objek Date
    const tripDate = new Date(tripDateString + 'T00:00:00'); // Tambahkan T00:00:00 untuk menghindari masalah zona waktu
    
    const dayOfWeek = tripDate.toLocaleDateString('id-ID', { weekday: 'long' });
    const formattedDate = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    // Update UI
    tripDayDisplay.textContent = dayOfWeek; // Hari (misal: Sabtu)
    tripDateDisplay.textContent = formattedDate; // Tanggal lengkap (misal: 14 Oktober 2025)
    secretMessageDisplay.textContent = secretMessage;
    
    // Render list aktivitas
    selectionList.innerHTML = tripSelections.map(item => `
        <li>
            <span class="activity-type">${item.subtype || 'Aktivitas'}</span>
            <span class="activity-name">${item.name || 'Nama Tempat'}</span>
        </li>
    `).join('');

    // KRITIS: Simpan ke Supabase saat halaman Summary di-load
    // KRITIS: Simpan ke Supabase saat halaman Summary di-load
    saveTripHistory(tripDateString, tripSelections, secretMessage);
    
    // ✅ BARU: Show success banner jika edit mode
    const isEditMode = localStorage.getItem('editMode') === 'true';
    if (isEditMode) {
        showSuccessBanner();
    }
}

// ============================================================
// SUCCESS BANNER untuk Edit Mode
// ============================================================

function showSuccessBanner() {
    const banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <span class="banner-icon">✅</span>
            <div class="banner-text">
                <strong>Trip Berhasil Diupdate!</strong>
                <small>Perubahan sudah disimpan ke riwayat trip Anda.</small>
            </div>
        </div>
    `;
    
    document.body.prepend(banner);
    
    // Auto hide setelah 5 detik
    setTimeout(() => {
        banner.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => banner.remove(), 500);
    }, 5000);
}
// --- FUNGSI SHARE & DOWNLOAD (Tidak ada perubahan signifikan) ---

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

    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
        shareBtn.disabled = false;
        return;
    }

    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], "karcis-trip-ciaaa.png", { type: "image/png" });
        
        // Buat teks yang akan dishare
        const tripDateString = localStorage.getItem('tripDate');
        const selections = JSON.parse(localStorage.getItem('tripSelections') || '[]');
        const tripDate = new Date(tripDateString + 'T00:00:00');
        const dayOfWeek = tripDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
        let shareText = `**💌 Rencana Trip Kita (${dayOfWeek})!**\n\n`;
        shareText += "Aktivitas:\n";
        selections.forEach((item, index) => {
            shareText += `${index + 1}. ${item.name} (${item.subtype})\n`;
        });
        const secretMessage = localStorage.getItem('secretMessage') || '';
        if (secretMessage) {
            shareText += `\n*Pesan Rahasia: ${secretMessage}*`;
        }
        shareText += `\n\nLihat detailnya di aplikasi Trip Ciaaa.`;
        
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Karcis Trip Romantis Kita! ❤️',
                text: shareText
            });
            shareBtn.textContent = '✅ Berbagi Sukses!';
        } else {
            console.warn('Gagal membagikan file, mencoba fallback download.');
            await navigator.clipboard.writeText(shareText);
            alert('Rencana disalin ke clipboard! Sekarang klik "Download Tiket" dan kirim foto dari galeri/folder download Anda.');
            downloadCanvas(canvas);
        }
    } catch (error) {
        console.error('Share Gagal:', error);
        alert('Gagal membagikan. Salin teks atau coba "Download Tiket"');
        
        // Fallback: Salin teks
        const shareText = 'Rencana trip sudah siap! Cek di Karcis Trip Ciaaa.';
        await navigator.clipboard.writeText(shareText);
        shareBtn.textContent = 'Teks Disalin! 📋';
    }
    
    // Set ulang teks tombol setelah proses selesai
    setTimeout(() => {
        shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
        shareBtn.disabled = false;
    }, 1500);
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