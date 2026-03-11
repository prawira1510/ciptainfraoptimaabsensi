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
        updateStatusAbsen();
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
    
    document.getElementById('namaTerpilih').value = nama;
    document.getElementById('divisiTerpilih').value = divisi;
    
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
    
    document.getElementById('namaTerpilih').value = nama;
    document.getElementById('divisiTerpilih').value = divisi;
    
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

// ===== LOKASI GPS =====
function deteksiLokasi() {
    if (!navigator.geolocation) {
        document.getElementById('loadingLokasi').innerHTML = '<i class="bi bi-exclamation-triangle-fill text-danger"></i> Geolokasi tidak didukung';
        return;
    }
    
    updateStatusLokasi('Mendeteksi lokasi...', 'text-primary', 'bi-geo-alt-fill');
    
    navigator.geolocation.getCurrentPosition(
        positionSuccess,
        positionError,
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        }
    );
}

function positionSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const akurasi = position.coords.accuracy;
    
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
    
    document.getElementById('koordinat').innerHTML = `
        <i class="bi bi-crosshair"></i> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}<br>
        <span class="${akurasiClass}">${akurasiText}: ±${akurasi.toFixed(0)}m</span>
    `;
    
    reverseGeocode(lat, lng);
}

function positionError(error) {
    let pesan = '';
    if (error.code === 1) pesan = 'Izin lokasi ditolak';
    else if (error.code === 2) pesan = 'Lokasi tidak tersedia';
    else if (error.code === 3) pesan = 'Timeout';
    else pesan = 'Error tidak diketahui';
    
    updateStatusLokasi(pesan, 'text-danger', 'bi-exclamation-triangle-fill');
}

function startWatchPosition() {
    if (!navigator.geolocation) return;
    
    watchId = navigator.geolocation.watchPosition(
        watchSuccess,
        watchError,
        {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
        }
    );
}

function watchSuccess(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const akurasi = position.coords.accuracy;
    
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    
    document.getElementById('koordinat').innerHTML = `
        <i class="bi bi-crosshair"></i> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}<br>
        <span class="text-info"><i class="bi bi-arrow-repeat"></i> Update: ±${akurasi.toFixed(0)}m</span>
    `;
}

function watchError(error) {
    console.warn('Watch error:', error);
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

function reverseGeocode(lat, lng) {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&accept-language=id`)
    .then(response => response.json())
    .then(data => {
        if (data && data.display_name) {
            document.getElementById('loadingLokasi').style.display = 'none';
            document.getElementById('alamatLengkap').innerHTML = `
                <i class="bi bi-pin-map-fill text-primary"></i> 
                <strong>${data.display_name}</strong>
            `;
        }
    })
    .catch(() => {
        document.getElementById('loadingLokasi').style.display = 'none';
        document.getElementById('alamatLengkap').innerHTML = `
            <i class="bi bi-info-circle-fill text-warning"></i> 
            Alamat tidak ditemukan
        `;
    });
}

// ===== KAMERA =====
async function inisialisasiKamera() {
    try {
        if (mediaStream) matikanKamera();
        
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: false 
        });
        
        const video = document.getElementById('video');
        video.srcObject = mediaStream;
        video.style.display = 'block';
        
        document.getElementById('fotoPreview').style.display = 'none';
        document.getElementById('btnAmbilFoto').style.display = 'block';
        document.getElementById('btnUlangFoto').style.display = 'none';
        
    } catch (err) {
        alert('Tidak dapat mengakses kamera');
    }
}

function matikanKamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
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
        alert('Masukkan lokasi tempat!');
        return;
    }
    
    if (!document.getElementById('fotoData').value) {
        alert('Ambil foto terlebih dahulu!');
        return;
    }
    
    const data = {
        nama: nama,
        divisi: divisi,
        tanggal: document.getElementById('tanggal').value,
        waktu: document.getElementById('waktu').value,
        jenis: document.getElementById('jenisAbsen').value,
        status: document.getElementById('statusKehadiran').value,
        keterangan: document.getElementById('keterangan').value,
        lokasiTempat: document.getElementById('lokasiTempat').value.trim(),
        latitude: document.getElementById('latitude').value || '0',
        longitude: document.getElementById('longitude').value || '0',
        alamat: document.getElementById('alamatLengkap').innerText || 'Alamat tidak diketahui',
        fotoData: document.getElementById('fotoData').value
    };
    
    const btn = document.querySelector('button[onclick="submitAbsen()"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Menyimpan...';
    btn.disabled = true;
    
    // Simpan ke database
    fetch('api/absen.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result && result.status === 'success') {
            // Simpan juga ke localStorage
            data.id = Date.now();
            data.timestamp = new Date().toISOString();
            simpanDataLocal(data);
            
            resetFormAbsen();
            isFormActive = false;
            kameraDiaktifkan = false;
            stopWatchPosition();
            updateStatusAbsen();
            alert('✅ Absensi berhasil!');
        } else {
            alert('❌ Gagal: ' + (result?.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback ke local
        data.id = Date.now();
        data.timestamp = new Date().toISOString();
        simpanDataLocal(data);
        
        resetFormAbsen();
        isFormActive = false;
        kameraDiaktifkan = false;
        stopWatchPosition();
        updateStatusAbsen();
        alert('📱 Data disimpan lokal (server offline)');
    })
    .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// ===== FUNGSI HAPUS DATA - VERSI FINAL =====
async function hapusData(id) {
    // Konfirmasi langsung
    if (!confirm('🗑️ Yakin ingin menghapus data ini?\nData yang dihapus tidak bisa dikembalikan!')) {
        return;
    }
    
    try {
        // Cari tombol yang diklik
        const btn = event?.target?.closest('button');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
            btn.disabled = true;
        }
        
        console.log('Menghapus data ID:', id);
        
        // Panggil API hapus
        const response = await fetch('api/hapus.php?id=' + id, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        const result = await response.json();
        console.log('Response hapus:', result);
        
        if (result.status === 'success') {
            // Hapus dari localStorage
            hapusDataLocal(id);
            
            // Refresh rekap
            await refreshRekap();
            
            alert('✅ Data berhasil dihapus!');
        } else {
            alert('❌ Gagal: ' + (result.message || 'Unknown error'));
            
            // Coba hapus dari localStorage aja
            hapusDataLocal(id);
            await refreshRekap();
        }
        
    } catch (error) {
        console.error('Error hapus:', error);
        
        // Fallback: hapus dari localStorage aja
        hapusDataLocal(id);
        await refreshRekap();
        
        alert('📱 Data dihapus dari lokal (server error)');
    } finally {
        // Kembalikan tombol ke normal
        const btn = event?.target?.closest('button');
        if (btn) {
            btn.innerHTML = '<i class="bi bi-trash"></i>';
            btn.disabled = false;
        }
    }
}

// ===== HAPUS DARI LOCAL STORAGE =====
function hapusDataLocal(id) {
    try {
        const idNum = parseInt(id);
        dataAbsensi = dataAbsensi.filter(item => {
            const itemId = parseInt(item.id || item.id_absensi || 0);
            return itemId !== idNum;
        });
        localStorage.setItem('dataAbsensi', JSON.stringify(dataAbsensi));
        console.log('Data dihapus dari localStorage');
    } catch (e) {
        console.error('Error hapus localStorage:', e);
    }
}

// ===== KONFIRMASI HAPUS =====
function konfirmasiHapus(id) {
    hapusData(id);
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

// ===== REKAP =====
async function refreshRekap() {
    const tbody = document.getElementById('rekapBody');
    if (!tbody) return;
    
    const filterTanggal = document.getElementById('filterTanggal').value;
    const filterDivisi = document.getElementById('filterDivisi').value;
    const filterStatus = document.getElementById('filterStatus').value;
    const filterNama = document.getElementById('filterNama').value;
    
    tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <p class="mt-2">Mengambil data...</p>
    </td></tr>`;
    
    try {
        // Ambil dari server
        let url = 'api/laporan.php';
        const params = [];
        if (filterTanggal) params.push('tanggal=' + filterTanggal);
        if (filterDivisi) params.push('divisi=' + encodeURIComponent(filterDivisi));
        if (filterStatus) params.push('status=' + filterStatus);
        if (filterNama) params.push('nama=' + encodeURIComponent(filterNama));
        if (params.length) url += '?' + params.join('&');
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.status === 'success' && result.data.length > 0) {
            tampilkanRekap(result.data, tbody);
            updateRekapInfo(result.data);
        } else {
            tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama);
        }
    } catch (error) {
        console.error('Error:', error);
        tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama);
    }
}

function tampilkanRekap(data, tbody) {
    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">Belum ada data</td></tr>`;
        return;
    }
    
    let html = '';
    data.forEach((item, index) => {
        const badgeStatus = `<span class="badge-status ${item.status || 'hadir'}">${(item.status || 'hadir').toUpperCase()}</span>`;
        const fotoThumb = item.foto ? 
            `<img src="${item.foto}" class="foto-thumbnail" onclick="previewFoto('${item.foto}')">` : '-';
        const lokasiGps = item.alamat ? item.alamat.substring(0, 40) + '...' : '-';
        
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama}</strong></td>
                <td>${item.divisi || '-'}</td>
                <td>${item.tanggal}</td>
                <td>${item.jam_masuk || item.jamMasuk || '-'}</td>
                <td>${item.jam_pulang || item.jamPulang || '-'}</td>
                <td>${badgeStatus}</td>
                <td>${item.keterangan || '-'}</td>
                <td>${item.lokasi_tempat || item.lokasiTempat || '-'}</td>
                <td>${lokasiGps}</td>
                <td>${fotoThumb}</td>
                <td>
                    <button class="btn-aksi hapus" onclick="konfirmasiHapus(${item.id_absensi || item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function tampilkanRekapLocal(tbody, filterTanggal, filterDivisi, filterStatus, filterNama) {
    let data = [...dataAbsensi];
    
    if (filterTanggal) data = data.filter(i => i.tanggal === filterTanggal);
    if (filterDivisi) data = data.filter(i => i.divisi === filterDivisi);
    if (filterStatus) data = data.filter(i => i.status === filterStatus);
    if (filterNama) data = data.filter(i => i.nama.toLowerCase().includes(filterNama.toLowerCase()));
    
    const grouped = {};
    data.forEach(item => {
        const key = item.tanggal + '-' + item.nama;
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
        tbody.innerHTML = `<tr><td colspan="12" class="text-center py-4">Belum ada data</td></tr>`;
        return;
    }
    
    let html = '';
    dataArray.forEach((item, index) => {
        const badgeStatus = `<span class="badge-status ${item.status}">${item.status.toUpperCase()}</span>`;
        const fotoThumb = item.foto ? 
            `<img src="${item.foto}" class="foto-thumbnail" onclick="previewFoto('${item.foto}')">` : '-';
        
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
                <td>${item.alamat?.substring(0,40) || '-'}</td>
                <td>${fotoThumb}</td>
                <td>
                    <button class="btn-aksi hapus" onclick="konfirmasiHapus(${item.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html + `<tr><td colspan="12" class="text-center text-muted small">*Data lokal (offline)</td></tr>`;
    updateRekapInfo(dataArray);
}

function updateRekapInfo(data) {
    document.getElementById('totalData').innerHTML = data.length;
    
    const hadir = data.filter(i => (i.status || 'hadir') === 'hadir').length;
    const izin = data.filter(i => i.status === 'izin').length;
    const sakit = data.filter(i => i.status === 'sakit').length;
    const alpha = data.filter(i => i.status === 'alpha').length;
    const unique = new Set(data.map(i => i.nama)).size;
    
    document.getElementById('totalHadir').innerHTML = hadir;
    document.getElementById('totalIzin').innerHTML = izin;
    document.getElementById('totalSakit').innerHTML = sakit;
    document.getElementById('totalAlpha').innerHTML = alpha;
    document.getElementById('totalKaryawan').innerHTML = unique;
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

// ===== EXPORT =====
function exportPDF() {
    const element = document.querySelector('.table-container');
    html2pdf().from(element).save('rekap_absensi.pdf');
}

function exportCSV() {
    if (!dataAbsensi.length) {
        alert('Tidak ada data');
        return;
    }
    
    let csv = 'No,Nama,Divisi,Tanggal,Jenis,Waktu,Status,Keterangan,Lokasi Tempat\n';
    dataAbsensi.forEach((item, i) => {
        csv += `${i+1},${item.nama},${item.divisi || '-'},${item.tanggal},${item.jenis},${item.waktu},${item.status || 'hadir'},${item.keterangan || ''},${item.lokasiTempat || ''}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

function cetakRekap() {
    window.print();
}