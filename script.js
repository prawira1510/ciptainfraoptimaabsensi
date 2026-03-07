// Data absensi disimpan di localStorage
let dataAbsensi = JSON.parse(localStorage.getItem('dataAbsensi')) || [];

// Status absen yang dipilih
let jenisAbsenDipilih = '';
let absenHariIni = {};

// Variabel untuk kamera
let videoStream = null;
let fotoDiambil = false;

// Variabel untuk lokasi
let lokasiUser = {
    latitude: null,
    longitude: null,
    alamat: ''
};

// Konstanta jam istirahat
const JAM_ISTIRAHAT_MULAI = '12:00';
const JAM_ISTIRAHAT_SELESAI = '13:00';

// API untuk OpenStreetMap
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=';

// ==================== FUNGSI DASAR ====================

function getTanggalHariIni() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getWaktuSekarang() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function bandingkanWaktu(waktu1, waktu2) {
    return waktu1.localeCompare(waktu2);
}

function cekDalamRentangIstirahat(waktu) {
    return waktu >= JAM_ISTIRAHAT_MULAI && waktu <= JAM_ISTIRAHAT_SELESAI;
}

// ==================== FUNGSI MODAL ====================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Gunakan Bootstrap modal jika ada
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        } else {
            modal.style.display = 'none';
        }
        
        if (modalId === 'absenModal') {
            hentikanKamera();
        }
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
}

// ==================== FUNGSI KAMERA ====================

async function mulaiKamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }, 
            audio: false 
        });
        const video = document.getElementById('video');
        video.srcObject = videoStream;
        
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('video').style.display = 'block';
        document.getElementById('btnAmbilFoto').style.display = 'block';
        document.getElementById('btnUlangFoto').style.display = 'none';
        
        fotoDiambil = false;
    } catch (err) {
        console.error('Error mengakses kamera:', err);
        alert('Tidak dapat mengakses kamera. Pastikan kamera terhubung dan izinkan akses kamera.');
    }
}

function hentikanKamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

function ambilFoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const fotoPreview = document.getElementById('fotoPreview');
    const fotoHasil = document.getElementById('fotoHasil');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const fotoData = canvas.toDataURL('image/jpeg', 0.8);
    document.getElementById('fotoData').value = fotoData;
    
    fotoHasil.src = fotoData;
    fotoPreview.style.display = 'block';
    video.style.display = 'none';
    
    document.getElementById('btnAmbilFoto').style.display = 'none';
    document.getElementById('btnUlangFoto').style.display = 'block';
    
    fotoDiambil = true;
    hentikanKamera();
}

function ulangFoto() {
    mulaiKamera();
    document.getElementById('fotoPreview').style.display = 'none';
    document.getElementById('fotoData').value = '';
    fotoDiambil = false;
}

// ==================== FUNGSI LOKASI ====================

function dapatkanLokasi() {
    const loadingLokasi = document.getElementById('loadingLokasi');
    const alamatDiv = document.getElementById('alamatLengkap');
    const koordinatDiv = document.getElementById('koordinat');
    
    loadingLokasi.style.display = 'block';
    alamatDiv.innerHTML = '';
    koordinatDiv.innerHTML = '';
    
    if (!navigator.geolocation) {
        loadingLokasi.style.display = 'none';
        alamatDiv.innerHTML = 'Geolocation tidak didukung browser ini';
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            lokasiUser.latitude = position.coords.latitude;
            lokasiUser.longitude = position.coords.longitude;
            
            document.getElementById('latitude').value = lokasiUser.latitude;
            document.getElementById('longitude').value = lokasiUser.longitude;
            
            koordinatDiv.innerHTML = `${lokasiUser.latitude.toFixed(6)}, ${lokasiUser.longitude.toFixed(6)}`;
            
            try {
                const response = await fetch(`${NOMINATIM_URL}${lokasiUser.latitude}&lon=${lokasiUser.longitude}`);
                const data = await response.json();
                
                if (data.display_name) {
                    lokasiUser.alamat = data.display_name;
                    alamatDiv.innerHTML = lokasiUser.alamat;
                } else {
                    alamatDiv.innerHTML = 'Alamat tidak ditemukan';
                }
            } catch (error) {
                console.error('Error reverse geocoding:', error);
                alamatDiv.innerHTML = 'Gagal mendapatkan alamat';
            }
            
            loadingLokasi.style.display = 'none';
        },
        (error) => {
            loadingLokasi.style.display = 'none';
            let pesanError = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    pesanError = 'Izin lokasi ditolak. Izinkan akses lokasi untuk melanjutkan.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    pesanError = 'Informasi lokasi tidak tersedia.';
                    break;
                case error.TIMEOUT:
                    pesanError = 'Waktu permintaan lokasi habis.';
                    break;
                default:
                    pesanError = 'Terjadi kesalahan saat mendapatkan lokasi.';
            }
            
            alamatDiv.innerHTML = pesanError;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ==================== FUNGSI FORM ====================

function ubahJenisKaryawan() {
    const jenisKaryawan = document.querySelector('input[name="jenisKaryawan"]:checked').value;
    const tempatKantor = document.getElementById('tempatKantorGroup');
    const tempatLapangan = document.getElementById('tempatLapanganGroup');
    
    if (jenisKaryawan === 'kantor') {
        tempatKantor.style.display = 'block';
        tempatLapangan.style.display = 'none';
        document.getElementById('tempatLapangan').required = false;
        document.getElementById('tempatKantor').required = true;
    } else {
        tempatKantor.style.display = 'none';
        tempatLapangan.style.display = 'block';
        document.getElementById('tempatKantor').required = false;
        document.getElementById('tempatLapangan').required = true;
    }
}

// ==================== FUNGSI STATUS ====================

function cekStatusAbsenHariIni() {
    const tanggalHariIni = getTanggalHariIni();
    const namaTersimpan = localStorage.getItem('namaUser') || '';
    
    const absenHariIniFilter = dataAbsensi.filter(item => item.tanggal === tanggalHariIni);
    
    absenHariIni = {
        jamMasuk: null,
        jamIstirahat: null,
        jamPulang: null,
        nama: namaTersimpan || ''
    };
    
    if (namaTersimpan) {
        const absenUser = absenHariIniFilter.filter(item => item.nama === namaTersimpan);
        absenUser.forEach(item => {
            if (item.jenis === 'Jam Masuk') absenHariIni.jamMasuk = item.waktu;
            if (item.jenis === 'Jam Istirahat') absenHariIni.jamIstirahat = item.waktu;
            if (item.jenis === 'Jam Pulang') absenHariIni.jamPulang = item.waktu;
        });
    }
    
    return absenHariIni;
}

function updateStatusDisplay() {
    const status = cekStatusAbsenHariIni();
    const statusContainer = document.getElementById('statusAbsen');
    
    if (!statusContainer) return;
    
    let html = `
        <h5 class="mb-3">Status Absensi Hari Ini (${getTanggalHariIni()})</h5>
        <div class="d-flex flex-wrap gap-3 justify-content-center">
    `;
    
    // Status Jam Masuk
    if (status.jamMasuk) {
        html += `
            <div class="status-badge selesai">
                <i class="bi bi-check-circle"></i>
                <span>Jam Masuk</span>
                <span class="badge bg-light text-dark">${status.jamMasuk}</span>
            </div>
        `;
    } else {
        html += `
            <div class="status-badge belum">
                <i class="bi bi-hourglass-split"></i>
                <span>Jam Masuk</span>
                <span class="badge bg-secondary">Belum</span>
            </div>
        `;
    }
    
    // Status Jam Istirahat
    if (status.jamIstirahat) {
        html += `
            <div class="status-badge selesai">
                <i class="bi bi-check-circle"></i>
                <span>Jam Istirahat</span>
                <span class="badge bg-light text-dark">${status.jamIstirahat}</span>
            </div>
        `;
    } else {
        html += `
            <div class="status-badge belum">
                <i class="bi bi-hourglass-split"></i>
                <span>Jam Istirahat</span>
                <span class="badge bg-secondary">Belum</span>
                <small class="text-muted">(12:00-13:00)</small>
            </div>
        `;
    }
    
    // Status Jam Pulang
    if (status.jamPulang) {
        html += `
            <div class="status-badge selesai">
                <i class="bi bi-check-circle"></i>
                <span>Jam Pulang</span>
                <span class="badge bg-light text-dark">${status.jamPulang}</span>
            </div>
        `;
    } else {
        html += `
            <div class="status-badge belum">
                <i class="bi bi-hourglass-split"></i>
                <span>Jam Pulang</span>
                <span class="badge bg-secondary">Belum</span>
            </div>
        `;
    }
    
    html += '</div>';
    statusContainer.innerHTML = html;
    
    updateTombolStatus();
}

function updateTombolStatus() {
    const status = cekStatusAbsenHariIni();
    const btnJamMasuk = document.getElementById('btnJamMasuk');
    const btnJamIstirahat = document.getElementById('btnJamIstirahat');
    const btnJamPulang = document.getElementById('btnJamPulang');
    const jenisContainer = document.getElementById('jenisAbsenContainer');
    const pesanSelesai = document.getElementById('pesanSelesai');
    const infoIstirahat = document.getElementById('infoJamIstirahat');
    
    if (!btnJamMasuk || !btnJamIstirahat || !btnJamPulang) return;
    
    btnJamMasuk.disabled = false;
    btnJamIstirahat.disabled = false;
    btnJamPulang.disabled = false;
    btnJamMasuk.classList.remove('aktif');
    btnJamIstirahat.classList.remove('aktif');
    btnJamPulang.classList.remove('aktif');
    
    if (infoIstirahat) infoIstirahat.style.display = 'none';
    
    if (!status.jamMasuk) {
        btnJamIstirahat.disabled = true;
        btnJamPulang.disabled = true;
        btnJamMasuk.classList.add('aktif');
    } else if (!status.jamIstirahat) {
        btnJamMasuk.disabled = true;
        btnJamPulang.disabled = true;
        btnJamIstirahat.classList.add('aktif');
        
        if (infoIstirahat) infoIstirahat.style.display = 'flex';
    } else if (!status.jamPulang) {
        btnJamMasuk.disabled = true;
        btnJamIstirahat.disabled = true;
        btnJamPulang.classList.add('aktif');
    } else {
        btnJamMasuk.disabled = true;
        btnJamIstirahat.disabled = true;
        btnJamPulang.disabled = true;
        
        if (jenisContainer) jenisContainer.style.display = 'none';
        if (pesanSelesai) pesanSelesai.style.display = 'block';
    }
}

// ==================== FUNGSI ABSENSI ====================

function handleAbsen() {
    const formContainer = document.getElementById('formAbsenContainer');
    const pesanSelesai = document.getElementById('pesanSelesai');
    const jenisContainer = document.getElementById('jenisAbsenContainer');
    const infoIstirahat = document.getElementById('infoJamIstirahat');
    
    if (formContainer) formContainer.style.display = 'none';
    if (pesanSelesai) pesanSelesai.style.display = 'none';
    if (jenisContainer) jenisContainer.style.display = 'flex';
    if (infoIstirahat) infoIstirahat.style.display = 'none';
    
    document.getElementById('absenForm').reset();
    document.getElementById('fotoData').value = '';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    
    hentikanKamera();
    fotoDiambil = false;
    
    updateStatusDisplay();
    showModal('absenModal');
}

function pilihJamMasuk() {
    jenisAbsenDipilih = 'Jam Masuk';
    tampilkanFormAbsen('Jam Masuk', 'Jam Masuk:');
}

function pilihJamIstirahat() {
    const waktuSekarang = getWaktuSekarang();
    
    if (!cekDalamRentangIstirahat(waktuSekarang)) {
        alert(`Maaf, absen jam istirahat hanya bisa dilakukan pada pukul ${JAM_ISTIRAHAT_MULAI} - ${JAM_ISTIRAHAT_SELESAI} WIB.\nSekarang pukul ${waktuSekarang}`);
        return;
    }
    
    jenisAbsenDipilih = 'Jam Istirahat';
    tampilkanFormAbsen('Jam Istirahat', 'Jam Istirahat:');
}

function pilihJamPulang() {
    jenisAbsenDipilih = 'Jam Pulang';
    tampilkanFormAbsen('Jam Pulang', 'Jam Pulang:');
}

function tampilkanFormAbsen(jenis, label) {
    const status = cekStatusAbsenHariIni();
    const waktuSekarang = getWaktuSekarang();
    
    if (jenis === 'Jam Masuk' && status.jamMasuk) {
        alert('Anda sudah melakukan absen Jam Masuk hari ini!');
        return;
    }
    if (jenis === 'Jam Istirahat' && !status.jamMasuk) {
        alert('Anda harus melakukan absen Jam Masuk terlebih dahulu!');
        return;
    }
    if (jenis === 'Jam Istirahat' && status.jamIstirahat) {
        alert('Anda sudah melakukan absen Jam Istirahat hari ini!');
        return;
    }
    if (jenis === 'Jam Pulang' && !status.jamIstirahat) {
        alert('Anda harus melakukan absen Jam Istirahat terlebih dahulu!');
        return;
    }
    if (jenis === 'Jam Pulang' && status.jamPulang) {
        alert('Anda sudah melakukan absen Jam Pulang hari ini!');
        return;
    }
    
    if (jenis === 'Jam Pulang' && bandingkanWaktu(waktuSekarang, JAM_ISTIRAHAT_SELESAI) < 0) {
        alert(`Maaf, absen jam pulang baru bisa dilakukan setelah jam istirahat selesai (setelah ${JAM_ISTIRAHAT_SELESAI} WIB)`);
        return;
    }
    
    document.getElementById('jenisAbsen').value = jenis;
    document.getElementById('labelWaktu').textContent = label;
    
    if (status.nama) {
        document.getElementById('nama').value = status.nama;
        document.getElementById('nama').readOnly = true;
    } else {
        document.getElementById('nama').value = '';
        document.getElementById('nama').readOnly = false;
    }
    
    document.getElementById('waktu').value = waktuSekarang;
    
    const waktuInfo = document.getElementById('waktuInfo');
    if (jenis === 'Jam Istirahat') {
        waktuInfo.textContent = `* Absen istirahat hanya bisa dilakukan pukul ${JAM_ISTIRAHAT_MULAI} - ${JAM_ISTIRAHAT_SELESAI} WIB`;
    } else {
        waktuInfo.textContent = '';
    }
    
    document.getElementById('tanggal').value = getTanggalHariIni();
    
    mulaiKamera();
    dapatkanLokasi();
    
    document.getElementById('jenisAbsenContainer').style.display = 'none';
    document.getElementById('formAbsenContainer').style.display = 'block';
    
    const infoIstirahat = document.getElementById('infoJamIstirahat');
    if (infoIstirahat) infoIstirahat.style.display = 'none';
}

function batalPilihJenis() {
    document.getElementById('formAbsenContainer').style.display = 'none';
    document.getElementById('jenisAbsenContainer').style.display = 'flex';
    jenisAbsenDipilih = '';
    
    hentikanKamera();
    updateTombolStatus();
}

function submitAbsen(event) {
    event.preventDefault();
    
    const nama = document.getElementById('nama').value.trim();
    const waktu = document.getElementById('waktu').value;
    const tanggal = document.getElementById('tanggal').value;
    const jenis = document.getElementById('jenisAbsen').value;
    const fotoData = document.getElementById('fotoData').value;
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    const jenisKaryawan = document.querySelector('input[name="jenisKaryawan"]:checked').value;
    
    if (!nama) {
        alert('Nama harus diisi!');
        return;
    }
    
    if (!fotoData) {
        alert('Foto harus diambil!');
        return;
    }
    
    if (!latitude || !longitude) {
        alert('Lokasi tidak terdeteksi!');
        return;
    }
    
    let tempat = '';
    if (jenisKaryawan === 'kantor') {
        tempat = document.getElementById('tempatKantor').value.trim();
        if (!tempat) {
            alert('Tempat (Rubrik) harus diisi!');
            return;
        }
    } else {
        tempat = document.getElementById('tempatLapangan').value.trim();
        if (!tempat) {
            alert('Nama proyek harus diisi!');
            return;
        }
    }
    
    const status = cekStatusAbsenHariIni();
    
    if (jenis === 'Jam Masuk' && status.jamMasuk) {
        alert('Anda sudah melakukan absen Jam Masuk hari ini!');
        return;
    }
    if (jenis === 'Jam Istirahat' && status.jamIstirahat) {
        alert('Anda sudah melakukan absen Jam Istirahat hari ini!');
        return;
    }
    if (jenis === 'Jam Pulang' && status.jamPulang) {
        alert('Anda sudah melakukan absen Jam Pulang hari ini!');
        return;
    }
    
    if (jenis === 'Jam Istirahat' && !cekDalamRentangIstirahat(waktu)) {
        alert(`Maaf, absen jam istirahat hanya bisa dilakukan pada pukul ${JAM_ISTIRAHAT_MULAI} - ${JAM_ISTIRAHAT_SELESAI} WIB`);
        return;
    }
    
    localStorage.setItem('namaUser', nama);
    
    const absensiBaru = {
        id: Date.now(),
        nama: nama,
        tanggal: tanggal,
        waktu: waktu,
        jenis: jenis,
        jenisKaryawan: jenisKaryawan,
        tempat: tempat,
        foto: fotoData,
        latitude: latitude,
        longitude: longitude,
        alamat: lokasiUser.alamat || '',
        timestamp: new Date().toISOString()
    };
    
    dataAbsensi.push(absensiBaru);
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
    
    alert(`Absensi ${jenis} berhasil!\nNama: ${nama}\nTanggal: ${tanggal}\nWaktu: ${waktu}`);
    
    hentikanKamera();
    updateStatusDisplay();
    
    const statusBaru = cekStatusAbsenHariIni();
    if (statusBaru.jamMasuk && statusBaru.jamIstirahat && statusBaru.jamPulang) {
        document.getElementById('formAbsenContainer').style.display = 'none';
        document.getElementById('pesanSelesai').style.display = 'block';
    } else {
        batalPilihJenis();
    }
}

// ==================== FUNGSI LAPORAN ====================

function handleLaporan() {
    const filterTanggal = document.getElementById('filterTanggal');
    if (filterTanggal) {
        filterTanggal.value = getTanggalHariIni();
    }
    
    tampilkanLaporan();
    showModal('laporanModal');
}

function filterLaporan() {
    tampilkanLaporan();
}

function resetFilter() {
    document.getElementById('filterTanggal').value = '';
    tampilkanLaporan();
}

function refreshLaporan() {
    tampilkanLaporan();
}

function tampilkanLaporan() {
    const tbody = document.getElementById('laporanBody');
    const filterTanggal = document.getElementById('filterTanggal')?.value || '';
    
    if (!tbody) return;
    
    let dataTampil = dataAbsensi;
    if (filterTanggal) {
        dataTampil = dataAbsensi.filter(item => item.tanggal === filterTanggal);
    }
    
    dataTampil.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (dataTampil.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-4">Belum ada data absensi</td></tr>`;
        return;
    }
    
    const laporanGroup = {};
    
    dataTampil.forEach(item => {
        const key = `${item.nama}_${item.tanggal}`;
        if (!laporanGroup[key]) {
            laporanGroup[key] = {
                nama: item.nama,
                tanggal: item.tanggal,
                jamMasuk: '-',
                jamIstirahat: '-',
                jamPulang: '-',
                jenisKaryawan: item.jenisKaryawan,
                tempat: item.tempat,
                lokasi: item.alamat || `${item.latitude}, ${item.longitude}`,
                foto: item.foto,
                id: item.id,
                status: 'Belum Lengkap'
            };
        }
        
        if (item.jenis === 'Jam Masuk') {
            laporanGroup[key].jamMasuk = item.waktu;
        } else if (item.jenis === 'Jam Istirahat') {
            laporanGroup[key].jamIstirahat = item.waktu;
        } else if (item.jenis === 'Jam Pulang') {
            laporanGroup[key].jamPulang = item.waktu;
        }
    });
    
    Object.keys(laporanGroup).forEach(key => {
        const data = laporanGroup[key];
        if (data.jamMasuk !== '-' && data.jamIstirahat !== '-' && data.jamPulang !== '-') {
            data.status = 'Lengkap';
        }
    });
    
    let no = 1;
    let html = '';
    
    Object.keys(laporanGroup).forEach(key => {
        const item = laporanGroup[key];
        const statusClass = item.status === 'Lengkap' ? 'status-lengkap' : 'status-belum';
        
        html += `
            <tr>
                <td>${no++}</td>
                <td>${item.nama}</td>
                <td>${item.tanggal}</td>
                <td><span class="badge bg-primary">${item.jamMasuk}</span></td>
                <td><span class="badge bg-warning text-dark">${item.jamIstirahat}</span></td>
                <td><span class="badge bg-success">${item.jamPulang}</span></td>
                <td>${item.jenisKaryawan === 'kantor' ? '🏢 Kantor' : '🏗️ Lapangan'}</td>
                <td>${item.tempat}</td>
                <td style="max-width: 200px; font-size: 0.9rem;">${item.lokasi}</td>
                <td><span class="status-badge-table ${statusClass}">${item.status}</span></td>
                <td>
                    <img src="${item.foto}" alt="Foto" class="foto-thumbnail" onclick="lihatFotoLaporan('${item.id}')">
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function lihatFotoLaporan(id) {
    const data = dataAbsensi.find(item => item.id == id);
    if (data && data.foto) {
        const fotoModal = document.getElementById('fotoModal');
        const fotoPreviewModal = document.getElementById('fotoPreviewModal');
        
        if (fotoModal && fotoPreviewModal) {
            fotoPreviewModal.src = data.foto;
            showModal('fotoModal');
        }
    }
}

// ==================== FUNGSI RESET ====================

function resetDataHariIni() {
    const konfirmasi = confirm("⚠️ Reset data hari ini?\n\nData absensi untuk hari ini akan dihapus. Data hari lain tetap aman.\n\nLanjutkan?");
    
    if (konfirmasi) {
        const tanggalHariIni = getTanggalHariIni();
        
        dataAbsensi = dataAbsensi.filter(item => item.tanggal !== tanggalHariIni);
        localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
        
        absenHariIni = {
            jamMasuk: null,
            jamIstirahat: null,
            jamPulang: null,
            nama: localStorage.getItem('namaUser') || ''
        };
        
        updateStatusDisplay();
        tampilkanLaporan();
        
        alert('✅ Data hari ini berhasil direset!');
    }
}

function resetSemuaData() {
    const konfirmasi = confirm("⚠️ PERINGATAN!\n\nAnda akan menghapus SEMUA data absensi yang tersimpan.\nTindakan ini tidak dapat dibatalkan.\n\nYakin ingin melanjutkan?");
    
    if (konfirmasi) {
        const konfirmasiUlang = prompt("Ketik 'RESET' untuk mengkonfirmasi penghapusan semua data:");
        
        if (konfirmasiUlang === 'RESET') {
            dataAbsensi = [];
            localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
            
            absenHariIni = {
                jamMasuk: null,
                jamIstirahat: null,
                jamPulang: null,
                nama: ''
            };
            
            localStorage.removeItem('namaUser');
            
            updateStatusDisplay();
            tampilkanLaporan();
            
            alert('✅ Semua data berhasil direset!');
        } else {
            alert('❌ Reset dibatalkan (konfirmasi salah)');
        }
    }
}

function resetStatusUjiCoba() {
    const konfirmasi = confirm("🧪 Mode Uji Coba\n\nIni akan:\n1. Reset semua data hari ini\n2. Mengisi contoh data absensi\n\nLanjutkan?");
    
    if (konfirmasi) {
        const tanggalHariIni = getTanggalHariIni();
        
        dataAbsensi = dataAbsensi.filter(item => item.tanggal !== tanggalHariIni);
        
        const namaContoh = "User Uji Coba";
        const waktuSekarang = new Date();
        const jamMasuk = "08:00";
        const jamIstirahat = "12:30";
        
        // Contoh foto dummy (data URL kecil untuk contoh)
        const fotoDummy = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23667eea'/%3E%3Ctext x='50' y='55' font-size='40' text-anchor='middle' fill='white' font-family='Arial'%3E📸%3C/text%3E%3C/svg%3E";
        
        const dataContoh = [
            {
                id: Date.now() - 30000,
                nama: namaContoh,
                tanggal: tanggalHariIni,
                waktu: jamMasuk,
                jenis: "Jam Masuk",
                jenisKaryawan: "kantor",
                tempat: "Rubrik Uji Coba",
                foto: fotoDummy,
                latitude: "-6.2088",
                longitude: "106.8456",
                alamat: "Jakarta, Indonesia",
                timestamp: new Date(Date.now() - 30000).toISOString()
            },
            {
                id: Date.now() - 20000,
                nama: namaContoh,
                tanggal: tanggalHariIni,
                waktu: jamIstirahat,
                jenis: "Jam Istirahat",
                jenisKaryawan: "kantor",
                tempat: "Rubrik Uji Coba",
                foto: fotoDummy,
                latitude: "-6.2088",
                longitude: "106.8456",
                alamat: "Jakarta, Indonesia",
                timestamp: new Date(Date.now() - 20000).toISOString()
            }
        ];
        
        dataAbsensi = [...dataAbsensi, ...dataContoh];
        localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
        localStorage.setItem('namaUser', namaContoh);
        
        updateStatusDisplay();
        tampilkanLaporan();
        
        alert('✅ Mode uji coba aktif!\nData contoh telah ditambahkan. Silakan lanjutkan absen jam pulang.');
    }
}

// ==================== FUNGSI EKSPOR ====================

function eksporCSV() {
    if (dataAbsensi.length === 0) {
        alert('Tidak ada data untuk diekspor!');
        return;
    }
    
    let csv = 'No,Nama,Tanggal,Jam Masuk,Jam Istirahat,Jam Pulang,Jenis Karyawan,Tempat,Lokasi,Status\n';
    
    const laporanGroup = {};
    dataAbsensi.forEach(item => {
        const key = `${item.nama}_${item.tanggal}`;
        if (!laporanGroup[key]) {
            laporanGroup[key] = {
                nama: item.nama,
                tanggal: item.tanggal,
                jamMasuk: '-',
                jamIstirahat: '-',
                jamPulang: '-',
                jenisKaryawan: item.jenisKaryawan === 'kantor' ? 'Kantor' : 'Lapangan',
                tempat: item.tempat,
                lokasi: item.alamat || `${item.latitude}, ${item.longitude}`
            };
        }
        
        if (item.jenis === 'Jam Masuk') laporanGroup[key].jamMasuk = item.waktu;
        if (item.jenis === 'Jam Istirahat') laporanGroup[key].jamIstirahat = item.waktu;
        if (item.jenis === 'Jam Pulang') laporanGroup[key].jamPulang = item.waktu;
    });
    
    let no = 1;
    Object.keys(laporanGroup).forEach(key => {
        const item = laporanGroup[key];
        const status = (item.jamMasuk !== '-' && item.jamIstirahat !== '-' && item.jamPulang !== '-') ? 'Lengkap' : 'Belum Lengkap';
        
        csv += `"${no++}","${item.nama}","${item.tanggal}","${item.jamMasuk}","${item.jamIstirahat}","${item.jamPulang}","${item.jenisKaryawan}","${item.tempat}","${item.lokasi}","${status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi_${getTanggalHariIni()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function eksporJSON() {
    if (dataAbsensi.length === 0) {
        alert('Tidak ada data untuk diekspor!');
        return;
    }
    
    const dataStr = JSON.stringify(dataAbsensi, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `absensi_${getTanggalHariIni()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function cetakLaporan() {
    const filterTanggal = document.getElementById('filterTanggal')?.value || '';
    const judul = filterTanggal ? `Laporan Absensi Tanggal ${filterTanggal}` : 'Laporan Semua Absensi';
    
    const cetakWindow = window.open('', '_blank');
    
    let dataCetak = dataAbsensi;
    if (filterTanggal) {
        dataCetak = dataAbsensi.filter(item => item.tanggal === filterTanggal);
    }
    
    const laporanGroup = {};
    dataCetak.forEach(item => {
        const key = `${item.nama}_${item.tanggal}`;
        if (!laporanGroup[key]) {
            laporanGroup[key] = {
                nama: item.nama,
                tanggal: item.tanggal,
                jamMasuk: '-',
                jamIstirahat: '-',
                jamPulang: '-',
                jenisKaryawan: item.jenisKaryawan === 'kantor' ? 'Kantor' : 'Lapangan',
                tempat: item.tempat,
                lokasi: item.alamat || `${item.latitude}, ${item.longitude}`
            };
        }
        
        if (item.jenis === 'Jam Masuk') laporanGroup[key].jamMasuk = item.waktu;
        if (item.jenis === 'Jam Istirahat') laporanGroup[key].jamIstirahat = item.waktu;
        if (item.jenis === 'Jam Pulang') laporanGroup[key].jamPulang = item.waktu;
    });
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${judul}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { padding: 20px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <h1 class="text-center mb-4">${judul}</h1>
            <p class="text-muted">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
            <table class="table table-bordered">
                <thead class="table-primary">
                    <tr>
                        <th>No</th>
                        <th>Nama</th>
                        <th>Tanggal</th>
                        <th>Jam Masuk</th>
                        <th>Jam Istirahat</th>
                        <th>Jam Pulang</th>
                        <th>Jenis</th>
                        <th>Tempat</th>
                        <th>Lokasi</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let no = 1;
    Object.keys(laporanGroup).forEach(key => {
        const item = laporanGroup[key];
        html += `
            <tr>
                <td>${no++}</td>
                <td>${item.nama}</td>
                <td>${item.tanggal}</td>
                <td>${item.jamMasuk}</td>
                <td>${item.jamIstirahat}</td>
                <td>${item.jamPulang}</td>
                <td>${item.jenisKaryawan}</td>
                <td>${item.tempat}</td>
                <td>${item.lokasi}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
            <div class="text-center mt-4 no-print">
                <button onclick="window.print()" class="btn btn-primary">Cetak</button>
                <button onclick="window.close()" class="btn btn-secondary">Tutup</button>
            </div>
        </body>
        </html>
    `;
    
    cetakWindow.document.write(html);
    cetakWindow.document.close();
}

// ==================== INISIALISASI ====================

document.addEventListener('DOMContentLoaded', function() {
    dataAbsensi = JSON.parse(localStorage.getItem('dataAbsensi')) || [];
    
    const radioKantor = document.getElementById('kantor');
    if (radioKantor) {
        radioKantor.checked = true;
    }
    
    const tempatKantor = document.getElementById('tempatKantor');
    if (tempatKantor) {
        tempatKantor.value = 'Rubrik';
    }
    
    updateStatusDisplay();
    
    // Inisialisasi Bootstrap modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        new bootstrap.Modal(modal, {
            backdrop: 'static'
        });
    });
    
    console.log('🔧 Developer tools:');
    console.log('  - resetDataHariIni()   : Reset data hari ini');
    console.log('  - resetSemuaData()     : Reset semua data');
    console.log('  - resetStatusUjiCoba() : Mode uji coba');
});

// Export fungsi ke global
window.handleAbsen = handleAbsen;
window.handleLaporan = handleLaporan;
window.pilihJamMasuk = pilihJamMasuk;
window.pilihJamIstirahat = pilihJamIstirahat;
window.pilihJamPulang = pilihJamPulang;
window.batalPilihJenis = batalPilihJenis;
window.submitAbsen = submitAbsen;
window.closeModal = closeModal;
window.ambilFoto = ambilFoto;
window.ulangFoto = ulangFoto;
window.ubahJenisKaryawan = ubahJenisKaryawan;
window.filterLaporan = filterLaporan;
window.resetFilter = resetFilter;
window.refreshLaporan = refreshLaporan;
window.eksporCSV = eksporCSV;
window.eksporJSON = eksporJSON;
window.cetakLaporan = cetakLaporan;
window.lihatFotoLaporan = lihatFotoLaporan;
window.resetDataHariIni = resetDataHariIni;
window.resetSemuaData = resetSemuaData;
window.resetStatusUjiCoba = resetStatusUjiCoba;