<?php

require 'db.php';

function crearProducto($name, $description, $price, $stock, $image_url)
{
    global $pdo;
    try {
        $sql = "INSERT INTO products (name, description, price, stock, image_url) VALUES (:name, :description, :price, :stock, :image_url)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock' => $stock,
            'image_url' => $image_url
        ]);
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando producto: " . $e->getMessage());
        return 0;
    }
}

function editarProducto($id, $name, $description, $price, $stock, $image_url)
{
    global $pdo;
    try {
        $sql = "UPDATE products SET name = :name, description = :description, price = :price, stock = :stock, image_url = :image_url WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'name' => $name,
            'description' => $description,
            'price' => $price,
            'stock' => $stock,
            'image_url' => $image_url,
            'id' => $id
        ]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        logError("Error editando producto: " . $e->getMessage());
        return false;
    }
}

// Validar entorno (web o CLI)
if (PHP_SAPI === 'cli') {
    echo "[ERROR] Este script debe ejecutarse en un entorno web.\n";
    exit;
}

function obtenerProductos()
{
    global $pdo;
    try {
        $sql = "SELECT * FROM products";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        logError("Error al obtener productos: " . $e->getMessage());
        return [];
    }
}

function obtenerproductoById($id)
{
    global $pdo;
    try {
        $sql = "Select * from products where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        logError("Error al obtener producto: " . $e->getMessage());
        return [];
    }
}

function eliminarProducto($id)
{
    global $pdo;
    try {
        $sql = "DELETE FROM products WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        logError("Error al eliminar producto: " . $e->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');

function getJsonInput()
{
    return json_decode(file_get_contents("php://input"), true);
}
session_start();


if (isset($_SESSION['user_id'])) {
    //el usuario tiene sesion
    $user_id = $_SESSION['user_id'];
    logDebug($user_id);
switch ($method) {
    case 'GET':

    // Verificar si se envió el parámetro 'id'
    if (isset($_GET['id'])) {
        $productId = intval($_GET['id']);

        // Llamar a la función para obtener el producto por ID
        $producto = obtenerProductoById($productId);

        if ($producto) {
            http_response_code(200);
            echo json_encode($producto); // Retornar el primer producto encontrado
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Producto no encontrado"]);
        }
    } else {
        $productos = obtenerProductos();
        echo json_encode($productos);
    }
        
        break;
        

    case 'POST':
        $input = getJsonInput();
        if (isset($input['name'], $input['description'], $input['price'], $input['stock'], $input['image_url'])) {
            $id = crearProducto($input['name'], $input['description'], $input['price'], $input['stock'], $input['image_url']);
            if ($id > 0) {
                http_response_code(201);
                echo json_encode(["message" => "Producto creado: ID:" . $id]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error creando el producto"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Datos insuficientes"]);
        }
        break;

    case 'PUT':
        $input = getJsonInput();
        if (isset($input['name'], $input['description'], $input['price'], $input['stock'], $input['image_url']) && isset($_GET['id'])) {
            $editResult = editarProducto($_GET['id'], $input['name'], $input['description'], $input['price'], $input['stock'], $input['image_url']);
            if ($editResult) {
                http_response_code(200);
                echo json_encode(["message" => "Producto actualizado"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error actualizando el producto"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Datos insuficientes"]);
        }
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $deleted = eliminarProducto($_GET['id']);
            if ($deleted) {
                http_response_code(200);
                echo json_encode(["message" => "Producto eliminado"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error eliminando el producto"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Datos insuficientes"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        break;
    }

} else {
    http_response_code(401);
    echo json_encode(["error" => "Sesion no activa"]);
}


