/**
 * 會員地址管理路由
 * 處理地址的增刪改查
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 獲取當前用戶的所有地址
 * GET /api/addresses
 */
router.get('/', authenticateToken, (req, res) => {
    const userId = req.user.id;
    
    db.all(
        'SELECT * FROM user_addresses WHERE "userId" = ? ORDER BY "isDefault" DESC, "createdAt" DESC',
        [userId],
        (err, addresses) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '獲取地址失敗',
                    error: err.message
                });
            }
            
            res.json({
                success: true,
                data: { addresses }
            });
        }
    );
});

/**
 * 新增地址
 * POST /api/addresses
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientName, phone, city, district, address, postalCode, isDefault } = req.body;
        
        // 驗證必填欄位
        if (!recipientName || !phone || !city || !district || !address) {
            return res.status(400).json({
                success: false,
                message: '請填寫完整地址資訊'
            });
        }
        
        const addressId = uuidv4();
        const now = Date.now();
        
        // 如果設為預設地址，先將其他地址設為非預設
        if (isDefault) {
            db.run(
                'UPDATE user_addresses SET "isDefault" = ? WHERE "userId" = ?',
                [false, userId],
                (err) => {
                    if (err) {
                        console.error('更新預設地址失敗:', err);
                    }
                }
            );
        }
        
        // 新增地址
        db.run(
            `INSERT INTO user_addresses 
             (id, "userId", "recipientName", phone, city, district, address, "postalCode", "isDefault", "createdAt", "updatedAt")
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [addressId, userId, recipientName, phone, city, district, address, postalCode || '', isDefault || false, now, now],
            function(err) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: '新增地址失敗',
                        error: err.message
                    });
                }
                
                res.json({
                    success: true,
                    message: '地址新增成功',
                    data: {
                        address: {
                            id: addressId,
                            userId,
                            recipientName,
                            phone,
                            city,
                            district,
                            address,
                            postalCode: postalCode || '',
                            isDefault: isDefault || false,
                            createdAt: now,
                            updatedAt: now
                        }
                    }
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '伺服器錯誤',
            error: error.message
        });
    }
});

/**
 * 更新地址
 * PUT /api/addresses/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;
        const { recipientName, phone, city, district, address, postalCode, isDefault } = req.body;
        
        // 驗證地址是否屬於當前用戶
        db.get(
            'SELECT * FROM user_addresses WHERE id = ? AND "userId" = ?',
            [addressId, userId],
            async (err, existingAddress) => {
                if (err || !existingAddress) {
                    return res.status(404).json({
                        success: false,
                        message: '地址不存在'
                    });
                }
                
                const now = Date.now();
                
                // 如果設為預設地址，先將其他地址設為非預設
                if (isDefault) {
                    db.run(
                        'UPDATE user_addresses SET "isDefault" = ? WHERE "userId" = ? AND id != ?',
                        [false, userId, addressId],
                        (err) => {
                            if (err) {
                                console.error('更新預設地址失敗:', err);
                            }
                        }
                    );
                }
                
                // 更新地址
                db.run(
                    `UPDATE user_addresses 
                     SET "recipientName" = ?, phone = ?, city = ?, district = ?, 
                         address = ?, "postalCode" = ?, "isDefault" = ?, "updatedAt" = ?
                     WHERE id = ? AND "userId" = ?`,
                    [
                        recipientName || existingAddress.recipientName,
                        phone || existingAddress.phone,
                        city || existingAddress.city,
                        district || existingAddress.district,
                        address || existingAddress.address,
                        postalCode !== undefined ? postalCode : existingAddress.postalCode,
                        isDefault !== undefined ? isDefault : existingAddress.isDefault,
                        now,
                        addressId,
                        userId
                    ],
                    function(err) {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: '更新地址失敗',
                                error: err.message
                            });
                        }
                        
                        res.json({
                            success: true,
                            message: '地址更新成功'
                        });
                    }
                );
            }
        );
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '伺服器錯誤',
            error: error.message
        });
    }
});

/**
 * 刪除地址
 * DELETE /api/addresses/:id
 */
router.delete('/:id', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    // 驗證地址是否屬於當前用戶
    db.get(
        'SELECT * FROM user_addresses WHERE id = ? AND "userId" = ?',
        [addressId, userId],
        (err, address) => {
            if (err || !address) {
                return res.status(404).json({
                    success: false,
                    message: '地址不存在'
                });
            }
            
            // 刪除地址
            db.run(
                'DELETE FROM user_addresses WHERE id = ? AND "userId" = ?',
                [addressId, userId],
                function(err) {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '刪除地址失敗',
                            error: err.message
                        });
                    }
                    
                    res.json({
                        success: true,
                        message: '地址刪除成功'
                    });
                }
            );
        }
    );
});

/**
 * 設定預設地址
 * PUT /api/addresses/:id/set-default
 */
router.put('/:id/set-default', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    
    // 驗證地址是否屬於當前用戶
    db.get(
        'SELECT * FROM user_addresses WHERE id = ? AND "userId" = ?',
        [addressId, userId],
        (err, address) => {
            if (err || !address) {
                return res.status(404).json({
                    success: false,
                    message: '地址不存在'
                });
            }
            
            // 先將所有地址設為非預設
            db.run(
                'UPDATE user_addresses SET "isDefault" = ? WHERE "userId" = ?',
                [false, userId],
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: '更新失敗',
                            error: err.message
                        });
                    }
                    
                    // 設定指定地址為預設
                    db.run(
                        'UPDATE user_addresses SET "isDefault" = ?, "updatedAt" = ? WHERE id = ?',
                        [true, Date.now(), addressId],
                        function(err) {
                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: '設定預設地址失敗',
                                    error: err.message
                                });
                            }
                            
                            res.json({
                                success: true,
                                message: '預設地址設定成功'
                            });
                        }
                    );
                }
            );
        }
    );
});

module.exports = router;
