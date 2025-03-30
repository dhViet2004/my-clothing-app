const express = require('express');
const mysql = require('mysql2/promise'); // Sử dụng promise-based API
const cors = require('cors');
const app = express();

// Middleware
// Thêm vào đầu file server.js
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Kết nối MySQL với pool connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'clothing_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối database
pool.getConnection()
    .then(connection => {
        console.log('Kết nối MySQL thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('Lỗi kết nối MySQL:', err);
        process.exit(1);
    });
app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        const [rows] = await pool.query(
            'SELECT * FROM products WHERE product_id = ?',
            [productId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Lỗi truy vấn chi tiết sản phẩm:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});
// API lấy danh sách sản phẩm (có phân trang và tìm kiếm)
app.get('/products', async (req, res) => {
    try {
        const { search, page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let query = 'SELECT * FROM products';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ? OR description LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), offset);

        const [products] = await pool.query(query, params);

        // Lấy tổng số sản phẩm
        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) as total FROM products'
        );

        res.json({
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } catch (err) {
        console.error('Lỗi truy vấn:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// API thêm sản phẩm
app.post('/products', async (req, res) => {
    try {
        const { name, description, price, stock_quantity, category, url } = req.body;

        // Validate
        if (!name || !price || !stock_quantity || !category) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        const validCategories = ['quan_jean', 'quan_ao', 'ao_khoac', 'ao_so_mi', 'ao_len'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: 'Danh mục không hợp lệ' });
        }

        const [result] = await pool.query(
            'INSERT INTO products SET ?',
            {
                name,
                description,
                price: parseFloat(price),
                stock_quantity: parseInt(stock_quantity),
                category,
                url: url || null
            }
        );

        res.status(201).json({
            message: 'Sản phẩm đã được thêm!',
            productId: result.insertId
        });
    } catch (err) {
        console.error('Lỗi thêm sản phẩm:', err);
        res.status(500).json({ error: 'Lỗi server khi thêm sản phẩm' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        const [result] = await pool.query(
            'DELETE FROM products WHERE product_id = ?',
            [productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json({
            message: 'Sản phẩm đã được xóa!',
            productId: parseInt(productId)
        });
    } catch (err) {
        console.error('Lỗi xóa sản phẩm:', err);
        res.status(500).json({ error: 'Lỗi server khi xóa sản phẩm' });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, description, price, stock_quantity, category } = req.body;

        // Validate
        if (!name || !price || !stock_quantity || !category) {
            return res.status(400).json({ 
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }

        const [result] = await pool.query(
            'UPDATE products SET ? WHERE product_id = ?',
            [{
                name,
                description: description || '',
                price: parseFloat(price),
                stock_quantity: parseInt(stock_quantity),
                category
            }, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Không tìm thấy sản phẩm' 
            });
        }
        const [updatedRows] = await pool.query(
            'SELECT * FROM products WHERE product_id = ?',
            [productId]
        );

        res.json({
            success: true,
            message: 'Sản phẩm đã được cập nhật!',
            data: updatedRows[0]
        });
    } catch (err) {
        console.error('Lỗi cập nhật sản phẩm:', err);
        res.status(500).json({ 
            success: false,
            error: err.message || 'Lỗi server khi cập nhật sản phẩm' 
        });
    }
});

// Khởi động server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy trên http://localhost:${PORT}`);
});