const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require("socket.io");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('./middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const sequelize = require('./config/database');
const BusinessDetails = require('./models/BusinessDetails');
const IdentityScan = require('./models/IdentityScan');
const axios = require('axios');
const { createClient } = require('redis');
const { RedisMemoryServer } = require('redis-memory-server');

const app = express();
const PORT = 3000;

// Security Middleware
app.use(helmet());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// Redis Configuration
let redisClient;
const USE_REDIS = process.env.USE_REDIS !== 'false';

if (USE_REDIS) {
    (async () => {
        let redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            console.log('No REDIS_URL found, starting in-memory Redis server...');
            try {
                const redisServer = new RedisMemoryServer();
                const host = await redisServer.getHost();
                const port = await redisServer.getPort();
                redisUrl = `redis://${host}:${port}`;
                console.log(`In-memory Redis started at ${redisUrl}`);
            } catch (err) {
                console.error('Failed to start in-memory Redis:', err);
            }
        }

        if (redisUrl) {
            redisClient = createClient({ url: redisUrl });
            redisClient.on('error', (err) => console.log('Redis Client Error (Fallback to Memory/DirectDB):', err.message));
            try {
                await redisClient.connect();
                console.log('Connected to Redis');
            } catch (e) {
                console.log('Redis Connection Failed, proceeding without cache.');
                redisClient = null;
            }
        }
    })();
}

const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
};

const setCache = async (key, value, ttl = 300) => {
    if (!redisClient) return;
    try {
        await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    } catch (e) { }
};

// Ensure Upload Directories Exist
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
ensureDir(path.join(__dirname, 'uploads/profiles'));
ensureDir(path.join(__dirname, 'uploads/products'));
ensureDir(path.join(__dirname, 'uploads/services'));
ensureDir(path.join(__dirname, 'uploads/certificates'));
ensureDir(path.join(__dirname, 'uploads/resumes'));
ensureDir(path.join(__dirname, 'uploads/chats'));
ensureDir(path.join(__dirname, 'uploads/identity'));

// Database Connection Config (Pool)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'AppStarter',
    waitForConnections: true,
    connectionLimit: 100, // Handle up to 100 concurrent DB connections
    queueLimit: 0,        // Unlimited queueing
    multipleStatements: true
};

// Create Connection Pool instead of single connection
let db = mysql.createPool(dbConfig);

// Initialize Sequelize
try {
    (async () => {
        await sequelize.authenticate();
        console.log('Connected to MySQL via Sequelize.');
        await sequelize.sync(); // Sync models
        console.log('Sequelize models synced.');
    })();
} catch (error) {
    console.error('Unable to connect to the database via Sequelize:', error);
}

const initConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    multipleStatements: true
});

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
            profile_pic_url VARCHAR(255),
            is_tunnel_completed BOOLEAN DEFAULT 0,
            address TEXT,
            street_id INT DEFAULT NULL,
            current_job_title VARCHAR(255)
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
            unit VARCHAR(50),
            category VARCHAR(100),
            attributes LONGTEXT,
            addons LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FULLTEXT(name, description)
        );

        CREATE TABLE IF NOT EXISTS services (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            duration_mins INT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            provider_id INT NOT NULL,
            customer_id INT NOT NULL,
            service_id INT,
            appointment_date DATETIME NOT NULL,
            duration_mins INT DEFAULT 30,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES users(id),
            FOREIGN KEY (customer_id) REFERENCES users(id),
            FOREIGN KEY (service_id) REFERENCES services(id)
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
            status ENUM('pending', 'accepted', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
            payment_method VARCHAR(50) DEFAULT 'cod',
            rating INT,
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            variant TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS education (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            degree VARCHAR(255) NOT NULL,
            institution VARCHAR(255) NOT NULL,
            year VARCHAR(20),
            type ENUM('Degree', 'Certificate', 'Diploma') DEFAULT 'Degree',
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
            business_type VARCHAR(100),
            location_lat DECIMAL(10, 8),
            location_lng DECIMAL(11, 8),
            address TEXT,
            street_id INT DEFAULT NULL,
            subscription_expiry_date DATETIME DEFAULT NULL,
            is_premium BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_biz (user_id)
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

        CREATE TABLE IF NOT EXISTS profile_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            profile_id INT NOT NULL,
            viewer_id INT,
            source VARCHAR(50) DEFAULT 'unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (profile_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS link_clicks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            link_id INT NOT NULL,
            clicker_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (link_id) REFERENCES social_links(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS generic (
          id int(11) NOT NULL AUTO_INCREMENT,
          query text NOT NULL,
          error text NOT NULL,
          url text NOT NULL,
          creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id) USING BTREE
        ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

        CREATE TABLE IF NOT EXISTS province (
          provinceId int(11) NOT NULL AUTO_INCREMENT,
          provinceName varchar(50) NOT NULL,
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          terminus_region_id int(11) DEFAULT NULL,
          PRIMARY KEY (provinceId)
        );

        CREATE TABLE IF NOT EXISTS city (
          cityId int(3) NOT NULL AUTO_INCREMENT,
          province_provinceId int(11) NOT NULL,
          cityName varchar(50) NOT NULL,
          cityCode varchar(5) DEFAULT NULL,
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          sap_id int(11) DEFAULT 0,
          costCenter varchar(50) DEFAULT NULL,
          provisionEmail varchar(50) DEFAULT NULL,
          cityIata varchar(3) DEFAULT NULL,
          support_number varchar(15) DEFAULT NULL,
          odnEmail varchar(50) DEFAULT NULL,
          huaweiVASProfile varchar(255) DEFAULT NULL,
          available_tv_services tinyint(1) DEFAULT '1',
          operational tinyint(1) unsigned NOT NULL DEFAULT '1',
          ticket_system enum('OTRS','TERMINUS') DEFAULT 'OTRS',
          terminus_city_id int(11) DEFAULT NULL,
          modified_by int(11) DEFAULT NULL,
          internet_blocked tinyint(1) DEFAULT '0',
          PRIMARY KEY (cityId),
          FOREIGN KEY (province_provinceId) REFERENCES province (provinceId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS location (
          locationId int(11) NOT NULL AUTO_INCREMENT,
          city_cityId int(11) NOT NULL,
          locationName varchar(50) NOT NULL,
          locationCharges decimal(4,2) NOT NULL DEFAULT 0.00,
          charges_type varchar(1) NOT NULL DEFAULT 'F',
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          visible_np_coverage tinyint(1) DEFAULT '0',
          np_flag_modified_by int(11) DEFAULT NULL,
          np_flag_modified_date datetime DEFAULT NULL,
          available_tv_services tinyint(1) DEFAULT '1',
          internet_blocked tinyint(1) DEFAULT '0',
          PRIMARY KEY (locationId),
          FOREIGN KEY (city_cityId) REFERENCES city (cityId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS sublocation (
          sublocationId int(11) NOT NULL AUTO_INCREMENT,
          location_LocationId int(11) NOT NULL,
          sublocationName varchar(50) NOT NULL,
          sublocationLink varchar(100) DEFAULT '',
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          visible_np_coverage tinyint(1) DEFAULT '0',
          np_flag_modified_by int(11) DEFAULT NULL,
          np_flag_modified_date datetime DEFAULT NULL,
          available_tv_services tinyint(1) DEFAULT '1',
          total_housepass int(5) DEFAULT NULL,
          current_housepass_occupancy int(5) DEFAULT NULL,
          energize_date date DEFAULT NULL,
          internet_blocked tinyint(1) DEFAULT '0',
          PRIMARY KEY (sublocationId),
          FOREIGN KEY (location_LocationId) REFERENCES location (locationId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS streetinfo (
          streetId int(11) NOT NULL AUTO_INCREMENT,
          sublocation_sublocationId int(11) NOT NULL,
          streetName varchar(100) NOT NULL,
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          PRIMARY KEY (streetId),
          FOREIGN KEY (sublocation_sublocationId) REFERENCES sublocation (sublocationId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS building (
          buildingId int(11) NOT NULL AUTO_INCREMENT,
          streetInfo_streetId int(11) NOT NULL,
          buildingName varchar(45) NOT NULL,
          plotNumber varchar(10) DEFAULT NULL,
          charges double unsigned NOT NULL,
          chargesType char(1) NOT NULL,
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          total_housepass int(11) DEFAULT NULL,
          current_housepass_occupancy int(11) DEFAULT NULL,
          energize_date date DEFAULT NULL,
          PRIMARY KEY (buildingId),
          KEY house_block_FKIndex1 (streetInfo_streetId),
          FOREIGN KEY (streetInfo_streetId) REFERENCES streetinfo(streetId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS building_block (
          buildingBlockId int(11) NOT NULL AUTO_INCREMENT,
          buildingBlockName varchar(45) NOT NULL,
          creationDate timestamp NULL DEFAULT NULL,
          modifiedDate timestamp NULL DEFAULT NULL,
          building_buildingId int(11) NOT NULL,
          PRIMARY KEY (buildingBlockId),
          KEY fk_building_block_building1 (building_buildingId),
          FOREIGN KEY (building_buildingId) REFERENCES building(buildingId) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS product_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            product_id INT NOT NULL,
            old_price DECIMAL(10, 2),
            new_price DECIMAL(10, 2),
            action VARCHAR(50) DEFAULT 'update',
            change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info',
            read_status BOOLEAN DEFAULT 0,
            related_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS user_metadata (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            device_model VARCHAR(255),
            os_version VARCHAR(255),
            app_version VARCHAR(50),
            ip_address VARCHAR(50),
            location_lat DECIMAL(10, 8),
            location_lng DECIMAL(11, 8),
            meta_data TEXT,
            communication_keywords TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

initConnection.query(initQuery, (err, result) => {
    if (err) {
        console.error('Error initializing database:', err);
    } else {
        console.log('Database and Tables initialized.');
        initConnection.end(); // close init connection

        // Apply migrations dynamically if needed
        const runMigration = (sql, msg) => {
            db.query(sql, (e) => {
                if (e && e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_DUP_KEYNAME' && e.errno !== 121) console.log(`Migration Note (${msg}):`, e.message);
                else if (!e) console.log(`Migration Success: ${msg}`);
            });
        };

        runMigration("ALTER TABLE business_details ADD COLUMN subscription_expiry_date DATETIME DEFAULT NULL", "Subscription Expiry");
        runMigration("ALTER TABLE business_details ADD COLUMN is_premium BOOLEAN DEFAULT 0", "Is Premium");

        // Product Schema Updates
        runMigration("ALTER TABLE products ADD COLUMN unit VARCHAR(50)", "Product Unit");
        runMigration("ALTER TABLE products ADD COLUMN category VARCHAR(100)", "Product Category");
        runMigration("ALTER TABLE products ADD COLUMN attributes LONGTEXT", "Product Attributes");
        runMigration("ALTER TABLE order_items ADD COLUMN variant TEXT", "Order Item Variant");

        runMigration("CREATE INDEX idx_users_email ON users(email)", "Index Email");
        runMigration("CREATE INDEX idx_products_user_category ON products(user_id, category)", "Index Products User/Cat");
        runMigration("CREATE FULLTEXT INDEX idx_products_fts ON products(name, description)", "FTS Products");

        // New Migrations for Fish Wala Flow
        runMigration("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'pending'", "Order Status Enum");
        runMigration("ALTER TABLE orders ADD COLUMN rating INT", "Order Rating");
        runMigration("ALTER TABLE orders ADD COLUMN review TEXT", "Order Review");

        // Migrations for Restaurant Flow (V3)
        runMigration("ALTER TABLE products ADD COLUMN addons LONGTEXT", "Product Addons");
        runMigration("ALTER TABLE order_items ADD COLUMN selected_addons LONGTEXT", "Order Item Addons");
        runMigration("ALTER TABLE business_details ADD COLUMN operating_hours LONGTEXT", "Business Operating Hours");
        runMigration("ALTER TABLE business_details ADD COLUMN delivery_radius DECIMAL(10,2)", "Business Delivery Radius");
        runMigration("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'preparing', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'pending'", "Order Status Update");
        runMigration("ALTER TABLE orders ADD COLUMN rider_name VARCHAR(255)", "Order Rider Name");
        runMigration("ALTER TABLE orders ADD COLUMN rider_phone VARCHAR(50)", "Order Rider Phone");
        runMigration("ALTER TABLE orders ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0.00", "Order Delivery Fee");
        runMigration("ALTER TABLE chats ADD COLUMN order_id INT", "Chat Order ID");
        runMigration("ALTER TABLE chats ADD CONSTRAINT fk_chats_order FOREIGN KEY (order_id) REFERENCES orders(id)", "Chat Order FK");

        // Migration V4: Order Instructions (Generic Notes)
        runMigration("ALTER TABLE orders ADD COLUMN instructions TEXT", "Order Instructions");

        runMigration("ALTER TABLE users ADD COLUMN street_id INT DEFAULT NULL", "User Street ID");
        runMigration("ALTER TABLE business_details ADD COLUMN street_id INT DEFAULT NULL", "Business Street ID");
        runMigration("ALTER TABLE user_metadata ADD COLUMN communication_keywords TEXT", "User Communication Keywords");
        runMigration("ALTER TABLE profile_views ADD COLUMN viewer_id INT DEFAULT NULL", "Profile Views Viewer ID");

        // Migration V5: Avatar/Body Dimensions
        runMigration("ALTER TABLE users ADD COLUMN height DECIMAL(5,2) DEFAULT NULL", "User Height");
        runMigration("ALTER TABLE users ADD COLUMN weight DECIMAL(5,2) DEFAULT NULL", "User Weight");
        runMigration("ALTER TABLE users ADD COLUMN skin_tone VARCHAR(50) DEFAULT NULL", "User Skin Tone");
        runMigration("ALTER TABLE users ADD COLUMN body_size VARCHAR(10) DEFAULT NULL", "User Body Size");
        runMigration("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL", "User Avatar URL");
        runMigration("ALTER TABLE users ADD COLUMN gender VARCHAR(20) DEFAULT NULL", "User Gender");

        // Seed Dummy Data for Location (If empty)
        db.query("SELECT COUNT(*) as count FROM province", (e, r) => {
            if (r && r[0].count === 0) {
                console.log("Seeding Location Data...");
                const sql = "INSERT INTO province (provinceName) VALUES ('Sindh'), ('Punjab')";
                db.query(sql, (err, res) => {
                    if (!err) {
                        const sindhId = res.insertId;
                        db.query("INSERT INTO city (province_provinceId, cityName) VALUES (?, ?)", [sindhId, 'Karachi'], (e2, r2) => {
                            if (!e2) {
                                const khiId = r2.insertId;
                                db.query("INSERT INTO location (city_cityId, locationName) VALUES (?, ?)", [khiId, 'Gulshan-e-Iqbal'], (e3, r3) => {
                                    if (!e3) {
                                        const locId = r3.insertId;
                                        db.query("INSERT INTO sublocation (location_LocationId, sublocationName) VALUES (?, ?)", [locId, 'Block 13-D'], (e4, r4) => {
                                            if (!e4) {
                                                const subId = r4.insertId;
                                                db.query("INSERT INTO streetinfo (sublocation_sublocationId, streetName) VALUES (?, ?)", [subId, 'Street 1'], (e5, r5) => {
                                                    if (!e5) {
                                                        const strId = r5.insertId;
                                                        db.query("INSERT INTO building (streetInfo_streetId, buildingName, charges, chargesType) VALUES (?, ?, 0, 'F')", [strId, 'Building A'], (e6, r6) => {
                                                            if (!e6) {
                                                                const bId = r6.insertId;
                                                                db.query("INSERT INTO building_block (building_buildingId, buildingBlockName) VALUES (?, ?)", [bId, 'Block A'], () => { });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});

// Ping DB periodically to keep pool active
setInterval(() => {
    db.query('SELECT 1', (err) => {
        if (err) console.error('Ping error:', err);
    });
}, 60000); // every 60s

// Helper to sanitize filenames
const sanitize = (str) => String(str).replace(/[^a-zA-Z0-9_-]/g, '');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir = 'uploads/';
        if (req.path.includes('profile')) dir += 'profiles/';
        else if (req.path.includes('product')) dir += 'products/';
        else if (req.path.includes('service')) dir += 'services/'; // Added services
        else if (req.path.includes('certificate')) dir += 'certificates/';
        else if (req.path.includes('chat')) dir += 'chats/';
        else if (req.path.includes('identity')) dir += 'identity/';

        // Ensure directory exists (mkdir -p logic handled by shell usually but good to be safe)
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Expect fields: userId (for profile) OR productId, index (for products)
        const ext = path.extname(file.originalname) || '.jpg';

        if (req.path.includes('profile')) {
            const userId = sanitize(req.body.userId || 'unknown');
            cb(null, `${userId}${ext}`);
        } else if (req.path.includes('resume')) {
            const userId = sanitize(req.body.userId || 'unknown');
            cb(null, `${userId}${ext}`); // userId.pdf or userId.jpg
        } else if (req.path.includes('product')) {
            const productId = sanitize(req.body.productId || 'unknown');
            const index = sanitize(req.body.index || '0');
            cb(null, `${productId}-${index}${ext}`);
        } else if (req.path.includes('service')) {
            const serviceId = sanitize(req.body.serviceId || 'unknown');
            // services usually have one image, but let's stick to convention if needed
            // or just serviceId.ext
            cb(null, `${serviceId}${ext}`);
        } else if (req.path.includes('chat')) {
            // sanitize is not available, using simple replace
            const safeName = file.originalname.replace(/[^a-zA-Z0-9_-]/g, '');
            cb(null, `${Date.now()}-${safeName}`);
        } else if (req.path.includes('identity')) {
            const userId = sanitize(req.body.userId || 'unknown');
            cb(null, `${userId}-${Date.now()}${ext}`);
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

            // Handle fatal errors or dropped connections by retrying once if it's an easily recoverable error
            if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET' || err.code === 'ER_LOCK_DEADLOCK') {
                console.warn('Retrying query after connection lost or deadlock...');
                db.query(sql, params, (retryErr, retryResult) => {
                    if (retryErr) {
                        const logSql = "INSERT INTO generic (query, error, url) VALUES (?, ?, ?)";
                        db.query(logSql, [sql, retryErr.message, url], (logErr) => { });
                        if (callback) return callback(retryErr, null);
                    }
                    if (callback) return callback(null, retryResult);
                });
                return; // exit the main callback execution flow
            }

            // Log error to generic table for other errors (Syntax, Duplicate keys etc)
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

    socket.on('register_user', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} registered for notifications`);
    });

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

// Subscription Middleware
const checkSubscription = (req, res, next) => {
    const userId = req.user.id;
    if (req.user.user_type.toLowerCase() !== 'business') return next();

    const query = 'SELECT subscription_expiry_date, is_premium FROM business_details WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return next();
        if (results.length > 0) {
            const { subscription_expiry_date, is_premium } = results[0];
            // Check Expiry Date regardless of is_premium flag (since flag just means they paid once or subscribed)
            // If date is present AND date is in the past -> Expired.
            // If date is NULL -> Not activated/Expired (unless we allow eternal free tier which we don't for business)

            // Allow trial logic: On creation we set expiry date.
            if (!subscription_expiry_date || new Date(subscription_expiry_date) < new Date()) {
                return res.status(402).json({ success: false, message: 'Subscription expired. Payment required.' });
            }
        }
        next();
    });
};

// --- ROUTES ---

// --- GOOGLE AUTHENTICATION ---
// Replace YOUR_WEB_CLIENT_ID with actual client id when available
const GOOGLE_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post('/api/google-login', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'ID Token is required' });
    }

    try {
        // Verify token
        const ticket = await googleClient.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, picture } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account has no email attached.' });
        }

        // Check if user exists
        const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkUserQuery, [email], (err, results) => {
            if (err) {
                console.error('Database error finding Google user:', err);
                return res.status(500).json({ success: false, message: 'Database error' });
            }

            if (results.length > 0) {
                // User exists, log them in
                const user = results[0];
                const token = jwt.sign(
                    { id: user.id, email: user.email, user_type: user.user_type },
                    JWT_SECRET,
                    { expiresIn: '30d' }
                );

                // Don't send password back to the frontend
                const { password, ...userWithoutPassword } = user;
                return res.json({ success: true, message: 'Google login successful', token, user: userWithoutPassword });
            } else {
                // User doesn't exist, auto-register them
                // DB Schema enforces `phone` and `password` to be NOT NULL. Provide dummy/secure random values.

                // Generate a random, highly secure dummy password since they use Google to log in
                const randomPassword = require('crypto').randomBytes(16).toString('hex');
                // Use a generic placeholder phone number, user can update later in profile
                const dummyPhone = '+0000000000';
                // Default to Individual, as user sets real type in Tunnel
                const userType = 'Individual';

                const insertUserQuery = 'INSERT INTO users (name, email, password, phone, user_type, profile_pic_url) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(insertUserQuery, [name, email, randomPassword, dummyPhone, userType, picture || null], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error('Error inserting Google user:', insertErr);
                        return res.status(500).json({ success: false, message: 'Error creating user account' });
                    }

                    const newUserId = insertResult.insertId;
                    const token = jwt.sign(
                        { id: newUserId, email, user_type: userType },
                        JWT_SECRET,
                        { expiresIn: '30d' }
                    );

                    // Construct what the user object looks like for the frontend
                    const newUser = {
                        id: newUserId,
                        name,
                        email,
                        phone: dummyPhone,
                        user_type: userType,
                        profile_pic_url: picture,
                        is_tunnel_completed: 0 // New users must go through tunnel
                    };

                    return res.json({ success: true, message: 'Google registration successful', token, user: newUser });
                });
            }
        });

    } catch (error) {
        console.error('Google token verification error:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired Google Token' });
    }
});

// Helper to create notification
const createNotification_Helper = (userId, title, message, type, relatedId) => {
    const query = 'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, title, message, type, relatedId || null], (err, result) => {
        if (!err && typeof io !== 'undefined') {
            io.to(`user_${userId}`).emit('new_notification', { id: result.insertId, user_id: userId, title, message, type, related_id: relatedId, created_at: new Date(), read_status: 0 });
        }
    });
};

// Discover Products with Pagination & Caching & FTS
app.get('/api/products/discover', async (req, res) => {
    const search = req.query.search || '';
    const cursor = parseInt(req.query.cursor) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || 'All';

    // Cache Key
    const cacheKey = `products:discover:${search}:${cursor}:${limit}:${type}`;

    // Try Cache
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, products: cached, fromCache: true });

    let query = 'SELECT * FROM products WHERE id > ?';
    let params = [cursor];

    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (type === 'Location') {
        // Join logic
        query = `SELECT p.* FROM products p JOIN users u ON p.user_id = u.id WHERE p.id > ? AND u.address LIKE ?`;
        params = [cursor, `%${search}%`];
    }

    query += ' ORDER BY id ASC LIMIT ?';
    params.push(limit);

    dbQuery(query, params, req, async (err, results) => {
        if (err) return res.status(500).json({ success: false });

        // Set Cache (Short TTL 5 mins)
        await setCache(cacheKey, results, 300);

        res.json({ success: true, products: results, nextCursor: results.length > 0 ? results[results.length - 1].id : null });
    });
});

// Discover Users with Pagination
app.get('/api/users/discover', (req, res) => {
    const excludeId = parseInt(req.query.excludeId) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const type = req.query.type || 'All';
    const cursor = parseInt(req.query.cursor) || 0;
    const limit = parseInt(req.query.limit) || 20;

    let query;
    let params;

    if (type === 'Skills') {
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            JOIN skills s ON u.id = s.user_id
            WHERE u.id != ? AND u.id > ? AND s.skill_name LIKE ?
            ORDER BY u.id ASC
            LIMIT ?
        `;
        params = [excludeId, cursor, search, limit];
    } else if (type === 'Location') {
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            LEFT JOIN business_details bd ON u.id = bd.user_id
            WHERE u.id != ? AND u.id > ? AND (u.address LIKE ? OR bd.address LIKE ?)
            ORDER BY u.id ASC
            LIMIT ?
        `;
        params = [excludeId, cursor, search, search, limit];
    } else {
        query = 'SELECT id, name, email, user_type, profile_pic_url FROM users WHERE id != ? AND id > ? AND name LIKE ? ORDER BY id ASC LIMIT ?';
        params = [excludeId, cursor, search, limit];
    }

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, users: results, nextCursor: results.length > 0 ? results[results.length - 1].id : null });
    });
});

// Notifications
app.get('/api/notifications/:userId', verifyToken, (req, res) => {
    if (req.user.id != req.params.userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, notifications: results });
    });
});

app.put('/api/notifications/:id/read', verifyToken, (req, res) => {
    const query = 'UPDATE notifications SET read_status = 1 WHERE id = ? AND user_id = ?';
    dbQuery(query, [req.params.id, req.user.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// Register
app.post('/register', (req, res) => {
    const { email, password, name, phone, mac_address } = req.body;
    if (!email || !password || !phone) return res.status(400).json({ success: false, message: 'Required fields missing' });

    // Password Validation: Min 8 chars, 1 Upper, 1 Lower, 1 Special
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
        });
    }

    // Check if phone already exists
    const checkPhoneQuery = 'SELECT id FROM users WHERE phone = ?';
    dbQuery(checkPhoneQuery, [phone], req, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error during phone validation' });

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Phone number already exists' });
        }

        // Default user_type to 'Individual'
        const query = 'INSERT INTO users (email, password, name, phone, user_type, mac_address, is_tunnel_completed) VALUES (?, ?, ?, ?, ?, ?, 0)';
        dbQuery(query, [email, password, name, phone, req.body.user_type || 'Individual', mac_address || null], req, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email already exists' });
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.json({ success: true, message: 'User registered', userId: result.insertId });
        });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbQuery(query, [email, password], req, (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const user = results[0];
        // Generate Token
        jwt.sign({ id: user.id, email: user.email, user_type: user.user_type }, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) return res.status(500).json({ success: false, message: 'Token generation failed' });
            res.json({ success: true, message: 'Login successful', user: user, token: token });
        });
    });
});

// Update Profile
app.post('/update-profile', verifyToken, (req, res) => {
    const { id, name, phone, email } = req.body;
    // Security: Ensure user can only update their own profile
    if (req.user.id != id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?';
    dbQuery(query, [name, phone, email, id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.post('/api/business/card-settings', verifyToken, (req, res) => {
    const { user_id, card_template, card_custom_details } = req.body;
    const query = `INSERT INTO business_details (user_id, card_template, card_custom_details)
                   VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE card_template=VALUES(card_template), card_custom_details=VALUES(card_custom_details)`;
    dbQuery(query, [user_id, card_template, JSON.stringify(card_custom_details)], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// --- NEW API ENDPOINTS FOR PROFILE ENHANCEMENTS ---

// Get User Full Profile (including education, skills, socials)
app.get('/api/profile/:userId', verifyToken, (req, res) => {
    const userId = req.params.userId;
    const viewerId = req.user.id;

    // Check relationship (Self, Connected, or Stranger)
    const relQuery = `
        SELECT * FROM connections
        WHERE (follower_id = ? AND following_id = ? AND status = 'accepted')
           OR (follower_id = ? AND following_id = ? AND status = 'accepted')
    `;

    db.query(relQuery, [viewerId, userId, userId, viewerId], (relErr, relResults) => {
        const isSelf = (parseInt(userId) === parseInt(viewerId));
        const isConnected = (relResults && relResults.length > 0);

        const queries = `
            SELECT * FROM education WHERE user_id = ?;
            SELECT * FROM social_links WHERE user_id = ?;
            SELECT * FROM certificates WHERE user_id = ?;
            SELECT * FROM business_details WHERE user_id = ?;
            SELECT * FROM payment_methods WHERE user_id = ?;
            SELECT id, name, email, phone, user_type, profile_pic_url, resume_url, address, current_job_title, is_private FROM users WHERE id = ?;
            SELECT * FROM skills WHERE user_id = ?;
        `;

        dbQuery(queries, [userId, userId, userId, userId, userId, userId, userId], req, (err, results) => {
            if (err) return res.status(500).json({ success: false });

            let user = results[5][0];
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // Log Profile View
            if (!isSelf) {
                db.query('INSERT INTO profile_views (profile_id, viewer_id, source) VALUES (?, ?, ?)', [userId, viewerId, 'app_api'], (e) => { });
                createNotification_Helper(userId, 'Profile View', 'Someone recently viewed your profile!', 'info', viewerId);
            }

            // Privacy Check
            if (user.is_private && !isSelf && !isConnected) {
                // Return Restricted Profile
                return res.json({
                    success: true,
                    is_restricted: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        user_type: user.user_type,
                        profile_pic_url: user.profile_pic_url,
                        current_job_title: user.current_job_title,
                        is_private: 1
                    },
                    education: [],
                    socials: [],
                    certificates: [],
                    business: null,
                    payments: [],
                    skills: []
                });
            }

            // Return Full Profile
            res.json({
                success: true,
                is_restricted: false,
                education: results[0],
                socials: results[1],
                certificates: results[2],
                business: results[3][0] || null,
                payments: results[4],
                user: user,
                skills: results[6]
            });
        });
    });
});

app.post('/api/settings/privacy', verifyToken, (req, res) => {
    const { is_private } = req.body;
    const query = 'UPDATE users SET is_private = ? WHERE id = ?';
    dbQuery(query, [is_private ? 1 : 0, req.user.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Privacy settings updated' });
    });
});

app.post('/api/analytics/click', (req, res) => {
    const { link_id, clicker_id } = req.body;
    const query = 'INSERT INTO link_clicks (link_id, clicker_id) VALUES (?, ?)';
    dbQuery(query, [link_id, clicker_id || null], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// --- PUBLIC WEB VIEW (SSR) ---
app.get('/view/:userId', (req, res) => {
    const userId = req.params.userId;
    const queries = `
        SELECT * FROM users WHERE id = ?;
        SELECT * FROM education WHERE user_id = ?;
        SELECT * FROM social_links WHERE user_id = ?;
        SELECT * FROM certificates WHERE user_id = ?;
        SELECT * FROM business_details WHERE user_id = ?;
        SELECT * FROM skills WHERE user_id = ?;
    `;

    dbQuery(queries, [userId, userId, userId, userId, userId, userId], req, (err, results) => {
        if (err || !results[0][0]) return res.status(404).send('User not found');

        // Log View
        dbQuery('INSERT INTO profile_views (profile_id, source) VALUES (?, ?)', [userId, 'web_view'], req, () => { });

        const user = results[0][0];
        const education = results[1];
        const socials = results[2];
        const certificates = results[3];
        const business = results[4][0];
        const skills = results[5];

        const profilePic = user.profile_pic_url ? `/${user.profile_pic_url}` : 'https://via.placeholder.com/150';

        // Render HTML
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${user.name} - Raabtaa Profile</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f7fafc; color: #2d3748; }
                    .container { max-width: 600px; margin: 0 auto; background: white; min-height: 100vh; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: #2b6cb0; color: white; padding: 40px 20px; text-align: center; border-radius: 0 0 20px 20px; }
                    .profile-pic { width: 120px; height: 120px; border-radius: 60px; border: 4px solid white; margin-top: -60px; object-fit: cover; background: white; }
                    .profile-section { text-align: center; padding: 20px; }
                    .name { font-size: 24px; font-weight: bold; margin: 10px 0 5px; }
                    .title { color: #718096; font-size: 16px; margin-bottom: 20px; }
                    .bio { color: #4a5568; margin-bottom: 20px; line-height: 1.6; }
                    .section { padding: 20px; border-top: 1px solid #edf2f7; }
                    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #2b6cb0; }
                    .chip-container { display: flex; flex-wrap: wrap; gap: 8px; }
                    .chip { background: #ebf8ff; color: #2b6cb0; padding: 6px 12px; border-radius: 15px; font-size: 14px; }
                    .social-link { display: block; padding: 12px; margin-bottom: 10px; background: #edf2f7; color: #4a5568; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 500; transition: background 0.2s; }
                    .social-link:hover { background: #e2e8f0; }
                    .footer { text-align: center; padding: 20px; color: #a0aec0; font-size: 12px; }
                    .btn { display: inline-block; background: #2b6cb0; color: white; padding: 10px 20px; border-radius: 20px; text-decoration: none; font-weight: bold; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Raabtaa</h1>
                    </div>
                    <div class="profile-section">
                        <img src="${profilePic}" alt="Profile" class="profile-pic">
                        <div class="name">${user.name}</div>
                        <div class="title">${user.current_job_title || (business ? business.business_type : 'Individual')}</div>
                        ${business ? `<div class="bio">${business.description || ''}</div>` : ''}

                        <a href="tel:${user.phone}" class="btn">Contact</a>
                    </div>

                    ${socials.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Connect</div>
                        ${socials.map(s => `<a href="${s.url}" target="_blank" class="social-link" onclick="logClick(${s.id})">${s.platform}</a>`).join('')}
                    </div>
                    ` : ''}

                    ${skills.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Skills</div>
                        <div class="chip-container">
                            ${skills.map(s => `<div class="chip">${s.skill_name}</div>`).join('')}
                        </div>
                    </div>
                    ` : ''}

                    ${education.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Education</div>
                        ${education.map(e => `
                            <div style="margin-bottom: 10px;">
                                <strong>${e.degree}</strong><br>
                                <span style="color: #718096;">${e.institution} (${e.year})</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    <div class="footer">
                        Powered by Raabtaa Digital Ecosystem
                    </div>
                </div>

                <script>
                    function logClick(linkId) {
                        fetch('/api/analytics/click', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ link_id: linkId })
                        });
                    }
                </script>
            </body>
            </html>
        `;

        res.send(html);
    });
});

app.get('/api/orders/customer/:userId', (req, res) => {
    const query = `
        SELECT o.*, u.name as seller_name
        FROM orders o
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        if (results.length === 0) return res.json({ success: true, orders: [] });

        const orderIds = results.map(o => o.id);
        const itemQuery = `
            SELECT oi.*, p.name as product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
        `;
        db.query(itemQuery, [orderIds], (err2, items) => {
            if (err2) return res.status(500).json({ success: false });

            const orders = results.map(o => ({
                ...o,
                items: items.filter(i => i.order_id === o.id)
            }));
            res.json({ success: true, orders });
        });
    });
});

app.post('/api/education', (req, res) => {
    const { user_id, degree, institution, year, type } = req.body;
    const query = 'INSERT INTO education (user_id, degree, institution, year, type) VALUES (?, ?, ?, ?, ?)';
    dbQuery(query, [user_id, degree, institution, year, type || 'Degree'], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId, education: { id: result.insertId, user_id, degree, institution, year, type: type || 'Degree' } });
    });
});

app.get('/api/education/:userId', (req, res) => {
    const query = 'SELECT * FROM education WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, education: results });
    });
});

app.delete('/api/education/:id', (req, res) => {
    const query = 'DELETE FROM education WHERE id = ?';
    dbQuery(query, [req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
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
    const { user_id, description, industry, category, location_lat, location_lng, address, payment_methods, socials, operating_hours, delivery_radius } = req.body;

    // Save business details
    const bizQuery = `INSERT INTO business_details (user_id, description, industry, category, location_lat, location_lng, address, operating_hours, delivery_radius)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                      ON DUPLICATE KEY UPDATE description=?, industry=?, category=?, location_lat=?, location_lng=?, address=?, operating_hours=?, delivery_radius=?`;

    dbQuery(bizQuery, [
        user_id, description, industry, category, location_lat, location_lng, address, operating_hours ? JSON.stringify(operating_hours) : null, delivery_radius || null,
        description, industry, category, location_lat, location_lng, address, operating_hours ? JSON.stringify(operating_hours) : null, delivery_radius || null
    ], req, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to save business details' });

        // Save Payment Methods if any
        if (payment_methods && payment_methods.length > 0) {
            const payValues = payment_methods.map(p => [user_id, p.provider, p.account_number, p.account_title]);
            db.query('INSERT INTO payment_methods (user_id, provider, account_number, account_title) VALUES ?', [payValues], (e) => {
                if (e) console.error("Payment methods save error", e);
            });
        }

        // Save Socials if any (and passed here)
        if (socials && socials.length > 0) {
            const socValues = socials.map(s => [user_id, s.platform, s.url]);
            db.query('INSERT INTO social_links (user_id, platform, url) VALUES ?', [socValues], (e) => {
                if (e) console.error("Socials save error", e);
            });
        }

        res.json({ success: true, message: 'Onboarding complete' });
    });
});

app.post('/api/business/subscribe', verifyToken, (req, res) => {
    // 1. Calculate new expiry (NOW + 30 days)
    // 2. Set is_premium = 1
    const userId = req.user.id;
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 30);

    const query = 'UPDATE business_details SET is_premium = 1, subscription_expiry_date = ? WHERE user_id = ?';
    dbQuery(query, [newExpiry, userId], req, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Subscription failed' });

        // Notify
        createNotification_Helper(userId, 'Subscription Active', 'You are now a Premium Business member!', 'info', null);

        res.json({ success: true, message: 'Subscribed successfully', expiry: newExpiry });
    });
});

// --- CHAT API ---

app.post('/api/chats/initiate', (req, res) => {
    const { user1_id, user2_id, order_id } = req.body;

    // If order_id is provided, check for existing chat for this order
    if (order_id) {
        const checkOrderChat = 'SELECT * FROM chats WHERE order_id = ?';
        dbQuery(checkOrderChat, [order_id], req, (err, results) => {
            if (err) return res.status(500).json({ success: false });
            if (results.length > 0) {
                return res.json({ success: true, chatId: results[0].id });
            }
            // Create new chat linked to order
            createChat(user1_id, user2_id, order_id);
        });
        return;
    }

    // Fallback: Check if generic chat exists
    const checkQuery = 'SELECT * FROM chats WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)';
    dbQuery(checkQuery, [user1_id, user2_id, user2_id, user1_id], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        if (results.length > 0) {
            res.json({ success: true, chatId: results[0].id });
        } else {
            createChat(user1_id, user2_id, null);
        }
    });

    function createChat(u1, u2, oId) {
        const createQuery = 'INSERT INTO chats (user1_id, user2_id, order_id) VALUES (?, ?, ?)';
        dbQuery(createQuery, [u1, u2, oId], req, (err2, result) => {
            if (err2) return res.status(500).json({ success: false });
            res.json({ success: true, chatId: result.insertId });
        });
    }
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

app.post('/api/upload/resume', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const userId = req.body.userId;
    const fileUrl = `uploads/resumes/${req.file.filename}`;

    // Update DB if userId is provided
    if (userId) {
        const query = 'UPDATE users SET resume_url = ? WHERE id = ?';
        dbQuery(query, [fileUrl, userId], req, (err) => {
            if (err) console.error("Failed to update resume url in db");
            res.json({ success: true, message: 'Resume uploaded', filePath: fileUrl });
        });
    } else {
        res.json({ success: true, message: 'Resume uploaded', filePath: fileUrl });
    }
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

app.post('/api/upload/service', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const serviceId = req.body.serviceId;
    const fileUrl = `uploads/services/${req.file.filename}`;

    const query = 'UPDATE services SET image_url = ? WHERE id = ?';
    dbQuery(query, [fileUrl, serviceId], req, (err) => {
        res.json({ success: true, message: 'Service image uploaded', filePath: fileUrl });
    });
});

app.post('/api/upload/chat', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = `uploads/chats/${req.file.filename}`;
    res.json({ success: true, message: 'Chat image uploaded', filePath: fileUrl });
});

app.post('/api/identity/scan', upload.single('scan'), verifyToken, async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No scan file uploaded' });

    try {
        await IdentityScan.create({
            user_id: req.user.id,
            scan_file_url: req.file.path,
            status: 'verified', // Auto-verify for MVP/Demo flow as we don't have real AI backend connected yet
            meta_data: JSON.stringify({
                originalname: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            })
        });
        res.json({ success: true, message: 'Identity verified' });
    } catch (err) {
        console.error("Identity Scan Error:", err);
        res.status(500).json({ success: false, message: 'Processing failed' });
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
    const excludeId = parseInt(req.query.excludeId) || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const type = req.query.type || 'All';
    const cursor = parseInt(req.query.cursor) || 0;
    const limit = parseInt(req.query.limit) || 20;

    let query;
    let params;

    if (type === 'Skills') {
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            JOIN skills s ON u.id = s.user_id
            WHERE u.id != ? AND u.id > ? AND s.skill_name LIKE ?
            ORDER BY u.id ASC
            LIMIT ?
        `;
        params = [excludeId, cursor, search, limit];
    } else if (type === 'Location') {
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            LEFT JOIN business_details bd ON u.id = bd.user_id
            WHERE u.id != ? AND u.id > ? AND (u.address LIKE ? OR bd.address LIKE ?)
            ORDER BY u.id ASC
            LIMIT ?
        `;
        params = [excludeId, cursor, search, search, limit];
    } else {
        query = 'SELECT id, name, email, user_type, profile_pic_url FROM users WHERE id != ? AND id > ? AND name LIKE ? ORDER BY id ASC LIMIT ?';
        params = [excludeId, cursor, search, limit];
    }

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, users: results, nextCursor: results.length > 0 ? results[results.length - 1].id : null });
    });
});

app.get('/api/products/discover', async (req, res) => {
    // Redundant declaration here just to match structure if needed, but removed to avoid dupes since defined above
    // Keeping defined above
});

app.get('/api/product/:id', (req, res) => {
    const query = 'SELECT p.*, u.name as seller_name, u.profile_pic_url as seller_pic FROM products p JOIN users u ON p.user_id = u.id WHERE p.id = ?';
    dbQuery(query, [req.params.id], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product: results[0] });
    });
});

// --- PRODUCTS & INVENTORY ---

app.post('/api/products', verifyToken, checkSubscription, (req, res) => {
    const { user_id, name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers, unit, addons } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'INSERT INTO products (user_id, name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers, unit, addons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    dbQuery(query, [
        user_id,
        name,
        price,
        description || '',
        image_url || '',
        stock_quantity || 0,
        variants ? JSON.stringify(variants) : null,
        delivery_fee || 0,
        is_returnable !== undefined ? is_returnable : 1,
        wholesale_tiers ? JSON.stringify(wholesale_tiers) : null,
        unit || null,
        addons ? JSON.stringify(addons) : null
    ], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Product added', id: result.insertId });
    });
});

app.delete('/api/products/:id', verifyToken, (req, res) => {
    const query = 'DELETE FROM products WHERE id = ? AND user_id = ?';
    dbQuery(query, [req.params.id, req.user.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Product deleted' });
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

// --- SERVICES ---

app.post('/api/services', verifyToken, checkSubscription, (req, res) => {
    const { user_id, name, description, price, duration_mins, image_url, service_type, service_location, pricing_structure, cancellation_policy, auto_approve, category } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'INSERT INTO services (user_id, name, description, price, duration_mins, image_url, service_type, service_location, pricing_structure, cancellation_policy, auto_approve, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    dbQuery(query, [
        user_id,
        name,
        description,
        price || 0,
        duration_mins,
        image_url || '',
        service_type || 'Hourly',
        service_location || 'OnSite',
        pricing_structure ? JSON.stringify(pricing_structure) : null,
        cancellation_policy || '',
        auto_approve ? 1 : 0,
        category || ''
    ], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Service added', id: result.insertId });
    });
});

app.get('/api/services/discover', (req, res) => {
    const searchTerm = req.query.search;
    const type = req.query.type || 'All';
    const searchPattern = searchTerm ? `%${searchTerm}%` : '%';

    let query;
    let params;

    if (type === 'Skills') {
        // Services don't match skills -> Return empty
        return res.json({ success: true, services: [] });
    } else if (type === 'Location') {
        query = `
            SELECT s.*
            FROM services s
            JOIN users u ON s.user_id = u.id
            WHERE u.address LIKE ?
            LIMIT 50
        `;
        params = [searchPattern];
    } else {
        // Default: Search by Name/Desc
        if (searchTerm) {
            query = 'SELECT * FROM services WHERE name LIKE ? OR description LIKE ? LIMIT 50';
            params = [searchPattern, searchPattern];
        } else {
            query = 'SELECT * FROM services LIMIT 50';
            params = [];
        }
    }

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, services: results });
    });
});

app.get('/api/service/:id', (req, res) => {
    const query = 'SELECT s.*, u.name as provider_name, u.profile_pic_url as provider_pic FROM services s JOIN users u ON s.user_id = u.id WHERE s.id = ?';
    dbQuery(query, [req.params.id], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, service: results[0] });
    });
});

app.get('/api/services/:userId', (req, res) => {
    const query = 'SELECT * FROM services WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, services: results });
    });
});

app.put('/api/services/:id', verifyToken, (req, res) => {
    const { name, description, price, duration_mins, service_type, service_location, pricing_structure, cancellation_policy, auto_approve, category } = req.body;
    const query = 'UPDATE services SET name = ?, description = ?, price = ?, duration_mins = ?, service_type = ?, service_location = ?, pricing_structure = ?, cancellation_policy = ?, auto_approve = ?, category = ? WHERE id = ?';
    dbQuery(query, [
        name,
        description,
        price,
        duration_mins,
        service_type,
        service_location,
        pricing_structure ? JSON.stringify(pricing_structure) : null,
        cancellation_policy,
        auto_approve ? 1 : 0,
        category || '',
        req.params.id
    ], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.post('/api/staff', verifyToken, (req, res) => {
    const { user_id, name, role } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'INSERT INTO staff (provider_id, name, role) VALUES (?, ?, ?)';
    dbQuery(query, [user_id, name, role], req, (err, result) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, id: result.insertId, staff: { id: result.insertId, provider_id: user_id, name, role } });
    });
});

app.get('/api/staff/:providerId', (req, res) => {
    const query = 'SELECT * FROM staff WHERE provider_id = ?';
    dbQuery(query, [req.params.providerId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, staff: results });
    });
});

app.delete('/api/staff/:id', verifyToken, (req, res) => {
    // Should verify ownership, simplified for now
    const query = 'DELETE FROM staff WHERE id = ?';
    dbQuery(query, [req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.delete('/api/services/:id', verifyToken, (req, res) => {
    const query = 'DELETE FROM services WHERE id = ?';
    dbQuery(query, [req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
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

app.post('/api/orders', verifyToken, (req, res) => {
    const { seller_id, buyer_id, items, payment_method, delivery_fee, instructions } = req.body;
    // items: [{ product_id, quantity, price, variant, selected_addons }]

    // Calculate total
    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal + (delivery_fee || 0);

    const orderQuery = 'INSERT INTO orders (seller_id, buyer_id, total_amount, status, payment_method, delivery_fee, instructions) VALUES (?, ?, ?, "pending", ?, ?, ?)';
    dbQuery(orderQuery, [seller_id, buyer_id || null, total, payment_method || 'cod', delivery_fee || 0, instructions || ''], req, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to create order' });

        const orderId = result.insertId;
        const itemValues = items.map(item => [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
            item.variant ? JSON.stringify(item.variant) : null,
            item.selected_addons ? JSON.stringify(item.selected_addons) : null
        ]);

        const itemQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price, variant, selected_addons) VALUES ?';
        db.query(itemQuery, [itemValues], (itemErr) => {
            if (itemErr) {
                console.error("Order Items Error:", itemErr);
                return res.status(500).json({ success: false, message: 'Partial failure' });
            }

            // Update stock
            items.forEach(item => {
                db.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
            });

            // Notify Seller
            createNotification_Helper(seller_id, 'New Order Received', `You have a new order of ${total} PKR`, 'order', orderId);

            // Emit NEW_ORDER event to seller's room
            if (typeof io !== 'undefined') {
                io.to(`user_${seller_id}`).emit('new_order', {
                    id: orderId,
                    buyer_id,
                    total_amount: total,
                    status: 'pending',
                    payment_method: payment_method || 'cod',
                    delivery_fee: delivery_fee || 0,
                    created_at: new Date()
                });
            }

            res.json({ success: true, message: 'Order created', orderId });
        });
    });
});

app.get('/api/user/counts/:userId', (req, res) => {
    const userId = req.params.userId;
    const queries = `
        SELECT COUNT(*) as count FROM orders WHERE seller_id = ? AND status = 'pending';
        SELECT COUNT(*) as count FROM orders WHERE buyer_id = ? AND status = 'pending';
        SELECT COUNT(*) as count FROM appointments WHERE (provider_id = ? OR customer_id = ?) AND status IN ('pending', 'confirmed') AND appointment_date >= NOW();
        SELECT COUNT(*) as count FROM chats WHERE user1_id = ? OR user2_id = ?;
    `;
    dbQuery(queries, [userId, userId, userId, userId, userId, userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({
            success: true,
            sales_pending: results[0][0].count,
            purchases_pending: results[1][0].count,
            appointments_upcoming: results[2][0].count,
            messages_active: results[3][0].count
        });
    });
});

app.put('/api/orders/:orderId/status', (req, res) => {
    const { status, rider_name, rider_phone } = req.body; // pending, accepted, preparing, out_for_delivery, completed, cancelled

    let query = 'UPDATE orders SET status = ?';
    const params = [status];

    if (rider_name) {
        query += ', rider_name = ?';
        params.push(rider_name);
    }
    if (rider_phone) {
        query += ', rider_phone = ?';
        params.push(rider_phone);
    }

    query += ' WHERE id = ?';
    params.push(req.params.orderId);

    dbQuery(query, params, req, (err) => {
        if (err) return res.status(500).json({ success: false });

        // Notify Buyer
        db.query('SELECT buyer_id FROM orders WHERE id = ?', [req.params.orderId], (e, r) => {
            if (!e && r.length > 0 && r[0].buyer_id) {
                let msg = `Your order status is now: ${status}`;
                if (status === 'preparing') msg = 'Your order is being prepared.';
                if (status === 'out_for_delivery') msg = `Your order is out for delivery! Rider: ${rider_name || 'Assigned'}`;
                if (status === 'completed') msg = 'Your order has been marked as completed. Please rate your experience!';

                createNotification_Helper(r[0].buyer_id, 'Order Update', msg, 'order', req.params.orderId);
            }
        });

        res.json({ success: true, message: 'Order status updated' });
    });
});

app.post('/api/orders/:id/rate', verifyToken, (req, res) => {
    const { rating, review } = req.body;
    const orderId = req.params.id;
    const userId = req.user.id;

    // Verify ownership
    dbQuery('SELECT buyer_id FROM orders WHERE id = ?', [orderId], req, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
        if (results[0].buyer_id !== userId) return res.status(403).json({ success: false, message: 'Unauthorized' });

        const query = 'UPDATE orders SET rating = ?, review = ? WHERE id = ?';
        dbQuery(query, [rating, review, orderId], req, (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Rating submitted' });
        });
    });
});

app.get('/api/orders/business/:userId', (req, res) => {
    const status = req.query.status;
    let query = `
        SELECT o.*, u.name as buyer_name, u.phone as buyer_phone
        FROM orders o
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ?
    `;
    const params = [req.params.userId];

    if (status && status !== 'All') {
        query += ' AND o.status = ?';
        params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        // For each order, fetch items (simplistic N+1 solution for now, or use GROUP_CONCAT)
        // Let's do a second query to get all items for these orders
        if (results.length === 0) return res.json({ success: true, orders: [] });

        const orderIds = results.map(o => o.id);
        const itemQuery = `
            SELECT oi.*, p.name as product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
        `;
        db.query(itemQuery, [orderIds], (err2, items) => {
            if (err2) return res.status(500).json({ success: false });

            const orders = results.map(o => ({
                ...o,
                items: items.filter(i => i.order_id === o.id)
            }));
            res.json({ success: true, orders });
        });
    });
});

app.get('/api/business/procurement/:userId', (req, res) => {
    // Smart Aggregation: Sum quantities of pending orders by product
    const query = `
        SELECT p.id, p.name, p.image_url, SUM(oi.quantity) as total_needed
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.seller_id = ? AND o.status = 'pending'
        GROUP BY p.id, p.name, p.image_url
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, procurement: results });
    });
});

app.get('/api/reports/sales/:userId', (req, res) => {
    // Returns daily sales for the last 30 days (COMPLETED ONLY)
    const query = `
        SELECT
            DATE(created_at) as date,
            COUNT(*) as count,
            SUM(total_amount) as total
        FROM orders
        WHERE seller_id = ? AND status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });

        // Also get Monthly total (COMPLETED ONLY)
        const monthQuery = `
            SELECT SUM(total_amount) as total
            FROM orders
            WHERE seller_id = ? AND status = 'completed' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())
        `;

        // Pending/Cancelled Stats
        const statsQuery = `
            SELECT
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
                SUM(CASE WHEN status = 'cancelled' THEN total_amount ELSE 0 END) as cancelled_amount
            FROM orders
            WHERE seller_id = ?
        `;

        dbQuery(monthQuery, [req.params.userId], req, (err2, monthResult) => {
            dbQuery(statsQuery, [req.params.userId], req, (err3, statsResult) => {
                res.json({
                    success: true,
                    daily: results,
                    monthlyTotal: monthResult[0]?.total || 0,
                    stats: statsResult[0] || { pending_count: 0, pending_amount: 0, cancelled_count: 0, cancelled_amount: 0 }
                });
            });
        });
    });
});

// --- APPOINTMENTS (For Calendar) ---

app.post('/api/appointments', (req, res) => {
    const { provider_id, customer_id, service_id, appointment_date, duration_mins, staff_id } = req.body;

    // Check Availability (Blocked Days)
    // Extract YYYY-MM-DD from appointment_date (Assuming 'YYYY-MM-DD HH:mm:ss' or ISO)
    const datePart = appointment_date.split(' ')[0].split('T')[0];

    dbQuery('SELECT status FROM availability WHERE user_id = ? AND date = ?', [provider_id, datePart], req, (availErr, availRes) => {
        if (!availErr && availRes.length > 0 && availRes[0].status === 'busy') {
            return res.status(409).json({ success: false, message: 'Provider is unavailable on this date.' });
        }

        // Check for auto-approve if service_id is provided
        const checkServiceQuery = 'SELECT auto_approve FROM services WHERE id = ?';
        dbQuery(checkServiceQuery, [service_id], req, (err, results) => {
            let status = 'pending';
            if (!err && results.length > 0 && results[0].auto_approve) {
                status = 'confirmed';
            }

            const query = 'INSERT INTO appointments (provider_id, customer_id, service_id, appointment_date, duration_mins, status, staff_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
            dbQuery(query, [provider_id, customer_id, service_id || null, appointment_date, duration_mins || 30, status, staff_id || null], req, (err, result) => {
                if (err) return res.status(500).json({ success: false });

                // Notify Provider
                createNotification(provider_id, 'New Appointment Request', `New appointment request for ${datePart}`, 'appointment', result.insertId);

                res.json({ success: true, message: status === 'confirmed' ? 'Appointment confirmed!' : 'Request sent', id: result.insertId, status });
            });
        });
    });
});

app.get('/api/appointments/:userId', (req, res) => {
    // Get all appointments (both as provider and customer)
    const query = `
        SELECT a.*,
            u1.name as provider_name,
            u2.name as customer_name,
            s.name as service_name
        FROM appointments a
        JOIN users u1 ON a.provider_id = u1.id
        JOIN users u2 ON a.customer_id = u2.id
        LEFT JOIN services s ON a.service_id = s.id
        WHERE a.provider_id = ? OR a.customer_id = ?
    `;
    dbQuery(query, [req.params.userId, req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, appointments: results });
    });
});

app.get('/api/appointments/slots/:providerId', (req, res) => {
    // Get booked slots for a specific date
    // Query param: date (YYYY-MM-DD)
    const date = req.query.date;
    if (!date) return res.status(400).json({ success: false, message: 'Date required' });

    const query = `
        SELECT appointment_date, duration_mins
        FROM appointments
        WHERE provider_id = ?
        AND DATE(appointment_date) = ?
        AND status != 'cancelled'
    `;
    dbQuery(query, [req.params.providerId, date], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        // Return busy slots. Frontend will calculate free slots.
        res.json({ success: true, busySlots: results });
    });
});

app.put('/api/appointments/:id/status', (req, res) => {
    const { status } = req.body; // pending, confirmed, cancelled
    const query = 'UPDATE appointments SET status = ? WHERE id = ?';
    dbQuery(query, [status, req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Status updated' });
    });
});

// Biometric Login (Existing)
app.post('/biometric/login', (req, res) => {
    const { mac_address } = req.body;
    if (!mac_address) return res.status(400).json({ success: false });

    const query = 'SELECT * FROM users WHERE mac_address = ?';
    dbQuery(query, [mac_address], req, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ success: false });

        const user = results[0];
        jwt.sign({ id: user.id, email: user.email, user_type: user.user_type }, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) return res.status(500).json({ success: false, message: 'Token generation failed' });
            res.json({ success: true, user: user, token: token });
        });
    });
});

// --- TUNNEL ENDPOINTS ---

app.post('/api/tunnel/update-type', (req, res) => {
    const { user_id, user_type } = req.body;
    const query = 'UPDATE users SET user_type = ? WHERE id = ?';
    dbQuery(query, [user_type, user_id], req, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update user type' });
        res.json({ success: true, message: 'User type updated' });
    });
});

app.post('/api/tunnel/personal/skills', (req, res) => {
    const { user_id, skills } = req.body; // skills is array of strings
    if (!skills || !Array.isArray(skills)) return res.status(400).json({ success: false });

    // Clear existing skills first? Or append? Assuming replace for tunnel.
    db.query('DELETE FROM skills WHERE user_id = ?', [user_id], (err) => {
        if (err) return res.status(500).json({ success: false });

        if (skills.length === 0) return res.json({ success: true });

        const values = skills.map(s => [user_id, s]);
        const query = 'INSERT INTO skills (user_id, skill_name) VALUES ?';
        db.query(query, [values], (err2) => {
            if (err2) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});

app.post('/api/tunnel/avatar-setup', verifyToken, (req, res) => {
    // Only update avatar properties
    const { height, weight, skin_tone, body_size, avatar_url, user_id, gender } = req.body;

    // Fallback: If no custom avatar_url passed, use a default doppl-like base model
    const finalAvatar = avatar_url || "https://models.readyplayer.me/64b73b5b699276c1a8264e03.glb";

    const query = 'UPDATE users SET height = ?, weight = ?, skin_tone = ?, body_size = ?, avatar_url = ?, gender = ? WHERE id = ?';
    dbQuery(query, [height, weight, skin_tone, body_size, finalAvatar, gender || null, user_id], req, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update avatar details' });
        res.json({ success: true, message: 'Avatar setup complete' });
    });
});

app.post('/api/tunnel/personal/additional', (req, res) => {
    const { user_id, username, gender, interests } = req.body;
    // interests is array, store as JSON
    const query = 'UPDATE users SET username = ?, gender = ?, interests = ? WHERE id = ?';
    dbQuery(query, [username, gender, JSON.stringify(interests), user_id], req, (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Username already taken' });
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true });
    });
});

app.post('/api/tunnel/personal/details', (req, res) => {
    const { user_id, address, street_id, current_job_title } = req.body;
    const query = 'UPDATE users SET address = ?, street_id = ?, current_job_title = ? WHERE id = ?';
    dbQuery(query, [address, street_id || null, current_job_title, user_id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

app.post('/api/tunnel/complete', (req, res) => {
    const { user_id } = req.body;
    const query = 'UPDATE users SET is_tunnel_completed = 1 WHERE id = ?';
    dbQuery(query, [user_id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Tunnel completed' });
    });
});

app.post('/api/tunnel/revert', (req, res) => {
    const { user_id } = req.body;
    const query = 'UPDATE users SET is_tunnel_completed = 0 WHERE id = ?';
    dbQuery(query, [user_id], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: 'Tunnel reverted' });
    });
});

app.post('/api/tunnel/business/location', async (req, res) => {
    const { user_id, address, street_id, location_lat, location_lng } = req.body;
    try {
        await BusinessDetails.upsert({
            user_id: user_id,
            address: address,
            street_id: street_id || null,
            location_lat: location_lat,
            location_lng: location_lng
        });
        res.json({ success: true });
    } catch (err) {
        console.error("Sequelize Error:", err);
        res.status(500).json({ success: false });
    }
});

app.post('/api/tunnel/business/type', (req, res) => {
    const { user_id, business_type, description, payment_methods, socials, phone, email } = req.body;

    // Update business_details
    const query = `INSERT INTO business_details (user_id, business_type, description)
                   VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE business_type=VALUES(business_type), description=VALUES(description)`;

    dbQuery(query, [user_id, business_type, description], req, (err) => {
        if (err) return res.status(500).json({ success: false });

        // Update Payment Methods
        // Simplification: Clear and re-insert or just append?
        // Tunnel usually implies setting up fresh. Let's delete existing and insert.
        if (payment_methods && payment_methods.length > 0) {
            db.query('DELETE FROM payment_methods WHERE user_id = ?', [user_id], (e) => {
                if (!e) {
                    const payValues = payment_methods.map(p => [user_id, p.provider, p.account_number, p.account_title]);
                    db.query('INSERT INTO payment_methods (user_id, provider, account_number, account_title) VALUES ?', [payValues], (e2) => {
                        if (e2) console.error("Payment methods save error", e2);
                    });
                }
            });
        }

        // Update Socials (Contact info might be here too if formatted as socials)
        // Or if phone/email are in users table, we update them there?
        // The screen has "Phone" and "Email".
        if (phone || email) {
            const userUpdate = 'UPDATE users SET phone = COALESCE(?, phone), email = COALESCE(?, email) WHERE id = ?';
            db.query(userUpdate, [phone, email, user_id], (e) => {
                if (e) console.error("User contact update error", e);
            });
        }

        res.json({ success: true });
    });
});

app.post('/api/tunnel/business/industry', (req, res) => {
    const { user_id, industry, category } = req.body;
    const query = `INSERT INTO business_details (user_id, industry, category)
                   VALUES (?, ?, ?)
                   ON DUPLICATE KEY UPDATE industry=VALUES(industry), category=VALUES(category)`;
    dbQuery(query, [user_id, industry, category], req, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
});

// --- NEW LOCATION APIS ---

app.get('/api/provinces', (req, res) => {
    dbQuery('SELECT * FROM province', [], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, provinces: results });
    });
});

app.get('/api/cities/:provinceId', (req, res) => {
    dbQuery('SELECT * FROM city WHERE province_provinceId = ?', [req.params.provinceId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, cities: results });
    });
});

app.get('/api/locations/:cityId', (req, res) => {
    dbQuery('SELECT * FROM location WHERE city_cityId = ?', [req.params.cityId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, locations: results });
    });
});

app.get('/api/sublocations/:locationId', (req, res) => {
    dbQuery('SELECT * FROM sublocation WHERE location_LocationId = ?', [req.params.locationId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, sublocations: results });
    });
});

app.get('/api/streets/:sublocationId', (req, res) => {
    dbQuery('SELECT * FROM streetinfo WHERE sublocation_sublocationId = ?', [req.params.sublocationId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, streets: results });
    });
});

app.get('/api/buildings/:streetId', (req, res) => {
    dbQuery('SELECT * FROM building WHERE streetInfo_streetId = ?', [req.params.streetId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, buildings: results });
    });
});

app.get('/api/building-blocks/:buildingId', (req, res) => {
    dbQuery('SELECT * FROM building_block WHERE building_buildingId = ?', [req.params.buildingId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, buildingBlocks: results });
    });
});

// --- PRODUCT LOGS & FULL UPDATE ---

app.put('/api/products/:id', verifyToken, (req, res) => {
    const { name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers, unit, addons } = req.body;
    const productId = req.params.id;

    // First get old values for logging
    dbQuery('SELECT * FROM products WHERE id = ?', [productId], req, (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ success: false, message: 'Product not found' });

        const oldProduct = results[0];

        // Log price change if any
        if (price !== undefined && price != oldProduct.price) {
            dbQuery('INSERT INTO product_logs (product_id, old_price, new_price, action) VALUES (?, ?, ?, "price_update")',
                [productId, oldProduct.price, price], req, () => { });
        }

        const query = 'UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, stock_quantity = ?, variants = ?, delivery_fee = ?, is_returnable = ?, wholesale_tiers = ?, unit = ?, addons = ? WHERE id = ?';
        dbQuery(query, [
            name,
            price,
            description,
            image_url,
            stock_quantity,
            variants ? JSON.stringify(variants) : null,
            delivery_fee || 0,
            is_returnable !== undefined ? is_returnable : 1,
            wholesale_tiers ? JSON.stringify(wholesale_tiers) : null,
            unit || null,
            addons ? JSON.stringify(addons) : null,
            productId
        ], req, (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false });
            res.json({ success: true, message: 'Product updated' });
        });
    });
});

app.get('/api/products/:id/logs', verifyToken, (req, res) => {
    // Get logs + sales summary associated with those dates?
    // User wants: "Yesterday 10$ sold 5, Today 15$ sold 2"
    // This is a complex query joining orders.
    // Ideally we want to show a timeline.

    // For MVP, let's return the logs and let frontend merge with sales or do a smart query.
    // Let's try to get sales per day/price period.
    // It's easier to just return the logs and the daily sales, and let the UI visualize it.

    const query = 'SELECT * FROM product_logs WHERE product_id = ? ORDER BY change_date DESC';
    dbQuery(query, [req.params.id], req, (err, logs) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, logs: logs });
    });
});


// --- UPDATE USER ADDITIONAL INFO ---
app.post('/api/tunnel/personal/additional', (req, res) => {
    const { user_id, username, gender, interests } = req.body;

    // Check uniqueness of username
    dbQuery('SELECT id FROM users WHERE username = ? AND id != ?', [username, user_id], req, (err, results) => {
        if (results && results.length > 0) return res.status(409).json({ success: false, message: 'Username taken' });

        const query = 'UPDATE users SET username = ?, gender = ?, interests = ? WHERE id = ?';
        dbQuery(query, [username, gender, JSON.stringify(interests || []), user_id], req, (uErr) => {
            if (uErr) return res.status(500).json({ success: false });
            res.json({ success: true });
        });
    });
});
// --- LOGGING & RAAST API ---

const logApiCall = (endpoint, reqData, resData, status, source = 'Backend') => {
    const query = "INSERT INTO api_logs (endpoint, request_data, response_data, http_status, source) VALUES (?, ?, ?, ?, ?)";
    const reqStr = typeof reqData === 'string' ? reqData : JSON.stringify(reqData);
    const resStr = typeof resData === 'string' ? resData : JSON.stringify(resData);

    // Fire and forget
    db.query(query, [endpoint, reqStr, resStr, status, source], (err) => {
        if (err) console.error("Failed to write to api_logs:", err.message);
    });
};

app.post('/api/logs', (req, res) => {
    const { level, message, details, source } = req.body;
    const httpStatus = level === 'ERROR' ? 500 : 200;

    // Save to api_logs
    logApiCall(`CLIENT_LOG: ${source || 'App'}`, message, details, httpStatus, 'Client');

    // Also save to error_logs if error
    if (level === 'ERROR') {
        dbQuery('INSERT INTO error_logs (level, message, details, source) VALUES (?, ?, ?, ?)',
            [level, message, JSON.stringify(details), source], req, () => { });
    }

    res.json({ success: true });
});

app.post('/api/metadata', (req, res) => {
    const { user_id, device_model, os_version, app_version, ip_address, location_lat, location_lng, meta_data, communication_keywords } = req.body;

    // Store metadata silently
    const query = `INSERT INTO user_metadata (user_id, device_model, os_version, app_version, ip_address, location_lat, location_lng, meta_data, communication_keywords)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    dbQuery(query, [
        user_id || null,
        device_model || 'Unknown',
        os_version || 'Unknown',
        app_version || '1.0.0',
        ip_address || req.ip,
        location_lat || null,
        location_lng || null,
        meta_data ? JSON.stringify(meta_data) : null,
        communication_keywords ? JSON.stringify(communication_keywords) : null
    ], req, (err) => {
        if (err) {
            // Silently fail but log error
            console.error("Metadata Save Error:", err.message);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.post('/api/raast', async (req, res) => {
    const requestData = req.body;
    const endpoint = 'api/raast';

    // RAAST CONFIGURATION
    const RAAST_API_URL = process.env.RAAST_API_URL;
    const RAAST_API_KEY = process.env.RAAST_API_KEY;

    try {
        if (requestData.action === 'merchantInquiry') {
            const ref = requestData.referenceNumber;

            // Basic Format Validation
            if (!/^03[0-9]{9}$/.test(ref)) {
                throw new Error("Invalid Reference Number Format");
            }

            // DIRECT REAL CALL (No Dummy Fallback)
            try {
                const axiosResponse = await axios.post(RAAST_API_URL, {
                    referenceNumber: ref,
                    merchantId: process.env.MERCHANT_ID || 'DEMO_MERCHANT'
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${RAAST_API_KEY}`,
                        'X-Reference-Id': `${Date.now()}`
                    }
                });

                logApiCall(endpoint, requestData, axiosResponse.data, axiosResponse.status);
                return res.json(axiosResponse.data);

            } catch (upstreamError) {
                const errorMessage = upstreamError.response?.data?.message || upstreamError.message;
                logApiCall(endpoint, requestData, { message: errorMessage }, 500);
                // Return the actual error to the user for verification
                return res.status(500).json({ status: "error", message: `Upstream Error: ${errorMessage}`, details: upstreamError.response?.data });
            }

        } else {
            throw new Error("Invalid Action");
        }
    } catch (error) {
        const errorResponse = { status: "error", message: error.message };
        logApiCall(endpoint, requestData, errorResponse, 500);
        return res.status(500).json(errorResponse);
    }
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
