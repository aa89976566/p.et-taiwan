/**
 * 優惠券路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 獲取所有優惠券（管理員）
 */
router.get('/admin', authenticateToken, (req, res) => {
    // 檢查是否為管理員（這裡簡化處理，實際應該檢查用戶角色）
    const query = 'SELECT * FROM coupons ORDER BY createdAt DESC';
    
    db.all(query, [], (err, coupons) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        res.json({
            success: true,
            data: coupons
        });
    });
});

/**
 * 獲取單個優惠券
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM coupons WHERE id = ?', [id], (err, coupon) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: '優惠券不存在'
            });
        }

        res.json({
            success: true,
            data: coupon
        });
    });
});

/**
 * 驗證優惠碼
 */
router.post('/validate', optionalAuth, (req, res) => {
    const { code, subtotal } = req.body;
    const userId = req.user?.id;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: '請輸入優惠碼'
        });
    }

    const now = Date.now();

    // 查詢優惠券
    db.get(
        `SELECT * FROM coupons 
         WHERE code = ? AND status = 'active' 
         AND startDate <= ? AND endDate >= ?`,
        [code.toUpperCase(), now, now],
        (err, coupon) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '驗證失敗',
                    error: err.message
                });
            }

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: '優惠碼不存在或已過期'
                });
            }

            // 檢查使用次數限制
            if (coupon.limitCount && coupon.usedCount >= coupon.limitCount) {
                return res.status(400).json({
                    success: false,
                    message: '優惠碼已達使用上限'
                });
            }

            // 檢查最低消費
            const cartSubtotal = parseFloat(subtotal) || 0;
            if (cartSubtotal < coupon.minSpend) {
                return res.status(400).json({
                    success: false,
                    message: `此優惠碼需滿 NT$ ${coupon.minSpend} 才能使用`
                });
            }

            // 計算折扣金額
            let discountAmount = 0;
            if (coupon.type === 'percentage') {
                discountAmount = Math.round(cartSubtotal * (coupon.value / 100));
                if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else {
                discountAmount = coupon.value;
            }

            // 確保折扣不超過小計
            if (discountAmount > cartSubtotal) {
                discountAmount = cartSubtotal;
            }

            res.json({
                success: true,
                data: {
                    coupon: {
                        id: coupon.id,
                        name: coupon.name,
                        code: coupon.code,
                        type: coupon.type,
                        value: coupon.value
                    },
                    discountAmount: discountAmount,
                    finalTotal: cartSubtotal - discountAmount
                }
            });
        }
    );
});

/**
 * 建立優惠券（管理員）
 */
router.post('/', authenticateToken, (req, res) => {
    const {
        name,
        code,
        type,
        value,
        minSpend = 0,
        maxDiscount = null,
        limitCount = null,
        startDate,
        endDate,
        description = ''
    } = req.body;

    // 驗證必填欄位
    if (!name || !code || !type || !value || !startDate || !endDate) {
        return res.status(400).json({
            success: false,
            message: '請填寫所有必填欄位'
        });
    }

    if (type !== 'percentage' && type !== 'fixed') {
        return res.status(400).json({
            success: false,
            message: '折扣類型必須是 percentage 或 fixed'
        });
    }

    const id = uuidv4();
    const now = Date.now();
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    db.run(
        `INSERT INTO coupons (
            id, name, code, type, value, minSpend, maxDiscount, 
            limitCount, usedCount, startDate, endDate, status, 
            description, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            id, name, code.toUpperCase(), type, value, minSpend, maxDiscount,
            limitCount, 0, startTimestamp, endTimestamp, 'active',
            description, now, now
        ],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({
                        success: false,
                        message: '優惠碼已存在'
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: '建立失敗',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: '優惠券建立成功',
                data: { id }
            });
        }
    );
});

/**
 * 更新優惠券（管理員）
 */
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const {
        name,
        code,
        type,
        value,
        minSpend,
        maxDiscount,
        limitCount,
        startDate,
        endDate,
        status,
        description
    } = req.body;

    const now = Date.now();
    const updates = [];
    const values = [];

    if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
    }
    if (code !== undefined) {
        updates.push('code = ?');
        values.push(code.toUpperCase());
    }
    if (type !== undefined) {
        updates.push('type = ?');
        values.push(type);
    }
    if (value !== undefined) {
        updates.push('value = ?');
        values.push(value);
    }
    if (minSpend !== undefined) {
        updates.push('minSpend = ?');
        values.push(minSpend);
    }
    if (maxDiscount !== undefined) {
        updates.push('maxDiscount = ?');
        values.push(maxDiscount);
    }
    if (limitCount !== undefined) {
        updates.push('limitCount = ?');
        values.push(limitCount);
    }
    if (startDate !== undefined) {
        updates.push('startDate = ?');
        values.push(new Date(startDate).getTime());
    }
    if (endDate !== undefined) {
        updates.push('endDate = ?');
        values.push(new Date(endDate).getTime());
    }
    if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
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
        `UPDATE coupons SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(400).json({
                        success: false,
                        message: '優惠碼已存在'
                    });
                }
                return res.status(500).json({
                    success: false,
                    message: '更新失敗',
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '優惠券不存在'
                });
            }

            res.json({
                success: true,
                message: '優惠券更新成功'
            });
        }
    );
});

/**
 * 刪除優惠券（管理員）
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM coupons WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '刪除失敗',
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: '優惠券不存在'
            });
        }

        res.json({
            success: true,
            message: '優惠券已刪除'
        });
    });
});

/**
 * 記錄優惠券使用
 */
router.post('/:id/use', optionalAuth, (req, res) => {
    const { id: couponId } = req.params;
    const { orderId, discountAmount } = req.body;
    const userId = req.user?.id;

    if (!orderId || !discountAmount) {
        return res.status(400).json({
            success: false,
            message: '缺少必要參數'
        });
    }

    const usageId = uuidv4();
    const now = Date.now();

    // 開始事務
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 插入使用記錄
        db.run(
            `INSERT INTO coupon_usage (id, couponId, orderId, userId, usedAt, discountAmount)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [usageId, couponId, orderId, userId, now, discountAmount],
            (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({
                        success: false,
                        message: '記錄使用失敗',
                        error: err.message
                    });
                }

                // 更新優惠券使用次數
                db.run(
                    'UPDATE coupons SET usedCount = usedCount + 1, updatedAt = ? WHERE id = ?',
                    [now, couponId],
                    (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({
                                success: false,
                                message: '更新使用次數失敗',
                                error: err.message
                            });
                        }

                        db.run('COMMIT', (err) => {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: '提交失敗',
                                    error: err.message
                                });
                            }

                            res.json({
                                success: true,
                                message: '使用記錄已建立'
                            });
                        });
                    }
                );
            }
        );
    });
});

module.exports = router;



