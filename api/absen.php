<?php
// api/absen.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

// Buat folder uploads jika belum ada
$upload_dir = __DIR__ . '/../uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Ambil data dari request
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Data tidak valid'
    ]);
    exit;
}

try {
    // Cari atau buat karyawan baru berdasarkan nama
    $query_karyawan = "SELECT id_karyawan FROM tbl_karyawan WHERE nama_lengkap = :nama";
    $stmt_karyawan = $db->prepare($query_karyawan);
    $stmt_karyawan->bindParam(':nama', $input['nama']);
    $stmt_karyawan->execute();
    
    if ($stmt_karyawan->rowCount() == 0) {
        // Insert karyawan baru
        $query_insert_karyawan = "INSERT INTO tbl_karyawan (nama_lengkap, jenis_karyawan) VALUES (:nama, :jenis)";
        $stmt_insert = $db->prepare($query_insert_karyawan);
        $stmt_insert->bindParam(':nama', $input['nama']);
        $stmt_insert->bindParam(':jenis', $input['jenisKaryawan']);
        $stmt_insert->execute();
        
        $id_karyawan = $db->lastInsertId();
    } else {
        $karyawan = $stmt_karyawan->fetch(PDO::FETCH_ASSOC);
        $id_karyawan = $karyawan['id_karyawan'];
    }
    
    // Cek apakah sudah absen hari ini
    $query_cek = "SELECT id_absensi, jam_masuk, jam_pulang 
                  FROM tbl_absensi 
                  WHERE id_karyawan = :id_karyawan AND tanggal = :tanggal";
    $stmt_cek = $db->prepare($query_cek);
    $stmt_cek->bindParam(':id_karyawan', $id_karyawan);
    $stmt_cek->bindParam(':tanggal', $input['tanggal']);
    $stmt_cek->execute();
    
    $existing = $stmt_cek->fetch(PDO::FETCH_ASSOC);
    
    // Simpan foto
    $foto_path = simpanFoto($input['fotoData'], $id_karyawan, $input['jenis']);
    
    if ($existing) {
        // Update absensi yang sudah ada
        if ($input['jenis'] == 'masuk' && empty($existing['jam_masuk'])) {
            $query_update = "UPDATE tbl_absensi 
                            SET jam_masuk = :jam,
                                foto_masuk = :foto,
                                latitude_masuk = :lat,
                                longitude_masuk = :lng,
                                alamat_masuk = :alamat,
                                tempat_absensi = :tempat
                            WHERE id_absensi = :id_absensi";
            
            $stmt = $db->prepare($query_update);
            $stmt->bindParam(':jam', $input['waktu']);
            $stmt->bindParam(':foto', $foto_path);
            $stmt->bindParam(':lat', $input['latitude']);
            $stmt->bindParam(':lng', $input['longitude']);
            $stmt->bindParam(':alamat', $input['alamat']);
            $stmt->bindParam(':tempat', $input['tempat']);
            $stmt->bindParam(':id_absensi', $existing['id_absensi']);
            
        } elseif ($input['jenis'] == 'pulang' && empty($existing['jam_pulang'])) {
            $query_update = "UPDATE tbl_absensi 
                            SET jam_pulang = :jam,
                                foto_pulang = :foto,
                                latitude_pulang = :lat,
                                longitude_pulang = :lng,
                                alamat_pulang = :alamat
                            WHERE id_absensi = :id_absensi";
            
            $stmt = $db->prepare($query_update);
            $stmt->bindParam(':jam', $input['waktu']);
            $stmt->bindParam(':foto', $foto_path);
            $stmt->bindParam(':lat', $input['latitude']);
            $stmt->bindParam(':lng', $input['longitude']);
            $stmt->bindParam(':alamat', $input['alamat']);
            $stmt->bindParam(':id_absensi', $existing['id_absensi']);
        } else {
            echo json_encode([
                'status' => 'warning',
                'message' => 'Anda sudah absen ' . $input['jenis'] . ' hari ini'
            ]);
            exit;
        }
    } else {
        // Insert absensi baru
        if ($input['jenis'] == 'masuk') {
            $query_insert = "INSERT INTO tbl_absensi 
                            (id_karyawan, tanggal, jam_masuk, foto_masuk, 
                             latitude_masuk, longitude_masuk, alamat_masuk, tempat_absensi) 
                            VALUES 
                            (:id_karyawan, :tanggal, :jam, :foto, 
                             :lat, :lng, :alamat, :tempat)";
        } else {
            $query_insert = "INSERT INTO tbl_absensi 
                            (id_karyawan, tanggal, jam_pulang, foto_pulang, 
                             latitude_pulang, longitude_pulang, alamat_pulang, tempat_absensi) 
                            VALUES 
                            (:id_karyawan, :tanggal, :jam, :foto, 
                             :lat, :lng, :alamat, :tempat)";
        }
        
        $stmt = $db->prepare($query_insert);
        $stmt->bindParam(':id_karyawan', $id_karyawan);
        $stmt->bindParam(':tanggal', $input['tanggal']);
        $stmt->bindParam(':jam', $input['waktu']);
        $stmt->bindParam(':foto', $foto_path);
        $stmt->bindParam(':lat', $input['latitude']);
        $stmt->bindParam(':lng', $input['longitude']);
        $stmt->bindParam(':alamat', $input['alamat']);
        $stmt->bindParam(':tempat', $input['tempat']);
    }
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Absensi ' . $input['jenis'] . ' berhasil disimpan',
            'data' => [
                'id_karyawan' => $id_karyawan,
                'foto' => $foto_path
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menyimpan absensi'
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

// Fungsi simpan foto
function simpanFoto($foto_base64, $id_karyawan, $jenis) {
    global $upload_dir;
    
    // Generate nama file unik
    $filename = 'absensi_' . $id_karyawan . '_' . $jenis . '_' . date('Ymd_His') . '.jpg';
    $filepath = $upload_dir . $filename;
    
    // Hapus prefix base64
    $foto_data = preg_replace('#^data:image/\w+;base64,#i', '', $foto_base64);
    $foto_data = base64_decode($foto_data);
    
    // Simpan file
    if (file_put_contents($filepath, $foto_data)) {
        return 'uploads/' . $filename;
    } else {
        return null;
    }
}
?>