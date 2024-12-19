<?php
require 'db.php';

try {
    $stmt = $pdo->query("SELECT 1");
    if ($stmt) {
        echo "Conexión exitosa a la base de datos.";
    }
} catch (Exception $e) {
    echo "Error al conectar a la base de datos: " . $e->getMessage();
}