<?php
// api/laporan.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

// Ambil parameter
$tanggal = isset($_GET['tanggal']) ? $_GET['tanggal'] : null;
$bulan = isset($_GET['bulan']) ? $_GET['bulan'] : null;
$id_karyawan = isset($_GET['id_karyawan']) ? $_GET['id_karyawan'] : null;

try {
    $query = "SELECT 
                k.id_karyawan,
                k.nama_lengkap as nama,
                k.nip,
                k.jenis_karyawan,
                a.tanggal,
                a.jam_masuk,
                a.jam_pulang,
                a.foto_masuk,
                a.foto_pulang,
                a.alamat_masuk,
                a.alamat_pulang,
                a.tempat_absensi as tempat,
                a.latitude_masuk,
                a.longitude_masuk,
                a.created_at
              FROM tbl_absensi a
              JOIN tbl_karyawan k ON a.id_karyawan = k.id_karyawan
              WHERE 1=1";
    
    $params = [];
    
    if ($tanggal) {
        $query .= " AND a.tanggal = :tanggal";
        $params[':tanggal'] = $tanggal;
    }
    
    if ($bulan) {
        $query .= " AND DATE_FORMAT(a.tanggal, '%Y-%m') = :bulan";
        $params[':bulan'] = $bulan;
    }
    
    if ($id_karyawan) {
        $query .= " AND a.id_karyawan = :id_karyawan";
        $params[':id_karyawan'] = $id_karyawan;
    }
    
    $query .= " ORDER BY a.tanggal DESC, a.jam_masuk DESC";
    
    $stmt = $db->prepare($query);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format data untuk frontend
    $result = [];
    foreach ($data as $row) {
        // Tentukan alamat yang akan ditampilkan
        $alamat = $row['alamat_masuk'] ?: $row['alamat_pulang'] ?: '-';
        
        // Tentukan foto yang akan ditampilkan (prioritas foto masuk)
        $foto = $row['foto_masuk'] ?: $row['foto_pulang'];
        if ($foto) {
            // Buat URL lengkap
            $base_url = (isset($_SERVER['HTTPS']) ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'];
            $base_url .= str_replace('api/laporan.php', '', $_SERVER['SCRIPT_NAME']);
            $foto = $base_url . $foto;
        }
        
        $result[] = [
            'nama' => $row['nama'],
            'nip' => $row['nip'] ?: '-',
            'tanggal' => $row['tanggal'],
            'jamMasuk' => $row['jam_masuk'] ?? '-',
            'jamPulang' => $row['jam_pulang'] ?? '-',
            'jenisKaryawan' => $row['jenis_karyawan'],
            'tempat' => $row['tempat'] ?: '-',
            'alamat' => $alamat,
            'foto' => $foto,
            'fotoMasuk' => $row['foto_masuk'] ? $base_url . $row['foto_masuk'] : null,
            'fotoPulang' => $row['foto_pulang'] ? $base_url . $row['foto_pulang'] : null
        ];
    }
    
    echo json_encode([
        'status' => 'success',
        'data' => $result,
        'total' => count($result)
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>