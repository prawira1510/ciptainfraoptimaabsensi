<?php
// api/config/database.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

class Database {
    private $host = "localhost";
    private $db_name = "db_absensi_cio";
    private $username = "root";      // Ganti dengan username MySQL Anda (default XAMPP: root)
    private $password = "";          // Ganti dengan password MySQL Anda (default XAMPP: kosong)
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
            
            return $this->conn;
            
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Koneksi database gagal: ' . $e->getMessage()
            ]);
            exit;
        }
    }
}

// Buat instance database untuk digunakan di file lain
$database = new Database();
$db = $database->getConnection();
?>