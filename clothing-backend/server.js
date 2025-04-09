import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Kết nối MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'clothing_store',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware xác thực JWT
const authenticateJWT = (requiredRole) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Không có token xác thực' });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Kiểm tra user có tồn tại trong DB không
            const [users] = await pool.query(
                'SELECT * FROM users WHERE user_id = ?',
                [decoded.userId]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: 'Người dùng không tồn tại' });
            }

            const user = users[0];

            // Kiểm tra role nếu cần
            if (requiredRole && user.role !== requiredRole) {
                return res.status(403).json({ error: 'Không có quyền truy cập' });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error('Lỗi xác thực JWT:', err);
            res.status(401).json({ error: 'Token không hợp lệ' });
        }
    };
};

// ================== API ĐĂNG KÝ ==================
app.post('/register', async (req, res) => {
    try {
        const { username, password, full_name, email, phone, address } = req.body;

        // Validate
        if (!username || !password || !full_name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Kiểm tra username/email đã tồn tại
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Username hoặc email đã tồn tại'
            });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới
        const [result] = await pool.query(
            'INSERT INTO users SET ?',
            {
                username,
                password: hashedPassword,
                full_name,
                email,
                phone: phone || null,
                address: address || null,
                role: 'client'
            }
        );

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            userId: result.insertId
        });
    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi đăng ký'
        });
    }
});

// ================== API ĐĂNG NHẬP ==================
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng nhập username và password'
            });
        }

        // Tìm user trong database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Username hoặc mật khẩu không đúng'
            });
        }

        const user = users[0];

        // So sánh mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Username hoặc mật khẩu không đúng'
            });
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        // Trả về thông tin user (loại bỏ password)
        const userResponse = {
            userId: user.user_id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
        };

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            token,
            user: userResponse
        });
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi đăng nhập'
        });
    }
});

// ================== API LẤY THÔNG TIN USER ==================
app.get('/profile', authenticateJWT(), async (req, res) => {
    try {
        // User đã được xác thực bởi middleware
        const user = req.user;

        // Trả về thông tin user (loại bỏ password)
        const userResponse = {
            userId: user.user_id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
        };

        res.json({
            success: true,
            user: userResponse
        });
    } catch (err) {
        console.error('Lỗi lấy thông tin user:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi lấy thông tin user'
        });
    }
});

// ================== BẢO VỆ CÁC API VỚI PHÂN QUYỀN ==================

// API chỉ admin mới được truy cập
app.get('/admin/dashboard', authenticateJWT('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Chào mừng admin!'
    });
});

// API quản lý sản phẩm (chỉ admin)
app.post('/products', authenticateJWT('admin'), async (req, res) => {
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

app.put('/products/:id', authenticateJWT('admin'), async (req, res) => {
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
app.delete('/products/:id', authenticateJWT('admin'), async (req, res) => {
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

// API giỏ hàng (chỉ client)
app.get('/cart', authenticateJWT('client'), async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [cartItems] = await pool.query(`
            SELECT c.*, p.name, p.price, p.url 
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            WHERE c.user_id = ?
        `, [userId]);

        res.json({
            success: true,
            cart: cartItems
        });
    } catch (err) {
        console.error('Lỗi lấy giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi lấy giỏ hàng'
        });
    }
});

// API xem sản phẩm (ai cũng xem được)
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
// API THỐNG KÊ DOANH THU (TURNOVER)
app.get('/turnover', authenticateJWT('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') AS month,
          SUM(o.total_amount) AS amount,
          (
            SUM(o.total_amount) - LAG(SUM(o.total_amount), 1) OVER (ORDER BY DATE_FORMAT(o.order_date, '%Y-%m'))
          ) / LAG(SUM(o.total_amount), 1) OVER (ORDER BY DATE_FORMAT(o.order_date, '%Y-%m')) * 100 AS \`change\`
        FROM orders o
        JOIN payments p ON o.order_id = p.order_id
        WHERE o.status = 'delivered' AND p.payment_status = 'completed'
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `);
  
      res.json(rows);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu turnover:', err);
      res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu turnover' });
    }
  });
  
  // API THỐNG KÊ LỢI NHUẬN (PROFIT)
  app.get('/profit', authenticateJWT('admin'), async (req, res) => {
    try {
      const PROFIT_MARGIN = 20; // Giả định tỷ lệ lợi nhuận 20%
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(o.order_date, '%Y-%m') AS month,
          SUM(o.total_amount * ${PROFIT_MARGIN} / 100) AS amount,
          ${PROFIT_MARGIN} AS margin
        FROM orders o
        JOIN payments p ON o.order_id = p.order_id
        WHERE o.status = 'delivered' AND p.payment_status = 'completed'
        GROUP BY DATE_FORMAT(o.order_date, '%Y-%m')
        ORDER BY month DESC
        LIMIT 12
      `);
  
      res.json(rows);
    } catch (err) {
      console.error('Lỗi lấy dữ liệu profit:', err);
      res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu profit' });
    }
  });
  
  // API THỐNG KÊ KHÁCH HÀNG (CUSTOMERS)
  app.get('/customers', authenticateJWT('admin'), async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.user_id,
          u.username,
          u.full_name,
          u.email,
          u.created_at,
          CASE 
            WHEN DATEDIFF(NOW(), u.created_at) <= 30 THEN 'New'
            ELSE 'Existing'
          END AS status
        FROM users u
        WHERE u.role = 'client'
        ORDER BY u.created_at DESC
      `);
  
      res.json({
        success: true,
        customers: rows
      });
    } catch (err) {
      console.error('Lỗi lấy dữ liệu khách hàng:', err);
      res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu khách hàng' });
    }
  });
  

// Khởi động server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy trên http://localhost:${PORT}`);
});