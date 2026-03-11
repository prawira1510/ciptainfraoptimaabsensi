<?php
// api/config/database.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

class Database {
    private $host = "localhost";
    private $db_name = "absensikaryawancio"; // Sesuaikan dengan nama database Anda
    private $username = "root";  // Sesuaikan dengan username MySQL Anda
    private $password = "";       // Sesuaikan dengan password MySQL Anda
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
            error_log("Database connection error: " . $e->getMessage());
            throw $e;
        }
    }
}
?>