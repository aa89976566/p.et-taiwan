/**
 * 添加缺失的產品到資料庫
 * 這些產品在前端使用，但資料庫中不存在
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 資料庫路徑（使用與 server.js 相同的路徑）
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'jiangchong.db');

// 開啟資料庫連接
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ 無法連接到資料庫:', err.message);
        process.exit(1);
    }
    console.log('✅ 已連接到資料庫');
});

// 要添加的產品
const missingProducts = [
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
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
        createdAt: Date.now(),
        updatedAt: Date.now()
    }
];

// 插入產品
function insertProduct(product) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR REPLACE INTO products (
                id, name, sku, category, price, originalPrice, stock,
                status, imageUrl, description, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product.id,
                product.name,
                product.sku,
                product.category,
                product.price,
                product.originalPrice,
                product.stock,
                product.status,
                product.imageUrl,
                product.description,
                product.createdAt,
                product.updatedAt
            ],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

// 主函數
async function main() {
    console.log('🌱 開始添加缺失的產品...\n');

    try {
        for (const product of missingProducts) {
            try {
                await insertProduct(product);
                console.log(`✅ 已添加: ${product.name} (${product.id})`);
            } catch (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    console.log(`⚠️  產品已存在，已更新: ${product.name} (${product.id})`);
                } else {
                    console.error(`❌ 添加失敗 ${product.name}:`, err.message);
                }
            }
        }

        console.log('\n✅ 所有產品處理完成');
        db.close();
    } catch (error) {
        console.error('❌ 錯誤:', error);
        db.close();
        process.exit(1);
    }
}

// 執行
main();

