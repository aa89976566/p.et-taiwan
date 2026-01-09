/**
 * 商品路由
 */
const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

/**
 * 獲取所有商品（支援篩選和分頁）
 */
router.get('/', optionalAuth, (req, res) => {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }

    if (search) {
        query += ' AND (name LIKE ? OR sku LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, products) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        // 獲取總數
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        const countParams = params.slice(0, -2); // 移除 LIMIT 和 OFFSET

        db.get(countQuery, countParams, (err, result) => {
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
                    products: products || [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: result.total,
                        pages: Math.ceil(result.total / limit)
                    }
                }
            });
        });
    });
});

/**
 * 獲取單一商品
 */
router.get('/:id', optionalAuth, (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '查詢失敗',
                error: err.message
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }

        // 增加瀏覽次數
        db.run('UPDATE products SET viewCount = viewCount + 1 WHERE id = ?', [id]);

        // 獲取商品規格
        db.all('SELECT * FROM product_variants WHERE productId = ?', [id], (err, variants) => {
            res.json({
                success: true,
                data: {
                    ...product,
                    variants: variants || []
                }
            });
        });
    });
});

/**
 * 建立商品（需要管理員權限）
 */
const { requireAdmin } = require('../middleware/auth');

router.post('/', requireAdmin, (req, res) => {
    const {
        name, sku, cyberbizId, category, price, originalPrice,
        stock, lowStockThreshold, status, imageUrl, description, variants
    } = req.body;

    if (!name || !price) {
        return res.status(400).json({
            success: false,
            message: '請填寫商品名稱和價格'
        });
    }

    const productId = uuidv4();
    const now = Date.now();

    db.run(
        `INSERT INTO products (id, name, sku, cyberbizId, category, price, originalPrice, stock, 
         lowStockThreshold, status, imageUrl, description, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, name, sku || null, cyberbizId || null, category || 'snacks',
         price, originalPrice || null, stock || 0, lowStockThreshold || 10,
         status || 'active', imageUrl || null, description || null, now, now],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '建立失敗',
                    error: err.message
                });
            }

            // 如果有規格，插入規格
            if (variants && Array.isArray(variants)) {
                variants.forEach(variant => {
                    const variantId = uuidv4();
                    db.run(
                        'INSERT INTO product_variants (id, productId, name, price, stock) VALUES (?, ?, ?, ?, ?)',
                        [variantId, productId, variant.name, variant.price || price, variant.stock || 0]
                    );
                });
            }

            res.json({
                success: true,
                message: '商品建立成功',
                data: { id: productId }
            });
        }
    );
});

/**
 * 更新商品
 */
router.put('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const now = Date.now();

    // 建立更新語句
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'createdAt') {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }
    });

    if (fields.length === 0) {
        return res.status(400).json({
            success: false,
            message: '沒有要更新的欄位'
        });
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    db.run(
        `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
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
                message: '商品更新成功'
            });
        }
    );
});

/**
 * 刪除商品
 */
router.delete('/:id', requireAdmin, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: '刪除失敗',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: '商品刪除成功'
        });
    });
});

module.exports = router;

