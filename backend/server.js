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
    const initQuery = `
        CREATE DATABASE IF NOT EXISTS AppStarter;
        USE AppStarter;
        CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;

    db.query(initQuery, (err, result) => {
        if (err) {
            console.error('Error initializing database:', err);
        } else {
            console.log('Database and Users table initialized.');
            // Reconnect to the specific database
            db.end();
            db = mysql.createConnection({ ...dbConfig, database: 'AppStarter' });
        }
    });
});

// Routes

// Register
app.post('/register', (req, res) => {
    const { email, password, name, phone } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const query = 'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)';
    db.query(query, [email, password, name, phone], (err, result) => {
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
    db.query(query, [email, password], (err, results) => {
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
    db.query(query, [name, phone, email, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Profile updated successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${ PORT } `);
});
