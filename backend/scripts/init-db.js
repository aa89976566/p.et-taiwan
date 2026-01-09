/**
 * 初始化資料庫腳本
 */
require('dotenv').config();
const { initDatabase, closeDatabase } = require('../config/database');

async function main() {
    console.log('開始初始化資料庫...');
    try {
        await initDatabase();
        console.log('✅ 資料庫初始化完成');
    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
        process.exit(1);
    } finally {
        await closeDatabase();
    }
}

main();

