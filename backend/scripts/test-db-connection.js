/**
 * 資料庫連線測試腳本
 * 用於確認能否成功連接到 PostgreSQL 資料庫
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
    console.log('🔍 開始測試資料庫連線...');
    console.log('📋 環境變數檢查:');
    console.log('   DB_TYPE:', process.env.DB_TYPE || '未設定（將自動判斷）');
    console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ 已設定' : '❌ 未設定');
    
    if (!process.env.DATABASE_URL) {
        console.error('❌ 錯誤: DATABASE_URL 環境變數未設定');
        console.error('   請確認 Railway 已提供 DATABASE_URL，或手動設定以下變數:');
        console.error('   - DB_HOST');
        console.error('   - DB_PORT');
        console.error('   - DB_NAME');
        console.error('   - DB_USER');
        console.error('   - DB_PASSWORD');
        process.exit(1);
    }
    
    let pool;
    try {
        // 建立連接池
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        console.log('\n🔌 嘗試連接到 PostgreSQL...');
        
        // 測試 1: SELECT 1（最基本連線測試）
        console.log('\n📝 測試 1: SELECT 1');
        const result1 = await pool.query('SELECT 1 as test');
        console.log('   ✅ 成功！回應:', result1.rows[0]);
        
        // 測試 2: SELECT NOW()（確認資料庫功能正常）
        console.log('\n📝 測試 2: SELECT NOW()');
        const result2 = await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('   ✅ 成功！');
        console.log('   📅 資料庫時間:', result2.rows[0].current_time);
        console.log('   📦 PostgreSQL 版本:', result2.rows[0].pg_version.split(',')[0]);
        
        // 測試 3: 檢查現有資料表
        console.log('\n📝 測試 3: 檢查現有資料表');
        const result3 = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        
        if (result3.rows.length === 0) {
            console.log('   ⚠️  資料庫中沒有任何資料表（這是正常的，稍後會建立）');
        } else {
            console.log(`   ✅ 找到 ${result3.rows.length} 個資料表:`);
            result3.rows.forEach((row, index) => {
                console.log(`      ${index + 1}. ${row.table_name}`);
            });
        }
        
        // 測試 4: 檢查連接資訊（不顯示密碼）
        console.log('\n📝 測試 4: 連接資訊');
        const connectionInfo = new URL(process.env.DATABASE_URL);
        console.log('   🏠 主機:', connectionInfo.hostname);
        console.log('   🔌 端口:', connectionInfo.port);
        console.log('   📂 資料庫:', connectionInfo.pathname.substring(1));
        console.log('   👤 用戶:', connectionInfo.username);
        console.log('   🔐 密碼:', '***已隱藏***');
        
        console.log('\n✅ 所有連線測試通過！資料庫連接正常。');
        console.log('\n➡️  下一步: 執行 `npm run init-db` 或 `node scripts/init-db.js` 來建立資料表');
        
    } catch (error) {
        console.error('\n❌ 資料庫連線測試失敗！');
        console.error('錯誤訊息:', error.message);
        console.error('\n可能的原因:');
        console.error('1. DATABASE_URL 格式不正確');
        console.error('2. 資料庫服務未啟動');
        console.error('3. 網路連線問題');
        console.error('4. 認證資訊錯誤');
        console.error('\n請檢查:');
        console.error('- Railway PostgreSQL 服務狀態');
        console.error('- DATABASE_URL 環境變數是否正確');
        process.exit(1);
    } finally {
        if (pool) {
            await pool.end();
            console.log('\n🔌 資料庫連接已關閉');
        }
    }
}

testConnection();
