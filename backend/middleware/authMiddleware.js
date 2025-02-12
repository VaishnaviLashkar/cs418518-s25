const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;
