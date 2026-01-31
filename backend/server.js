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
const sequelize = require('./config/database');
const BusinessDetails = require('./models/BusinessDetails');
const IdentityScan = require('./models/IdentityScan');
const axios = require('axios');

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
db.connect(async (err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL server (Raw).');

    // Initialize Sequelize
    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL via Sequelize.');
        await sequelize.sync(); // Sync models
        console.log('Sequelize models synced.');
    } catch (error) {
        console.error('Unable to connect to the database via Sequelize:', error);
    }

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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
            status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
            payment_method VARCHAR(50) DEFAULT 'cod',
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
    `;

    db.query(initQuery, (err, result) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database and Tables initialized.');
            db.end();
            db = mysql.createConnection({ ...dbConfig, database: 'AppStarter' });

            // Add column if not exists (Hack for existing db)
            db.query("SHOW COLUMNS FROM services LIKE 'category'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN category VARCHAR(100)", () => console.log("Added category to services"));
                }
            });

            db.query("SHOW COLUMNS FROM products LIKE 'stock_quantity'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE products ADD COLUMN stock_quantity INT DEFAULT 0", () => console.log("Added stock_quantity column"));
                }
            });
            db.query("SHOW COLUMNS FROM products LIKE 'variants'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE products ADD COLUMN variants JSON", () => console.log("Added variants column"));
                }
            });
            db.query("SHOW COLUMNS FROM products LIKE 'delivery_fee'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE products ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0", () => console.log("Added delivery_fee column"));
                }
            });
            db.query("SHOW COLUMNS FROM products LIKE 'is_returnable'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE products ADD COLUMN is_returnable BOOLEAN DEFAULT 1", () => console.log("Added is_returnable column"));
                }
            });
            db.query("SHOW COLUMNS FROM products LIKE 'wholesale_tiers'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE products ADD COLUMN wholesale_tiers JSON", () => console.log("Added wholesale_tiers column"));
                }
            });

            // Service & Staff Migrations
            db.query("SHOW COLUMNS FROM services LIKE 'service_type'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN service_type ENUM('Hourly', 'Shift', 'MultiDay') DEFAULT 'Hourly'", () => console.log("Added service_type column"));
                }
            });
            db.query("SHOW COLUMNS FROM services LIKE 'service_location'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN service_location ENUM('OnSite', 'Home', 'Both') DEFAULT 'OnSite'", () => console.log("Added service_location column"));
                }
            });
            db.query("SHOW COLUMNS FROM services LIKE 'pricing_structure'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN pricing_structure JSON", () => console.log("Added pricing_structure column"));
                }
            });
            db.query("SHOW COLUMNS FROM services LIKE 'cancellation_policy'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN cancellation_policy TEXT", () => console.log("Added cancellation_policy column"));
                }
            });
            db.query("SHOW COLUMNS FROM services LIKE 'auto_approve'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN auto_approve BOOLEAN DEFAULT 0", () => console.log("Added auto_approve column"));
                }
            });
            db.query("SHOW TABLES LIKE 'staff'", (e, r) => {
                if (r && r.length === 0) {
                    const createStaff = `CREATE TABLE IF NOT EXISTS staff (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        provider_id INT NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        role VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
                    )`;
                    db.query(createStaff, () => console.log("Created staff table"));
                }
            });
            db.query("SHOW COLUMNS FROM appointments LIKE 'staff_id'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE appointments ADD COLUMN staff_id INT", () => console.log("Added staff_id to appointments"));
                }
            });

            db.query("SHOW COLUMNS FROM users LIKE 'profile_pic_url'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN profile_pic_url VARCHAR(255)", () => console.log("Added profile_pic_url column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'is_tunnel_completed'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN is_tunnel_completed BOOLEAN DEFAULT 0", () => console.log("Added is_tunnel_completed column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'address'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN address TEXT", () => console.log("Added address column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'current_job_title'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN current_job_title VARCHAR(255)", () => console.log("Added current_job_title column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'resume_url'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN resume_url VARCHAR(255)", () => console.log("Added resume_url column"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'is_private'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN is_private BOOLEAN DEFAULT 0", () => console.log("Added is_private column"));
                }
            });
            db.query("SHOW COLUMNS FROM business_details LIKE 'card_template'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE business_details ADD COLUMN card_template VARCHAR(50) DEFAULT 'standard'", () => console.log("Added card_template column"));
                }
            });
            db.query("SHOW COLUMNS FROM business_details LIKE 'card_custom_details'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE business_details ADD COLUMN card_custom_details TEXT", () => console.log("Added card_custom_details column"));
                }
            });
            db.query("SHOW COLUMNS FROM business_details LIKE 'business_type'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE business_details ADD COLUMN business_type VARCHAR(100)", () => console.log("Added business_type column"));
                }
            });
            // Ensure appointments table exists (Hack if creating via initQuery failed previously)
            db.query("SHOW TABLES LIKE 'appointments'", (e, r) => {
                if (r && r.length === 0) {
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

            // --- NEW MIGRATIONS FOR SERVICE/PRODUCT UPDATE ---
            db.query("SHOW COLUMNS FROM orders LIKE 'status'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE orders ADD COLUMN status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending'", () => console.log("Added status to orders"));
                } else {
                    // Update Enum to include 'accepted' if not present (blind update is safe enough here)
                    db.query("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'accepted', 'completed', 'cancelled') DEFAULT 'pending'", () => console.log("Updated status enum"));
                }
            });
            db.query("SHOW COLUMNS FROM orders LIKE 'payment_method'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cod'", () => console.log("Added payment_method to orders"));
                }
            });
            db.query("SHOW COLUMNS FROM appointments LIKE 'service_id'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE appointments ADD COLUMN service_id INT, ADD FOREIGN KEY (service_id) REFERENCES services(id)", () => console.log("Added service_id to appointments"));
                }
            });
            db.query("SHOW COLUMNS FROM appointments LIKE 'duration_mins'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE appointments ADD COLUMN duration_mins INT DEFAULT 30", () => console.log("Added duration_mins to appointments"));
                }
            });
            db.query("SHOW COLUMNS FROM education LIKE 'type'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE education ADD COLUMN type ENUM('Degree', 'Certificate', 'Diploma') DEFAULT 'Degree'", () => console.log("Added type to education"));
                }
            });

            // --- NEW MIGRATIONS FOR TUNNEL & BUSINESS LOGIC ---
            db.query("SHOW COLUMNS FROM users LIKE 'username'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE", () => console.log("Added username to users"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'gender'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN gender VARCHAR(20)", () => console.log("Added gender to users"));
                }
            });
            db.query("SHOW COLUMNS FROM users LIKE 'interests'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE users ADD COLUMN interests JSON", () => console.log("Added interests to users"));
                }
            });
            db.query("SHOW COLUMNS FROM services LIKE 'booking_rules'", (e, r) => {
                if (r && r.length === 0) {
                    db.query("ALTER TABLE services ADD COLUMN booking_rules JSON", () => console.log("Added booking_rules to services"));
                }
            });

            // Seed Dummy Data for Location (If empty)
            db.query("SELECT COUNT(*) as count FROM province", (e, r) => {
                if (r && r[0].count === 0) {
                    console.log("Seeding Location Data...");
                    const sql = "INSERT INTO province (provinceName) VALUES ('Sindh'), ('Punjab')";
                    db.query(sql, (err, res) => {
                        if (!err) {
                            const sindhId = res.insertId; // Assuming first insert is Sindh. Auto-inc might vary but good enough for mvp.
                            // Insert City
                            db.query("INSERT INTO city (province_provinceId, cityName) VALUES (?, ?)", [sindhId, 'Karachi'], (e2, r2) => {
                                if (!e2) {
                                    const khiId = r2.insertId;
                                    // Insert Location
                                    db.query("INSERT INTO location (city_cityId, locationName) VALUES (?, ?)", [khiId, 'Gulshan-e-Iqbal'], (e3, r3) => {
                                        if (!e3) {
                                            const locId = r3.insertId;
                                            // Insert Sublocation
                                            db.query("INSERT INTO sublocation (location_LocationId, sublocationName) VALUES (?, ?)", [locId, 'Block 13-D'], (e4, r4) => {
                                                if (!e4) {
                                                    const subId = r4.insertId;
                                                    // Insert Street
                                                    db.query("INSERT INTO streetinfo (sublocation_sublocationId, streetName) VALUES (?, ?)", [subId, 'Street 1'], () => { });
                                                    db.query("INSERT INTO streetinfo (sublocation_sublocationId, streetName) VALUES (?, ?)", [subId, 'Street 2'], () => { });
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
});

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

// Helper to create notification
const createNotification = (userId, title, message, type, relatedId) => {
    const query = 'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [userId, title, message, type, relatedId || null], (err) => {
        if (err) console.error("Failed to create notification:", err);
    });
};

// Register
app.post('/register', (req, res) => {
    const { email, password, name, phone, mac_address } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Required fields missing' });

    // Default user_type to 'Individual', will be updated in Tunnel
    const query = 'INSERT INTO users (email, password, name, phone, user_type, mac_address, is_tunnel_completed) VALUES (?, ?, ?, ?, ?, ?, 0)';
    dbQuery(query, [email, password, name, phone, req.body.user_type || 'Individual', mac_address || null], req, (err, result) => {
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
        `;

        dbQuery(queries, [userId, userId, userId, userId, userId, userId], req, (err, results) => {
            if (err) return res.status(500).json({ success: false });

            let user = results[5][0];
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });

            // Log Profile View
            if (!isSelf) {
                db.query('INSERT INTO profile_views (profile_id, source) VALUES (?, ?)', [userId, 'app_api'], (e) => { });
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
                    payments: []
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
                user: user
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
    // Simple discover: list all users except self
    const excludeId = req.query.excludeId || 0;
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const type = req.query.type || 'All'; // All, Skills, Location

    let query;
    let params;

    if (type === 'Skills') {
        // Search by skill name
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            JOIN skills s ON u.id = s.user_id
            WHERE u.id != ? AND s.skill_name LIKE ?
            LIMIT 50
        `;
        params = [excludeId, search];
    } else if (type === 'Location') {
        // Search by user address or business address
        query = `
            SELECT DISTINCT u.id, u.name, u.email, u.user_type, u.profile_pic_url
            FROM users u
            LEFT JOIN business_details bd ON u.id = bd.user_id
            WHERE u.id != ? AND (u.address LIKE ? OR bd.address LIKE ?)
            LIMIT 50
        `;
        params = [excludeId, search, search];
    } else {
        // Default: Search by Name
        query = 'SELECT id, name, email, user_type, profile_pic_url FROM users WHERE id != ? AND name LIKE ? LIMIT 50';
        params = [excludeId, search];
    }

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, users: results });
    });
});

app.get('/api/products/discover', (req, res) => {
    const search = req.query.search ? `%${req.query.search}%` : '%';
    const type = req.query.type || 'All';

    let query;
    let params;

    if (type === 'Skills') {
        // Products don't match skills -> Return empty
        return res.json({ success: true, products: [] });
    } else if (type === 'Location') {
        // Match seller address
        query = `
            SELECT p.*
            FROM products p
            JOIN users u ON p.user_id = u.id
            WHERE u.address LIKE ?
            LIMIT 50
        `;
        params = [search];
    } else {
        // Default: Search by Product Name
        query = 'SELECT * FROM products WHERE name LIKE ? LIMIT 50';
        params = [search];
    }

    dbQuery(query, params, req, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, products: results });
    });
});

// --- PRODUCTS & INVENTORY ---

app.post('/api/products', verifyToken, (req, res) => {
    const { user_id, name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers } = req.body;
    if (req.user.id != user_id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const query = 'INSERT INTO products (user_id, name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
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
        wholesale_tiers ? JSON.stringify(wholesale_tiers) : null
    ], req, (err, result) => {
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

// --- SERVICES ---

app.post('/api/services', verifyToken, (req, res) => {
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
    const { seller_id, buyer_id, items, payment_method } = req.body;
    // items: [{ product_id, quantity, price }]

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const orderQuery = 'INSERT INTO orders (seller_id, buyer_id, total_amount, status, payment_method) VALUES (?, ?, ?, "pending", ?)';
    dbQuery(orderQuery, [seller_id, buyer_id || null, total, payment_method || 'cod'], req, (err, result) => {
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

            // Notify Seller
            createNotification(seller_id, 'New Order Received', `You have a new order of ${total} PKR`, 'order', orderId);

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
    const { status } = req.body; // pending, accepted, completed, cancelled
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    dbQuery(query, [status, req.params.orderId], req, (err) => {
        if (err) return res.status(500).json({ success: false });

        // Notify Buyer if completed
        if (status === 'completed') {
            db.query('SELECT buyer_id FROM orders WHERE id = ?', [req.params.orderId], (e, r) => {
                if (!e && r.length > 0 && r[0].buyer_id) {
                    createNotification(r[0].buyer_id, 'Order Completed', 'Your order has been marked as completed.', 'order', req.params.orderId);
                }
            });
        }
        res.json({ success: true, message: 'Order status updated' });
    });
});

app.get('/api/orders/business/:userId', (req, res) => {
    const query = `
        SELECT o.*, u.name as buyer_name, u.phone as buyer_phone
        FROM orders o
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ?
        ORDER BY o.created_at DESC
    `;
    dbQuery(query, [req.params.userId], req, (err, results) => {
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
    const { user_id, address, current_job_title } = req.body;
    const query = 'UPDATE users SET address = ?, current_job_title = ? WHERE id = ?';
    dbQuery(query, [address, current_job_title, user_id], req, (err) => {
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

app.post('/api/tunnel/business/location', async (req, res) => {
    const { user_id, address, location_lat, location_lng } = req.body;
    try {
        await BusinessDetails.upsert({
            user_id: user_id,
            address: address,
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

// --- PRODUCT LOGS & FULL UPDATE ---

app.put('/api/products/:id', verifyToken, (req, res) => {
    const { name, price, description, image_url, stock_quantity, variants, delivery_fee, is_returnable, wholesale_tiers } = req.body;
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

        const query = 'UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, stock_quantity = ?, variants = ?, delivery_fee = ?, is_returnable = ?, wholesale_tiers = ? WHERE id = ?';
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
