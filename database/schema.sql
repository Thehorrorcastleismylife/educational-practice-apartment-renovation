CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(254) UNIQUE,
    user_name VARCHAR(30) NOT NULL,
    user_fullname VARCHAR(30) NOT NULL,
    user_surname VARCHAR(30) NULL,
    user_pass VARCHAR(255) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    user_role ENUM('admin','user','guest') DEFAULT 'guest'
);

CREATE TABLE remont_services (
    remont_service_id INT AUTO_INCREMENT PRIMARY KEY,
    remont_service_name TEXT UNIQUE,
    remont_service_pricePerSqm INT,
    remont_service_description TEXT NOT NULL,
    remont_service_durationDays INT NOT NULL,
    remont_service_path_media VARCHAR(100),
    remont_service_included_works TEXT,
    remont_service_category enum('general', 'finishing', 'tile')
);

CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_user_id INT NOT NULL,
    order_service_id INT NOT NULL,
    order_square INT NOT NULL,
    order_description TEXT,
    order_date DATE NOT NULL,
    order_status ENUM('new','in_progress','done','cancelled') DEFAULT 'new',
    order_address VARCHAR(255),
    order_phone VARCHAR(20),
    FOREIGN KEY (order_user_id) REFERENCES users(user_id),
    FOREIGN KEY (order_service_id) REFERENCES remont_services(remont_service_id)
);
