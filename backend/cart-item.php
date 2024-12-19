<?php

require 'db.php';
require_once 'cart.php';
require_once "message_log.php";

function eliminarItemDelCarrito($cart_item_id)
{
  global $pdo;
  try {
    $sql = "DELETE FROM cart_item WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['id' => $cart_item_id]);
    return $stmt->rowCount() > 0;
  } catch (Exception $e) {
    logError("Error al eliminar item: " . $e->getMessage());
    return false;
  }
}

function agregarItemAlCarrito($cart_id, $product_id, $quantity)
{
  global $pdo;
  try {
    $sql = "INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (:cart_id, :product_id, :quantity)
                ON DUPLICATE KEY UPDATE quantity = quantity + :quantity";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['cart_id' => $cart_id, 'product_id' => $product_id, 'quantity' => $quantity]);
    return $stmt->rowCount() > 0;
  } catch (Exception $e) {
    logError("Error al agregar item: " . $e->getMessage());
    return false;
  }
}

function obtenerItemsDelCarrito($cart_id)
{
  global $pdo;
  try {
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
    $stmt = $pdo->prepare($sql);
    $stmt->execute(params: ['cart_id' => $cart_id]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  } catch (Exception $e) {
    logError("Error obteniendo items: " . $e->getMessage());
    return [];
  }
}



session_start();

if (isset($_SESSION['user_id'])) {
  $user_id = $_SESSION['user_id'];
  $method = $_SERVER['REQUEST_METHOD'];
  header('Content-Type: application/json');

  switch ($method) {
    case 'GET':
      $carrito = obtenerCarritoPorUsuario($user_id);
      if ($carrito) {
        $items = obtenerItemsDelCarrito($carrito['id']);
        echo json_encode(['cart' => $carrito, 'items' => $items]);
      } else {
        echo json_encode(['message' => 'El usuario no tiene un carrito.']);
      }
      break;

    case 'POST':
      logDebug(message: "here " . $_POST['productId'] . " " .  $_POST['quantity']);
      if (isset($_POST['productId'], $_POST['quantity'])) {
        logDebug(message: "here " . $_POST['productId'] . " " .  $_POST['quantity']);
        $carrito = obtenerCarritoPorUsuario($user_id);
        if (!$carrito) {
          $carritoId = crearCarrito($user_id);
          if ($carritoId === 0) {
            http_response_code(500);
            echo json_encode(['error' => 'Error creando el carrito.']);
            break;
          }
        } else {
          $carritoId = $carrito['id'];
        }

        $result = agregarItemAlCarrito($carritoId, $_POST['productId'], $_POST['quantity']);
        if ($result) {
          http_response_code(201);
          echo json_encode(['message' => 'Item agregado al carrito.']);
        } else {
          http_response_code(response_code: 500);
          echo json_encode(['error' => 'Error agregando el item al carrito.']);
        }
      } else {
        http_response_code(400);
        echo json_encode(['error' => 'Datos insuficientes.']);
      }
      break;

    case 'DELETE':
      $input = getJsonInput();
      logDebug($input['id']);
      if (isset($input['id'])) {
        $carrito = obtenerCarritoPorUsuario($user_id);
        if (!$carrito) {
          http_response_code(404);
          echo json_encode(['error' => 'Carrito no encontrado.']);
          break;
        }
        $result = eliminarItemDelCarrito($input["id"]);
        if ($result) {
          http_response_code(200);
          echo json_encode(['message' => 'Item eliminado del carrito.']);
        } else {
          http_response_code(500);
          echo json_encode(['error' => 'Error eliminando el item del carrito.']);
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
