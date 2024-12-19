<?php

require_once 'db.php';
require_once "message_log.php";

function obtenerHistorialDeCompras($user_id)
{
    global $pdo;
    try {
        $sql = "
      SELECT 
        i.id as invoice_id,
        i.total,
        id.id as invoice_detail_id,
        id.product_id,
        id.quantity,
        id.subtotal,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.image_url as product_image
      FROM invoices i
      JOIN invoice_details id ON i.id = id.invoice_id
      JOIN products p ON id.product_id = p.id
      WHERE i.user_id = :user_id
      ORDER BY i.created_at DESC
    ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        $orders = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $orders[$row['invoice_id']]['total'] = $row['total'];
            $orders[$row['invoice_id']]['items'][] = $row;
        }
        return $orders;
    } catch (Exception $e) {
        logError("Error obteniendo historial de compras: " . $e->getMessage());
        return [];
    }
}

function eliminarItemDelHistorial($invoice_detail_id)
{
    global $pdo;
    try {
        $sql = "DELETE FROM invoice_details WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $invoice_detail_id]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        logError("Error al eliminar item del historial: " . $e->getMessage());
        return false;
    }
}

session_start();

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    switch ($method) {
        case 'GET':
            $historial = obtenerHistorialDeCompras($user_id);
            echo json_encode(array_values($historial));
            break;

        case 'DELETE':
            $input = json_decode(file_get_contents("php://input"), true);
            if (isset($input['id'])) {
                $result = eliminarItemDelHistorial($input['id']);
                if ($result) {
                    http_response_code(200);
                    echo json_encode(['message' => 'Item eliminado del historial.']);
                } else {
                    http_response_code(500);
                    echo json_encode(['error' => 'Error eliminando el item del historial.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Datos insuficientes para eliminar el item.']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido.']);
            break;
    }
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Sesión no activa.']);
}