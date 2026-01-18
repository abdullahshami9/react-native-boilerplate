const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-very-secure-secret-key-change-this-in-prod'; // In a real app, use ENV variables

const verifyToken = (req, res, next) => {
    // Get token from header
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, JWT_SECRET, (err, authData) => {
            if (err) {
                return res.status(403).json({ success: false, message: 'Invalid or expired token' });
            } else {
                req.user = authData; // Attach user info (id, email, etc.) to request
                next();
            }
        });
    } else {
        // Forbidden
        res.status(401).json({ success: false, message: 'Authentication required' });
    }
};

module.exports = { verifyToken, JWT_SECRET };
