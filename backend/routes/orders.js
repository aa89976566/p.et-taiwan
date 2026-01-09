/**
 * 訂單路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 獲取訂單列表
 */
router.get('/', authenticateToken, (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let query = 'SELECT * FROM orders WHERE userId = ?';
    const params = [userId];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    query += ' ORDER BY orderDate DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, orders) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        // 獲取訂單項目
        const orderIds = orders.map(o => o.id);
        if (orderIds.length === 0) {
            return res.json({
                success: true,
                data: { orders: [], pagination: { page: 1, limit, total: 0, pages: 0 } }
            });
        }

        const placeholders = orderIds.map(() => '?').join(',');
        db.all(
            `SELECT * FROM order_items WHERE orderId IN (${placeholders})`,
            orderIds,
            (err, items) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: '查詢失敗',
                        error: err.message
                    });
                }

                // 組合訂單和項目
                const ordersWithItems = orders.map(order => ({
                    ...order,
                    items: items.filter(item => item.orderId === order.id)
                }));

                res.json({
                    success: true,
                    data: { orders: ordersWithItems }
                });
            }
        );
    });
});

/**
 * 獲取單一訂單
 */
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId], (err, order) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '訂單不存在'
            });
        }

        // 獲取訂單項目
        db.all('SELECT * FROM order_items WHERE orderId = ?', [id], (err, items) => {
            res.json({
                success: true,
                data: {
                    ...order,
                    items: items || []
                }
            });
        });
    });
});

/**
 * 建立訂單
 */
router.post('/', optionalAuth, (req, res) => {
    const {
        items, subtotal, shippingFee, discount, total,
        receiver, shipping, payment, notes
    } = req.body;

    console.log('📥 收到建立訂單請求:', {
        itemsCount: items?.length || 0,
        items: items,
        subtotal,
        shippingFee,
        discount,
        total,
        receiver,
        shipping,
        payment
    });

    if (!items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: '購物車是空的'
        });
    }

    // 驗證必要欄位
    if (!receiver || !receiver.name || !receiver.phone) {
        return res.status(400).json({
            success: false,
            message: '請提供收件人資訊（姓名和電話）'
        });
    }

    if (!shipping || !shipping.method) {
        return res.status(400).json({
            success: false,
            message: '請提供配送方式'
        });
    }

    if (!payment || !payment.method) {
        return res.status(400).json({
            success: false,
            message: '請提供付款方式'
        });
    }

    const orderId = uuidv4();
    const userId = req.user ? req.user.id : null;
    const now = Date.now();

    // 建立訂單
    db.run(
        `INSERT INTO orders (id, userId, orderDate, subtotal, shippingFee, discount, total,
         receiverName, receiverPhone, receiverEmail,
         shippingMethod, shippingCourier, shippingAddress, shippingCity, shippingDistrict, shippingZipCode,
         shippingStoreId, shippingStoreName, shippingStoreAddress, shippingEstimatedDays,
         paymentMethod, paymentStatus, status, deliveryStatus, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            orderId, userId, now, subtotal, shippingFee, discount, total,
            receiver.name, receiver.phone, receiver.email || '',
            shipping.method, shipping.courier || '', shipping.address || '',
            shipping.city || '', shipping.district || '', shipping.zipCode || '',
            shipping.storeId || '', shipping.storeName || '', shipping.storeAddress || '',
            shipping.estimatedDays || 2,
            payment.method, payment.status || 'pending', 'pending', 'pending',
            notes || '', now, now
        ],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '建立訂單失敗',
                    error: err.message
                });
            }

            // 插入訂單項目（需要先檢查 productId 是否存在）
            const itemPromises = items.map((item, index) => {
                return new Promise((resolve, reject) => {
                    // 驗證項目資料
                    if (!item.name) {
                        return reject(new Error(`訂單項目 ${index + 1} 缺少商品名稱`));
                    }
                    if (item.price === undefined || item.price === null || isNaN(item.price)) {
                        return reject(new Error(`訂單項目 ${index + 1} (${item.name}) 價格無效: ${item.price}`));
                    }
                    if (item.quantity === undefined || item.quantity === null || isNaN(item.quantity) || item.quantity <= 0) {
                        return reject(new Error(`訂單項目 ${index + 1} (${item.name}) 數量無效: ${item.quantity}`));
                    }
                    
                    const itemId = uuidv4();
                    const price = parseFloat(item.price) || 0;
                    const quantity = parseInt(item.quantity) || 1;
                    
                    // 如果 productId 存在，檢查是否在 products 表中
                    // 如果不存在，將 productId 設為 null（避免外鍵約束失敗）
                    if (item.productId) {
                        db.get('SELECT id FROM products WHERE id = ?', [item.productId], (err, product) => {
                            if (err) {
                                console.warn(`⚠️ 檢查產品 ${item.productId} 時發生錯誤，將設為 null:`, err.message);
                                insertOrderItem(null);
                            } else if (!product) {
                                console.warn(`⚠️ 產品 ${item.productId} 不存在於資料庫中，將設為 null`);
                                insertOrderItem(null);
                            } else {
                                insertOrderItem(item.productId);
                            }
                        });
                    } else {
                        insertOrderItem(null);
                    }
                    
                    function insertOrderItem(validProductId) {
                        db.run(
                            'INSERT INTO order_items (id, orderId, productId, name, price, quantity, variant) VALUES (?, ?, ?, ?, ?, ?, ?)',
                            [
                                itemId, 
                                orderId, 
                                validProductId, 
                                String(item.name), 
                                price, 
                                quantity, 
                                item.variant ? String(item.variant) : ''
                            ],
                            (err) => {
                                if (err) {
                                    console.error(`❌ 插入訂單項目失敗 (項目 ${index + 1}):`, err);
                                    console.error(`❌ 項目資料:`, item);
                                    console.error(`❌ productId:`, validProductId);
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    }
                });
            });

            // 更新商品庫存和銷量
            items.forEach(item => {
                if (item.productId) {
                    db.run(
                        'UPDATE products SET stock = stock - ?, salesCount = salesCount + ? WHERE id = ?',
                        [item.quantity, item.quantity, item.productId]
                    );
                }
            });

            // 更新用戶統計
            if (userId) {
                db.run(
                    'UPDATE users SET totalOrders = totalOrders + 1, totalSpent = totalSpent + ? WHERE id = ?',
                    [total, userId]
                );
            }

            Promise.all(itemPromises)
                .then(() => {
                    // 回傳完整的訂單資料（包含 id 欄位，前端需要使用）
                    res.json({
                        success: true,
                        message: '訂單建立成功',
                        data: { 
                            id: orderId,
                            orderId: orderId,
                            userId: userId,
                            items: items,
                            subtotal: subtotal,
                            shippingFee: shippingFee,
                            discount: discount,
                            total: total
                        }
                    });
                })
                .catch(err => {
                    console.error('❌ 建立訂單項目失敗:', err);
                    console.error('❌ 錯誤詳情:', {
                        message: err.message,
                        stack: err.stack,
                        items: items
                    });
                    res.status(500).json({
                        success: false,
                        message: '建立訂單項目失敗',
                        error: err.message
                    });
                });
        }
    );
});

/**
 * 更新訂單狀態（管理員）
 */
const { requireAdmin } = require('../middleware/auth');

router.put('/:id/status', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status, deliveryStatus, paymentStatus } = req.body;
    const now = Date.now();

    const updates = [];
    const values = [];

    if (status) {
        updates.push('status = ?');
        values.push(status);
    }

    if (deliveryStatus) {
        updates.push('deliveryStatus = ?');
        values.push(deliveryStatus);
    }

    if (paymentStatus) {
        updates.push('paymentStatus = ?');
        values.push(paymentStatus);
        if (paymentStatus === 'paid') {
            updates.push('paymentPaidAt = ?');
            values.push(now);
        }
    }

    if (updates.length === 0) {
        return res.status(400).json({
            success: false,
            message: '沒有要更新的欄位'
        });
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    db.run(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        values,
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
                message: '訂單更新成功'
            });
        }
    );
});

/**
 * 取消訂單
 */
router.post('/:id/cancel', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM orders WHERE id = ? AND userId = ?', [id, userId], (err, order) => {
        if (err || !order) {
            return res.status(404).json({
                success: false,
                message: '訂單不存在'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: '訂單已取消'
            });
        }

        db.run(
            'UPDATE orders SET status = ?, cancelReason = ?, updatedAt = ? WHERE id = ?',
            ['cancelled', reason || '', Date.now(), id],
            function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: '取消訂單失敗',
                        error: err.message
                    });
                }

                res.json({
                    success: true,
                    message: '訂單已取消'
                });
            }
        );
    });
});

module.exports = router;

