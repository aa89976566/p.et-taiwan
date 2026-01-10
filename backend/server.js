/**
 * 匠寵 - 後端 API 服務器
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase, closeDatabase } = require('./config/database');

// 導入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const ecpayRoutes = require('./routes/ecpay');
const quizRoutes = require('./routes/quiz');
const adminRoutes = require('./routes/admin');
const couponRoutes = require('./routes/coupons');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件 - CORS 設定（開發環境允許所有本地端口）
app.use(cors({
    origin: true, // 允許所有來源（開發環境）
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 請求日誌
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// 健康檢查
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '服務運行正常',
        timestamp: new Date().toISOString()
    });
});

// 檢查資料表（不需要認證，用於快速檢查）
app.get('/api/check-tables', async (req, res) => {
    try {
        const dbType = process.env.DB_TYPE || (process.env.DATABASE_URL ? 'postgresql' : 'sqlite');
        const { Pool } = require('pg');
        const { db } = require('./config/database');
        
        let query;
        if (dbType === 'postgresql') {
            query = `
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `;
        } else {
            query = `
                SELECT name as table_name
                FROM sqlite_master 
                WHERE type = 'table' 
                AND name NOT LIKE 'sqlite_%'
                ORDER BY name
            `;
        }

        db.all(query, [], (err, tables) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: '查詢資料表失敗',
                    error: err.message,
                    dbType: dbType
                });
            }

            const expectedTables = [
                'users',
                'products',
                'product_variants',
                'orders',
                'order_items',
                'quiz_results',
                'subscriptions',
                'cart_items',
                'settings',
                'coupons',
                'coupon_usage'
            ];

            const existingTableNames = (tables || []).map(t => 
                t.table_name || t.name || (typeof t === 'string' ? t : null)
            ).filter(Boolean);
            
            const missingTables = expectedTables.filter(t => !existingTableNames.includes(t));
            const extraTables = existingTableNames.filter(t => !expectedTables.includes(t));

            res.json({
                success: true,
                data: {
                    dbType: dbType,
                    totalTables: existingTableNames.length,
                    expectedTables: expectedTables.length,
                    tables: existingTableNames,
                    missingTables: missingTables,
                    extraTables: extraTables,
                    allTablesExist: missingTables.length === 0,
                    message: missingTables.length === 0 
                        ? '✅ 所有資料表都已建立！' 
                        : `⚠️ 缺少 ${missingTables.length} 個資料表: ${missingTables.join(', ')}`
                }
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '檢查失敗',
            error: error.message
        });
    }
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ecpay', ecpayRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '路由不存在'
    });
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error('❌ 錯誤:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || '伺服器錯誤',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 初始化資料庫並啟動服務器
console.log('🔍 正在初始化資料庫...');
initDatabase()
    .then(() => {
        console.log('✅ 資料庫初始化完成');
        console.log('🔍 正在啟動伺服器...');
        
        // 檢查端口是否被占用
        const net = require('net');
        const testServer = net.createServer();
        testServer.listen(PORT, () => {
            testServer.close(() => {
                // 端口可用，啟動伺服器
                app.listen(PORT, '0.0.0.0', () => {
                    console.log(`\n🚀 匠寵後端服務器已啟動`);
                    console.log(`📍 服務地址: http://localhost:${PORT}`);
                    console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
                    console.log(`\n✅ API 端點:`);
                    console.log(`   - POST   /api/auth/register`);
                    console.log(`   - POST   /api/auth/login`);
                    console.log(`   - GET    /api/products`);
                    console.log(`   - POST   /api/orders`);
                    console.log(`   - GET    /api/cart`);
                    console.log(`   - POST   /api/ecpay/create-payment`);
                    console.log(`\n按 Ctrl+C 停止服務器\n`);
                });
            });
        });
        
        testServer.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`\n❌ 錯誤: 端口 ${PORT} 已被占用`);
                console.error('   請執行以下命令關閉占用端口的程序:');
                console.error(`   lsof -ti :${PORT} | xargs kill -9`);
                console.error('   或使用其他端口: PORT=3001 npm start\n');
                process.exit(1);
            } else {
                console.error('❌ 啟動失敗:', err);
                process.exit(1);
            }
        });
    })
    .catch(err => {
        console.error('❌ 資料庫初始化失敗:', err);
        console.error('錯誤詳情:', err.message);
        if (err.stack) {
            console.error('錯誤堆疊:', err.stack);
        }
        process.exit(1);
    });

// 優雅關閉
process.on('SIGINT', async () => {
    console.log('\n正在關閉服務器...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n正在關閉服務器...');
    await closeDatabase();
    process.exit(0);
});

module.exports = app;

