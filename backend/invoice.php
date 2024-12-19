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
      $pdo->prepare("UPDATE products SET stock = stock - :quantity WHERE id = :product_id")->execute(['product_id' => $item["product_id"], 'quantity' => $item["quantity"]]);
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

function obtenerFacturasConDetalles(int $userId)
{
  global $pdo;
  $sql = "
      SELECT 
          invoices.id AS invoice_id,
          invoices.total,
          invoices.created_at AS invoice_created_at,
          invoices.updated_at AS invoice_updated_at,
          invoice_details.quantity,
          invoice_details.subtotal,
          invoice_details.created_at AS detail_created_at,
          products.name,
          products.description,
          products.image_url,
          products.category_id
      FROM invoices
      INNER JOIN invoice_details ON invoices.id = invoice_details.invoice_id
      INNER JOIN products ON invoice_details.product_id = products.id
      WHERE invoices.user_id = :user_id
      ORDER BY invoices.created_at DESC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute(['user_id' => $userId]);
  $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $invoices = [];

  foreach ($results as $row) {
    $invoiceId = $row['invoice_id'];

    if (!isset($invoices[$invoiceId])) {
      $invoices[$invoiceId] = [
        'invoice_id' => $invoiceId,
        'total' => $row['total'],
        'created_at' => $row['invoice_created_at'],
        'updated_at' => $row['invoice_updated_at'],
        'items' => []
      ];
    }

    $invoices[$invoiceId]['items'][] = [
      'quantity' => $row['quantity'],
      'subtotal' => $row['subtotal'],
      'detail_created_at' => $row['detail_created_at'],
      'name' => $row['name'],
      'description' => $row['description'],
      'image_url' => $row['image_url'],
      'category_id' => $row['category_id']
    ];
  }

  return array_values($invoices);
}


session_start();
$method = $_SERVER['REQUEST_METHOD'];
if (isset($_SESSION['user_id'])) {
  switch ($method) {
    case 'GET':
      $historial = obtenerFacturasConDetalles($_SESSION['user_id']);
      echo json_encode($historial);
      break;
    case 'POST':
      $cart_id = $_POST['cart_id'];
      if (isset($cart_id)) {
        $result = checkout($cart_id, $user_id);
        echo json_encode($result);
      } else {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan datos para procesar el checkout.']);
      }
      break;
    default:
      http_response_code(405);
      echo json_encode(['error' => 'Método no permitido.']);
      break;
  }
}
