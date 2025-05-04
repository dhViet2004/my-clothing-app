import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
const app = express();

// Initialize Google OAuth client
const googleClient = new OAuth2Client("175627284623-pl3oarbc99djsl3erhs5a11kfn8tk2qs.apps.googleusercontent.com");

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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

        // Log toàn bộ request body để debug
        console.log('Request body:', req.body);

        // Validate
        if (!name || !price || !stock_quantity || !category) {
            console.log('Missing required fields:', { name, price, stock_quantity, category });
            return res.status(400).json({ 
                error: 'Vui lòng điền đầy đủ thông tin',
                details: {
                    name: !name,
                    price: !price,
                    stock_quantity: !stock_quantity,
                    category: !category
                }
            });
        }

        // Validate category
        const validCategories = ['dam_vay', 'quan_jean', 'quan_au', 'ao_so_mi', 'ao_khoac', 'ao_len', 'chan_vay', 'quan_short', 'ao_phong'];
        
        if (!validCategories.includes(category)) {
            console.log('Invalid category:', category);
            console.log('Valid categories:', validCategories);
            return res.status(400).json({ 
                error: 'Danh mục không hợp lệ',
                received: category,
                valid: validCategories
            });
        }

        // Validate price and stock_quantity
        if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            return res.status(400).json({ error: 'Giá sản phẩm không hợp lệ' });
        }

        if (isNaN(parseInt(stock_quantity)) || parseInt(stock_quantity) < 0) {
            return res.status(400).json({ error: 'Số lượng sản phẩm không hợp lệ' });
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
        res.status(500).json({ 
            error: 'Lỗi server khi thêm sản phẩm',
            details: err.message
        });
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
        console.log('Attempting to delete product:', productId);

        // Check if product exists
        const [product] = await pool.query(
            'SELECT * FROM products WHERE product_id = ?',
            [productId]
        );

        if (product.length === 0) {
            console.log('Product not found:', productId);
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        // Check if product is referenced in order_details
        const [orderDetails] = await pool.query(
            'SELECT * FROM order_details WHERE product_id = ?',
            [productId]
        );

        if (orderDetails.length > 0) {
            console.log('Product is referenced in orders:', productId);
            return res.status(400).json({ 
                error: 'Không thể xóa sản phẩm vì đã có đơn hàng liên quan',
                details: 'Sản phẩm này đã được sử dụng trong các đơn hàng'
            });
        }

        // Delete the product
        const [result] = await pool.query(
            'DELETE FROM products WHERE product_id = ?',
            [productId]
        );

        console.log('Delete result:', result);

        if (result.affectedRows === 0) {
            console.log('No rows affected when deleting product:', productId);
            return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        }

        res.status(200).json({
            message: 'Sản phẩm đã được xóa!',
            productId: parseInt(productId)
        });
    } catch (err) {
        console.error('Detailed error in delete product:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            sqlMessage: err.sqlMessage
        });
        res.status(500).json({ 
            error: 'Lỗi server khi xóa sản phẩm',
            details: err.message
        });
    }
});

// API giỏ hàng
app.get('/cart', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        let userId = null;

        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                userId = decoded.userId;
            } catch (err) {
                console.log('Invalid token, proceeding as guest');
            }
        }

        if (userId) {
            // Get cart for authenticated user
            const [cartItems] = await pool.query(`
                SELECT c.*, p.name, p.price, p.url 
                FROM cart c
                JOIN products p ON c.product_id = p.product_id
                WHERE c.user_id = ?
            `, [userId]);

            res.json({
                success: true,
                items: cartItems
            });
        } else {
            // Return empty cart for guest
            res.json({
                success: true,
                items: []
            });
        }
    } catch (err) {
        console.error('Lỗi lấy giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi lấy giỏ hàng'
        });
    }
});

// API xóa toàn bộ giỏ hàng
app.delete('/cart/clear', authenticateJWT('client'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log('Clearing cart for user:', userId);

        const [result] = await pool.query(
            'DELETE FROM cart WHERE user_id = ?',
            [userId]
        );

        console.log('Cart cleared, deleted rows:', result.affectedRows);

        res.json({
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng',
            deletedCount: result.affectedRows
        });
    } catch (err) {
        console.error('Lỗi xóa giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi xóa giỏ hàng'
        });
    }
});

// API lưu giỏ hàng
app.post('/cart', authenticateJWT('client'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                error: 'Dữ liệu giỏ hàng không hợp lệ'
            });
        }

        // Bắt đầu transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Xóa giỏ hàng cũ
            await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

            // Thêm các sản phẩm mới vào giỏ hàng
            for (const item of items) {
                await connection.query(
                    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    [userId, item.product_id, item.quantity]
                );
            }

            await connection.commit();
            res.json({
                success: true,
                message: 'Đã lưu giỏ hàng thành công'
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Lỗi lưu giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi lưu giỏ hàng'
        });
    }
});

// API xóa sản phẩm khỏi giỏ hàng
app.delete('/cart/:productId', authenticateJWT('client'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const productId = req.params.productId;

        const [result] = await pool.query(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy sản phẩm trong giỏ hàng'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng'
        });
    } catch (err) {
        console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng'
        });
    }
});

// API xóa nhiều sản phẩm khỏi giỏ hàng
app.post('/cart/remove-items', authenticateJWT('client'), async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                success: false,
                error: 'Dữ liệu không hợp lệ'
            });
        }

        const [result] = await pool.query(
            'DELETE FROM cart WHERE user_id = ? AND product_id IN (?)',
            [userId, productIds]
        );

        res.json({
            success: true,
            message: 'Đã xóa sản phẩm khỏi giỏ hàng',
            deletedCount: result.affectedRows
        });
    } catch (err) {
        console.error('Lỗi xóa sản phẩm khỏi giỏ hàng:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi xóa sản phẩm khỏi giỏ hàng'
        });
    }
});

// API xem sản phẩm (ai cũng xem được)
app.get('/products', async (req, res) => {
    try {
        const { search, category, sort = 'default', page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;

        let query = 'SELECT * FROM products';
        let params = [];
        let conditions = [];

        if (search) {
            conditions.push('(name LIKE ? OR description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category) {
            conditions.push('category = ?');
            params.push(category);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Thêm sắp xếp theo giá
        if (sort === 'price_asc') {
            query += ' ORDER BY price ASC';
        } else if (sort === 'price_desc') {
            query += ' ORDER BY price DESC';
        }

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), offset);

        const [products] = await pool.query(query, params);

        // Lấy tổng số sản phẩm
        let countQuery = 'SELECT COUNT(*) as total FROM products';
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        const [[{ total }]] = await pool.query(countQuery, params.slice(0, -2));

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
        console.log('Fetching turnover data...');
        
        // Query to get monthly turnover data from payments table
        const query = `
            WITH monthly_totals AS (
                SELECT 
                    DATE_FORMAT(p.payment_date, '%Y-%m') AS month,
                    COALESCE(SUM(p.amount), 0) AS amount,
                    COUNT(DISTINCT o.order_id) AS order_count
                FROM payments p
                JOIN orders o ON p.order_id = o.order_id
                WHERE p.payment_status = 'completed'
                GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
            ),
            turnover_with_changes AS (
                SELECT 
                    month,
                    amount,
                    order_count,
                    LAG(amount) OVER (ORDER BY month) as prev_amount
                FROM monthly_totals
            )
            SELECT 
                month,
                amount,
                order_count,
                CASE 
                    WHEN prev_amount IS NULL OR prev_amount = 0 THEN 0
                    ELSE ROUND(((amount - prev_amount) / prev_amount * 100), 2)
                END as \`change\`
            FROM turnover_with_changes
            ORDER BY month DESC
            LIMIT 12
        `;

        console.log('Executing turnover query:', query);
        
        const [rows] = await pool.query(query);
        console.log('Raw turnover data:', rows);

        if (!rows || rows.length === 0) {
            console.log('No turnover data found');
            return res.json([]);
        }

        // Format data for frontend
        const formattedData = rows.map(row => {
            // Ensure all numeric values are properly converted
            const amount = Number(row.amount) || 0;
            const change = Number(row.change) || 0;
            const orderCount = Number(row.order_count) || 0;
            
            return {
                id: row.month,
                date: row.month,
                amount: amount,
                current: amount,
                status: 'Completed',
                name: new Date(row.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                orderCount: orderCount,
                change: change
            };
        });

        console.log('Formatted turnover data:', formattedData);
        res.json(formattedData);
    } catch (err) {
        console.error('Detailed error in turnover endpoint:', {
            message: err.message,
            stack: err.stack,
            code: err.code,
            sqlMessage: err.sqlMessage
        });
        res.status(500).json({ 
            error: 'Lỗi server khi lấy dữ liệu turnover',
            details: err.message
        });
    }
});

// API lấy dữ liệu lợi nhuận
app.get('/profit', authenticateJWT('admin'), async (req, res) => {
    try {
        console.log('Fetching profit data...');
        
        // Query để lấy dữ liệu lợi nhuận theo tháng
        const [profitData] = await pool.query(`
            SELECT 
                DATE_FORMAT(p.payment_date, '%Y-%m') as month,
                SUM(p.amount) as total_revenue,
                SUM(p.amount * 0.2) as profit_amount,
                COUNT(DISTINCT o.order_id) as order_count,
                LAG(SUM(p.amount * 0.2)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m')) as prev_month_profit
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            WHERE p.payment_status = 'completed'
            GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
            ORDER BY month DESC
        `);

        console.log('Raw profit data:', profitData);

        // Xử lý dữ liệu để tính phần trăm thay đổi
        const processedData = profitData.map((item, index) => {
            const change = item.prev_month_profit 
                ? ((item.profit_amount - item.prev_month_profit) / item.prev_month_profit * 100).toFixed(2)
                : 0;

            return {
                id: index + 1,
                date: item.month,
                amount: item.profit_amount,
                current: item.profit_amount,
                status: 'Completed',
                name: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                orderCount: item.order_count,
                change: parseFloat(change),
                totalRevenue: item.total_revenue
            };
        });

        console.log('Processed profit data:', processedData);
        res.json(processedData);
    } catch (error) {
        console.error('Error fetching profit data:', error);
        res.status(500).json({ error: 'Failed to fetch profit data' });
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

// API tạo đơn hàng mới
app.post('/orders', authenticateJWT(), async (req, res) => {
    try {
        const { user_id, total_amount, shipping_address, order_details, payment } = req.body;

        console.log('Received order data:', req.body);

        // Validate
        if (!user_id || !total_amount || !shipping_address || !order_details || !payment) {
            console.log('Validation failed:', { user_id, total_amount, shipping_address, order_details, payment });
            return res.status(400).json({
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin đơn hàng'
            });
        }

        // Kiểm tra quyền truy cập
        if (req.user.role !== 'admin' && req.user.user_id !== parseInt(user_id)) {
            console.log('Access denied: User role:', req.user.role, 'User ID:', req.user.user_id);
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Bắt đầu transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            console.log('Creating order with data:', {
                user_id,
                total_amount,
                shipping_address
            });

            // 1. Tạo đơn hàng mới
            const [orderResult] = await connection.query(
                'INSERT INTO orders SET ?',
                {
                    user_id,
                    total_amount,
                    status: 'pending',
                    shipping_address
                }
            );

            const orderId = orderResult.insertId;
            console.log('Order created with ID:', orderId);

            // 2. Thêm chi tiết đơn hàng
            console.log('Adding order details:', order_details);
            for (const detail of order_details) {
                console.log('Processing detail:', detail);
                await connection.query(
                    'INSERT INTO order_details SET ?',
                    {
                        order_id: orderId,
                        product_id: detail.product_id,
                        quantity: detail.quantity,
                        price: detail.price
                    }
                );
            }

            // 3. Thêm thông tin thanh toán
            console.log('Adding payment info:', payment);
            // Xử lý phương thức thanh toán
            const paymentMethod = payment.payment_method === 'bank_transfer' ? 'bank_transfer' : 'cash';
            const paymentStatus = paymentMethod === 'bank_transfer' ? 'completed' : 'pending';
            
            await connection.query(
                'INSERT INTO payments SET ?',
                {
                    order_id: orderId,
                    amount: payment.amount,
                    payment_method: paymentMethod,
                    payment_status: paymentStatus,
                    transaction_id: paymentMethod === 'bank_transfer' ? payment.transaction_id : null
                }
            );

            // Commit transaction
            await connection.commit();
            console.log('Transaction committed successfully');

            res.status(201).json({
                success: true,
                message: 'Đơn hàng đã được tạo thành công',
                orderId
            });
        } catch (err) {
            // Rollback nếu có lỗi
            await connection.rollback();
            console.error('Transaction error:', err);
            console.error('Error stack:', err.stack);
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Lỗi tạo đơn hàng:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({
            success: false,
            error: err.message || 'Lỗi server khi tạo đơn hàng'
        });
    }
});

// API lấy danh sách đơn hàng của user
app.get('/orders/user/:userId', authenticateJWT(), async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Fetching orders for user:', userId);
        console.log('Current user:', req.user);

        // Kiểm tra quyền truy cập
        if (req.user.role !== 'admin' && req.user.user_id !== parseInt(userId)) {
            console.log('Access denied: User role:', req.user.role, 'User ID:', req.user.user_id);
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Lấy danh sách đơn hàng của user
        const [orders] = await pool.query(`
            SELECT o.*, p.payment_status, p.payment_method
            FROM orders o
            LEFT JOIN payments p ON o.order_id = p.order_id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC
        `, [userId]);

        console.log('Found orders:', orders);

        // Lấy chi tiết sản phẩm cho mỗi đơn hàng
        for (let order of orders) {
            const [details] = await pool.query(`
                SELECT od.*, p.name, p.url
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = ?
            `, [order.order_id]);
            order.details = details;
        }

        res.json(orders);
    } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách đơn hàng' });
    }
});

// API lấy chi tiết đơn hàng
app.get('/orders/:orderId/details', authenticateJWT(), async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log('Fetching details for order:', orderId);

        // Kiểm tra quyền truy cập
        const [order] = await pool.query('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
        if (order.length === 0) {
            console.log('Order not found:', orderId);
            return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
        }

        if (req.user.role !== 'admin' && req.user.user_id !== order[0].user_id) {
            console.log('Access denied: User role:', req.user.role, 'User ID:', req.user.user_id);
            return res.status(403).json({ error: 'Không có quyền truy cập' });
        }

        // Lấy chi tiết đơn hàng với thông tin thanh toán
        const [orderDetails] = await pool.query(`
            SELECT 
                od.*,
                p.name,
                p.url,
                py.payment_method,
                py.payment_status,
                py.transaction_id
            FROM order_details od
            JOIN products p ON od.product_id = p.product_id
            LEFT JOIN payments py ON od.order_id = py.order_id
            WHERE od.order_id = ?
        `, [orderId]);

        console.log('Found order details:', orderDetails);
        res.json(orderDetails);
    } catch (err) {
        console.error('Lỗi lấy chi tiết đơn hàng:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy chi tiết đơn hàng' });
    }
});

// API lấy danh sách đơn hàng cho admin
app.get('/admin/orders', authenticateJWT('admin'), async (req, res) => {
    try {
        console.log('Fetching all orders for admin');
        
        // Lấy danh sách đơn hàng với thông tin người dùng
        const [orders] = await pool.query(`
            SELECT DISTINCT 
                o.order_id,
                o.user_id,
                o.total_amount,
                o.status,
                o.order_date,
                o.shipping_address,
                u.username,
                p.payment_status,
                p.payment_method
            FROM orders o
            JOIN users u ON o.user_id = u.user_id
            LEFT JOIN payments p ON o.order_id = p.order_id
            ORDER BY o.order_date DESC
        `);

        console.log('Found orders:', orders);

        // Lấy chi tiết sản phẩm cho mỗi đơn hàng
        for (let order of orders) {
            const [details] = await pool.query(`
                SELECT DISTINCT
                    od.order_detail_id,
                    od.product_id,
                    od.quantity,
                    od.price,
                    p.name,
                    p.url
                FROM order_details od
                JOIN products p ON od.product_id = p.product_id
                WHERE od.order_id = ?
            `, [order.order_id]);
            order.details = details;
        }

        res.json(orders);
    } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách đơn hàng' });
    }
});

// API cập nhật trạng thái đơn hàng
app.put('/admin/orders/:orderId/status', authenticateJWT('admin'), async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status } = req.body;

        console.log('Updating order status:', { orderId, status });

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        // Bắt đầu transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Lấy thông tin đơn hàng hiện tại
            const [currentOrder] = await connection.query(
                'SELECT * FROM orders WHERE order_id = ?',
                [orderId]
            );

            if (currentOrder.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
            }

            // Cập nhật trạng thái đơn hàng
            const [result] = await connection.query(
                'UPDATE orders SET status = ? WHERE order_id = ?',
                [status, orderId]
            );

            // Nếu đơn hàng được giao thành công, cập nhật trạng thái thanh toán
            if (status === 'delivered') {
                // Cập nhật trạng thái thanh toán thành completed
                await connection.query(
                    'UPDATE payments SET payment_status = ?, payment_date = CURRENT_TIMESTAMP WHERE order_id = ?',
                    ['completed', orderId]
                );

                // Log để debug
                console.log('Updated payment status to completed for order:', orderId);
            }

            // Commit transaction
            await connection.commit();

            // Lấy thông tin đơn hàng sau khi cập nhật
            const [updatedOrder] = await connection.query(`
                SELECT o.*, u.username, p.payment_status, p.payment_method, p.payment_date
                FROM orders o
                JOIN users u ON o.user_id = u.user_id
                LEFT JOIN payments p ON o.order_id = p.order_id
                WHERE o.order_id = ?
            `, [orderId]);

            console.log('Order updated:', updatedOrder[0]);

            res.json({
                success: true,
                message: 'Cập nhật trạng thái đơn hàng thành công',
                order: updatedOrder[0]
            });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Lỗi cập nhật trạng thái đơn hàng:', err);
        res.status(500).json({ 
            error: 'Lỗi server khi cập nhật trạng thái đơn hàng',
            details: err.message 
        });
    }
});

// API endpoint to get payment data
app.get('/payments', authenticateJWT('admin'), async (req, res) => {
  try {
    console.log('Fetching payment data...');
    
    // Query to get payment data with order information
    const [rows] = await pool.query(`
      SELECT 
        p.payment_id,
        p.order_id,
        p.amount,
        p.payment_method,
        p.payment_status,
        p.transaction_id,
        p.payment_date,
        o.order_date,
        o.status as order_status,
        o.total_amount as order_total,
        u.full_name as customer_name
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN users u ON o.user_id = u.user_id
      ORDER BY p.payment_date DESC
    `);

    console.log('Payment data fetched:', rows);

    // Format the data for frontend
    const formattedData = rows.map(row => ({
      id: row.payment_id,
      orderId: row.order_id,
      amount: parseFloat(row.amount),
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      transactionId: row.transaction_id,
      paymentDate: row.payment_date,
      orderDate: row.order_date,
      orderStatus: row.order_status,
      orderTotal: parseFloat(row.order_total),
      customerName: row.customer_name
    }));

    res.json({
      success: true,
      payments: formattedData
    });
  } catch (err) {
    console.error('Error fetching payment data:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch payment data' 
    });
  }
});

// ================== API ĐĂNG NHẬP GOOGLE ==================
app.post('/auth/google', async (req, res) => {
    try {
        console.log('Received Google login request');
        const { credential } = req.body;
        
        if (!credential) {
            console.log('No credential provided');
            return res.status(400).json({
                success: false,
                error: 'Không có thông tin xác thực Google'
            });
        }

        console.log('Verifying Google token...');
        
        try {
            // Verify Google token
            const ticket = await googleClient.verifyIdToken({
                idToken: credential,
                audience: "175627284623-pl3oarbc99djsl3erhs5a11kfn8tk2qs.apps.googleusercontent.com"
            });

            console.log('Token verified, getting payload...');
            const payload = ticket.getPayload();
            console.log('Payload:', payload);
            const { email, name, picture } = payload;

            console.log('Checking if user exists...');
            // Check if user exists
            const [users] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );

            let user;
            if (users.length === 0) {
                console.log('Creating new user...');
                // Generate username from email
                const username = email.split('@')[0];
                
                // Generate a random password
                const randomPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                
                // Create new user if doesn't exist
                const [result] = await pool.query(
                    'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
                    [username, email, hashedPassword, name, 'client']
                );
                
                user = {
                    userId: result.insertId,
                    username,
                    email,
                    full_name: name,
                    role: 'client'
                };
            } else {
                console.log('User exists, getting user data...');
                user = {
                    userId: users[0].user_id,
                    username: users[0].username,
                    email: users[0].email,
                    full_name: users[0].full_name,
                    role: users[0].role
                };
            }

            console.log('Creating JWT token...');
            // Create JWT token
            const token = jwt.sign(
                {
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
            );

            console.log('Login successful, sending response...');
            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                token,
                user
            });
        } catch (verifyError) {
            console.error('Error verifying Google token:', verifyError);
            throw verifyError;
        }
    } catch (error) {
        console.error('Google login error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Lỗi xác thực Google: ' + error.message,
            details: error.stack
        });
    }
});

// ================== API CẬP NHẬT THÔNG TIN USER ==================
app.put('/users/:userId', authenticateJWT(), async (req, res) => {
    try {
        const userId = req.params.userId;
        const { full_name, email, phone, address } = req.body;

        // Validate
        if (!full_name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Email không hợp lệ'
            });
        }

        // Validate phone format (10 digits)
        if (phone && !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                error: 'Số điện thoại không hợp lệ'
            });
        }

        // Check if email is already used by another user
        const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND user_id != ?',
            [email, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email đã được sử dụng bởi người dùng khác'
            });
        }

        // Update user
        const [result] = await pool.query(
            'UPDATE users SET ? WHERE user_id = ?',
            [{
                full_name,
                email,
                phone: phone || null,
                address: address || null
            }, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Get updated user data
        const [users] = await pool.query(
            'SELECT * FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        const user = users[0];

        // Return updated user data (without password)
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
            message: 'Cập nhật thông tin thành công',
            user: userResponse
        });
    } catch (err) {
        console.error('Lỗi cập nhật thông tin:', err);
        res.status(500).json({
            success: false,
            error: 'Lỗi server khi cập nhật thông tin'
        });
    }
});

// Khởi động server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server chạy trên http://localhost:${PORT}`);
});