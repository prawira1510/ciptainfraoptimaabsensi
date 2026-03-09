// ===== GLOBAL VARIABLES =====
let mediaStream = null;
let dataAbsensi = [];
let isFormActive = false;
let hapusId = null;
let kameraDiaktifkan = false;
let watchId = null; // Untuk GPS continuous tracking

// Daftar karyawan tetap
const daftarKaryawan = [
    "Ahmad Fauzi",
    "Budi Santoso",
    "Citra Dewi",
    "Dodi Prasetyo",
    "Eka Putri",
    "Fajar Hidayat",
    "Gita Permata",
    "Hendra Wijaya",
    "Indah Sari",
    "Joko Susilo"
];

// ===== INISIALISASI =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplikasi Absensi CIO siap!');
    loadDataFromStorage();
    setWaktuRealTime();
    setInterval(setWaktuRealTime, 1000);
});

// ===== HANDLE MENU =====
function handleAbsen() {
    resetFormAbsen();
    isFormActive = false;
    kameraDiaktifkan = false;
    
    const modal = new bootstrap.Modal(document.getElementById('absenModal'));
    modal.show();
    
    setWaktuRealTime();
    updateStatusAbsen();
    validasiDataDiri(); // Cek status tombol
}

function handleRekap() {
    refreshRekap();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filterTanggal').value = today;
    document.getElementById('filterDivisi').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterNama').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('rekapModal'));
    modal.show();
}

function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) modal.hide();
    
    if (modalId === 'absenModal') {
        matikanKamera();
        stopWatchPosition();
        isFormActive = false;
        kameraDiaktifkan = false;
    }
}

function tutupModalAbsen() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('absenModal'));
    if (modal) modal.hide();
    matikanKamera();
    stopWatchPosition();
    isFormActive = false;
    kameraDiaktifkan = false;
}

// ===== FUNGSI DROPDOWN NAMA =====
function pilihKaryawan() {
    const selectedValue = document.getElementById('nama').value;
    const namaManualGroup = document.getElementById('namaManualGroup');
    
    if (selectedValue === 'Lainnya') {
        namaManualGroup.style.display = 'block';
        document.getElementById('namaManual').value = '';
    } else {
        namaManualGroup.style.display = 'none';
    }
    
    validasiDataDiri();
    updateStatusAbsen();
}

function getNamaTerpilih() {
    const selectedValue = document.getElementById('nama').value;
    
    if (selectedValue === 'Lainnya') {
        return document.getElementById('namaManual').value.trim();
    } else {
        return selectedValue;
    }
}

// ===== VALIDASI DATA DIRI =====
function validasiDataDiri() {
    const nama = getNamaTerpilih();
    const divisi = document.getElementById('divisi').value;
    
    const btnJamMasuk = document.getElementById('btnJamMasuk');
    const btnJamPulang = document.getElementById('btnJamPulang');
    
    if (nama && divisi) {
        btnJamMasuk.disabled = false;
        btnJamPulang.disabled = false;
        updateStatusAbsen(); // Update status untuk karyawan ini
    } else {
        btnJamMasuk.disabled = true;
        btnJamPulang.disabled = true;
    }
}

// ===== WAKTU =====
function setWaktuRealTime() {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    const waktu = `${jam}:${menit}`;
    
    const tahun = now.getFullYear();
    const bulan = String(now.getMonth() + 1).padStart(2, '0');
    const tanggal = String(now.getDate()).padStart(2, '0');
    const tanggalFormatted = `${tahun}-${bulan}-${tanggal}`;
    
    const waktuInput = document.getElementById('waktu');
    const tanggalInput = document.getElementById('tanggal');
    
    if (waktuInput) waktuInput.value = waktu;
    if (tanggalInput) tanggalInput.value = tanggalFormatted;
}

// ===== STATUS KEHADIRAN =====
function ubahStatusKehadiran() {
    const status = document.getElementById('statusKehadiran').value;
    const keteranganGroup = document.getElementById('keteranganGroup');
    
    if (status === 'izin' || status === 'sakit' || status === 'alpha') {
        keteranganGroup.style.display = 'block';
    } else {
        keteranganGroup.style.display = 'none';
    }
}

// ===== STATUS ABSEN =====
function updateStatusAbsen() {
    const statusContainer = document.getElementById('statusAbsen');
    if (!statusContainer) return;
    
    const today = new Date().toISOString().split('T')[0];
    const nama = getNamaTerpilih();
    
    if (!nama) {
        statusContainer.innerHTML = '<div class="text-muted"><i class="bi bi-info-circle"></i> Pilih nama untuk melihat status</div>';
        return;
    }
    
    const absenHariIni = dataAbsensi.filter(item => item.tanggal === today && item.nama === nama);
    
    const jamMasuk = absenHariIni.find(item => item.jenis === 'masuk');
    const jamPulang = absenHariIni.find(item => item.jenis === 'pulang');
    
    let statusHTML = '<div class="status-item-sederhana">';
    statusHTML += '<span class="status-label"><i class="bi bi-clock"></i> Jam Masuk:</span>';
    statusHTML += `<span class="status-value ${jamMasuk ? 'selesai' : ''}"> ${jamMasuk ? jamMasuk.waktu : 'Belum'}</span>`;
    statusHTML += '</div>';
    
    statusHTML += '<div class="status-item-sederhana">';
    statusHTML += '<span class="status-label"><i class="bi bi-house-door"></i> Jam Pulang:</span>';
    statusHTML += `<span class="status-value ${jamPulang ? 'selesai' : ''}"> ${jamPulang ? jamPulang.waktu : 'Belum'}</span>`;
    statusHTML += '</div>';
    
    statusContainer.innerHTML = statusHTML;
    
    // Update tombol
    const btnJamMasuk = document.getElementById('btnJamMasuk');
    const btnJamPulang = document.getElementById('btnJamPulang');
    
    if (btnJamMasuk) {
        btnJamMasuk.disabled = !!jamMasuk || !nama;
        btnJamMasuk.classList.toggle('selesai', !!jamMasuk);
        btnJamMasuk.innerHTML = jamMasuk ? 
            '<i class="bi bi-check-circle"></i> Jam Masuk (Selesai)' : 
            '<i class="bi bi-clock"></i> Jam Masuk';
    }
    
    if (btnJamPulang) {
        btnJamPulang.disabled = !!jamPulang || !nama;
        btnJamPulang.classList.toggle('selesai', !!jamPulang);
        btnJamPulang.innerHTML = jamPulang ? 
            '<i class="bi bi-check-circle"></i> Jam Pulang (Selesai)' : 
            '<i class="bi bi-house-door"></i> Jam Pulang';
    }
    
    const semuaSelesai = jamMasuk && jamPulang;
    if (semuaSelesai) {
        document.getElementById('jenisAbsenContainer').style.display = 'none';
        document.getElementById('pesanSelesai').style.display = 'block';
    } else {
        document.getElementById('jenisAbsenContainer').style.display = 'flex';
        document.getElementById('pesanSelesai').style.display = 'none';
    }
}

// ===== PILIH JENIS =====
function pilihJamMasuk() {
    const nama = getNamaTerpilih();
    const divisi = document.getElementById('divisi').value;
    
    if (!nama || !divisi) {
        alert('Pilih nama dan divisi terlebih dahulu!');
        return;
    }
    
    document.getElementById('jenisAbsen').value = 'masuk';
    document.getElementById('labelWaktu').innerHTML = 'Waktu Masuk:';
    document.getElementById('formAbsenContainer').style.display = 'block';
    
    // Isi field readonly
    document.getElementById('namaTerpilih').value = nama;
    document.getElementById('divisiTerpilih').value = divisi;
    
    // Aktifkan kamera dan deteksi lokasi
    if (!kameraDiaktifkan) {
        inisialisasiKamera();
        kameraDiaktifkan = true;
    }
    deteksiLokasi();
    startWatchPosition();
    
    isFormActive = true;
    
    setTimeout(() => {
        document.getElementById('formAbsenContainer').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

function pilihJamPulang() {
    const nama = getNamaTerpilih();
    const divisi = document.getElementById('divisi').value;
    
    if (!nama || !divisi) {
        alert('Pilih nama dan divisi terlebih dahulu!');
        return;
    }
    
    document.getElementById('jenisAbsen').value = 'pulang';
    document.getElementById('labelWaktu').innerHTML = 'Waktu Pulang:';
    document.getElementById('formAbsenContainer').style.display = 'block';
    
    // Isi field readonly
    document.getElementById('namaTerpilih').value = nama;
    document.getElementById('divisiTerpilih').value = divisi;
    
    // Aktifkan kamera dan deteksi lokasi
    if (!kameraDiaktifkan) {
        inisialisasiKamera();
        kameraDiaktifkan = true;
    }
    deteksiLokasi();
    startWatchPosition();
    
    isFormActive = true;
    
    setTimeout(() => {
        document.getElementById('formAbsenContainer').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }, 100);
}

function batalPilihJenis() {
    document.getElementById('formAbsenContainer').style.display = 'none';
    document.getElementById('fotoData').value = '';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('lokasiTempat').value = '';
    document.getElementById('statusKehadiran').value = 'hadir';
    document.getElementById('keteranganGroup').style.display = 'none';
    document.getElementById('keterangan').value = '';
    
    document.getElementById('fotoPreview').style.display = 'none';
    document.getElementById('btnAmbilFoto').style.display = 'block';
    document.getElementById('btnUlangFoto').style.display = 'none';
    
    matikanKamera();
    stopWatchPosition();
    kameraDiaktifkan = false;
    isFormActive = false;
    
    // Reset tampilan lokasi
    document.getElementById('loadingLokasi').innerHTML = '<i class="bi bi-geo-alt-fill text-primary"></i> Mendeteksi lokasi...';
    document.getElementById('alamatLengkap').innerHTML = '';
    document.getElementById('koordinat').innerHTML = '';
}

function resetFormAbsen() {
    document.getElementById('formAbsenContainer').style.display = 'none';
    document.getElementById('absenForm').reset();
    document.getElementById('jenisAbsen').value = '';
    document.getElementById('fotoData').value = '';
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('lokasiTempat').value = '';
    document.getElementById('statusKehadiran').value = 'hadir';
    document.getElementById('keteranganGroup').style.display = 'none';
    document.getElementById('keterangan').value = '';
    
    document.getElementById('fotoPreview').style.display = 'none';
    document.getElementById('btnAmbilFoto').style.display = 'block';
    document.getElementById('btnUlangFoto').style.display = 'none';
    
    matikanKamera();
    stopWatchPosition();
    kameraDiaktifkan = false;
}

// ===== LOKASI GPS - ENHANCED =====
function deteksiLokasi() {
    if (!navigator.geolocation) {
        document.getElementById('loadingLokasi').innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger"></i> Geolokasi tidak didukung browser ini';
        return;
    }
    
    updateStatusLokasi('Mendeteksi lokasi...', 'text-primary', 'bi-geo-alt-fill');
    
    const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(
        positionSuccess,
        positionError,
        options
    );
}

function positionSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const akurasi = position.coords.accuracy;
    const kecepatan = position.coords.speed;
    
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    let akurasiClass = '';
    let akurasiText = '';
    
    if (akurasi < 20) {
        akurasiClass = 'akurasi-tinggi';
        akurasiText = 'Akurasi Tinggi';
    } else if (akurasi < 100) {
        akurasiClass = 'akurasi-sedang';
        akurasiText = 'Akurasi Sedang';
    } else {
        akurasiClass = 'akurasi-rendah';
        akurasiText = 'Akurasi Rendah';
    }
    
    let koordinatHTML = `<i class="bi bi-crosshair"></i> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}<br>`;
    koordinatHTML += `<span class="${akurasiClass}"><i class="bi bi-${akurasiClass === 'akurasi-tinggi' ? 'check-circle' : (akurasiClass === 'akurasi-sedang' ? 'exclamation-circle' : 'exclamation-triangle')}"></i> ${akurasiText}: ±${akurasi.toFixed(0)} meter</span>`;
    
    if (kecepatan !== null && kecepatan > 0) {
        koordinatHTML += `<br><small class="text-muted">Kecepatan: ${(kecepatan * 3.6).toFixed(1)} km/jam</small>`;
    }
    
    document.getElementById('koordinat').innerHTML = koordinatHTML;
    
    reverseGeocodeWithFallback(lat, lng);
}

function positionError(error) {
    let icon = 'bi-exclamation-triangle-fill';
    let color = 'text-danger';
    let pesan = '';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            pesan = 'Izin lokasi ditolak. Izinkan akses lokasi di browser Anda.';
            icon = 'bi-shield-lock-fill';
            break;
        case error.POSITION_UNAVAILABLE:
            pesan = 'Lokasi tidak tersedia. Pastikan GPS aktif dan Anda di luar ruangan.';
            icon = 'bi-satellite';
            color = 'text-warning';
            break;
        case error.TIMEOUT:
            pesan = 'Timeout mengambil lokasi. Coba lagi.';
            icon = 'bi-hourglass-split';
            color = 'text-warning';
            break;
        default:
            pesan = 'Error tidak diketahui';
            icon = 'bi-question-circle-fill';
    }
    
    updateStatusLokasi(pesan, color, icon);
    console.error('Geolocation error:', error);
}

function startWatchPosition() {
    if (!navigator.geolocation) return;
    
    const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
    };
    
    watchId = navigator.geolocation.watchPosition(
        watchSuccess,
        watchError,
        options
    );
}

function watchSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const akurasi = position.coords.accuracy;
    
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    let akurasiClass = akurasi < 20 ? 'akurasi-tinggi' : (akurasi < 100 ? 'akurasi-sedang' : 'akurasi-rendah');
    
    document.getElementById('koordinat').innerHTML = `
        <i class="bi bi-crosshair"></i> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}<br>
        <span class="${akurasiClass}"><i class="bi bi-arrow-repeat"></i> Update real-time: ±${akurasi.toFixed(0)}m</span>
    `;
}

function watchError(error) {
    console.warn('Watch position error:', error);
}

function stopWatchPosition() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function updateStatusLokasi(pesan, colorClass, icon) {
    document.getElementById('loadingLokasi').innerHTML = `
        <i class="bi ${icon} ${colorClass}"></i> 
        <span class="${colorClass}">${pesan}</span>
    `;
}

function refreshLokasi() {
    updateStatusLokasi('Menyegarkan lokasi...', 'text-primary', 'bi-arrow-repeat');
    deteksiLokasi();
}

function inputLokasiManual() {
    const alamatManual = prompt('Masukkan alamat lengkap Anda:');
    if (alamatManual && alamatManual.trim()) {
        document.getElementById('alamatLengkap').innerHTML = `
            <i class="bi bi-pencil-fill text-warning"></i> 
            <strong>${alamatManual}</strong>
            <br><small class="text-muted">(Input manual)</small>
        `;
        document.getElementById('loadingLokasi').style.display = 'none';
        
        if (!document.getElementById('latitude').value) {
            document.getElementById('latitude').value = 'manual';
            document.getElementById('longitude').value = 'manual';
        }
    }
}

function reverseGeocodeWithFallback(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=id`, {
        headers: {
            'User-Agent': 'CIPTA-INFRA-OPTIMA-Absensi/1.0'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.display_name) {
            tampilkanAlamat(data);
        } else {
            throw new Error('Alamat tidak ditemukan');
        }
    })
    .catch(error => {
        console.warn('Nominatim gagal, coba provider lain:', error);
        reverseGeocodeBigDataCloud(lat, lng);
    });
}

function tampilkanAlamat(data) {
    document.getElementById('loadingLokasi').style.display = 'none';
    
    let alamat = data.display_name;
    let detailAlamat = [];
    
    if (data.address) {
        if (data.address.building) detailAlamat.push(`🏢 ${data.address.building}`);
        if (data.address.shop) detailAlamat.push(`🏪 ${data.address.shop}`);
        if (data.address.office) detailAlamat.push(`🏛️ ${data.address.office}`);
        if (data.address.road) detailAlamat.push(`🛣️ ${data.address.road}`);
        if (data.address.suburb) detailAlamat.push(`🏘️ ${data.address.suburb}`);
        if (data.address.city || data.address.town || data.address.village) {
            const kota = data.address.city || data.address.town || data.address.village;
            detailAlamat.push(`🏙️ ${kota}`);
        }
    }
    
    let alamatHTML = `<i class="bi bi-pin-map-fill text-primary"></i> <strong>${alamat}</strong>`;
    
    if (detailAlamat.length > 0) {
        alamatHTML += `<br><small class="text-muted">${detailAlamat.join(' • ')}</small>`;
    }
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID');
    alamatHTML += `<br><small class="text-muted"><i class="bi bi-clock"></i> Terdeteksi: ${timeStr}</small>`;
    
    document.getElementById('alamatLengkap').innerHTML = alamatHTML;
}

function reverseGeocodeBigDataCloud(lat, lng) {
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`)
    .then(response => response.json())
    .then(data => {
        if (data && (data.locality || data.city || data.countryName)) {
            document.getElementById('loadingLokasi').style.display = 'none';
            
            const parts = [];
            if (data.locality) parts.push(data.locality);
            if (data.city) parts.push(data.city);
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            if (data.countryName) parts.push(data.countryName);
            
            const alamat = parts.join(', ') || 'Alamat tidak ditemukan';
            
            document.getElementById('alamatLengkap').innerHTML = `
                <i class="bi bi-pin-map-fill text-primary"></i> 
                <strong>${alamat}</strong>
                <br><small class="text-muted"><i class="bi bi-database"></i> Sumber: BigDataCloud</small>
                <br><small class="text-muted"><i class="bi bi-clock"></i> ${new Date().toLocaleTimeString('id-ID')}</small>
            `;
        } else {
            throw new Error('Alamat tidak ditemukan');
        }
    })
    .catch(error => {
        console.warn('BigDataCloud gagal:', error);
        
        document.getElementById('loadingLokasi').style.display = 'none';
        document.getElementById('alamatLengkap').innerHTML = `
            <i class="bi bi-info-circle-fill text-warning"></i> 
            Alamat tidak dapat diambil, tapi koordinat tersedia.
            <br><small class="text-muted">Gunakan koordinat untuk verifikasi lokasi.</small>
        `;
    });
}

// ===== KAMERA =====
async function inisialisasiKamera() {
    try {
        if (mediaStream) {
            matikanKamera();
        }
        
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }, 
            audio: false 
        });
        
        const video = document.getElementById('video');
        video.srcObject = mediaStream;
        video.style.display = 'block';
        
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('btnAmbilFoto').style.display = 'block';
        document.getElementById('btnUlangFoto').style.display = 'none';
        
        console.log('Kamera aktif');
        
    } catch (err) {
        console.error('Error kamera:', err);
        alert('Tidak dapat mengakses kamera. Pastikan kamera terhubung dan izin diberikan.');
    }
}

function matikanKamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
            track.stop();
        });
        mediaStream = null;
        console.log('Kamera dimatikan');
    }
}

function ambilFoto() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const fotoData = canvas.toDataURL('image/jpeg', 0.8);
    document.getElementById('fotoData').value = fotoData;
    
    document.getElementById('fotoHasil').src = fotoData;
    document.getElementById('fotoPreview').style.display = 'block';
    document.getElementById('video').style.display = 'none';
    document.getElementById('btnAmbilFoto').style.display = 'none';
    document.getElementById('btnUlangFoto').style.display = 'block';
}

function ulangFoto() {
    document.getElementById('fotoPreview').style.display = 'none';
    document.getElementById('video').style.display = 'block';
    document.getElementById('btnAmbilFoto').style.display = 'block';
    document.getElementById('btnUlangFoto').style.display = 'none';
    document.getElementById('fotoData').value = '';
}

// ===== SUBMIT ABSEN =====
function submitAbsen() {
    const nama = document.getElementById('namaTerpilih').value;
    const divisi = document.getElementById('divisiTerpilih').value;
    
    if (!nama || !divisi) {
        alert('Data karyawan tidak valid!');
        return;
    }
    
    if (!document.getElementById('lokasiTempat').value.trim()) {
        alert('Masukkan lokasi tempat Anda saat ini!');
        return;
    }
    
    if (!document.getElementById('fotoData').value) {
        alert('Ambil foto terlebih dahulu!');
        return;
    }
    
    if (!document.getElementById('latitude').value) {
        alert('Lokasi GPS belum terdeteksi. Tunggu sebentar atau gunakan input manual.');
        return;
    }
    
    const data = {
        id: Date.now(),
        nama: nama,
        divisi: divisi,
        tanggal: document.getElementById('tanggal').value,
        waktu: document.getElementById('waktu').value,
        jenis: document.getElementById('jenisAbsen').value,
        status: document.getElementById('statusKehadiran').value,
        keterangan: document.getElementById('keterangan').value,
        lokasiTempat: document.getElementById('lokasiTempat').value.trim(),
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value,
        alamat: document.getElementById('alamatLengkap').innerText || 'Alamat tidak diketahui',
        fotoData: document.getElementById('fotoData').value,
        timestamp: new Date().toISOString()
    };
    
    const btn = document.querySelector('button[onclick="submitAbsen()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Menyimpan...';
    btn.disabled = true;
    
    simpanKeDatabase(data)
        .then(result => {
            if (result && result.status === 'success') {
                simpanDataLocal(data);
                resetFormAbsen();
                isFormActive = false;
                kameraDiaktifkan = false;
                stopWatchPosition();
                updateStatusAbsen();
                alert('Absensi berhasil!');
            } else {
                throw new Error(result?.message || 'Gagal');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            simpanDataLocal(data);
            resetFormAbsen();
            isFormActive = false;
            kameraDiaktifkan = false;
            stopWatchPosition();
            updateStatusAbsen();
            alert('Data disimpan lokal (server offline)');
        })
        .finally(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        });
}

// ===== DATABASE =====
async function simpanKeDatabase(data) {
    try {
        const response = await fetch('api/absen.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Koneksi database gagal:', error);
        return null;
    }
}

async function ambilDariDatabase(tanggal = '', divisi = '', status = '', nama = '') {
    try {
        let url = 'api/laporan.php';
        const params = [];
        if (tanggal) params.push(`tanggal=${tanggal}`);
        if (divisi) params.push(`divisi=${divisi}`);
        if (status) params.push(`status=${status}`);
        if (nama) params.push(`nama=${encodeURIComponent(nama)}`);
        if (params.length) url += '?' + params.join('&');
        
        const response = await fetch(url);
        const result = await response.json();
        return result.status === 'success' ? result.data : [];
    } catch (error) {
        console.error('Gagal ambil data:', error);
        return [];
    }
}

async function hapusDataDatabase(id) {
    try {
        const response = await fetch(`api/hapus.php?id=${id}`, {
            method: 'DELETE'
        });
        return await response.json();
    } catch (error) {
        console.error('Gagal hapus data:', error);
        return null;
    }
}

// ===== LOCAL STORAGE =====
function simpanDataLocal(data) {
    dataAbsensi.push(data);
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
}

function loadDataFromStorage() {
    const stored = localStorage.getItem('dataAbsensi');
    if (stored) {
        try {
            dataAbsensi = JSON.parse(stored);
        } catch (e) {
            dataAbsensi = [];
        }
    }
}

function hapusDataLocal(id) {
    dataAbsensi = dataAbsensi.filter(item => item.id != id);
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
}

// ===== REKAP SEMUA KARYAWAN =====
async function refreshRekap() {
    const tbody = document.getElementById('rekapBody');
    if (!tbody) return;
    
    const filterTanggal = document.getElementById('filterTanggal').value;
    const filterDivisi = document.getElementById('filterDivisi').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterNama = document.getElementById('filterNama').value;
    
    tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Mengambil data...</p>
    </td></tr>`;
    
    try {
        const dataDB = await ambilDariDatabase(filterTanggal, filterDivisi, filterStatus, filterNama);
        
        if (dataDB && dataDB.length > 0) {
            tampilkanRekap(dataDB, tbody);
            updateRekapInfo(dataDB);
        } else {
            tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama);
        }
    } catch (error) {
        tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama);
    }
}

function tampilkanRekap(data, tbody) {
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">Belum ada data</td></tr>`;
        updateRekapInfo([]);
        return;
    }
    
    let html = '';
    data.forEach((item, index) => {
        const badgeStatus = `<span class="badge-status ${item.status || 'hadir'}">${(item.status || 'hadir').toUpperCase()}</span>`;
        const fotoThumb = item.foto ? 
            `<img src="${item.foto}" class="foto-thumbnail" onclick="previewFoto('${item.foto}')" title="Klik untuk perbesar">` : 
            '<span class="text-muted">-</span>';
        const lokasiGps = item.alamat ? item.alamat.substring(0, 40) + '...' : '-';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama}</strong></td>
                <td>${item.divisi || '-'}</td>
                <td>${item.tanggal}</td>
                <td>${item.jamMasuk || '-'}</td>
                <td>${item.jamPulang || '-'}</td>
                <td>${badgeStatus}</td>
                <td>${item.keterangan || '-'}</td>
                <td>${item.lokasiTempat || '-'}</td>
                <td>${lokasiGps}</td>
                <td>${fotoThumb}</td>
                <td>
                    <button class="btn-aksi hapus" onclick="konfirmasiHapus(${item.id})" title="Hapus">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    updateRekapInfo(data);
}

function tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama) {
    let data = [...dataAbsensi];
    
    if (filterTanggal) {
        data = data.filter(item => item.tanggal === filterTanggal);
    }
    
    if (filterDivisi) {
        data = data.filter(item => item.divisi === filterDivisi);
    }
    
    if (filterStatus) {
        data = data.filter(item => item.status === filterStatus);
    }
    
    if (filterNama) {
        data = data.filter(item => item.nama.toLowerCase().includes(filterNama.toLowerCase()));
    }
    
    const grouped = {};
    data.forEach(item => {
        const key = `${item.tanggal}-${item.nama}`;
        if (!grouped[key]) {
            grouped[key] = {
                id: item.id,
                nama: item.nama,
                divisi: item.divisi,
                tanggal: item.tanggal,
                jamMasuk: '-',
                jamPulang: '-',
                status: item.status || 'hadir',
                keterangan: item.keterangan || '',
                lokasiTempat: item.lokasiTempat,
                alamat: item.alamat,
                foto: null
            };
        }
        if (item.jenis === 'masuk') {
            grouped[key].jamMasuk = item.waktu;
            grouped[key].foto = item.fotoData;
        } else {
            grouped[key].jamPulang = item.waktu;
        }
    });
    
    const dataArray = Object.values(grouped);
    
    if (!dataArray.length) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">Belum ada data lokal</td></tr>`;
        updateRekapInfo([]);
        return;
    }
    
    let html = '';
    dataArray.forEach((item, index) => {
        const badgeStatus = `<span class="badge-status ${item.status}">${item.status.toUpperCase()}</span>`;
        const fotoThumb = item.foto ? 
            `<img src="${item.foto}" class="foto-thumbnail" onclick="previewFoto('${item.foto}')" title="Klik untuk perbesar (Lokal)">` : 
            '<span class="text-muted">-</span>';
        const lokasiGps = item.alamat ? item.alamat.substring(0, 40) + '...' : '-';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama}</strong></td>
                <td>${item.divisi || '-'}</td>
                <td>${item.tanggal}</td>
                <td>${item.jamMasuk}</td>
                <td>${item.jamPulang}</td>
                <td>${badgeStatus}</td>
                <td>${item.keterangan || '-'}</td>
                <td>${item.lokasiTempat || '-'}</td>
                <td>${lokasiGps}</td>
                <td>${fotoThumb}</td>
                <td>
                    <button class="btn-aksi hapus" onclick="konfirmasiHapus(${item.id})" title="Hapus">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html + `<tr><td colspan="12" class="text-center text-muted small py-2"><i class="bi bi-info-circle"></i> *Data lokal (offline) - Tidak tersinkronisasi dengan server</td></tr>`;
    updateRekapInfo(dataArray);
}

function updateRekapInfo(data) {
    document.getElementById('totalData').innerHTML = data.length;
    
    const hadir = data.filter(item => (item.status || 'hadir') === 'hadir').length;
    const izin = data.filter(item => item.status === 'izin').length;
    const sakit = data.filter(item => item.status === 'sakit').length;
    const alpha = data.filter(item => item.status === 'alpha').length;
    
    const uniqueKaryawan = new Set(data.map(item => item.nama)).size;
    
    document.getElementById('totalHadir').innerHTML = hadir;
    document.getElementById('totalIzin').innerHTML = izin;
    document.getElementById('totalSakit').innerHTML = sakit;
    document.getElementById('totalAlpha').innerHTML = alpha;
    document.getElementById('totalKaryawan').innerHTML = uniqueKaryawan;
}

function filterRekap() {
    refreshRekap();
}

function resetFilter() {
    document.getElementById('filterTanggal').value = '';
    document.getElementById('filterDivisi').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterNama').value = '';
    refreshRekap();
}

function previewFoto(fotoData) {
    document.getElementById('fotoPreviewModal').src = fotoData;
    new bootstrap.Modal(document.getElementById('fotoModal')).show();
}

// ===== HAPUS DATA =====
function konfirmasiHapus(id) {
    hapusId = id;
    const modal = new bootstrap.Modal(document.getElementById('hapusModal'));
    modal.show();
    
    document.getElementById('confirmHapus').onclick = function() {
        hapusData(id);
        modal.hide();
    };
}

function hapusData(id) {
    hapusDataDatabase(id).then(result => {
        if (result && result.status === 'success') {
            console.log('Data terhapus dari database');
        }
    }).catch(error => {
        console.error('Gagal hapus dari database:', error);
    });
    
    hapusDataLocal(id);
    refreshRekap();
    alert('Data berhasil dihapus');
}

// ===== EXPORT PDF =====
function exportPDF() {
    const element = document.querySelector('.table-container');
    const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `rekap_absensi_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// ===== EXPORT CSV =====
function exportCSV() {
    if (!dataAbsensi.length) {
        alert('Tidak ada data');
        return;
    }
    
    let csv = 'No,Nama,Divisi,Tanggal,Jenis,Waktu,Status,Keterangan,Lokasi Tempat,Alamat\n';
    dataAbsensi.forEach((item, i) => {
        csv += `${i+1},${item.nama},${item.divisi || '-'},${item.tanggal},${item.jenis},${item.waktu},${item.status || 'hadir'},${item.keterangan || ''},${item.lokasiTempat || ''},${item.alamat}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_absensi_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// ===== CETAK =====
function cetakRekap() {
    window.print();
}

// ===== RESET (UNTUK TESTING) =====
function resetDataHariIni() {
    if (!confirm('Reset data hari ini?')) return;
    const today = new Date().toISOString().split('T')[0];
    dataAbsensi = dataAbsensi.filter(item => item.tanggal !== today);
    localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
    refreshRekap();
    alert('Data hari ini telah direset');
}

function resetSemuaData() {
    if (!confirm('Hapus semua data? Ketik RESET untuk konfirmasi')) return;
    const confirmText = prompt('Ketik RESET untuk konfirmasi:');
    if (confirmText === 'RESET') {
        dataAbsensi = [];
        localStorage.removeItem('dataAbsensi');
        refreshRekap();
        alert('Semua data telah dihapus');
    }
}