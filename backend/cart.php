<?php
function crearCarrito($user_id)
{
    global $pdo;
    try {
        $sql = "INSERT INTO cart (user_id, created_at) VALUES (:user_id, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando carrito: " . $e->getMessage());
        return 0;
    }
}

function obtenerCarritoPorUsuario($user_id)
{
    global $pdo;
    try {
        $sql = "SELECT * FROM cart WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        logError("Error al obtener carrito: " . $e->getMessage());
        return null;
    }
}