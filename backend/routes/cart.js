/**
 * 購物車路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 獲取購物車
 */
router.get('/', optionalAuth, (req, res) => {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    let query, params;

    if (userId) {
        query = 'SELECT * FROM cart_items WHERE userId = ?';
        params = [userId];
    } else if (sessionId) {
        query = 'SELECT * FROM cart_items WHERE sessionId = ?';
        params = [sessionId];
    } else {
        return res.json({
            success: true,
            data: { items: [] }
        });
    }

    db.all(query, params, (err, items) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        // 獲取商品詳情
        if (items.length === 0) {
            return res.json({
                success: true,
                data: { items: [] }
            });
        }

        const productIds = items.map(item => item.productId);
        const placeholders = productIds.map(() => '?').join(',');

        db.all(
            `SELECT * FROM products WHERE id IN (${placeholders})`,
            productIds,
            (err, products) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: '查詢失敗',
                        error: err.message
                    });
                }

                const productMap = {};
                products.forEach(p => productMap[p.id] = p);

                const cartItems = items.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    variant: item.variant,
                    product: productMap[item.productId] || null
                }));

                res.json({
                    success: true,
                    data: { items: cartItems }
                });
            }
        );
    });
});

/**
 * 加入購物車
 */
router.post('/add', optionalAuth, (req, res) => {
    const { productId, quantity = 1, variant } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId || uuidv4();

    if (!productId) {
        return res.status(400).json({
            success: false,
            message: '請提供商品 ID'
        });
    }

    // 檢查商品是否存在
    db.get('SELECT * FROM products WHERE id = ? AND status = ?', [productId, 'active'], (err, product) => {
        if (err || !product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在或已下架'
            });
        }

        // 檢查庫存
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: '庫存不足'
            });
        }

        // 檢查購物車中是否已有該商品
        let checkQuery, checkParams;
        if (userId) {
            checkQuery = 'SELECT * FROM cart_items WHERE userId = ? AND productId = ? AND variant = ?';
            checkParams = [userId, productId, variant || ''];
        } else {
            checkQuery = 'SELECT * FROM cart_items WHERE sessionId = ? AND productId = ? AND variant = ?';
            checkParams = [sessionId, productId, variant || ''];
        }

        db.get(checkQuery, checkParams, (err, existingItem) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '查詢失敗',
                    error: err.message
                });
            }

            const now = Date.now();

            if (existingItem) {
                // 更新數量
                const newQuantity = existingItem.quantity + quantity;
                if (product.stock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: '庫存不足'
                    });
                }

                db.run(
                    'UPDATE cart_items SET quantity = ?, updatedAt = ? WHERE id = ?',
                    [newQuantity, now, existingItem.id],
                    function(err) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: '更新失敗',
                                error: err.message
                            });
                        }

                        res.json({
                            success: true,
                            message: '已加入購物車',
                            data: { sessionId }
                        });
                    }
                );
            } else {
                // 新增項目
                const itemId = uuidv4();
                db.run(
                    'INSERT INTO cart_items (id, userId, sessionId, productId, quantity, variant, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [itemId, userId, userId ? null : sessionId, productId, quantity, variant || '', now, now],
                    function(err) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: '加入失敗',
                                error: err.message
                            });
                        }

                        res.json({
                            success: true,
                            message: '已加入購物車',
                            data: { sessionId }
                        });
                    }
                );
            }
        });
    });
});

/**
 * 更新購物車項目數量
 */
router.put('/:id', optionalAuth, (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    if (!quantity || quantity < 0) {
        return res.status(400).json({
            success: false,
            message: '數量必須大於 0'
        });
    }

    // 查找購物車項目
    let query, params;
    if (userId) {
        query = 'SELECT * FROM cart_items WHERE id = ? AND userId = ?';
        params = [id, userId];
    } else {
        query = 'SELECT * FROM cart_items WHERE id = ? AND sessionId = ?';
        params = [id, sessionId];
    }

    db.get(query, params, (err, item) => {
        if (err || !item) {
            return res.status(404).json({
                success: false,
                message: '購物車項目不存在'
            });
        }

        if (quantity === 0) {
            // 刪除項目
            db.run('DELETE FROM cart_items WHERE id = ?', [id], function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: '刪除失敗',
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    message: '已移除'
                });
            });
        } else {
            // 檢查庫存
            db.get('SELECT stock FROM products WHERE id = ?', [item.productId], (err, product) => {
                if (err || !product) {
                    return res.status(404).json({
                        success: false,
                        message: '商品不存在'
                    });
                }

                if (product.stock < quantity) {
                    return res.status(400).json({
                        success: false,
                        message: '庫存不足'
                    });
                }

                // 更新數量
                db.run(
                    'UPDATE cart_items SET quantity = ?, updatedAt = ? WHERE id = ?',
                    [quantity, Date.now(), id],
                    function(err) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: '更新失敗',
                                error: err.message
                            });
                        }

                        res.json({
                            success: true,
                            message: '已更新'
                        });
                    }
                );
            });
        }
    });
});

/**
 * 刪除購物車項目
 */
router.delete('/:id', optionalAuth, (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    let query, params;
    if (userId) {
        query = 'DELETE FROM cart_items WHERE id = ? AND userId = ?';
        params = [id, userId];
    } else {
        query = 'DELETE FROM cart_items WHERE id = ? AND sessionId = ?';
        params = [id, sessionId];
    }

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '刪除失敗',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: '已移除'
        });
    });
});

/**
 * 清空購物車
 */
router.delete('/', optionalAuth, (req, res) => {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;

    let query, params;
    if (userId) {
        query = 'DELETE FROM cart_items WHERE userId = ?';
        params = [userId];
    } else {
        query = 'DELETE FROM cart_items WHERE sessionId = ?';
        params = [sessionId];
    }

    db.run(query, params, function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '清空失敗',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: '購物車已清空'
        });
    });
});

module.exports = router;

