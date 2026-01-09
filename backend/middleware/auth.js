/**
 * JWT 認證中間件
 */
const jwt = require('jsonwebtoken');

/**
 * 驗證 JWT Token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: '未提供認證令牌' 
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: '無效的認證令牌' 
            });
        }
        req.user = user;
        next();
    });
}

/**
 * 可選的認證（用於訪客和已登入用戶）
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

/**
 * 管理員認證
 * 注意：目前資料庫沒有 role 欄位，暫時允許所有已登入用戶作為管理員
 */
function requireAdmin(req, res, next) {
    authenticateToken(req, res, () => {
        // 暫時允許所有已登入用戶作為管理員
        // TODO: 當資料庫有 role 欄位時，檢查 req.user.role === 'admin'
        next();
    });
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin
};

