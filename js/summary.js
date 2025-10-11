// js/summary.js (Logika untuk halaman summary.html - FINAL Share Gambar)

const selectionList = document.getElementById('selectionList');
const tripDayDisplay = document.getElementById('tripDayDisplay');
const tripDateDisplay = document.getElementById('tripDateDisplay');
const secretMessageDisplay = document.getElementById('secretMessageDisplay');
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn'); // Ini akan kita ubah fungsinya
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

function loadSummary() {
    const selectedDays = JSON.parse(localStorage.getItem('tripDays') || '[]');
    const selections = JSON.parse(localStorage.getItem('tripSelections') || '[]');
    const secretMessage = localStorage.getItem('secretMessage') || '';

    if (selectedDays.length === 0 || selections.length === 0) {
        window.location.href = 'index.html'; 
        return;
    }

    const mainDay = selectedDays[0];
    const tripDate = getTripDate(mainDay);
    
    tripDayDisplay.textContent = mainDay;
    tripDateDisplay.textContent = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    selectionList.innerHTML = '';
    selections.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.subtype})`;
        selectionList.appendChild(li);
    });
    
    if (secretMessage) {
        secretMessageDisplay.textContent = secretMessage + ' 🎤';
        secretMessageDisplay.style.display = 'block';
    } else {
        secretMessageDisplay.style.display = 'none';
    }
    
    // UBAH TAMPILAN TOMBOL SHARE
    shareBtn.textContent = '📲 Share Tiket (WA/Foto)';
    shareBtn.classList.remove('secondary');
    shareBtn.classList.add('primary'); // Beri warna yang menonjol
}


// --- FUNGSI SHARE KARCIS SEBAGAI GAMBAR KE WA/SOSMED ---
// Ini adalah fokus utama perbaikan Anda.

shareBtn.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') {
        alert('Gagal memuat library gambar.');
        return;
    }
    
    shareBtn.textContent = 'Memproses Gambar... ⏳';
    shareBtn.disabled = true;
    
    let canvas;
    try {
        // 1. Buat gambar HD
        canvas = await html2canvas(ticketDiv, { 
            scale: 3, // HD Resolution
            useCORS: true, // PENTING untuk gambar dari luar domain (Supabase)
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

    // 2. Coba kirim via Web Share API
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([], 'dummy.png')] })) {
        
        // Konversi canvas ke blob untuk Web Share API
        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert('Gagal konversi gambar. Silakan coba tombol Download.');
                return;
            }
            
            const file = new File([blob], 'karcis-trip-ciaaa.png', { type: 'image/png' });
            
            try {
                // Mencoba membagikan file
                await navigator.share({
                    files: [file],
                    title: 'Karcis Weekend Pass Ciaaa ❤️ Lino',
                    text: 'Ini karcis trip kita! Cek lampiran fotonya ya!',
                });
                console.log('Successful share via Web Share API');

            } catch (error) {
                console.log('Gagal membagikan file, mencoba fallback download:', error);
                alert('Gagal membagikan langsung. Silakan tekan tombol "Download Tiket", lalu kirim manual dari galeri.');
                
                // Jika share gagal, panggil tombol download manual
                downloadCanvas(canvas); 
            }
        }, 'image/png');
        
    } else {
        // 3. Fallback: Download manual (Jika tidak support Web Share API File Sharing)
        alert('Browser Anda tidak mendukung share gambar langsung. Silakan tekan tombol "Download Tiket" dan kirim foto dari galeri/folder download Anda.');
        downloadCanvas(canvas); 
    }
    
    shareBtn.textContent = '📲 Share Karcis (WA/Foto)';
    shareBtn.disabled = false;
});


// --- FUNGSI DOWNLOAD MANUAL (dipanggil dari downloadBtn atau sebagai fallback share) ---

function downloadCanvas(canvas) {
    const link = document.createElement('a');
    link.download = 'karcis-trip-ciaaa.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

downloadBtn.addEventListener('click', () => {
    // Fungsi ini tetap ada untuk opsi download manual yang terpisah
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


// --- FUNGSI SHARE TEKS (Dibuat terpisah jika Anda ingin mengembalikannya) ---
// Note: Kode ini dihilangkan karena permintaan Anda adalah share gambar, 
// tetapi bisa ditambahkan kembali sebagai tombol terpisah jika diperlukan.

// Init
loadSummary();