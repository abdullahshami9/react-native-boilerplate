const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Ensure Upload Directories Exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
};
ensureDir(path.join(__dirname, 'uploads/profiles'));
ensureDir(path.join(__dirname, 'uploads/products'));
ensureDir(path.join(__dirname, 'uploads/certificates'));

// Database Connection Config
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
};

// Create Connection
let db = mysql.createConnection(dbConfig);

// Initialize Database & Tables
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server.');

    const initQuery = `
        CREATE DATABASE IF NOT EXISTS AppStarter;
        USE AppStarter;

        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(255) NOT NULL,
            user_type ENUM('Individual', 'Business') NOT NULL,
            mac_address VARCHAR(255),
            profile_pic_url VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS error_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            details TEXT,
            source VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS skills (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            skill_name VARCHAR(100) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS availability (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            date DATE NOT NULL,
            status ENUM('free', 'busy') DEFAULT 'free',
            UNIQUE KEY unique_availability (user_id, date),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            description TEXT,
            image_url TEXT,
            stock_quantity INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            provider_id INT NOT NULL,
            customer_id INT NOT NULL,
            appointment_date DATETIME NOT NULL,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES users(id),
            FOREIGN KEY (customer_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS connections (
            id INT AUTO_INCREMENT PRIMARY KEY,
            follower_id INT NOT NULL,
            following_id INT NOT NULL,
            status ENUM('pending', 'accepted') DEFAULT 'accepted',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_connection (follower_id, following_id)
        );

        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            seller_id INT NOT NULL,
            buyer_id INT,
            total_amount DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS education (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            degree VARCHAR(255) NOT NULL,
            institution VARCHAR(255) NOT NULL,
            year VARCHAR(20),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS certificates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            file_url VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS social_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            platform VARCHAR(50) NOT NULL,
            url VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS business_details (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            description TEXT,
            industry VARCHAR(100),
            category VARCHAR(100),
            location_lat DECIMAL(10, 8),
            location_lng DECIMAL(11, 8),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payment_methods (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            provider VARCHAR(50),
            account_number VARCHAR(100),
            account_title VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS chats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user1_id INT NOT NULL,
            user2_id INT NOT NULL,
            last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1_id) REFERENCES users(id),
            FOREIGN KEY (user2_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            chat_id INT NOT NULL,
            sender_id INT NOT NULL,
            content TEXT,
            type ENUM('text', 'image') DEFAULT 'text',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS generic (
          id int(11) NOT NULL AUTO_INCREMENT,
          query text NOT NULL,
          error text NOT NULL,
          url text NOT NULL,
          creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id) USING BTREE
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
    `;

    db.query(initQuery, (err, result) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database and Tables initialized.');
            db.end();
            db = mysql.createConnection({ ...dbConfig, database: 'AppStarter' });

             // Add column if not exists (Hack for existing db)
            db.query("SHOW COLUMNS FROM products LIKE 'stock_quantity'", (e, r) => {
                if(r && r.length === 0) {
                     db.query("ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0", () => console.log("Added stock_quantity column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'profile_pic_url'", (e, r) => {
                 if(r && r.length === 0) {
                      db.query("ALTER TABLE users ADD COLUMN profile_pic_url VARCHAR(255)", () => console.log("Added profile_pic_url column"));
                 }
            });
            // Ensure appointments table exists (Hack if creating via initQuery failed previously)
            db.query("SHOW TABLES LIKE 'appointments'", (e, r) => {
                if(r && r.length === 0) {
                    const create = `CREATE TABLE IF NOT EXISTS appointments (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        provider_id INT NOT NULL,
                        customer_id INT NOT NULL,
                        appointment_date DATETIME NOT NULL,
                        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (provider_id) REFERENCES users(id),
                        FOREIGN KEY (customer_id) REFERENCES users(id)
                    )`;
                    db.query(create, () => console.log("Created appointments table"));
                }
            });
        }
    });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/';
        if (req.path.includes('profile')) dir += 'profiles/';
        else if (req.path.includes('product')) dir += 'products/';
        else if (req.path.includes('certificate')) dir += 'certificates/';

        // Ensure directory exists (mkdir -p logic handled by shell usually but good to be safe)
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Expect fields: userId (for profile) OR productId, index (for products)
        const ext = path.extname(file.originalname) || '.jpg';
        // Sanitize input
        const sanitize = (str) => String(str).replace(/[^a-zA-Z0-9_-]/g, '');

        if (req.path.includes('profile')) {
            const userId = sanitize(req.body.userId || 'unknown');
            cb(null, `${userId}${ext}`);
        } else if (req.path.includes('product')) {
            const productId = sanitize(req.body.productId || 'unknown');
            const index = sanitize(req.body.index || '0');
            cb(null, `${productId}-${index}${ext}`);
        } else {
             // Generic fallback
             cb(null, `${Date.now()}${ext}`);
        }
    }
});
const upload = multer({ storage });


// Helper to execute query and log errors
const dbQuery = (sql, params, reqOrUrl, callback) => {
    db.query(sql, params, (err, result) => {
        if (err) {
            const url = typeof reqOrUrl === 'string' ? reqOrUrl : (reqOrUrl?.originalUrl || 'Unknown');
            console.error(`DB Error [${url}]:`, err.message);
            // Log error to generic table
            const logSql = "INSERT INTO generic (query, error, url) VALUES (?, ?, ?)";
            db.query(logSql, [sql, err.message, url], (logErr) => {
                if (logErr) console.error("Failed to log database error:", logErr);
            });
        }
        if (callback) callback(err, result);
    });
};

// --- SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.id} joined room chat_${chatId}`);
    });

    socket.on('send_message', (data) => {
        // data: { chatId, senderId, content, type }
        const { chatId, senderId, content, type } = data;

        // Save to DB
        const query = 'INSERT INTO messages (chat_id, sender_id, content, type) VALUES (?, ?, ?, ?)';
        db.query(query, [chatId, senderId, content, type || 'text'], (err, result) => {
            if (err) {
                console.error("Socket DB Error:", err);
                return;
            }

            // Update last_message_at in chats table
            db.query('UPDATE chats SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [chatId]);

            // Emit to room
            const messageData = {
                id: result.insertId,
                chat_id: chatId,
                sender_id: senderId,
                content,
                type: type || 'text',
                created_at: new Date()
            };
            io.to(`chat_${chatId}`).emit('receive_message', messageData);
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// --- ROUTES ---

// Register
app.post('/register', (req, res) => {
    const { email, password, name, phone, mac_address } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Required fields missing' });

    const query = 'INSERT INTO users (email, password, name, phone, user_type, mac_address) VALUES (?, ?, ?, ?, ?, ?)';
    dbQuery(query, [email, password, name, phone, req.body.user_type || 'individual', mac_address || null], req, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email already exists' });
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'User registered', userId: result.insertId });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbQuery(query, [email, password], req, (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        res.json({ success: true, message: 'Login successful', user: results[0] });
    });
});

// Update Profile
app.post('/update-profile', (req, res) => {
    const { id, name, phone, email } = req.body;
    const query = 'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?';
    dbQuery(query, [name, phone, email, id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// --- NEW API ENDPOINTS FOR PROFILE ENHANCEMENTS ---

// Get User Full Profile (including education, skills, socials)
app.get('/api/profile/:userId', (req, res) => {
    const userId = req.params.userId;
    const queries = `
        SELECT * FROM education WHERE user_id = ?;
        SELECT * FROM social_links WHERE user_id = ?;
        SELECT * FROM certificates WHERE user_id = ?;
        SELECT * FROM business_details WHERE user_id = ?;
        SELECT * FROM payment_methods WHERE user_id = ?;
    `;

    dbQuery(queries, [userId, userId, userId, userId, userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        // results is array of arrays because of multipleStatements: true
        res.json({
            success: true,
            education: results[0],
            socials: results[1],
            certificates: results[2],
            business: results[3][0] || null,
            payments: results[4]
        });
    });
});

app.post('/api/education', (req, res) => {
    const { user_id, degree, institution, year } = req.body;
    const query = 'INSERT INTO education (user_id, degree, institution, year) VALUES (?, ?, ?, ?)';
    dbQuery(query, [user_id, degree, institution, year], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId });
    });
});

app.post('/api/socials', (req, res) => {
    const { user_id, platform, url } = req.body;
    const query = 'INSERT INTO social_links (user_id, platform, url) VALUES (?, ?, ?)';
    dbQuery(query, [user_id, platform, url], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId });
    });
});

// --- BUSINESS ONBOARDING ---

app.post('/api/business/onboarding', (req, res) => {
    const { user_id, description, industry, category, location_lat, location_lng, address, payment_methods, socials } = req.body;

    // Save business details
    const bizQuery = `INSERT INTO business_details (user_id, description, industry, category, location_lat, location_lng, address)
                      VALUES (?, ?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE description=?, industry=?, category=?, location_lat=?, location_lng=?, address=?`;

    dbQuery(bizQuery, [user_id, description, industry, category, location_lat, location_lng, address,
                       description, industry, category, location_lat, location_lng, address], req, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to save business details' });

        // Save Payment Methods if any
        if (payment_methods && payment_methods.length > 0) {
            const payValues = payment_methods.map(p => [user_id, p.provider, p.account_number, p.account_title]);
            db.query('INSERT INTO payment_methods (user_id, provider, account_number, account_title) VALUES ?', [payValues], (e) => {
                if(e) console.error("Payment methods save error", e);
            });
        }

        // Save Socials if any (and passed here)
        if (socials && socials.length > 0) {
             const socValues = socials.map(s => [user_id, s.platform, s.url]);
             db.query('INSERT INTO social_links (user_id, platform, url) VALUES ?', [socValues], (e) => {
                 if(e) console.error("Socials save error", e);
             });
        }

        res.json({ success: true, message: 'Onboarding complete' });
    });
});

// --- CHAT API ---

app.post('/api/chats/initiate', (req, res) => {
    const { user1_id, user2_id } = req.body;
    // Check if chat exists
    const checkQuery = 'SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)';
    dbQuery(checkQuery, [user1_id, user2_id, user2_id, user1_id], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        if (results.length > 0) {
            res.json({ success: true, chatId: results[0].id });
        } else {
            const createQuery = 'INSERT INTO chats (user1_id, user2_id) VALUES (?, ?)';
            dbQuery(createQuery, [user1_id, user2_id], req, (err2, result) => {
                if (err2) return res.status(500).json({ success: false });
                res.json({ success: true, chatId: result.insertId });
            });
        }
    });
});

app.get('/api/chats/:userId', (req, res) => {
    // Get list of chats for a user with last message
    const query = `
        SELECT c.*,
               u1.name as user1_name, u1.profile_pic_url as user1_pic,
               u2.name as user2_name, u2.profile_pic_url as user2_pic,
               (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
        FROM chats c
        JOIN users u1 ON c.user1_id = u1.id
        JOIN users u2 ON c.user2_id = u2.id
        WHERE c.user1_id = ? OR c.user2_id = ?
        ORDER BY c.last_message_at DESC
    `;
    dbQuery(query, [req.params.userId, req.params.userId], req, (err, results) => {
         if (err) return res.status(500).json({ success: false });
         res.json({ success: true, chats: results });
    });
});

app.get('/api/messages/:chatId', (req, res) => {
    const query = 'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC';
    dbQuery(query, [req.params.chatId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, messages: results });
    });
});


// --- UPLOADS ---

app.post('/api/upload/profile', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Update DB with URL/Path (Optional, but good for caching busting or knowing type)
    const userId = req.body.userId;
    // We store the relative path or filename.
    // Since naming is fixed (userId.ext), we can just infer it, but user might change extensions.
    // Better to update DB.
    const fileUrl = `uploads/profiles/${req.file.filename}`;
    const query = 'UPDATE users SET profile_pic_url = ? WHERE id = ?';

    dbQuery(query, [fileUrl, userId], req, (err) => {
        if (err) console.error("Failed to update profile pic url in db");
        // We succeed even if db update fails because file is saved
        res.json({ success: true, message: 'Profile uploaded', filePath: fileUrl });
    });
});

app.post('/api/upload/product', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const productId = req.body.productId;
    const index = req.body.index || 0;
    const fileUrl = `uploads/products/${req.file.filename}`;

    // If it's the main image (index 0), update product table
    if (index == 0) {
        const query = 'UPDATE products SET image_url = ? WHERE id = ?';
        dbQuery(query, [fileUrl, productId], req, (err) => {
             res.json({ success: true, message: 'Product image uploaded', filePath: fileUrl });
        });
    } else {
        res.json({ success: true, message: 'Product image uploaded', filePath: fileUrl });
    }
});

// --- CONNECTIONS ---

app.post('/api/connections', (req, res) => {
    const { follower_id, following_id, action } = req.body; // action: 'follow', 'unfollow'

    if (action === 'unfollow') {
        const query = 'DELETE FROM connections WHERE follower_id = ? AND following_id = ?';
        dbQuery(query, [follower_id, following_id], req, (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Unfollowed' });
        });
    } else {
        const query = 'INSERT INTO connections (follower_id, following_id, status) VALUES (?, ?, "accepted") ON DUPLICATE KEY UPDATE status="accepted"';
        dbQuery(query, [follower_id, following_id], req, (err) => {
            if (err) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Followed' });
        });
    }
});

app.get('/api/connections/:userId', (req, res) => {
    // Get people the user is following
    const query = `
        SELECT u.id, u.name, u.email, u.user_type, u.profile_pic_url
        FROM connections c
        JOIN users u ON c.following_id = u.id
        WHERE c.follower_id = ?
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, connections: results });
    });
});

app.get('/api/users/discover', (req, res) => {
    // Simple discover: list all users except self
    const excludeId = req.query.excludeId || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';

    const query = 'SELECT id, name, email, user_type, profile_pic_url FROM users WHERE id != ? AND name LIKE ? LIMIT 50';
    dbQuery(query, [excludeId, search], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, users: results });
    });
});

app.get('/api/products/discover', (req, res) => {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const query = 'SELECT * FROM products WHERE name LIKE ? LIMIT 50';
    dbQuery(query, [search], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, products: results });
    });
});

// --- PRODUCTS & INVENTORY ---

app.post('/api/products', (req, res) => {
    const { user_id, name, price, description, image_url, stock_quantity } = req.body;
    const query = 'INSERT INTO products (user_id, name, price, description, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)';
    dbQuery(query, [user_id, name, price, description || '', image_url || '', stock_quantity || 0], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Product added', id: result.insertId });
    });
});

app.get('/api/products/:userId', (req, res) => {
    const query = 'SELECT * FROM products WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, products: results });
    });
});

app.post('/api/products/:id/stock', (req, res) => {
    const { stock } = req.body;
    const query = 'UPDATE products SET stock_quantity = ? WHERE id = ?';
    dbQuery(query, [stock, req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Stock updated' });
    });
});

// --- SKILLS & AVAILABILITY ---

app.post('/api/skills', (req, res) => {
    const { user_id, skill_name } = req.body;
    const query = 'INSERT INTO skills (user_id, skill_name) VALUES (?, ?)';
    dbQuery(query, [user_id, skill_name], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId });
    });
});

app.get('/api/skills/:userId', (req, res) => {
    const query = 'SELECT * FROM skills WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, skills: results });
    });
});

app.delete('/api/skills/:id', (req, res) => {
    dbQuery('DELETE FROM skills WHERE id = ?', [req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.post('/api/availability', (req, res) => {
    const { user_id, date, status } = req.body;
    const query = 'INSERT INTO availability (user_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?';
    dbQuery(query, [user_id, date, status, status], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.get('/api/availability/:userId', (req, res) => {
    dbQuery('SELECT * FROM availability WHERE user_id = ?', [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, availability: results });
    });
});

// --- ORDERS & REPORTS ---

app.post('/api/orders', (req, res) => {
    const { seller_id, buyer_id, items } = req.body;
    // items: [{ product_id, quantity, price }]

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderQuery = 'INSERT INTO orders (seller_id, buyer_id, total_amount) VALUES (?, ?, ?)';
    dbQuery(orderQuery, [seller_id, buyer_id || null, total], req, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to create order' });

        const orderId = result.insertId;
        const itemValues = items.map(item => [orderId, item.product_id, item.quantity, item.price]);

        const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        db.query(itemQuery, [itemValues], (itemErr) => {
            if (itemErr) {
                console.error("Order Items Error:", itemErr);
                // Should rollback, but simple implementation for now
                return res.status(500).json({ success: false, message: 'Partial failure' });
            }

            // Update stock
            items.forEach(item => {
                 db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
            });

            res.json({ success: true, message: 'Order created', orderId });
        });
    });
});

app.get('/api/reports/sales/:userId', (req, res) => {
    // Returns daily sales for the last 30 days
    const query = `
        SELECT
            DATE(created_at) as date,
            COUNT(*) as count,
            SUM(total_amount) as total
        FROM orders
        WHERE seller_id = ?
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        // Also get Monthly total
        const monthQuery = `
            SELECT SUM(total_amount) as total
            FROM orders
            WHERE seller_id = ? AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `;
        dbQuery(monthQuery, [req.params.userId], req, (err2, monthResult) => {
             res.json({
                 success: true,
                 daily: results,
                 monthlyTotal: monthResult[0]?.total || 0
             });
        });
    });
});

// --- APPOINTMENTS (For Calendar) ---

app.get('/api/appointments/:userId', (req, res) => {
    // Get all appointments (both as provider and customer)
    const query = `
        SELECT a.*,
            u1.name as provider_name,
            u2.name as customer_name
        FROM appointments a
        JOIN users u1 ON a.provider_id = u1.id
        JOIN users u2 ON a.customer_id = u2.id
        WHERE a.provider_id = ? OR a.customer_id = ?
    `;
    dbQuery(query, [req.params.userId, req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, appointments: results });
    });
});

// Biometric Login (Existing)
app.post('/biometric/login', (req, res) => {
    const { mac_address } = req.body;
    if (!mac_address) return res.status(400).json({ success: false });

    const query = 'SELECT * FROM users WHERE mac_address = ?';
    dbQuery(query, [mac_address], req, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ success: false });
        res.json({ success: true, user: results[0] });
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
