<?php
// api/absen.php
require_once 'config.php';

// Ambil data dari request
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Data tidak valid'
    ]);
    exit;
}

try {
    // Mulai transaction
    $db->beginTransaction();
    
    // Cek apakah karyawan sudah ada di database
    $query = "SELECT id_karyawan FROM tbl_karyawan WHERE nama_lengkap = :nama";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':nama', $input['nama']);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $karyawan = $stmt->fetch(PDO::FETCH_ASSOC);
        $id_karyawan = $karyawan['id_karyawan'];
        
        // Update divisi jika berbeda
        $query = "UPDATE tbl_karyawan SET divisi = :divisi WHERE id_karyawan = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':divisi', $input['divisi']);
        $stmt->bindParam(':id', $id_karyawan);
        $stmt->execute();
        
    } else {
        // Insert karyawan baru
        $query = "INSERT INTO tbl_karyawan (nama_lengkap, divisi) VALUES (:nama, :divisi)";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':nama', $input['nama']);
        $stmt->bindParam(':divisi', $input['divisi']);
        $stmt->execute();
        $id_karyawan = $db->lastInsertId();
    }
    
    // Simpan foto ke server
    $foto_path = simpanFoto($input['fotoData'], $id_karyawan, $input['jenis']);
    
    // Cek apakah sudah absen hari ini
    $query = "SELECT id_absensi, jam_masuk, jam_pulang 
              FROM tbl_absensi 
              WHERE id_karyawan = :id_karyawan AND tanggal = :tanggal";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id_karyawan', $id_karyawan);
    $stmt->bindParam(':tanggal', $input['tanggal']);
    $stmt->execute();
    
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        // Update absensi yang sudah ada
        if ($input['jenis'] == 'masuk' && empty($existing['jam_masuk'])) {
            $query = "UPDATE tbl_absensi 
                     SET jam_masuk = :jam,
                         foto_masuk = :foto,
                         latitude_masuk = :lat,
                         longitude_masuk = :lng,
                         alamat_masuk = :alamat,
                         lokasi_tempat = :lokasi,
                         status_kehadiran = :status,
                         keterangan = :keterangan
                     WHERE id_absensi = :id_absensi";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':jam', $input['waktu']);
            $stmt->bindParam(':foto', $foto_path);
            $stmt->bindParam(':lat', $input['latitude']);
            $stmt->bindParam(':lng', $input['longitude']);
            $stmt->bindParam(':alamat', $input['alamat']);
            $stmt->bindParam(':lokasi', $input['lokasiTempat']);
            $stmt->bindParam(':status', $input['status']);
            $stmt->bindParam(':keterangan', $input['keterangan']);
            $stmt->bindParam(':id_absensi', $existing['id_absensi']);
            
        } elseif ($input['jenis'] == 'pulang' && empty($existing['jam_pulang'])) {
            $query = "UPDATE tbl_absensi 
                     SET jam_pulang = :jam,
                         foto_pulang = :foto,
                         latitude_pulang = :lat,
                         longitude_pulang = :lng,
                         alamat_pulang = :alamat
                     WHERE id_absensi = :id_absensi";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':jam', $input['waktu']);
            $stmt->bindParam(':foto', $foto_path);
            $stmt->bindParam(':lat', $input['latitude']);
            $stmt->bindParam(':lng', $input['longitude']);
            $stmt->bindParam(':alamat', $input['alamat']);
            $stmt->bindParam(':id_absensi', $existing['id_absensi']);
        } else {
            $db->rollBack();
            echo json_encode([
                'status' => 'warning',
                'message' => 'Anda sudah absen ' . $input['jenis'] . ' hari ini'
            ]);
            exit;
        }
    } else {
        // Insert absensi baru
        if ($input['jenis'] == 'masuk') {
            $query = "INSERT INTO tbl_absensi 
                     (id_karyawan, tanggal, jam_masuk, foto_masuk, 
                      latitude_masuk, longitude_masuk, alamat_masuk, 
                      lokasi_tempat, status_kehadiran, keterangan) 
                     VALUES 
                     (:id_karyawan, :tanggal, :jam, :foto,
                      :lat, :lng, :alamat, :lokasi,
                      :status, :keterangan)";
        } else {
            $query = "INSERT INTO tbl_absensi 
                     (id_karyawan, tanggal, jam_pulang, foto_pulang,
                      latitude_pulang, longitude_pulang, alamat_pulang,
                      lokasi_tempat, status_kehadiran, keterangan) 
                     VALUES 
                     (:id_karyawan, :tanggal, :jam, :foto,
                      :lat, :lng, :alamat, :lokasi,
                      :status, :keterangan)";
        }
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id_karyawan', $id_karyawan);
        $stmt->bindParam(':tanggal', $input['tanggal']);
        $stmt->bindParam(':jam', $input['waktu']);
        $stmt->bindParam(':foto', $foto_path);
        $stmt->bindParam(':lat', $input['latitude']);
        $stmt->bindParam(':lng', $input['longitude']);
        $stmt->bindParam(':alamat', $input['alamat']);
        $stmt->bindParam(':lokasi', $input['lokasiTempat']);
        $stmt->bindParam(':status', $input['status']);
        $stmt->bindParam(':keterangan', $input['keterangan']);
    }
    
    if ($stmt->execute()) {
        $db->commit();
        echo json_encode([
            'status' => 'success',
            'message' => 'Absensi ' . $input['jenis'] . ' berhasil disimpan',
            'id_karyawan' => $id_karyawan
        ]);
    } else {
        $db->rollBack();
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menyimpan absensi'
        ]);
    }
    
} catch (Exception $e) {
    $db->rollBack();
    error_log("Error in absen.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function simpanFoto($foto_base64, $id_karyawan, $jenis) {
    $upload_dir = '../uploads/';
    if (!file_exists($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }
    
    $filename = 'absensi_' . $id_karyawan . '_' . $jenis . '_' . date('Ymd_His') . '.jpg';
    $filepath = $upload_dir . $filename;
    
    // Hapus prefix base64
    $foto_data = preg_replace('#^data:image/\w+;base64,#i', '', $foto_base64);
    $foto_data = base64_decode($foto_data);
    
    if (file_put_contents($filepath, $foto_data)) {
        return 'uploads/' . $filename;
    }
    
    return null;
}
?>