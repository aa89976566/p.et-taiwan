/**
 * 測試後端伺服器啟動
 * 用於診斷啟動問題
 */

console.log('🔍 開始診斷後端伺服器啟動問題...\n');

// 1. 檢查 Node.js 版本
console.log('1. 檢查 Node.js 版本...');
console.log('   Node.js:', process.version);
console.log('   NPM:', require('child_process').execSync('npm --version').toString().trim());
console.log('');

// 2. 檢查依賴
console.log('2. 檢查依賴...');
try {
    require('express');
    console.log('   ✅ express 已安裝');
} catch (e) {
    console.log('   ❌ express 未安裝');
}

try {
    require('sqlite3');
    console.log('   ✅ sqlite3 已安裝');
} catch (e) {
    console.log('   ❌ sqlite3 未安裝');
}

try {
    require('dotenv');
    console.log('   ✅ dotenv 已安裝');
} catch (e) {
    console.log('   ❌ dotenv 未安裝');
}
console.log('');

// 3. 檢查環境變數
console.log('3. 檢查環境變數...');
require('dotenv').config();
console.log('   PORT:', process.env.PORT || '3000 (預設)');
console.log('   DB_PATH:', process.env.DB_PATH || 'data/jiangchong.db (預設)');
console.log('   ECPAY_MERCHANT_ID:', process.env.ECPAY_MERCHANT_ID || '未設定');
console.log('');

// 4. 檢查資料庫目錄
console.log('4. 檢查資料庫目錄...');
const fs = require('fs');
const path = require('path');
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data/jiangchong.db');
const dbDir = path.dirname(dbPath);

if (fs.existsSync(dbDir)) {
    console.log('   ✅ 資料庫目錄存在:', dbDir);
} else {
    console.log('   ⚠️  資料庫目錄不存在，將自動建立:', dbDir);
}

if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    console.log('   ✅ 資料庫檔案存在:', dbPath);
    console.log('   檔案大小:', (stats.size / 1024).toFixed(2), 'KB');
} else {
    console.log('   ⚠️  資料庫檔案不存在，將自動建立:', dbPath);
}
console.log('');

// 5. 測試資料庫連接
console.log('5. 測試資料庫連接...');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log('   ❌ 資料庫連接失敗:', err.message);
    } else {
        console.log('   ✅ 資料庫連接成功');
        db.close();
    }
});
console.log('');

// 6. 測試 Express 應用
console.log('6. 測試 Express 應用...');
try {
    const express = require('express');
    const app = express();
    console.log('   ✅ Express 應用建立成功');
    
    // 測試端口
    const PORT = process.env.PORT || 3000;
    console.log('   📍 將使用端口:', PORT);
    
    // 檢查端口是否被占用
    const net = require('net');
    const server = net.createServer();
    server.listen(PORT, () => {
        server.close(() => {
            console.log('   ✅ 端口', PORT, '可用');
        });
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log('   ❌ 端口', PORT, '已被占用');
        } else {
            console.log('   ❌ 端口檢查失敗:', err.message);
        }
    });
} catch (e) {
    console.log('   ❌ Express 應用建立失敗:', e.message);
}
console.log('');

// 7. 檢查路由檔案
console.log('7. 檢查路由檔案...');
const routes = [
    'routes/auth.js',
    'routes/products.js',
    'routes/orders.js',
    'routes/cart.js',
    'routes/ecpay.js',
    'routes/quiz.js',
    'routes/admin.js',
    'routes/coupons.js'
];

routes.forEach(route => {
    const routePath = path.join(__dirname, route);
    if (fs.existsSync(routePath)) {
        console.log('   ✅', route);
    } else {
        console.log('   ❌', route, '- 檔案不存在');
    }
});
console.log('');

console.log('✅ 診斷完成！');
console.log('\n如果所有檢查都通過，請嘗試執行: npm start');
console.log('如果仍有問題，請查看上方的錯誤訊息。\n');



