/**
 * 用戶認證路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

/**
 * 用戶註冊
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // 驗證輸入
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '請填寫完整資訊'
            });
        }

        // 驗證郵箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '郵箱格式不正確'
            });
        }

        // 檢查郵箱是否已存在
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '資料庫錯誤',
                    error: err.message
                });
            }

            if (user) {
                return res.status(400).json({
                    success: false,
                    message: '郵箱已被註冊'
                });
            }

            // 加密密碼
            const hashedPassword = await hashPassword(password);
            const userId = uuidv4();
            const now = Date.now();

            // 建立新用戶
            db.run(
                `INSERT INTO users (id, email, password, name, phone, memberLevel, status, registeredAt, lastLoginAt, createdAt, updatedAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, email, hashedPassword, name, phone || '', 'normal', 'active', now, now, now, now],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '註冊失敗',
                            error: err.message
                        });
                    }

                    // 生成 Token
                    const token = generateToken({
                        id: userId,
                        email: email,
                        name: name
                    });

                    res.json({
                        success: true,
                        message: '註冊成功',
                        data: {
                            user: {
                                id: userId,
                                name: name,
                                email: email,
                                phone: phone || '',
                                memberLevel: 'normal'
                            },
                            token: token
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '伺服器錯誤',
            error: error.message
        });
    }
});

/**
 * 用戶登入
 */
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '請填寫郵箱和密碼'
            });
        }

        // 查找用戶
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '資料庫錯誤',
                    error: err.message
                });
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '郵箱或密碼錯誤'
                });
            }

            // 驗證密碼
            const isValid = await comparePassword(password, user.password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: '郵箱或密碼錯誤'
                });
            }

            // 更新最後登入時間
            const now = Date.now();
            db.run('UPDATE users SET lastLoginAt = ?, updatedAt = ? WHERE id = ?', [now, now, user.id]);

            // 生成 Token
            const token = generateToken({
                id: user.id,
                email: user.email,
                name: user.name
            });

            res.json({
                success: true,
                message: '登入成功',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        avatar: user.avatar,
                        memberLevel: user.memberLevel,
                        totalOrders: user.totalOrders,
                        totalSpent: user.totalSpent
                    },
                    token: token
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '伺服器錯誤',
            error: error.message
        });
    }
});

/**
 * 獲取當前用戶資訊
 */
const { authenticateToken } = require('../middleware/auth');

router.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT id, email, name, phone, avatar, memberLevel, totalOrders, totalSpent, quizCompleted FROM users WHERE id = ?', 
        [req.user.id], (err, user) => {
            if (err || !user) {
                return res.status(404).json({
                    success: false,
                    message: '用戶不存在'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        });
});

module.exports = router;

