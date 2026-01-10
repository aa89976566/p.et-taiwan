/**
 * 創建管理員帳號腳本
 * 使用方法：
 * 1. 設置 DATABASE_URL 環境變數
 * 2. 運行：node backend/scripts/create-admin.js
 * 3. 或使用 Railway CLI：railway run node backend/scripts/create-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { Pool } = require('pg');

// 管理員資料
const ADMIN_DATA = {
    email: 'admin@jiangchong.com',  // 修改為你想要的 Email
    password: 'Admin@123456',        // 修改為你想要的密碼（至少 8 位）
    name: '匠寵管理員'
};

async function createAdmin() {
    console.log('🚀 開始創建管理員帳號...\n');

    // 檢查 DATABASE_URL
    if (!process.env.DATABASE_URL) {
        console.error('❌ 錯誤：DATABASE_URL 環境變數未設定');
        console.log('\n請設置 DATABASE_URL：');
        console.log('export DATABASE_URL="postgresql://..."');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        // 測試連接
        console.log('📊 測試資料庫連接...');
        await pool.query('SELECT NOW()');
        console.log('✅ 資料庫連接成功\n');

        // 檢查 Email 是否已存在
        console.log(`📧 檢查 Email 是否已存在: ${ADMIN_DATA.email}`);
        const checkResult = await pool.query(
            'SELECT id, email, "memberLevel" FROM users WHERE email = $1',
            [ADMIN_DATA.email]
        );

        if (checkResult.rows.length > 0) {
            const existingUser = checkResult.rows[0];
            console.log('⚠️  用戶已存在！');
            console.log(`   User ID: ${existingUser.id}`);
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Level: ${existingUser.memberLevel}`);

            if (existingUser.memberLevel === 'admin') {
                console.log('\n✅ 該帳號已經是管理員！');
            } else {
                console.log('\n🔄 將該帳號升級為管理員...');
                await pool.query(
                    'UPDATE users SET "memberLevel" = $1, "updatedAt" = $2 WHERE email = $3',
                    ['admin', Date.now(), ADMIN_DATA.email]
                );
                console.log('✅ 已升級為管理員！');
            }

            console.log('\n📝 登入資訊：');
            console.log(`   Email: ${ADMIN_DATA.email}`);
            console.log(`   密碼: (使用現有密碼)`);
            
            process.exit(0);
        }

        // 加密密碼
        console.log('🔐 加密密碼...');
        const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);
        console.log('✅ 密碼加密完成\n');

        // 生成 ID
        const adminId = uuidv4();
        const now = Date.now();

        // 創建管理員帳號
        console.log('👤 創建管理員帳號...');
        await pool.query(`
            INSERT INTO users (
                id, email, password, name, 
                "memberLevel", status, 
                "registeredAt", "createdAt", "updatedAt",
                "totalOrders", "totalSpent", "quizCompleted"
            ) VALUES (
                $1, $2, $3, $4, 
                $5, $6, 
                $7, $8, $9,
                $10, $11, $12
            )
        `, [
            adminId,
            ADMIN_DATA.email,
            hashedPassword,
            ADMIN_DATA.name,
            'admin',  // 管理員等級
            'active',
            now, now, now,
            0, 0, 0
        ]);

        console.log('✅ 管理員帳號創建成功！\n');

        // 驗證創建結果
        console.log('🔍 驗證創建結果...');
        const verifyResult = await pool.query(
            'SELECT id, email, name, "memberLevel", status FROM users WHERE email = $1',
            [ADMIN_DATA.email]
        );

        if (verifyResult.rows.length > 0) {
            const admin = verifyResult.rows[0];
            console.log('✅ 驗證成功！\n');
            console.log('═══════════════════════════════════');
            console.log('🎉 管理員帳號資訊');
            console.log('═══════════════════════════════════');
            console.log(`ID:       ${admin.id}`);
            console.log(`Email:    ${admin.email}`);
            console.log(`名稱:     ${admin.name}`);
            console.log(`等級:     ${admin.memberLevel}`);
            console.log(`狀態:     ${admin.status}`);
            console.log('═══════════════════════════════════\n');

            console.log('📝 登入資訊：');
            console.log(`   Email:    ${ADMIN_DATA.email}`);
            console.log(`   密碼:     ${ADMIN_DATA.password}`);
            console.log('\n⚠️  請妥善保管登入資訊！\n');

            console.log('🌐 登入後台：');
            console.log('   線上: https://aa89976566.github.io/p.et-taiwan/admin-login.html');
            console.log('');

        } else {
            console.error('❌ 驗證失敗：無法找到創建的帳號');
        }

    } catch (error) {
        console.error('\n❌ 錯誤：', error.message);
        console.error('\n詳細錯誤：', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// 執行
createAdmin();
