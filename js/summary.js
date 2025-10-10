// js/summary.js (Logika Karcis Boarding Pass)

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.44.2/+esm';

// Konfigurasi Supabase Anda (Harus sama dengan main.js)
const supabaseUrl = "https://rdoywpzkfddvrxrwmvsc.supabase.co"; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkb3l3cHprZmRkdnJ4cndtdnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDIyNzUsImV4cCI6MjA3NTY3ODI3NX0.CxlF8rihbLEOSef4ItWelqoCVIgr7JL03uGdpWNKGIU";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ticketsContainer = document.getElementById('ticketsContainer'); 
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');

let categoriesCache = [];
let ideasCache = [];

async function fetchData() {
    const { data: categories } = await supabase.from('idea_categories').select('*');
    if (categories) categoriesCache = categories;

    const { data: ideas } = await supabase.from('trip_ideas_v2').select('*');
    if (ideas) ideasCache = ideas;
}

// Fungsi untuk mendapatkan tanggal (misal: Sabtu ini atau Minggu ini)
function getTripDate(dayOfWeek) {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Minggu, 6 = Sabtu
    const targetDayMap = {
        'Minggu': 0,
        'Sabtu': 6
    };
    const targetDay = targetDayMap[dayOfWeek];

    let date = new Date(today);
    let diff = targetDay - currentDay;
    if (diff < 0) { // Jika target hari sudah lewat di minggu ini
        diff += 7;
    } else if (diff === 0 && today.getHours() >= 18) { // Jika hari ini adalah hari target dan sudah sore (asumsi trip besok)
        diff = 7;
    }
    
    date.setDate(today.getDate() + diff);

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}


function renderSummary() {
    const tripDays = JSON.parse(localStorage.getItem('tripDays') || '[]');
    const tripSelections = JSON.parse(localStorage.getItem('tripSelections') || '[]');

    if (tripSelections.length === 0) {
        ticketsContainer.innerHTML = '<p>Anda belum memilih aktivitas. Kembali ke halaman utama untuk memilih ide trip.</p>';
        return;
    }

    ticketsContainer.innerHTML = ''; 

    const groupedByDay = tripDays.reduce((acc, day) => {
        // Filter seleksi yang cocok dengan hari atau yang "all days"
        acc[day] = tripSelections.filter(item => {
            const idea = ideasCache.find(i => i.id == item.ideaId);
            const ideaDay = idea ? idea.day_of_week : ''; 
            return ideaDay === day || ideaDay === '' || item.ideaId.startsWith('cat-');
        });
        return acc;
    }, {});


    Object.entries(groupedByDay).forEach(([day, selectionsForDay]) => {
        if (selectionsForDay.length === 0) return; 

        const tripDate = getTripDate(day);
        const uniqueIdeaNames = new Set(); 
        
        const plansHtml = selectionsForDay.map((item) => {
            const displayName = item.name === item.subtype ? item.subtype : item.name;
            const fullDescription = `${displayName} (${item.subtype})`;
            
            if (uniqueIdeaNames.has(fullDescription)) {
                return ''; 
            }
            uniqueIdeaNames.add(fullDescription);
            return `<li>${displayName} <span class="plan-subtitle">(${item.subtype})</span></li>`;
        }).filter(Boolean).join(''); 

        const ticketHtml = `
            <div class="ticket-card" id="ticket-${day.toLowerCase()}">
                <div class="ticket-left">
                    <p class="pass-type">Weekend Pass</p>
                    <div class="names">
                        <span>Ciaaa</span> <span class="heart">💙</span> <span>Kamu</span>
                    </div>
                    <div class="detail-block">
                        <p class="detail-label">Hari</p>
                        <p class="detail-value">${day}</p>
                    </div>
                    <div class="detail-block">
                        <p class="detail-label">Tanggal</p>
                        <p class="detail-value">${tripDate}</p>
                    </div>
                </div>
                <div class="ticket-right">
                    <p class="section-title">Rencana Kita</p>
                    <ul class="plan-list">
                        ${plansHtml}
                    </ul>
                    <p class="special-note">Aku janji gak bakal nyanyi kenceng kecuali kamu minta 🎤</p>
                </div>
            </div>
        `;
        ticketsContainer.innerHTML += ticketHtml;
    });
}


// --- HANDLER DOWNLOAD ---
downloadBtn.addEventListener('click', () => {
    const ticketCards = document.querySelectorAll('.ticket-card');

    if (ticketCards.length === 0) {
        alert('Tidak ada tiket yang bisa di-download.');
        return;
    }
    
    // Download semua tiket satu per satu
    ticketCards.forEach((card, index) => {
        html2canvas(card, {
            scale: 2, 
            allowTaint: true, 
            useCORS: true 
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Karcis_Trip_Ciaaa_${card.id.replace('ticket-', '')}.png`;
            link.href = canvas.toDataURL('image/png');
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if (index === 0) {
                 console.log(`Tiket Hari ${card.id.replace('ticket-', '')} berhasil di-download!`);
            }
        }).catch(error => {
            console.error(`Gagal mengkonversi tiket ${card.id}:`, error);
            alert('Gagal membuat gambar. Pastikan gambar Anda memiliki CORS yang benar (cek RLS Storage).');
        });
    });
    alert('Download tiket berhasil! Cek folder unduhan Anda.');
});


// --- HANDLER SHARE (FOTO/FILE) ---
shareBtn.addEventListener('click', () => {
    const ticketCard = document.querySelector('.ticket-card');

    if (!ticketCard) {
        alert('Tidak ada tiket yang bisa dibagikan.');
        return;
    }
    
    const tripSelections = JSON.parse(localStorage.getItem('tripSelections') || '[]');
    const tripDays = JSON.parse(localStorage.getItem('tripDays') || '[]');
    
    // Buat pesan teks pendamping
    const formattedSelections = tripDays.map(day => {
        const selectionsForDay = tripSelections.filter(item => {
             const idea = ideasCache.find(i => i.id == item.ideaId);
             const ideaDay = idea ? idea.day_of_week : ''; 
             return ideaDay === day || ideaDay === '' || item.ideaId.startsWith('cat-');
        });

        const uniqueIdeaNames = new Set();
        const ideasList = selectionsForDay.map(i => {
             const displayName = i.name === i.subtype ? i.subtype : i.name;
             const fullDescription = `${displayName} (${i.subtype})`;
             if (uniqueIdeaNames.has(fullDescription)) return null;
             uniqueIdeaNames.add(fullDescription);
             return `- ${displayName} (${i.subtype})`;
        }).filter(Boolean).join('\n');
        
        return `*Hari ${day} (${getTripDate(day)}):*\n${ideasList}`;
    }).join('\n\n');


    const shareText = `🎟️ Karcis Trip Ciaaa! 
${formattedSelections}

Jangan lupa bawa kamera yaa 💕
Aku janji gak bakal nyanyi kenceng kecuali kamu minta 🎤`;
    
    
    // Coba berbagi File/Foto
    if (navigator.share) {
        html2canvas(ticketCard, {
            scale: 2, 
            allowTaint: true, 
            useCORS: true 
        }).then(canvas => {
            canvas.toBlob(async (blob) => {
                const fileName = `Karcis_Trip_Ciaaa_${ticketCard.id.replace('ticket-', '')}.png`;
                const file = new File([blob], fileName, {type: "image/png"});
                
                try {
                    // Coba berbagi file gambar
                    await navigator.share({
                        files: [file], 
                        title: 'Karcis Trip Ciaaa',
                        text: shareText, 
                    });
                    
                } catch (error) {
                    console.error('Sharing file failed, fallback to text/link:', error);
                    // FALLBACK: Jika berbagi file (foto) gagal, coba berbagi teks saja.
                    if (error.name === 'AbortError') return; 
                    
                    navigator.share({
                        title: 'Karcis Trip Ciaaa',
                        text: shareText,
                    }).catch(err => {
                        console.error('Fallback text sharing failed:', err);
                        alert('Berbagi gagal! Silakan tekan "Download" dan kirim foto dari galeri Anda.');
                    });
                }
            }, 'image/png');
        }).catch(error => {
            console.error("Gagal membuat gambar untuk share:", error);
            alert('Gagal membuat gambar untuk dibagikan. Silakan tekan "Download" dan bagikan secara manual.');
        });
        
    } else {
        // Jika navigator.share tidak didukung (misal, di desktop)
        window.open(`whatsapp://send?text=${encodeURIComponent(shareText)}`);
        setTimeout(() => {
             alert('Browser Anda tidak mendukung berbagi foto otomatis. Silakan tekan tombol "Download" untuk mendapatkan foto karcis.');
        }, 1000);
    }
});


// Init
(async function init() {
    await fetchData();
    renderSummary();
})();