CREATE DATABASE Instru_ecommerce;

USE Instru_ecommerce;

-- Tabla de Categorías
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    image_url VARCHAR(255),
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de Usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL
);


-- Tabla de Carrito de Compras
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabla de Facturas
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Detalles de Factura
CREATE TABLE invoice_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
);


-- information_schema


INSERT INTO categories (name, description) VALUES
('Cuerdas', 'Instrumentos de cuerda como guitarras y violines'),
('Percusión', 'Instrumentos de percusión como tambores y cajones'),
('Viento', 'Instrumentos de viento como flautas y saxofones'),
('Teclados', 'Instrumentos de teclado como pianos y sintetizadores');


INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES
('Guitarra Acústica Yamaha F310', 'Una guitarra acústica versátil ideal para principiantes y profesionales.', 150.00, 20, 'images/guitarra_yamaha_f310.jpg', 1),
('Violín Cremona SV-175', 'Violín de calidad para músicos intermedios.', 200.00, 15, 'images/violin_cremona_sv175.jpg', 1),
('Cajón Flamenco Meinl', 'Cajón de madera de abedul para ritmos flamencos y percusiones.', 120.00, 10, 'images/cajon_meinl.jpg', 2),
('Batería Pearl Export', 'Set completo de batería acústica con platillos y hardware.', 600.00, 5, 'images/bateria_pearl_export.jpg', 2),
('Flauta Yamaha YFL-222', 'Flauta traversa para músicos principiantes y avanzados.', 250.00, 8, 'images/flauta_yamaha_yfl222.jpg', 3),
('Saxofón Alto Yamaha YAS-280', 'Saxofón alto ligero y ergonómico ideal para estudiantes.', 800.00, 4, 'images/saxofon_yamaha_yas280.jpg', 3),
('Piano Digital Yamaha P-45', 'Piano digital portátil con 88 teclas y acción de martillo.', 500.00, 6, 'images/piano_yamaha_p45.jpg', 4),
('Teclado Casio CT-X700', 'Teclado portátil con 61 teclas y múltiples funciones.', 250.00, 12, 'images/teclado_casio_ctx700.jpg', 4),
('Guitarra Eléctrica Fender Stratocaster', 'La icónica guitarra eléctrica Fender con sonido versátil.', 700.00, 7, 'images/guitarra_fender_stratocaster.jpg', 1),
('Bongo Meinl HB100', 'Bongos de madera ideal para música latina y caribeña.', 100.00, 15, 'images/bongo_meinl.jpg', 2);



INSERT INTO users (username, password, email) VALUES
('ADMIN	', 'password123', 'ADMIN@gmail.com'),
('user', 'user134', 'user@gmail.com'),


INSERT INTO cart (user_id, product_id, quantity) VALUES
(1, 1, 1),
(2, 4, 2),
(3, 7, 1),
(4, 6, 1),
(5, 9, 2);


INSERT INTO invoices (user_id, total) VALUES
(1, 150.00),
(2, 1200.00);

INSERT INTO invoice_details (invoice_id, product_id, quantity, subtotal) VALUES
(1, 1, 1, 150.00),
(2, 4, 2, 1200.00);


