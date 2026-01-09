/**
 * 管理員路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

/**
 * 獲取統計數據
 */
router.get('/stats', requireAdmin, (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthTimestamp = firstDayOfMonth.getTime();

    // 今日訂單和營收
    db.get(
        `SELECT COUNT(*) as count, SUM(CASE WHEN paymentStatus = 'paid' THEN total ELSE 0 END) as revenue
         FROM orders WHERE createdAt >= ?`,
        [todayTimestamp],
        (err, todayStats) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '查詢失敗',
                    error: err.message
                });
            }

            // 本月訂單和營收
            db.get(
                `SELECT COUNT(*) as count, SUM(CASE WHEN paymentStatus = 'paid' THEN total ELSE 0 END) as revenue
                 FROM orders WHERE createdAt >= ?`,
                [monthTimestamp],
                (err, monthStats) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '查詢失敗',
                            error: err.message
                        });
                    }

                    // 今日新增會員
                    db.get(
                        'SELECT COUNT(*) as count FROM users WHERE registeredAt >= ?',
                        [todayTimestamp],
                        (err, todayUsers) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: '查詢失敗',
                                    error: err.message
                                });
                            }

                            // 待處理訂單
                            db.get(
                                "SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'confirmed')",
                                [],
                                (err, pendingOrders) => {
                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            message: '查詢失敗',
                                            error: err.message
                                        });
                                    }

                                    // 低庫存商品
                                    db.all(
                                        "SELECT * FROM products WHERE stock > 0 AND stock <= lowStockThreshold AND status = 'active'",
                                        [],
                                        (err, lowStockProducts) => {
                                            if (err) {
                                                return res.status(500).json({
                                                    success: false,
                                                    message: '查詢失敗',
                                                    error: err.message
                                                });
                                            }

                                            res.json({
                                                success: true,
                                                data: {
                                                    today: {
                                                        orders: todayStats.count || 0,
                                                        revenue: todayStats.revenue || 0,
                                                        newUsers: todayUsers.count || 0
                                                    },
                                                    month: {
                                                        orders: monthStats.count || 0,
                                                        revenue: monthStats.revenue || 0
                                                    },
                                                    pendingOrders: pendingOrders.count || 0,
                                                    lowStockProducts: lowStockProducts || []
                                                }
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

/**
 * 獲取所有訂單（管理員）
 */
router.get('/orders', requireAdmin, (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

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
        if (orders.length === 0) {
            return res.json({
                success: true,
                data: { orders: [] }
            });
        }

        const orderIds = orders.map(o => o.id);
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
 * 獲取所有用戶（管理員）
 */
router.get('/users', requireAdmin, (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    db.all(
        'SELECT id, email, name, phone, memberLevel, status, registeredAt, totalOrders, totalSpent FROM users ORDER BY registeredAt DESC LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)],
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '查詢失敗',
                    error: err.message
                });
            }

            res.json({
                success: true,
                data: { users: users || [] }
            });
        }
    );
});

module.exports = router;

