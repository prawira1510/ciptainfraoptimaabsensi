<?php
// api/hapus.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load database configuration
require_once __DIR__ . '/config/database.php';

// Ambil ID dari parameter GET
$id = isset($_GET['id']) ? $_GET['id'] : (isset($_POST['id']) ? $_POST['id'] : null);

// Log untuk debugging
error_log("Hapus data dengan ID: " . $id);

if (!$id) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID tidak ditemukan'
    ]);
    exit;
}

// Validasi ID harus angka
if (!is_numeric($id)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID harus berupa angka'
    ]);
    exit;
}

try {
    // Buat koneksi database
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception("Koneksi database gagal");
    }
    
    // Cek apakah data dengan ID tersebut ada
    $checkQuery = "SELECT id_absensi, foto_masuk, foto_pulang FROM tbl_absensi WHERE id_absensi = :id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':id', $id, PDO::PARAM_INT);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() == 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Data dengan ID ' . $id . ' tidak ditemukan di database'
        ]);
        exit;
    }
    
    $data = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    // Hapus file foto jika ada (opsional, tidak wajib)
    if (!empty($data['foto_masuk'])) {
        $fotoPath = __DIR__ . '/../' . $data['foto_masuk'];
        if (file_exists($fotoPath)) {
            unlink($fotoPath);
        }
    }
    
    if (!empty($data['foto_pulang'])) {
        $fotoPath = __DIR__ . '/../' . $data['foto_pulang'];
        if (file_exists($fotoPath)) {
            unlink($fotoPath);
        }
    }
    
    // Hapus dari tabel absensi
    $query = "DELETE FROM tbl_absensi WHERE id_absensi = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil dihapus',
            'id' => $id
        ]);
    } else {
        $errorInfo = $stmt->errorInfo();
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menghapus data: ' . $errorInfo[2]
        ]);
    }
    
} catch (PDOException $e) {
    error_log("PDO Error di hapus.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("General Error di hapus.php: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>