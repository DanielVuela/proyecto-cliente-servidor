<?php
session_start();
header('Content-Type: application/json');

// Verifica si la sesión está activa
if (isset($_SESSION['user_id'])) {
    echo json_encode(['sessionActive' => true]);
} else {
    echo json_encode(['sessionActive' => false]);
}
?>