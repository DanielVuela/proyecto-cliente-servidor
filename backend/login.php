<?php
session_start();
require 'db.php';

function login($username, $password){
    try {
        global $pdo;
        error_log("Intentando login para usuario: $username");

        $sql = "SELECT * FROM users WHERE email = :username";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['username' => $username]);
      
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if (password_verify($password, $user['password'])) {
                session_regenerate_id(true); // seguridad adicional
                $_SESSION['user_id'] = $user["id"];
                return true;
            }
            error_log("Contraseña incorrecta");
        } else {
            error_log("Usuario no encontrado");
        }
        return false;
    } catch (Exception $e) {
        error_log("Error en el login: " . $e->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'POST') {
    if (isset($_POST['email']) && isset($_POST['password'])) {
        $username = $_POST['email'];
        $password = $_POST['password'];
        if (login($username, $password)) {
            http_response_code(200);
            echo json_encode(["message" => "Login exitoso"]);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Email o contraseña incorrectos"]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["error" => "Email y password son requeridos"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método no permitido"]);
}
?>
