const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

// Tạo kết nối đến MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Thay bằng username MySQL 
    password: 'root', // Thay bằng password MySQL 
    database: 'clothing_store' 
});

// Kết nối đến MySQL
db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
        return;
    }
    console.log('Kết nối MySQL thành công!');
});

// API để lấy danh sách sản phẩm
app.get('/products', (req, res) => {
    const query = 'SELECT * FROM products';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            res.status(500).json({ error: 'Lỗi server' });
            return;
        }
        res.json(results);
    });
});


app.post('/products', (req, res) => {
    const { name, description, price, stock_quantity, category } = req.body;
    const query = 'INSERT INTO products (name, description, price, stock_quantity, category) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, stock_quantity, category], (err, result) => {
        if (err) {
            console.error('Lỗi thêm sản phẩm:', err);
            res.status(500).json({ error: 'Lỗi server' });
            return;
        }
        res.status(201).json({ message: 'Sản phẩm đã được thêm!', productId: result.insertId });
    });
});

// Khởi động server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server chạy trên cổng ${PORT}`);
});