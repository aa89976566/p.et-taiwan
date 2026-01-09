/**
 * 資料庫連接和初始化
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/jiangchong.db');

// 確保資料目錄存在
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 建立資料庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ 資料庫連接失敗:', err.message);
    } else {
        console.log('✅ 已連接到 SQLite 資料庫');
        db.run('PRAGMA foreign_keys = ON'); // 啟用外鍵約束
    }
});

/**
 * 初始化資料庫表結構
 */
function initDatabase() {
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

            console.log('✅ 資料庫表結構初始化完成');
            resolve();
        });
    });
}

/**
 * 關閉資料庫連接
 */
function closeDatabase() {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                console.log('✅ 資料庫連接已關閉');
                resolve();
            }
        });
    });
}

module.exports = {
    db,
    initDatabase,
    closeDatabase
};

