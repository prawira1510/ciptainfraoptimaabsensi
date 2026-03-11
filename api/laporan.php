<?php
// api/laporan.php
require_once 'config.php';

// Ambil parameter filter
$tanggal = isset($_GET['tanggal']) ? $_GET['tanggal'] : null;
$divisi = isset($_GET['divisi']) ? $_GET['divisi'] : null;
$status = isset($_GET['status']) ? $_GET['status'] : null;
$nama = isset($_GET['nama']) ? $_GET['nama'] : null;

try {
    // Query untuk mengambil SEMUA DATA absensi dengan JOIN ke tabel karyawan
    $query = "SELECT 
                a.id_absensi,
                k.id_karyawan,
                k.nama_lengkap as nama,
                k.divisi,
                a.tanggal,
                a.jam_masuk,
                a.jam_pulang,
                a.foto_masuk,
                a.foto_pulang,
                a.status_kehadiran as status,
                a.keterangan,
                a.lokasi_tempat,
                a.alamat_masuk,
                a.alamat_pulang,
                a.latitude_masuk,
                a.longitude_masuk
              FROM tbl_absensi a
              INNER JOIN tbl_karyawan k ON a.id_karyawan = k.id_karyawan
              WHERE 1=1";
    
    $params = [];
    
    // Tambahkan filter jika ada
    if ($tanggal) {
        $query .= " AND a.tanggal = :tanggal";
        $params[':tanggal'] = $tanggal;
    }
    
    if ($divisi) {
        $query .= " AND k.divisi = :divisi";
        $params[':divisi'] = $divisi;
    }
    
    if ($status) {
        $query .= " AND a.status_kehadiran = :status";
        $params[':status'] = $status;
    }
    
    if ($nama) {
        $query .= " AND k.nama_lengkap LIKE :nama";
        $params[':nama'] = "%$nama%";
    }
    
    // Urutkan dari terbaru
    $query .= " ORDER BY a.tanggal DESC, a.created_at DESC";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data untuk frontend
    $result = [];
    $base_url = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
    $base_url .= str_replace('api/laporan.php', '', $_SERVER['SCRIPT_NAME']);
    
    foreach ($data as $row) {
        // Gabungkan alamat
        $alamat = $row['alamat_masuk'] ?: $row['alamat_pulang'] ?: '-';
        
        // Tentukan foto yang akan ditampilkan
        $foto = $row['foto_masuk'] ?: $row['foto_pulang'];
        $foto_url = $foto ? $base_url . $foto : null;
        
        $result[] = [
            'id' => (int)$row['id_absensi'],
            'nama' => $row['nama'],
            'divisi' => $row['divisi'] ?: '-',
            'tanggal' => $row['tanggal'],
            'jamMasuk' => $row['jam_masuk'] ?: '-',
            'jamPulang' => $row['jam_pulang'] ?: '-',
            'status' => $row['status'] ?: 'hadir',
            'keterangan' => $row['keterangan'] ?: '',
            'lokasiTempat' => $row['lokasi_tempat'] ?: '-',
            'alamat' => $alamat,
            'foto' => $foto_url,
            'latitude' => $row['latitude_masuk'],
            'longitude' => $row['longitude_masuk']
        ];
    }
    
    // Kembalikan SEMUA DATA
    echo json_encode([
        'status' => 'success',
        'data' => $result,
        'total' => count($result),
        'message' => 'Data berhasil diambil'
    ]);
    
} catch (Exception $e) {
    error_log("Error in laporan.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>