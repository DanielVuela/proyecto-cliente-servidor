<?php
require "message_log.php";

// $host = getenv('DB_HOST') !== false ? getenv('DB_HOST') : 'localhost';
// $dbname = getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'tienda';

 $host = getenv(name: 'DB_HOST') !== false ? getenv('DB_HOST') : '127.0.0.1';
 $dbname = getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'Instru_ecommerce';

$user = getenv('DB_USER') !== false ? getenv('DB_USER') : 'root';
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '1234';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, value: PDO::ERRMODE_EXCEPTION);
    logDebug("DB: Conexión Exitosa");
} catch (PDOException $e) {
    logError($e->getMessage());
    die("Error de conexión: " . $e->getMessage());
}

// CREATE USER 'tienda_user'@'%' IDENTIFIED BY 'musica';
// GRANT ALL PRIVILEGES ON Instru_ecommerce.* TO 'tienda_user'@'%';
// FLUSH PRIVILEGES;