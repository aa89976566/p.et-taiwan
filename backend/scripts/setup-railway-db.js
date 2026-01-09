/**
 * Railway PostgreSQL 資料庫設置腳本
 * 用於在 Railway 環境中：
 * 1. 測試資料庫連線
 * 2. 建立所有資料表
 */

require('dotenv').config();
const { initDatabase, closeDatabase } = require('../config/database');

async function setupDatabase() {
    console.log('🚀 開始設置 Railway PostgreSQL 資料庫...\n');
    
    // 檢查環境變數
    console.log('📋 環境變數檢查:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
    console.log('   DB_TYPE:', process.env.DB_TYPE || '未設定（將自動判斷）');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ 已設定' : '❌ 未設定');
    console.log('');
    
    if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
        console.error('❌ 錯誤: 未找到資料庫連接資訊');
        console.error('   請確認 Railway 已提供 DATABASE_URL 環境變數');
        process.exit(1);
    }
    
    try {
        // 步驟 1: 測試基本連線
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('步驟 1: 測試資料庫連線');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        try {
            // 測試 SELECT 1
            console.log('🔍 執行 SELECT 1 測試...');
            const testResult = await pool.query('SELECT 1 as test');
            console.log('   ✅ SELECT 1 成功！回應:', testResult.rows[0]);
            
            // 測試 SELECT NOW()
            console.log('🔍 執行 SELECT NOW() 測試...');
            const timeResult = await pool.query('SELECT NOW() as current_time, version() as pg_version');
            console.log('   ✅ SELECT NOW() 成功！');
            console.log('   📅 資料庫時間:', timeResult.rows[0].current_time);
            console.log('   📦 PostgreSQL 版本:', timeResult.rows[0].pg_version.split(',')[0].trim());
            
            // 檢查現有資料表
            console.log('🔍 檢查現有資料表...');
            const tablesResult = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `);
            
            if (tablesResult.rows.length === 0) {
                console.log('   ⚠️  資料庫中沒有任何資料表');
                console.log('   ➡️  這表示需要建立資料表');
            } else {
                console.log(`   ✅ 找到 ${tablesResult.rows.length} 個現有資料表:`);
                tablesResult.rows.forEach((row, index) => {
                    console.log(`      ${index + 1}. ${row.table_name}`);
                });
                console.log('   ⚠️  資料表已存在，將使用 CREATE TABLE IF NOT EXISTS（不會重複建立）');
            }
            
            await pool.end();
            console.log('\n✅ 資料庫連線測試通過！\n');
            
        } catch (error) {
            await pool.end();
            throw error;
        }
        
        // 步驟 2: 初始化資料庫（建立資料表）
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('步驟 2: 建立資料表結構');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔨 開始建立資料表...\n');
        
        await initDatabase();
        
        console.log('\n✅ 所有資料表建立完成！\n');
        
        // 步驟 3: 驗證資料表
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('步驟 3: 驗證資料表');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        const verifyPool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        try {
            const verifyResult = await verifyPool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            `);
            
            console.log(`✅ 資料庫中共有 ${verifyResult.rows.length} 個資料表:\n`);
            
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
            
            const existingTableNames = verifyResult.rows.map(r => r.table_name);
            
            expectedTables.forEach(tableName => {
                if (existingTableNames.includes(tableName)) {
                    console.log(`   ✅ ${tableName}`);
                } else {
                    console.log(`   ❌ ${tableName} (缺失)`);
                }
            });
            
            console.log('\n✅ 資料庫設置完成！');
            console.log('\n📝 接下來可以:');
            console.log('   - 在後台新增產品');
            console.log('   - 在前台創建訂單');
            console.log('   - 測試所有功能');
            
        } finally {
            await verifyPool.end();
        }
        
    } catch (error) {
        console.error('\n❌ 資料庫設置失敗！');
        console.error('錯誤訊息:', error.message);
        console.error('\n錯誤詳情:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

// 執行設置
setupDatabase();
