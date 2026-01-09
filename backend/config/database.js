/**
 * 資料庫連接和初始化
 * 支援 SQLite（本地開發）和 PostgreSQL（Railway 生產環境）
 */

const path = require('path');
const fs = require('fs');

// 根據環境變數選擇資料庫類型
const DB_TYPE = process.env.DB_TYPE || (process.env.DATABASE_URL ? 'postgresql' : 'sqlite');

let db;
let dbType = DB_TYPE;

/**
 * 轉換 SQLite 查詢語法為 PostgreSQL 語法
 */
function convertQuery(query) {
    if (dbType !== 'postgresql') return query;
    
    let converted = query;
    let paramIndex = 1;
    
    // 替換 ? 為 $1, $2, $3...
    converted = converted.replace(/\?/g, () => `$${paramIndex++}`);
    
    // 轉換其他 SQLite 特定語法
    // INTEGER 在 PostgreSQL 中保持為 INTEGER 或 BIGINT（如果需要大數字）
    // TEXT 在 PostgreSQL 中為 TEXT 或 VARCHAR
    // REAL 在 PostgreSQL 中為 NUMERIC 或 DOUBLE PRECISION
    
    return converted;
}

// ============================================
// PostgreSQL 連接
// ============================================
let pool;
if (dbType === 'postgresql') {
    const { Pool } = require('pg');
    
    // 解析 Railway 的 DATABASE_URL
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    } else {
        pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'jiangchong',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }

    // 測試連接（非阻塞，僅記錄日誌）
    pool.query('SELECT NOW()', (err) => {
        if (err) {
            console.error('⚠️  PostgreSQL 連線測試失敗:', err.message);
            console.error('   注意：這可能是暫時性的，初始化時會重試');
        } else {
            console.log('✅ PostgreSQL 連接池已建立');
        }
    });

    // 創建 SQLite 兼容的 API 包裝器
    db = {
        // 執行查詢（返回多行）
        all: (query, params, callback) => {
            // 轉換 SQLite 參數占位符 ? 為 PostgreSQL 的 $1, $2, $3...
            const convertedQuery = convertQuery(query);
            pool.query(convertedQuery, params || [], (err, result) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result.rows);
                }
            });
        },
        
        // 執行查詢（返回單行）
        get: (query, params, callback) => {
            const convertedQuery = convertQuery(query);
            pool.query(convertedQuery, params || [], (err, result) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, result.rows[0] || null);
                }
            });
        },
        
        // 執行更新/插入/刪除
        run: function(query, params, callback) {
            const convertedQuery = convertQuery(query);
            const self = this;
            pool.query(convertedQuery, params || [], (err, result) => {
                if (callback) {
                    if (err) {
                        callback(err);
                    } else {
                        // PostgreSQL 使用 RETURNING id 來獲取 lastID
                        const lastID = result.rows && result.rows[0] && result.rows[0].id ? result.rows[0].id : null;
                        const resultObj = { 
                            lastID: lastID,
                            changes: result.rowCount || 0
                        };
                        // 為了保持與 SQLite 兼容，將 lastID 也添加到 this
                        if (lastID) {
                            self.lastID = lastID;
                        }
                        self.changes = result.rowCount || 0;
                        callback(null, resultObj);
                    }
                }
            });
        },
        
        // 序列化執行（PostgreSQL 使用事務）
        serialize: (callback) => {
            pool.query('BEGIN', (err) => {
                if (err) {
                    console.error('開始事務失敗:', err);
                }
                callback();
                pool.query('COMMIT', (commitErr) => {
                    if (commitErr) {
                        console.error('提交事務失敗:', commitErr);
                    }
                });
            });
        },
        
        // 關閉連接
        close: (callback) => {
            pool.end((err) => {
                if (callback) callback(err);
            });
        }
    };
}

// ============================================
// SQLite 連接（本地開發）
// ============================================
else {
    const sqlite3 = require('sqlite3').verbose();
    const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/jiangchong.db');
    
    // 確保資料目錄存在
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // 建立資料庫連接
    db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ SQLite 資料庫連接失敗:', err.message);
        } else {
            console.log('✅ 已連接到 SQLite 資料庫');
            db.run('PRAGMA foreign_keys = ON'); // 啟用外鍵約束
        }
    });
}

/**
 * 轉換 SQLite CREATE TABLE 語法為 PostgreSQL 語法
 */
function convertCreateTable(sql) {
    if (dbType !== 'postgresql') return sql;
    
    let converted = sql;
    
    // SQLite 的 TEXT 在 PostgreSQL 中保持為 TEXT
    // SQLite 的 INTEGER 在 PostgreSQL 中保持為 INTEGER（或 BIGINT）
    // SQLite 的 REAL 在 PostgreSQL 中改為 NUMERIC 或 DOUBLE PRECISION
    converted = converted.replace(/\bREAL\b/gi, 'NUMERIC');
    
    // SQLite 的 IF NOT EXISTS 在 PostgreSQL 中也是 IF NOT EXISTS，不需要改
    
    return converted;
}

/**
 * 初始化資料庫表結構
 */
function initDatabase() {
    return new Promise((resolve, reject) => {
        console.log(`📊 資料庫類型: ${dbType}`);
        if (dbType === 'postgresql') {
            // PostgreSQL 初始化
            console.log('🔍 使用 PostgreSQL 資料庫...');
            initPostgreSQL()
                .then(() => {
                    console.log('✅ PostgreSQL 資料庫初始化完成');
                    resolve();
                })
                .catch(err => {
                    console.error('❌ PostgreSQL 初始化失敗:', err);
                    reject(err);
                });
        } else {
            // SQLite 初始化
            console.log('🔍 使用 SQLite 資料庫...');
            initSQLite()
                .then(() => {
                    console.log('✅ SQLite 資料庫初始化完成');
                    resolve();
                })
                .catch(err => {
                    console.error('❌ SQLite 初始化失敗:', err);
                    reject(err);
                });
        }
    });
}

/**
 * PostgreSQL 初始化
 */
async function initPostgreSQL() {
    if (!pool) {
        throw new Error('PostgreSQL 連接池未初始化');
    }
    
    console.log('📊 開始建立 PostgreSQL 資料表...');
    const client = await pool.connect();
    
    try {
        // 先測試連線
        await client.query('SELECT 1');
        console.log('✅ PostgreSQL 連線測試成功');
        
        const tables = [
            // 用戶表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(255) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name VARCHAR(255),
                    phone VARCHAR(50),
                    avatar TEXT,
                    lineId VARCHAR(255),
                    memberLevel VARCHAR(50) DEFAULT 'normal',
                    status VARCHAR(50) DEFAULT 'active',
                    "registeredAt" BIGINT,
                    "lastLoginAt" BIGINT,
                    "totalOrders" INTEGER DEFAULT 0,
                    "totalSpent" NUMERIC DEFAULT 0,
                    "quizCompleted" INTEGER DEFAULT 0,
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT
                )
            `),
            
            // 商品表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS products (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    sku VARCHAR(255) UNIQUE,
                    "cyberbizId" VARCHAR(255),
                    category VARCHAR(100),
                    price NUMERIC NOT NULL,
                    "originalPrice" NUMERIC,
                    stock INTEGER DEFAULT 0,
                    "lowStockThreshold" INTEGER DEFAULT 10,
                    status VARCHAR(50) DEFAULT 'active',
                    "imageUrl" TEXT,
                    description TEXT,
                    "salesCount" INTEGER DEFAULT 0,
                    "viewCount" INTEGER DEFAULT 0,
                    rating NUMERIC DEFAULT 0,
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT
                )
            `),
            
            // 商品規格表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS product_variants (
                    id VARCHAR(255) PRIMARY KEY,
                    "productId" VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    price NUMERIC,
                    stock INTEGER DEFAULT 0,
                    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE
                )
            `),
            
            // 訂單表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS orders (
                    id VARCHAR(255) PRIMARY KEY,
                    "userId" VARCHAR(255),
                    "orderDate" BIGINT,
                    subtotal NUMERIC,
                    "shippingFee" NUMERIC,
                    discount NUMERIC,
                    total NUMERIC,
                    "receiverName" VARCHAR(255),
                    "receiverPhone" VARCHAR(50),
                    "receiverEmail" VARCHAR(255),
                    "shippingMethod" VARCHAR(50),
                    "shippingCourier" VARCHAR(50),
                    "shippingAddress" TEXT,
                    "shippingCity" VARCHAR(100),
                    "shippingDistrict" VARCHAR(100),
                    "shippingZipCode" VARCHAR(20),
                    "shippingStoreId" VARCHAR(255),
                    "shippingStoreName" VARCHAR(255),
                    "shippingStoreAddress" TEXT,
                    "shippingTrackingNumber" VARCHAR(255),
                    "shippingEstimatedDays" INTEGER,
                    "shippingShippedAt" BIGINT,
                    "shippingDeliveredAt" BIGINT,
                    "paymentMethod" VARCHAR(50),
                    "paymentStatus" VARCHAR(50) DEFAULT 'pending',
                    "paymentPaidAt" BIGINT,
                    "paymentTransactionId" VARCHAR(255),
                    "paymentEcpayTradeNo" VARCHAR(255),
                    status VARCHAR(50) DEFAULT 'pending',
                    "deliveryStatus" VARCHAR(50) DEFAULT 'pending',
                    notes TEXT,
                    "cancelReason" TEXT,
                    "refundReason" TEXT,
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT,
                    "completedAt" BIGINT,
                    FOREIGN KEY ("userId") REFERENCES users(id)
                )
            `),
            
            // 訂單項目表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS order_items (
                    id VARCHAR(255) PRIMARY KEY,
                    "orderId" VARCHAR(255) NOT NULL,
                    "productId" VARCHAR(255),
                    name VARCHAR(255) NOT NULL,
                    price NUMERIC NOT NULL,
                    quantity INTEGER NOT NULL,
                    variant VARCHAR(255),
                    FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE,
                    FOREIGN KEY ("productId") REFERENCES products(id)
                )
            `),
            
            // 測驗結果表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id VARCHAR(255) PRIMARY KEY,
                    "userId" VARCHAR(255),
                    "quizType" VARCHAR(50),
                    "petName" VARCHAR(255),
                    "petType" VARCHAR(50),
                    "petBreed" VARCHAR(255),
                    "petAge" INTEGER,
                    "petWeight" NUMERIC,
                    "petActivityLevel" VARCHAR(50),
                    "petHealthIssues" TEXT,
                    answers TEXT,
                    "resultCategory" VARCHAR(100),
                    "resultScore" INTEGER,
                    "resultRecommendations" TEXT,
                    "completedAt" BIGINT,
                    "createdAt" BIGINT,
                    FOREIGN KEY ("userId") REFERENCES users(id)
                )
            `),
            
            // 訂閱表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id VARCHAR(255) PRIMARY KEY,
                    "userId" VARCHAR(255) NOT NULL,
                    "planId" VARCHAR(255),
                    "planName" VARCHAR(255),
                    "productId" VARCHAR(255),
                    frequency VARCHAR(50),
                    quantity INTEGER DEFAULT 1,
                    price NUMERIC,
                    status VARCHAR(50) DEFAULT 'active',
                    "nextDeliveryDate" BIGINT,
                    "startDate" BIGINT,
                    "endDate" BIGINT,
                    "deliveryCount" INTEGER DEFAULT 0,
                    "totalDeliveries" INTEGER,
                    "shippingAddress" TEXT,
                    "paymentMethod" VARCHAR(50),
                    "autoRenew" INTEGER DEFAULT 1,
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT,
                    FOREIGN KEY ("userId") REFERENCES users(id),
                    FOREIGN KEY ("productId") REFERENCES products(id)
                )
            `),
            
            // 購物車表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    id VARCHAR(255) PRIMARY KEY,
                    "userId" VARCHAR(255),
                    "sessionId" VARCHAR(255),
                    "productId" VARCHAR(255) NOT NULL,
                    quantity INTEGER NOT NULL,
                    variant VARCHAR(255),
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT,
                    FOREIGN KEY ("productId") REFERENCES products(id)
                )
            `),
            
            // 設定表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS settings (
                    key VARCHAR(255) PRIMARY KEY,
                    value TEXT,
                    "updatedAt" BIGINT
                )
            `),
            
            // 優惠券表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS coupons (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    code VARCHAR(255) UNIQUE NOT NULL,
                    type VARCHAR(50) NOT NULL CHECK(type IN ('percentage', 'fixed')),
                    value NUMERIC NOT NULL,
                    "minSpend" NUMERIC DEFAULT 0,
                    "maxDiscount" NUMERIC,
                    "limitCount" INTEGER,
                    "usedCount" INTEGER DEFAULT 0,
                    "startDate" BIGINT,
                    "endDate" BIGINT,
                    status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'expired')),
                    description TEXT,
                    "createdAt" BIGINT,
                    "updatedAt" BIGINT
                )
            `),
            
            // 優惠券使用記錄表
            convertCreateTable(`
                CREATE TABLE IF NOT EXISTS coupon_usage (
                    id VARCHAR(255) PRIMARY KEY,
                    "couponId" VARCHAR(255) NOT NULL,
                    "orderId" VARCHAR(255),
                    "userId" VARCHAR(255),
                    "usedAt" BIGINT,
                    "discountAmount" NUMERIC,
                    FOREIGN KEY ("couponId") REFERENCES coupons(id),
                    FOREIGN KEY ("orderId") REFERENCES orders(id),
                    FOREIGN KEY ("userId") REFERENCES users(id)
                )
            `)
        ];
        
        // 執行所有 CREATE TABLE 語句
        console.log(`準備建立 ${tables.length} 個資料表...\n`);
        const tableNames = [
            'users', 'products', 'product_variants', 'orders', 'order_items',
            'quiz_results', 'subscriptions', 'cart_items', 'settings',
            'coupons', 'coupon_usage'
        ];
        
        for (let i = 0; i < tables.length; i++) {
            const tableSQL = tables[i];
            const tableName = tableNames[i] || `表 ${i + 1}`;
            try {
                await client.query(tableSQL);
                console.log(`   ✅ ${tableName} 建立成功`);
            } catch (error) {
                // 如果是「已存在」的錯誤，這是正常的
                if (error.message.includes('already exists') || error.code === '42P07') {
                    console.log(`   ℹ️  ${tableName} 已存在（跳過）`);
                } else {
                    console.error(`   ❌ ${tableName} 建立失敗:`, error.message);
                    throw error; // 重新拋出錯誤，讓調用者知道
                }
            }
        }
        
        console.log(`\n✅ PostgreSQL 資料庫表結構初始化完成（共 ${tables.length} 個資料表）`);
    } catch (error) {
        console.error('❌ PostgreSQL 初始化過程中發生錯誤:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * SQLite 初始化
 */
function initSQLite() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 用戶表
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    name TEXT,
                    phone TEXT,
                    avatar TEXT,
                    lineId TEXT,
                    memberLevel TEXT DEFAULT 'normal',
                    status TEXT DEFAULT 'active',
                    registeredAt INTEGER,
                    lastLoginAt INTEGER,
                    totalOrders INTEGER DEFAULT 0,
                    totalSpent REAL DEFAULT 0,
                    quizCompleted INTEGER DEFAULT 0,
                    createdAt INTEGER,
                    updatedAt INTEGER
                )
            `);

            // 商品表
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    sku TEXT UNIQUE,
                    cyberbizId TEXT,
                    category TEXT,
                    price REAL NOT NULL,
                    originalPrice REAL,
                    stock INTEGER DEFAULT 0,
                    lowStockThreshold INTEGER DEFAULT 10,
                    status TEXT DEFAULT 'active',
                    imageUrl TEXT,
                    description TEXT,
                    salesCount INTEGER DEFAULT 0,
                    viewCount INTEGER DEFAULT 0,
                    rating REAL DEFAULT 0,
                    createdAt INTEGER,
                    updatedAt INTEGER
                )
            `);

            // 商品規格表
            db.run(`
                CREATE TABLE IF NOT EXISTS product_variants (
                    id TEXT PRIMARY KEY,
                    productId TEXT NOT NULL,
                    name TEXT NOT NULL,
                    price REAL,
                    stock INTEGER DEFAULT 0,
                    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
                )
            `);

            // 訂單表
            db.run(`
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    userId TEXT,
                    orderDate INTEGER,
                    subtotal REAL,
                    shippingFee REAL,
                    discount REAL,
                    total REAL,
                    receiverName TEXT,
                    receiverPhone TEXT,
                    receiverEmail TEXT,
                    shippingMethod TEXT,
                    shippingCourier TEXT,
                    shippingAddress TEXT,
                    shippingCity TEXT,
                    shippingDistrict TEXT,
                    shippingZipCode TEXT,
                    shippingStoreId TEXT,
                    shippingStoreName TEXT,
                    shippingStoreAddress TEXT,
                    shippingTrackingNumber TEXT,
                    shippingEstimatedDays INTEGER,
                    shippingShippedAt INTEGER,
                    shippingDeliveredAt INTEGER,
                    paymentMethod TEXT,
                    paymentStatus TEXT DEFAULT 'pending',
                    paymentPaidAt INTEGER,
                    paymentTransactionId TEXT,
                    paymentEcpayTradeNo TEXT,
                    status TEXT DEFAULT 'pending',
                    deliveryStatus TEXT DEFAULT 'pending',
                    notes TEXT,
                    cancelReason TEXT,
                    refundReason TEXT,
                    createdAt INTEGER,
                    updatedAt INTEGER,
                    completedAt INTEGER,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // 訂單項目表
            db.run(`
                CREATE TABLE IF NOT EXISTS order_items (
                    id TEXT PRIMARY KEY,
                    orderId TEXT NOT NULL,
                    productId TEXT,
                    name TEXT NOT NULL,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL,
                    variant TEXT,
                    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
                    FOREIGN KEY (productId) REFERENCES products(id)
                )
            `);

            // 測驗結果表
            db.run(`
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id TEXT PRIMARY KEY,
                    userId TEXT,
                    quizType TEXT,
                    petName TEXT,
                    petType TEXT,
                    petBreed TEXT,
                    petAge INTEGER,
                    petWeight REAL,
                    petActivityLevel TEXT,
                    petHealthIssues TEXT,
                    answers TEXT,
                    resultCategory TEXT,
                    resultScore INTEGER,
                    resultRecommendations TEXT,
                    completedAt INTEGER,
                    createdAt INTEGER,
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            // 訂閱表
            db.run(`
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id TEXT PRIMARY KEY,
                    userId TEXT NOT NULL,
                    planId TEXT,
                    planName TEXT,
                    productId TEXT,
                    frequency TEXT,
                    quantity INTEGER DEFAULT 1,
                    price REAL,
                    status TEXT DEFAULT 'active',
                    nextDeliveryDate INTEGER,
                    startDate INTEGER,
                    endDate INTEGER,
                    deliveryCount INTEGER DEFAULT 0,
                    totalDeliveries INTEGER,
                    shippingAddress TEXT,
                    paymentMethod TEXT,
                    autoRenew INTEGER DEFAULT 1,
                    createdAt INTEGER,
                    updatedAt INTEGER,
                    FOREIGN KEY (userId) REFERENCES users(id),
                    FOREIGN KEY (productId) REFERENCES products(id)
                )
            `);

            // 購物車表
            db.run(`
                CREATE TABLE IF NOT EXISTS cart_items (
                    id TEXT PRIMARY KEY,
                    userId TEXT,
                    sessionId TEXT,
                    productId TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    variant TEXT,
                    createdAt INTEGER,
                    updatedAt INTEGER,
                    FOREIGN KEY (productId) REFERENCES products(id)
                )
            `);

            // 設定表
            db.run(`
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updatedAt INTEGER
                )
            `);

            // 優惠券表
            db.run(`
                CREATE TABLE IF NOT EXISTS coupons (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    code TEXT UNIQUE NOT NULL,
                    type TEXT NOT NULL CHECK(type IN ('percentage', 'fixed')),
                    value REAL NOT NULL,
                    minSpend REAL DEFAULT 0,
                    maxDiscount REAL,
                    limitCount INTEGER,
                    usedCount INTEGER DEFAULT 0,
                    startDate INTEGER,
                    endDate INTEGER,
                    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'disabled', 'expired')),
                    description TEXT,
                    createdAt INTEGER,
                    updatedAt INTEGER
                )
            `);

            // 優惠券使用記錄表
            db.run(`
                CREATE TABLE IF NOT EXISTS coupon_usage (
                    id TEXT PRIMARY KEY,
                    couponId TEXT NOT NULL,
                    orderId TEXT,
                    userId TEXT,
                    usedAt INTEGER,
                    discountAmount REAL,
                    FOREIGN KEY (couponId) REFERENCES coupons(id),
                    FOREIGN KEY (orderId) REFERENCES orders(id),
                    FOREIGN KEY (userId) REFERENCES users(id)
                )
            `);

            console.log('✅ SQLite 資料庫表結構初始化完成');
            resolve();
        });
    });
}

/**
 * 關閉資料庫連接
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (dbType === 'postgresql') {
            if (pool) {
                pool.end((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('✅ PostgreSQL 連接已關閉');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        } else {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('✅ SQLite 連接已關閉');
                    resolve();
                }
            });
        }
    });
}

// 如果是 PostgreSQL，需要在 db 物件上添加 pool 引用
if (dbType === 'postgresql' && pool) {
    db.pool = pool;
}

module.exports = {
    db,
    initDatabase,
    closeDatabase
};
