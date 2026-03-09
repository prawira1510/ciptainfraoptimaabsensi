<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CIPTA INFRA OPTIMA - Absensi</title>

    <!-- FAVICON LOGO PT CIO -->
    <link rel="icon" type="image/png" href="img/logo_cio_original-removebg-preview.png" onerror="this.href='https://via.placeholder.com/32x32?text=CIO'">
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <!-- Header dengan Logo -->
        <div class="company-header">
            <div class="company-logo mx-auto">
                <img src="img/logo_cio_original-removebg-preview.png" alt="Logo CIPTA INFRA OPTIMA" class="logo-img" onerror="this.src='https://via.placeholder.com/120x120?text=CIO'">
            </div>
            <h1 class="company-name">CIPTA INFRA OPTIMA <br> ABSENSI KARYAWAN</h1>
        </div>

        <!-- Menu Utama -->
        <div class="row g-4 justify-content-center">
            <div class="col-md-5 col-lg-4">
                <!-- Card ABSEN -->
                <div class="menu-card absen" onclick="handleAbsen()">
                    <div class="menu-icon">
                        <i class="bi bi-person-badge"></i>
                    </div>
                    <h2 class="menu-title">ABSEN</h2>
                    <p class="menu-subtitle">Klik untuk melakukan absensi</p>
                </div>
            </div>
            
            <div class="col-md-5 col-lg-4">
                <!-- Card REKAP -->
                <div class="menu-card laporan" onclick="handleRekap()">
                    <div class="menu-icon">
                        <i class="bi bi-file-text"></i>
                    </div>
                    <h2 class="menu-title">REKAP</h2>
                    <p class="menu-subtitle">Lihat riwayat absensi semua karyawan</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk ABSEN -->
    <div id="absenModal" class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Form Absensi</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="tutupModalAbsen()"></button>
                </div>
                <div class="modal-body" id="absenModalBody">
                    <!-- DATA DIRI (DROPDOWN NAMA) -->
                    <div class="data-diri-section mb-4 p-3 bg-light rounded">
                        <h6 class="mb-3"><i class="bi bi-person-circle"></i> Pilih Karyawan</h6>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="nama" class="form-label">Nama Karyawan:</label>
                                <select class="form-select" id="nama" required onchange="pilihKaryawan()">
                                    <option value="">-- Pilih Nama --</option>
                                    <option value="yayat rukiyat">YAYAT RUKIYAT</option>
                                    <option value="ester monica siregar">ESTER MONICA SIREGAR</option>
                                    <option value="harry syahputra sinaga">HARRY SYAHPUTRA SINAGA</option>
                                    <option value="nur habiba salim">NUR HABIBA SALIM</option>
                                    <option value="prawira sebastian">PRAWIRA SEBASTIAN</option>
                                    <option value="a. rasiydi">A. RASIYDI</option>
                                    <option value="robianto">ROBIANTO</option>
                                    <option value="arif haryanto">ARIF HARYANTO</option>
                                    <option value="rio akmal">RIO AKMAL</option>
                                    <option value="rofi chozimi">ROFI CHOZIMI</option>
                                    <option value="helmud halasan ambarita">HELMUD HALASAN AMBARITA</option>
                                    <option value="agus sudiarman sinaga">AGUS SUDIARMAN SINAGA</option>
                                    <option value="bayu prananda">BAYU PRANANDA</option>
                                    <option value="syaloom manik">SYALOOM MANIK</option>
                                    <option value="suyanto">SUYANTO</option>
                                    <option value="dedek iskandar">DEDEK ISKANDAR</option>
                                    <option value="fahrul">FAHRUL</option>
                                    <option value="Lainnya">+ Lainnya (Input Manual)</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3" id="namaManualGroup" style="display: none;">
                                <label for="namaManual" class="form-label">Nama Lengkap (Manual):</label>
                                <input type="text" class="form-control" id="namaManual" placeholder="Masukkan nama lengkap" onkeyup="validasiDataDiri()">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="divisi" class="form-label">Divisi:</label>
                                <select class="form-select" id="divisi" required onchange="validasiDataDiri()">
                                    <option value="">Pilih Divisi</option>
                                    <option value="IT - sosial media">IT - SOSIAL MEDIA</option>
                                    <option value="project planning, cc">PROJECT PLANNING, CC</option>
                                    <option value="Purchasing">PURCHASING</option>
                                    <option value="Site Enggineer">SITE ENGGINEER</option>
                                    <option value="Surveyor">SURVEYOR</option>
                                    <option value="Drafter">DRAFTER</option>
                                    <option value="Senior SPV">SENIOR SPV</option>
                                    <option value="Aas. Surveyor">ASS. SURVEYOR</option>
                                    <option value="Humas">HUMAS</option>
                                    <option value="SPV">SPV</option>
                                    <Option value="Logistik">LOGISTIK</Option>
                                    <option value="Security">SECURITY</option>
                                    <option value="Finance">FINANCE</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Status Absensi Hari Ini -->
                    <div id="statusAbsen" class="status-sederhana mb-3">
                        <!-- Akan diisi JavaScript -->
                    </div>

                    <!-- Pilihan Jenis Absen (AKTIF setelah pilih nama) -->
                    <div id="jenisAbsenContainer" class="row g-3 mb-4">
                        <div class="col-md-6">
                            <button id="btnJamMasuk" class="btn-jenis-absen" onclick="pilihJamMasuk()" disabled>
                                <i class="bi bi-clock"></i> Jam Masuk
                            </button>
                        </div>
                        <div class="col-md-6">
                            <button id="btnJamPulang" class="btn-jenis-absen" onclick="pilihJamPulang()" disabled>
                                <i class="bi bi-house-door"></i> Jam Pulang
                            </button>
                        </div>
                    </div>

                    <!-- Form Absensi (muncul setelah pilih jenis) -->
                    <div id="formAbsenContainer" style="display: none;">
                        <div class="form-absen-wrapper">
                            <form id="absenForm">
                                <input type="hidden" id="jenisAbsen" name="jenisAbsen">
                                <input type="hidden" id="fotoData" name="fotoData">
                                <input type="hidden" id="latitude" name="latitude">
                                <input type="hidden" id="longitude" name="longitude">
                                
                                <div class="row">
                                    <div class="col-lg-6">
                                        <!-- Informasi Karyawan (Readonly) -->
                                        <div class="mb-3">
                                            <label class="form-label">Nama:</label>
                                            <input type="text" class="form-control" id="namaTerpilih" readonly>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label class="form-label">Divisi:</label>
                                            <input type="text" class="form-control" id="divisiTerpilih" readonly>
                                        </div>
                                        
                                        <!-- Waktu & Tanggal -->
                                        <div class="row">
                                            <div class="col-6 mb-3">
                                                <label for="waktu" class="form-label" id="labelWaktu">Waktu:</label>
                                                <input type="time" class="form-control" id="waktu" name="waktu" required readonly>
                                            </div>
                                            
                                            <div class="col-6 mb-3">
                                                <label for="tanggal" class="form-label">Tanggal:</label>
                                                <input type="date" class="form-control" id="tanggal" name="tanggal" required readonly>
                                            </div>
                                        </div>
                                        
                                        <!-- LOKASI TEMPAT (Flexible) -->
                                        <div class="mb-3">
                                            <label for="lokasiTempat" class="form-label">Lokasi Tempat:</label>
                                            <input type="text" class="form-control" id="lokasiTempat" placeholder="Contoh: Kantor Pusat, Proyek A, Rumah Client" required>
                                            <small class="text-muted"><i class="bi bi-info-circle"></i> Di mana Anda saat ini?</small>
                                        </div>
                                        
                                        <!-- Status Kehadiran -->
                                        <div class="mb-3">
                                            <label class="form-label">Status Kehadiran:</label>
                                            <select class="form-select" id="statusKehadiran" onchange="ubahStatusKehadiran()">
                                                <option value="hadir">Hadir</option>
                                                <option value="izin">Izin</option>
                                                <option value="sakit">Sakit</option>
                                                <option value="alpha">Alpha (Tanpa Keterangan)</option>
                                            </select>
                                        </div>
                                        
                                        <!-- Keterangan -->
                                        <div class="mb-3" id="keteranganGroup" style="display: none;">
                                            <label for="keterangan" class="form-label">Keterangan:</label>
                                            <textarea class="form-control" id="keterangan" rows="2" placeholder="Masukkan keterangan..."></textarea>
                                        </div>
                                    </div>
                                    
                                    <div class="col-lg-6">
                                        <!-- LOKASI GPS - ENHANCED -->
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-geo-alt-fill text-primary"></i> 
                                                Lokasi GPS Anda:
                                                <span class="text-muted small">(otomatis terdeteksi)</span>
                                            </label>
                                            <div id="lokasiContainer" class="lokasi-box">
                                                <div id="loadingLokasi" class="loading">
                                                    <i class="bi bi-geo-alt-fill text-primary"></i> 
                                                    Mendeteksi lokasi...
                                                </div>
                                                <div id="alamatLengkap" class="alamat"></div>
                                                <div id="koordinat" class="koordinat"></div>
                                                <div id="lokasiActions" class="lokasi-actions mt-2">
                                                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="refreshLokasi()" title="Refresh lokasi">
                                                        <i class="bi bi-arrow-repeat"></i> Refresh
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="inputLokasiManual()" title="Input manual">
                                                        <i class="bi bi-pencil"></i> Manual
                                                    </button>
                                                </div>
                                            </div>
                                            <small class="text-muted">
                                                <i class="bi bi-info-circle"></i> 
                                                Pastikan GPS aktif dan izin lokasi diberikan
                                            </small>
                                        </div>
                                        
                                        <!-- KAMERA -->
                                        <div class="mb-3">
                                            <label class="form-label">
                                                <i class="bi bi-camera-fill text-primary"></i> 
                                                Foto Diri:
                                            </label>
                                            <div class="camera-container mb-2">
                                                <video id="video" class="camera-preview" autoplay playsinline></video>
                                                <canvas id="canvas" class="d-none"></canvas>
                                                <div id="fotoPreview" class="foto-preview" style="display: none;">
                                                    <img id="fotoHasil" src="" alt="Foto Diri" class="img-fluid">
                                                </div>
                                            </div>
                                            <div class="d-flex gap-2">
                                                <button type="button" id="btnAmbilFoto" class="btn-camera flex-fill" onclick="ambilFoto()">
                                                    <i class="bi bi-camera"></i> Ambil Foto
                                                </button>
                                                <button type="button" id="btnUlangFoto" class="btn-camera btn-secondary flex-fill" style="display: none;" onclick="ulangFoto()">
                                                    <i class="bi bi-arrow-repeat"></i> Ulang
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="d-flex gap-3 mt-4">
                                    <button type="button" class="btn btn-secondary flex-fill" onclick="batalPilihJenis()">Batal</button>
                                    <button type="button" class="btn btn-primary flex-fill" onclick="submitAbsen()">
                                        <i class="bi bi-check-circle"></i> Submit Absensi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Pesan Selesai -->
                    <div id="pesanSelesai" class="pesan-selesai" style="display: none;">
                        <div class="icon-selesai">✅</div>
                        <h4>Absensi Selesai</h4>
                        <p>Anda telah melakukan absensi hari ini</p>
                        <button onclick="tutupModalAbsen()" class="btn btn-primary mt-3">
                            <i class="bi bi-house-door"></i> Kembali
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk REKAP (Riwayat Semua Karyawan) -->
    <div id="rekapModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Rekap Absensi Semua Karyawan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- Filter -->
                    <div class="row g-3 mb-4 align-items-end">
                        <div class="col-md-3">
                            <label for="filterTanggal" class="form-label">Filter Tanggal:</label>
                            <input type="date" class="form-control" id="filterTanggal" onchange="filterRekap()">
                        </div>
                        <div class="col-md-3">
                            <label for="filterDivisi" class="form-label">Filter Divisi:</label>
                            <select class="form-select" id="filterDivisi" onchange="filterRekap()">
                                <option value="">Semua Divisi</option>
                                <option value="IT - sosial media">IT - SOSIAL MEDIA</option>
                                <option value="project planning, cc">PROJECT PLANNING, CC</option>
                                <option value="Purchasing">PURCHASING</option>
                                <option value="Site Enggineer">SITE ENGGINEER</option>
                                <option value="Surveyor">SURVEYOR</option>
                                <option value="Drafter">DRAFTER</option>
                                <option value="Senior SPV">SENIOR SPV</option>
                                <option value="Aas. Surveyor">ASS. SURVEYOR</option>
                                <option value="Humas">HUMAS</option>
                                <option value="SPV">SPV</option>
                                <Option value="Logistik">LOGISTIK</Option>
                                <option value="Security">SECURITY</option>
                                <option value="Finance">FINANCE</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="filterStatus" class="form-label">Filter Status:</label>
                            <select class="form-select" id="filterStatus" onchange="filterRekap()">
                                <option value="">Semua</option>
                                <option value="hadir">Hadir</option>
                                <option value="izin">Izin</option>
                                <option value="sakit">Sakit</option>
                                <option value="alpha">Alpha</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label for="filterNama" class="form-label">Cari Nama:</label>
                            <input type="text" class="form-control" id="filterNama" placeholder="Nama karyawan" onkeyup="filterRekap()">
                        </div>
                        <div class="col-md-2">
                            <button onclick="resetFilter()" class="btn btn-outline-secondary w-100">
                                <i class="bi bi-arrow-counterclockwise"></i> Reset
                            </button>
                        </div>
                    </div>

                    <!-- Info Rekap -->
                    <div class="rekap-info mb-3 p-3 bg-light rounded">
                        <div class="row">
                            <div class="col-md-2">
                                <strong>Total Data:</strong> <span id="totalData">0</span>
                            </div>
                            <div class="col-md-2">
                                <strong>Hadir:</strong> <span id="totalHadir" class="text-success">0</span>
                            </div>
                            <div class="col-md-2">
                                <strong>Izin:</strong> <span id="totalIzin" class="text-warning">0</span>
                            </div>
                            <div class="col-md-2">
                                <strong>Sakit:</strong> <span id="totalSakit" class="text-info">0</span>
                            </div>
                            <div class="col-md-2">
                                <strong>Alpha:</strong> <span id="totalAlpha" class="text-danger">0</span>
                            </div>
                            <div class="col-md-2">
                                <strong>Karyawan:</strong> <span id="totalKaryawan">0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tabel Riwayat Semua Karyawan -->
                    <div class="table-container">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Nama</th>
                                    <th>Divisi</th>
                                    <th>Tanggal</th>
                                    <th>Jam Masuk</th>
                                    <th>Jam Pulang</th>
                                    <th>Status</th>
                                    <th>Keterangan</th>
                                    <th>Lokasi Tempat</th>
                                    <th>Lokasi GPS</th>
                                    <th>Foto</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="rekapBody">
                                <tr>
                                    <td colspan="12" class="text-center py-4">Loading...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Tombol Aksi -->
                    <div class="d-flex gap-2 mt-4 flex-wrap">
                        <button onclick="exportPDF()" class="btn btn-danger">
                            <i class="bi bi-file-pdf"></i> Export PDF
                        </button>
                        <button onclick="exportCSV()" class="btn btn-success">
                            <i class="bi bi-file-earmark-spreadsheet"></i> Export CSV
                        </button>
                        <button onclick="cetakRekap()" class="btn btn-warning">
                            <i class="bi bi-printer"></i> Cetak
                        </button>
                        <button onclick="refreshRekap()" class="btn btn-primary">
                            <i class="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Preview Foto -->
    <div id="fotoModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-md">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Preview Foto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body text-center">
                    <img id="fotoPreviewModal" src="" alt="Foto" class="img-fluid rounded">
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div id="hapusModal" class="modal fade" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title">Konfirmasi Hapus</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>Apakah Anda yakin ingin menghapus data ini?</p>
                    <p class="text-muted small">Data yang dihapus tidak dapat dikembalikan.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                    <button type="button" class="btn btn-danger" id="confirmHapus">Hapus</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- html2pdf untuk export PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <!-- Custom JavaScript -->
    <script src="script.js"></script>
</body>
</html>