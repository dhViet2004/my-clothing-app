-- Tạo database
CREATE DATABASE clothing_store;
USE clothing_store;

-- Bảng users (Người dùng: client và admin)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Mật khẩu nên được mã hóa
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    role ENUM('client', 'admin') DEFAULT 'client', -- Vai trò: client hoặc admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng products (Sản phẩm)
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL, -- Giá sản phẩm
    stock_quantity INT NOT NULL DEFAULT 0, -- Số lượng tồn kho
    category ENUM('quan_jean', 'quan_ao', 'ao_khoac', 'ao_so_mi', 'ao_len') NOT NULL, -- Danh mục sản phẩm
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng orders (Đơn hàng)
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL, -- Tổng tiền đơn hàng
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending', -- Trạng thái đơn hàng
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng order_details (Chi tiết đơn hàng)
CREATE TABLE order_details (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL, -- Số lượng sản phẩm trong đơn hàng
    price DECIMAL(10, 2) NOT NULL, -- Giá tại thời điểm đặt hàng
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Bảng cart (Giỏ hàng)
CREATE TABLE cart (
    cart_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL, -- Số lượng sản phẩm trong giỏ
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Bảng payments (Thanh toán)
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Số tiền thanh toán
    payment_method ENUM('cash', 'card', 'bank_transfer') NOT NULL, -- Phương thức thanh toán
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
-- Thêm cột url vào bảng products
ALTER TABLE products
ADD COLUMN url VARCHAR(255) AFTER category; -- Thêm cột url sau cột category, giới hạn 255 ký tự

INSERT INTO products (name, description, price, stock_quantity, category)
VALUES ('Quần Jeans Xanh', 'Quần jeans nam màu xanh, size 32', 500000.00, 50, 'quan_jean');

INSERT INTO users (username, password, full_name, email, role) 
VALUES ('client1', 'password123', 'Nguyen Van A', 'client1@email.com', 'client'),
       ('admin1', 'admin123', 'Tran Thi B', 'admin1@email.com', 'admin');
       
