/**
 * 會員地址管理 - 資料庫 Migration
 * 新增 user_addresses 表
 */

-- 創建會員地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL,
    "recipientName" VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    "postalCode" VARCHAR(10),
    "isDefault" BOOLEAN DEFAULT false,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- 創建索引
CREATE INDEX idx_user_addresses_user_id ON user_addresses("userId");
CREATE INDEX idx_user_addresses_default ON user_addresses("userId", "isDefault");

-- 測試查詢
SELECT * FROM user_addresses WHERE "userId" = 'your-user-id';
