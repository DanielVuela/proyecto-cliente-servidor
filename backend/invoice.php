<?php

require_once 'db.php';
require_once "message_log.php";

function checkout($cart_id, $user_id)
{
  global $pdo;

  try {
    $pdo->beginTransaction(); // se crea una transaccion

    $sql = "
      SELECT 
        ci.cart_id,
        ci.id as cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.price AS product_price,
        p.image_url AS product_image
      FROM cart_item ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = :cart_id
    ";
    $stmt = $pdo->prepare(query: $sql);
    $stmt->execute(params: ['cart_id' => $cart_id]);
    $cart_items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    logDebug("got cart items");
    if (empty($cart_items)) {
      throw new Exception("El carrito está vacío o no existe.");
    }

    $sql = "INSERT INTO invoices (user_id, total) VALUES (:user_id, :total)";
    $total = 0;

    foreach ($cart_items as $item) {
      $total += $item['product_price'] * $item['quantity'];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id, 'total' => $total]);

    $invoice_id = $pdo->lastInsertId();

    logDebug("made invoice" . $invoice_id);


    $sql = "INSERT INTO invoice_details (invoice_id, product_id, quantity, subtotal) VALUES (:invoice_id, :product_id, :quantity, :subtotal)";
    $stmt = $pdo->prepare($sql);

    foreach ($cart_items as $item) {
      $stmt->execute([
        'invoice_id' => $invoice_id,
        'product_id' => $item['product_id'],
        'quantity' => $item['quantity'],
        'subtotal' => $item['product_price'] * $item['quantity']
      ]);
    }

    $pdo->prepare("DELETE FROM cart_item WHERE cart_id = :cart_id")->execute(['cart_id' => $cart_id]);
    $pdo->prepare("DELETE FROM cart WHERE id = :cart_id")->execute(['cart_id' => $cart_id]);

    $pdo->commit();

    return [
      'status' => 'success',
      'message' => 'Checkout completado.',
      'invoice_id' => $invoice_id,
      'total' => $total
    ];
  } catch (Exception $e) {
    $pdo->rollBack(); // si sale mal se hace rollback
    logError(message: "Error en checkout: " . $e->getMessage());
    return [
      'status' => 'error',
      'message' => $e->getMessage()
    ];
  }
}

session_start();
if (isset($_SESSION['user_id'])) {
  $user_id = $_SESSION['user_id'];
  $method = $_SERVER['REQUEST_METHOD'];
  if ($method === 'POST') {
    $cart_id = $_POST['cart_id'];
    if (isset($cart_id)) {
      $result = checkout($cart_id, $user_id);
      echo json_encode($result);
    } else {
      http_response_code(400);
      echo json_encode(['error' => 'Faltan datos para procesar el checkout.']);
    }
  } else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
  }
}
