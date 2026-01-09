/**
 * 生成測試數據腳本
 * 用於快速建立測試環境
 */
require('dotenv').config();
const { db, initDatabase, closeDatabase } = require('../config/database');
const { hashPassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

// 生成隨機日期（過去30天內）
function randomDate() {
    const now = Date.now();
    const daysAgo = Math.floor(Math.random() * 30);
    return now - (daysAgo * 24 * 60 * 60 * 1000);
}

// 將 db.run 包裝為 Promise
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

// 生成測試數據
async function seedTestData() {
    console.log('🌱 開始生成測試數據...\n');

    try {
        // 確保資料庫已初始化
        await initDatabase();

        // 1. 生成測試用戶
        console.log('👥 生成測試用戶...');
        const users = [
            {
                id: uuidv4(),
                email: 'admin@jiangchong.com',
                password: await hashPassword('admin123'),
                name: '管理員',
                phone: '0912345678',
                memberLevel: 'admin',
                status: 'active',
                registeredAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
                createdAt: Date.now() - (30 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: uuidv4(),
                email: 'test@example.com',
                password: await hashPassword('test123'),
                name: '測試用戶',
                phone: '0923456789',
                memberLevel: 'normal',
                status: 'active',
                registeredAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
                createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: uuidv4(),
                email: 'user1@example.com',
                password: await hashPassword('user123'),
                name: '用戶一',
                phone: '0934567890',
                memberLevel: 'vip',
                status: 'active',
                registeredAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
                createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            }
        ];

        for (const user of users) {
            await dbRun(`
                INSERT OR REPLACE INTO users (
                    id, email, password, name, phone, memberLevel, status,
                    registeredAt, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.id, user.email, user.password, user.name, user.phone,
                user.memberLevel, user.status, user.registeredAt,
                user.createdAt, user.updatedAt
            ]);
        }
        console.log(`   ✅ 已建立 ${users.length} 個測試用戶\n`);

        // 2. 生成測試商品
        console.log('📦 生成測試商品...');
        const products = [
            {
                id: 'prod_001',
                name: '手作雞肉乾',
                sku: 'SNACK-001',
                category: 'snacks',
                price: 299,
                originalPrice: 350,
                stock: 50,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '台灣在地食材手工製作，無添加防腐劑',
                createdAt: Date.now() - (25 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'prod_002',
                name: '益智玩具球',
                sku: 'TOY-001',
                category: 'toys',
                price: 599,
                originalPrice: 699,
                stock: 30,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '基於維也納大學研究的益智玩具',
                createdAt: Date.now() - (20 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'prod_003',
                name: '訂閱方案A',
                sku: 'SUB-001',
                category: 'subscription',
                price: 999,
                stock: -1, // 無庫存限制
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '每月配送一次，可隨時取消',
                createdAt: Date.now() - (15 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'prod_004',
                name: '手作牛肉乾',
                sku: 'SNACK-002',
                category: 'snacks',
                price: 399,
                originalPrice: 450,
                stock: 40,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '精選牛肉，低溫烘烤',
                createdAt: Date.now() - (10 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'prod_005',
                name: '益智拼圖',
                sku: 'TOY-002',
                category: 'toys',
                price: 799,
                originalPrice: 899,
                stock: 20,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '訓練寵物認知能力',
                createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'toy-puzzle-slider',
                name: '推拉解謎玩具',
                sku: 'TOY-003',
                category: 'toys',
                price: 599,
                originalPrice: 699,
                stock: 30,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '訓練問題解決能力',
                createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'toy-snuffle-mat',
                name: '嗅聞訓練墊',
                sku: 'TOY-004',
                category: 'toys',
                price: 399,
                originalPrice: 499,
                stock: 25,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '激發嗅覺本能，舒緩焦慮',
                createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            },
            {
                id: 'toy-memory-buttons',
                name: '記憶按鈕遊戲',
                sku: 'TOY-005',
                category: 'toys',
                price: 899,
                originalPrice: 1099,
                stock: 15,
                status: 'active',
                imageUrl: 'https://via.placeholder.com/300',
                description: '強化記憶與反應力',
                createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
                updatedAt: Date.now()
            }
        ];

        for (const product of products) {
            await dbRun(`
                INSERT OR REPLACE INTO products (
                    id, name, sku, category, price, originalPrice, stock,
                    status, imageUrl, description, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                product.id, product.name, product.sku, product.category,
                product.price, product.originalPrice, product.stock,
                product.status, product.imageUrl, product.description,
                product.createdAt, product.updatedAt
            ]);
        }
        console.log(`   ✅ 已建立 ${products.length} 個測試商品\n`);

        // 3. 生成測試訂單
        console.log('🛒 生成測試訂單...');
        const testUser = users[1]; // test@example.com
        const orders = [];

        for (let i = 0; i < 5; i++) {
            const orderId = uuidv4();
            const orderDate = randomDate();
            const items = [
                { productId: products[0].id, name: products[0].name, price: products[0].price, quantity: 2 },
                { productId: products[1].id, name: products[1].name, price: products[1].price, quantity: 1 }
            ];
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shippingFee = subtotal >= 1000 ? 0 : 120; // 新竹物流運費 120 元
            const discount = subtotal >= 1000 ? 100 : 0;
            const total = subtotal + shippingFee - discount;

            // 插入訂單
            await dbRun(`
                INSERT OR REPLACE INTO orders (
                    id, userId, orderDate, subtotal, shippingFee, discount, total,
                    receiverName, receiverPhone, receiverEmail,
                    shippingMethod, shippingAddress, shippingCity,
                    paymentMethod, paymentStatus, status, deliveryStatus,
                    createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                orderId, testUser.id, orderDate, subtotal, shippingFee, discount, total,
                '測試用戶', '0923456789', 'test@example.com',
                'hsinchu_logistics', '測試地址123號', '台北市', // 新竹物流
                i % 2 === 0 ? 'credit_card' : 'cod', // 輪流使用不同付款方式
                i < 3 ? 'paid' : 'pending', // 前3筆已付款
                i < 3 ? 'confirmed' : 'pending',
                i < 2 ? 'shipped' : 'pending',
                orderDate, Date.now()
            ]);

            // 插入訂單項目
            for (const item of items) {
                await dbRun(`
                    INSERT OR REPLACE INTO order_items (
                        id, orderId, productId, name, price, quantity
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    uuidv4(), orderId, item.productId, item.name, item.price, item.quantity
                ]);
            }

            orders.push({ id: orderId, total });
        }
        console.log(`   ✅ 已建立 ${orders.length} 個測試訂單\n`);

        // 4. 生成測試購物車
        console.log('🛍️  生成測試購物車...');
        const cartItems = [
            {
                id: uuidv4(),
                userId: testUser.id,
                productId: products[0].id,
                quantity: 2,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: uuidv4(),
                userId: testUser.id,
                productId: products[1].id,
                quantity: 1,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];

        for (const item of cartItems) {
            await dbRun(`
                INSERT OR REPLACE INTO cart_items (
                    id, userId, productId, quantity, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                item.id, item.userId, item.productId, item.quantity,
                item.createdAt, item.updatedAt
            ]);
        }
        console.log(`   ✅ 已建立 ${cartItems.length} 個購物車項目\n`);

        console.log('✅ 測試數據生成完成！\n');
        console.log('📋 測試帳號:');
        console.log('   管理員: admin@jiangchong.com / admin123');
        console.log('   測試用戶: test@example.com / test123');
        console.log('   用戶一: user1@example.com / user123');
        console.log('\n📦 測試商品: 5 個');
        console.log('🛒 測試訂單: 5 筆');
        console.log('🛍️  購物車項目: 2 個\n');

    } catch (error) {
        console.error('❌ 生成測試數據失敗:', error);
        throw error;
    }
}

// 執行
async function main() {
    try {
        await seedTestData();
    } catch (error) {
        console.error('❌ 錯誤:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    main();
}

module.exports = { seedTestData };

