<?php
session_start();
require 'db.php';

function login($username, $password){
    try{
        global $pdo;
        error_log("Intentando login para usuario: $username");

        $sql = "SELECT * FROM users where email = :username";
        $stmt = $pdo -> prepare($sql);
        $stmt -> execute(['username' => $username]);
      
        $user = $stmt -> fetch(PDO::FETCH_ASSOC);
        error_log($user);

        if($user){
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user["id"];
                return true;
            }
          
        }else {
            error_log("Usuario no encontrado");
        }
        return false;
    }catch(Exception $e){
        logError($e -> getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if($method == 'POST'){
    echo json_encode(["message" => "login exitoso "]);

   if(isset($_POST['email']) && isset($_POST['password'])){
        $username = $_POST['email'];
        $password = $_POST['password'];
        if(login($username, $password)){
            http_response_code(200);
            echo json_encode(["message" => "login exitoso "]);
        }else{
            http_response_code(401);
            echo json_encode(["error" => "Usuario o password incorrecto"]);
        }

    }else{
        http_response_code(400);
        echo json_encode(["error" => "Email y password son requeridos"]);
    } 

}else{
    http_response_code(405);
    echo json_encode(["error"=> "Metodo not permitido"]);
}