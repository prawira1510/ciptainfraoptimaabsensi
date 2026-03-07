<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CIPTA INFRA OPTIMA - Absensi</title>
    
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
<style>
        * {
            font-family: 'Inter', sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        /* Header */
        .company-header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 40px;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        
        .company-logo {
            width: 100px;
            height: 100px;
            margin-bottom: 15px;
        }
        
        .company-logo svg {
            width: 100%;
            height: 100%;
        }
        
        .company-logo circle, .company-logo path {
            stroke: white;
        }
        
        .company-name {
            color: white;
            font-size: 2.5rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            letter-spacing: 2px;
            margin: 0;
        }
        
        /* Menu Cards */
        .menu-card {
            background: white;
            border-radius: 20px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            height: 100%;
            border: none;
        }
        
        .menu-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .menu-card.absen:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .menu-card.laporan:hover {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }
        
        .menu-icon {
            font-size: 5rem;
            margin-bottom: 20px;
            color: #333;
        }
        
        .menu-card:hover .menu-icon {
            color: white;
        }
        
        .menu-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .menu-subtitle {
            color: #666;
            font-size: 0.9rem;
        }
        
        .menu-card:hover .menu-subtitle {
            color: rgba(255,255,255,0.9);
        }
        
        /* Modal Custom */
        .modal-content {
            border-radius: 20px;
            border: none;
        }
        
        .modal-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 20px 20px 0 0;
            padding: 20px 30px;
        }
        
        .modal-header .btn-close {
            filter: brightness(0) invert(1);
        }
        
        .modal-body {
            padding: 30px;
        }
        
        /* Status Badges */
        .status-container {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .status-badge {
            background: white;
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-weight: 500;
        }
        
        .status-badge.selesai {
            background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            color: white;
        }
        
        .status-badge.belum {
            background: #f1f1f1;
            color: #999;
        }
        
        /* Info Istirahat */
        .info-istirahat {
            background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 25px;
            border-left: 5px solid #ffc107;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .info-icon {
            font-size: 2.5rem;
        }
        
        .info-text {
            flex: 1;
        }
        
        .info-text strong {
            color: #856404;
            font-size: 1.1rem;
        }
        
        .info-text p {
            color: #856404;
            margin: 5px 0 0;
        }
        
        /* Jenis Absen Buttons */
        .btn-jenis-absen {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 15px;
            border-radius: 15px;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
        }
        
        .btn-jenis-absen:hover:not(:disabled) {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        
        .btn-jenis-absen:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: #ccc;
            color: #999;
            background: #f5f5f5;
        }
        
        .btn-jenis-absen.aktif {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }
        
        .btn-subinfo {
            font-size: 0.8rem;
            background: rgba(102, 126, 234, 0.1);
            padding: 3px 8px;
            border-radius: 20px;
            color: #667eea;
        }
        
        .btn-jenis-absen:hover .btn-subinfo {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }
        
        /* Form Styles */
        .form-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        
        .form-control, .form-select {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 12px 15px;
            font-size: 1rem;
        }
        
        .form-control:focus, .form-select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }
        
        .form-control[readonly] {
            background-color: #f5f5f5;
            cursor: not-allowed;
        }
        
        /* Radio Group */
        .radio-group {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .radio-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 10px 20px;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            transition: all 0.3s;
        }
        
        .radio-label:hover {
            border-color: #667eea;
            background: #f5f5f5;
        }
        
        .radio-label input[type="radio"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        /* Lokasi Box */
        .lokasi-box {
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 15px;
            min-height: 100px;
        }
        
        .loading {
            color: #666;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }
        
        .alamat {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
            font-size: 1.1rem;
        }
        
        .koordinat {
            color: #666;
            font-size: 0.9rem;
            font-family: monospace;
        }
        
        /* Camera */
        .camera-container {
            background: #333;
            border-radius: 15px;
            overflow: hidden;
            position: relative;
        }
        
        .camera-preview {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .foto-preview img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 10px;
        }
        
        .btn-camera {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s;
        }
        
        .btn-camera:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }
        
        .btn-camera.btn-secondary {
            background: #6c757d;
        }
        
        /* Table */
        .table-container {
            background: white;
            border-radius: 15px;
            overflow: auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .table {
            margin-bottom: 0;
        }
        
        .table thead th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            border: none;
            white-space: nowrap;
            padding: 15px;
        }
        
        .table tbody td {
            padding: 15px;
            vertical-align: middle;
        }
        
        .foto-thumbnail {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .foto-thumbnail:hover {
            transform: scale(1.1);
        }
        
        .status-badge-table {
            padding: 5px 12px;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
        }
        
        .status-lengkap {
            background: #84fab0;
            color: #1e7e34;
        }
        
        .status-belum {
            background: #ffd5d5;
            color: #c62828;
        }
        
        /* Reset Zone */
        .reset-zone {
            margin-top: 30px;
            padding: 25px;
            background: #fff3cd;
            border: 2px dashed #ffc107;
            border-radius: 15px;
        }
        
        .reset-zone h3 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        .reset-info {
            color: #856404;
            margin-bottom: 20px;
        }
        
        .reset-warning {
            color: #856404;
            font-style: italic;
            display: block;
            margin-top: 15px;
        }
        
        /* Pesan Selesai */
        .pesan-selesai {
            text-align: center;
            padding: 30px;
        }
        
        .icon-selesai {
            font-size: 5rem;
            margin-bottom: 20px;
            animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .company-name {
                font-size: 1.8rem;
            }
            
            .menu-icon {
                font-size: 4rem;
            }
            
            .menu-title {
                font-size: 1.5rem;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .radio-group {
                flex-direction: column;
            }
            
            .radio-label {
                width: 100%;
            }
            
            .status-badge {
                width: 100%;
            }
            
            .table {
                font-size: 0.9rem;
            }
            
            .table thead th {
                padding: 10px;
            }
            
            .table tbody td {
                padding: 10px;
            }
        }
        
        /* Loading Spinner */
        .spinner-custom {
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            display: inline-block;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
</head>
<body>
    <div class="container">
        <!-- Header dengan Logo -->
        <div class="company-header">
            <div class="company-logo mx-auto">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="white" stroke-width="5"/>
                    <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="8" stroke-linecap="round"/>
                </svg>
            </div>
            <h1 class="company-name">CIPTA INFRA OPTIMA</h1>
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
                <!-- Card LAPORAN -->
                <div class="menu-card laporan" onclick="handleLaporan()">
                    <div class="menu-icon">
                        <i class="bi bi-file-text"></i>
                    </div>
                    <h2 class="menu-title">LAPORAN</h2>
                    <p class="menu-subtitle">Lihat riwayat absensi</p>
                </div>
            </div>
        </div>

        <!-- Modal untuk ABSEN -->
        <div id="absenModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Form Absensi</h5>
                        <button type="button" class="btn-close" onclick="closeModal('absenModal')"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Status Absensi Hari Ini -->
                        <div id="statusAbsen" class="status-container">
                            <!-- Akan diisi oleh JavaScript -->
                        </div>

                        <!-- Informasi Jam Istirahat -->
                        <div id="infoJamIstirahat" class="info-istirahat" style="display: none;">
                            <div class="info-icon">🍽️</div>
                            <div class="info-text">
                                <strong>Jam Istirahat: 12:00 - 13:00 WIB</strong>
                                <p>Silakan absen jam istirahat pada rentang waktu tersebut</p>
                            </div>
                        </div>

                        <!-- Pilihan Jenis Absen -->
                        <div id="jenisAbsenContainer" class="row g-3 mb-4">
                            <div class="col-md-4">
                                <button id="btnJamMasuk" class="btn-jenis-absen" onclick="pilihJamMasuk()">
                                    <i class="bi bi-clock"></i> Jam Masuk
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button id="btnJamIstirahat" class="btn-jenis-absen" onclick="pilihJamIstirahat()">
                                    <i class="bi bi-cup-hot"></i> Jam Istirahat
                                    <span class="btn-subinfo">(12:00-13:00)</span>
                                </button>
                            </div>
                            <div class="col-md-4">
                                <button id="btnJamPulang" class="btn-jenis-absen" onclick="pilihJamPulang()">
                                    <i class="bi bi-house-door"></i> Jam Pulang
                                </button>
                            </div>
                        </div>

                        <!-- Form Absensi (muncul setelah pilih jenis) -->
                        <div id="formAbsenContainer" style="display: none;">
                            <form id="absenForm" onsubmit="submitAbsen(event)">
                                <input type="hidden" id="jenisAbsen" name="jenisAbsen">
                                <input type="hidden" id="fotoData" name="fotoData">
                                <input type="hidden" id="latitude" name="latitude">
                                <input type="hidden" id="longitude" name="longitude">
                                
                                <div class="row g-4">
                                    <div class="col-lg-6">
                                        <!-- Data Diri -->
                                        <div class="mb-3">
                                            <label for="nama" class="form-label">Nama Lengkap:</label>
                                            <input type="text" class="form-control" id="nama" name="nama" required placeholder="Masukkan nama Anda">
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="waktu" class="form-label" id="labelWaktu">Waktu:</label>
                                            <input type="time" class="form-control" id="waktu" name="waktu" required readonly>
                                            <small id="waktuInfo" class="text-muted"></small>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="tanggal" class="form-label">Tanggal:</label>
                                            <input type="date" class="form-control" id="tanggal" name="tanggal" required readonly>
                                        </div>
                                        
                                        <!-- Pilihan Karyawan -->
                                        <div class="mb-3">
                                            <label class="form-label">Jenis Karyawan:</label>
                                            <div class="radio-group">
                                                <label class="radio-label">
                                                    <input type="radio" name="jenisKaryawan" value="kantor" checked onchange="ubahJenisKaryawan()"> 
                                                    <span>Karyawan Kantor</span>
                                                </label>
                                                <label class="radio-label">
                                                    <input type="radio" name="jenisKaryawan" value="lapangan" onchange="ubahJenisKaryawan()"> 
                                                    <span>Karyawan Lapangan</span>
                                                </label>
                                            </div>
                                        </div>
                                        
                                        <!-- Tempat (dinamis) -->
                                        <div class="mb-3" id="tempatKantorGroup">
                                            <label for="tempatKantor" class="form-label">Tempat (Rubrik):</label>
                                            <input type="text" class="form-control" id="tempatKantor" name="tempatKantor" value="Rubrik" placeholder="Nama Rubrik">
                                        </div>
                                        
                                        <div class="mb-3" id="tempatLapanganGroup" style="display: none;">
                                            <label for="tempatLapangan" class="form-label">Nama Proyek:</label>
                                            <input type="text" class="form-control" id="tempatLapangan" name="tempatLapangan" placeholder="Masukkan nama proyek">
                                        </div>
                                    </div>
                                    
                                    <div class="col-lg-6">
                                        <!-- Lokasi -->
                                        <div class="mb-3">
                                            <label class="form-label">Lokasi Anda:</label>
                                            <div id="lokasiContainer" class="lokasi-box">
                                                <div id="loadingLokasi" class="loading">Mendeteksi lokasi...</div>
                                                <div id="alamatLengkap" class="alamat"></div>
                                                <div id="koordinat" class="koordinat"></div>
                                            </div>
                                        </div>
                                        
                                        <!-- Kamera -->
                                        <div class="mb-3">
                                            <label class="form-label">Foto Diri:</label>
                                            <div class="camera-container mb-2">
                                                <video id="video" class="camera-preview" autoplay playsinline></video>
                                                <canvas id="canvas" class="d-none"></canvas>
                                                <div id="fotoPreview" class="foto-preview text-center p-2" style="display: none;">
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
                                    <button type="submit" class="btn btn-primary flex-fill" id="btnSubmit">
                                        <i class="bi bi-check-circle"></i> Submit Absensi
                                    </button>
                                </div>
                            </form>
                        </div>

                        <!-- Pesan jika sudah absen semua -->
                        <div id="pesanSelesai" class="pesan-selesai" style="display: none;">
                            <div class="icon-selesai">✅</div>
                            <h3>Selamat! Anda sudah menyelesaikan absensi hari ini</h3>
                            <p class="text-muted">Anda telah melakukan absensi Jam Masuk, Jam Istirahat, dan Jam Pulang</p>
                            <button onclick="closeModal('absenModal')" class="btn btn-primary btn-lg mt-3">
                                <i class="bi bi-house-door"></i> Kembali ke Halaman Utama
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal untuk LAPORAN -->
        <div id="laporanModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-xl modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Riwayat Absensi</h5>
                        <button type="button" class="btn-close" onclick="closeModal('laporanModal')"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Filter Tanggal -->
                        <div class="row g-3 mb-4 align-items-end">
                            <div class="col-md-4">
                                <label for="filterTanggal" class="form-label">Pilih Tanggal:</label>
                                <input type="date" class="form-control" id="filterTanggal" onchange="filterLaporan()">
                            </div>
                            <div class="col-md-2">
                                <button onclick="resetFilter()" class="btn btn-outline-secondary w-100">
                                    <i class="bi bi-arrow-counterclockwise"></i> Reset
                                </button>
                            </div>
                        </div>

                        <div class="table-container">
                            <table class="table table-hover">
                                <thead>
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
                                        <th>Status</th>
                                        <th>Foto</th>
                                    </tr>
                                </thead>
                                <tbody id="laporanBody">
                                    <!-- Data akan diisi oleh JavaScript -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- TOMBOL RESET UNTUK UJI COBA -->
                        <div class="reset-zone mt-4">
                            <h3><i class="bi bi-tools"></i> Area Uji Coba</h3>
                            <p class="reset-info">Gunakan tombol di bawah untuk mereset data absensi agar bisa mencoba fitur dari awal</p>
                            
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <button onclick="resetDataHariIni()" class="btn btn-info text-white w-100">
                                        <i class="bi bi-arrow-repeat"></i> Reset Data Hari Ini
                                    </button>
                                </div>
                                <div class="col-md-4">
                                    <button onclick="resetSemuaData()" class="btn btn-danger w-100">
                                        <i class="bi bi-exclamation-triangle"></i> Reset SEMUA Data
                                    </button>
                                </div>
                                <div class="col-md-4">
                                    <button onclick="resetStatusUjiCoba()" class="btn btn-success w-100">
                                        <i class="bi bi-flask"></i> Mode Uji Coba
                                    </button>
                                </div>
                            </div>
                            
                            <small class="reset-warning">* Data yang direset tidak bisa dikembalikan</small>
                        </div>
                        
                        <div class="d-flex gap-2 mt-4">
                            <button onclick="refreshLaporan()" class="btn btn-primary">
                                <i class="bi bi-arrow-clockwise"></i> Refresh Data
                            </button>
                            <button onclick="eksporCSV()" class="btn btn-success">
                                <i class="bi bi-file-earmark-spreadsheet"></i> Ekspor CSV
                            </button>
                            <button onclick="eksporJSON()" class="btn btn-warning">
                                <i class="bi bi-file-earmark-code"></i> Ekspor JSON
                            </button>
                            <button onclick="cetakLaporan()" class="btn btn-secondary">
                                <i class="bi bi-printer"></i> Cetak
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal untuk Preview Foto -->
        <div id="fotoModal" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-md">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Preview Foto</h5>
                        <button type="button" class="btn-close" onclick="closeModal('fotoModal')"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img id="fotoPreviewModal" src="" alt="Foto" class="img-fluid rounded">
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
</body>
</html>