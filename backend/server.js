const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

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
            mac_address VARCHAR(255)
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
            // Reconnect to the specific database
            db.end();
            db = mysql.createConnection({ ...dbConfig, database: 'AppStarter' });
        }
    });
});

// Helper to log to DB internally (optional usage for backend errors)
const logToDb = (level, message, details = '', source = 'Backend') => {
    const query = 'INSERT INTO error_logs (level, message, details, source) VALUES (?, ?, ?, ?)';
    db.query(query, [level, message, typeof details === 'object' ? JSON.stringify(details) : details, source], (err) => {
        if (err) console.error('Failed to write to error_logs:', err);
    });
};

// Helper to execute query and log errors
const dbQuery = (sql, params, reqOrUrl, callback) => {
    db.query(sql, params, (err, result) => {
        if (err) {
            const url = typeof reqOrUrl === 'string' ? reqOrUrl : (reqOrUrl?.originalUrl || 'Unknown');
            // Log error to generic table
            const logSql = "INSERT INTO generic (query, error, url) VALUES (?, ?, ?)";
            // Use a fresh query call here to avoid infinite loops if the log query itself fails (though unlikely with simple structure)
            db.query(logSql, [sql, err.message, url], (logErr) => {
                if (logErr) console.error("Failed to log database error:", logErr);
            });
        }
        // Always execute the original callback
        if (callback) callback(err, result);
    });
};

// Routes

// Register
app.post('/register', (req, res) => {
    const { email, password, name, phone, mac_address } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const query = 'INSERT INTO users (email, password, name, phone, user_type, mac_address) VALUES (?, ?, ?, ?, ?, ?)';
    dbQuery(query, [email, password, name, phone, req.body.user_type || 'individual', mac_address || null], req, (err, result) => {
        if (err) {
            console.error(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Email already exists' });
            }
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'User registered successfully', userId: result.insertId });
    });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    dbQuery(query, [email, password], req, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length > 0) {
            const user = results[0];
            res.json({ success: true, message: 'Login successful', user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Update Profile
app.post('/update-profile', (req, res) => {
    const { id, name, phone, email } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const query = 'UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?';
    dbQuery(query, [name, phone, email, id], req, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

// --- NEW RAABTAA FEATURES ---

// 1. Skills (For Individuals)
app.post('/api/skills', (req, res) => {
    const { user_id, skill_name } = req.body;
    if (!user_id || !skill_name) return res.status(400).json({ success: false, message: 'Missing fields' });

    const query = 'INSERT INTO skills (user_id, skill_name) VALUES (?, ?)';
    dbQuery(query, [user_id, skill_name], req, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Skill added', id: result.insertId });
    });
});

app.get('/api/skills/:userId', (req, res) => {
    const query = 'SELECT * FROM skills WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, skills: results });
    });
});

app.delete('/api/skills/:id', (req, res) => {
    const query = 'DELETE FROM skills WHERE id = ?';
    dbQuery(query, [req.params.id], req, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, message: 'Skill removed' });
    });
});

// 2. Products (For Businesses)
app.post('/api/products', (req, res) => {
    const { user_id, name, price, description, image_url } = req.body;
    if (!user_id || !name || !price) return res.status(400).json({ success: false, message: 'Missing fields' });

    const query = 'INSERT INTO products (user_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)';
    dbQuery(query, [user_id, name, price, description || '', image_url || ''], req, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Product added', id: result.insertId });
    });
});

app.get('/api/products/:userId', (req, res) => {
    const query = 'SELECT * FROM products WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, products: results });
    });
});

// 3. Availability (For Individuals)
app.post('/api/availability', (req, res) => {
    const { user_id, date, status } = req.body; // status: 'free', 'busy'
    const query = 'INSERT INTO availability (user_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?';
    dbQuery(query, [user_id, date, status, status], req, (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, message: 'Availability updated' });
    });
});

app.get('/api/availability/:userId', (req, res) => {
    const query = 'SELECT * FROM availability WHERE user_id = ?';
    dbQuery(query, [req.params.userId], req, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, availability: results });
    });
});

// Biometric Login - Validate MAC Address
app.post('/biometric/login', (req, res) => {
    console.log('=== Biometric Login Request ===');
    console.log('Request body:', req.body);

    const { mac_address } = req.body;
    if (!mac_address) {
        console.log('Missing MAC address');
        return res.status(400).json({ success: false, message: 'MAC address is required' });
    }

    console.log('Looking up user with MAC address:', mac_address);
    const query = 'SELECT * FROM users WHERE mac_address = ?';
    dbQuery(query, [mac_address], req, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length === 0) {
            console.log('No user found with this MAC address');
            return res.status(404).json({
                success: false,
                message: 'Device not recognized. Please register a new account or login with your credentials to verify this device.'
            });
        }

        const user = results[0];
        console.log('User found:', user.email);
        console.log('Biometric login successful for user:', user.id);

        // MAC address found, login successful
        logToDb('INFO', 'Biometric login successful', { userId: user.id }, 'BiometricLogin');
        res.json({ success: true, message: 'Biometric login successful', user });
    });
});

// Logging Endpoint
app.post('/api/logs', (req, res) => {
    const { level, message, details, source } = req.body;
    const query = 'INSERT INTO error_logs (level, message, details, source) VALUES (?, ?, ?, ?)';

    // Log to console as well for immediate dev feedback
    console.log(`[${level}] ${source}: ${message}`, details ? details : '');

    db.query(query, [level, message, typeof details === 'object' ? JSON.stringify(details) : details, source], (err) => {
        if (err) {
            console.error('Failed to save log to DB:', err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} `);
});
