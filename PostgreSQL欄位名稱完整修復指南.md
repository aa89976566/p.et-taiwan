# 🔧 PostgreSQL 欄位名稱完整修復指南

## 📋 問題根源

### Railway PostgreSQL 資料表結構

在 `backend/config/database.js` 中，PostgreSQL 的 `users` 表定義：

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name VARCHAR(255),
    phone VARCHAR(50),
    avatar TEXT,
    lineId VARCHAR(255),                    -- ❌ 沒有雙引號 → 會變成 lineid
    memberLevel VARCHAR(50) DEFAULT 'normal', -- ❌ 沒有雙引號 → 會變成 memberlevel
    status VARCHAR(50) DEFAULT 'active',
    "registeredAt" BIGINT,                  -- ✅ 有雙引號 → 保留大小寫
    "lastLoginAt" BIGINT,                   -- ✅ 有雙引號 → 保留大小寫
    "totalOrders" INTEGER DEFAULT 0,        -- ✅ 有雙引號 → 保留大小寫
    "totalSpent" NUMERIC DEFAULT 0,         -- ✅ 有雙引號 → 保留大小寫
    "quizCompleted" INTEGER DEFAULT 0,      -- ✅ 有雙引號 → 保留大小寫
    "createdAt" BIGINT,                     -- ✅ 有雙引號 → 保留大小寫
    "updatedAt" BIGINT                      -- ✅ 有雙引號 → 保留大小寫
)
```

### PostgreSQL 大小寫規則

| 欄位定義 | PostgreSQL 實際儲存 | SQL 查詢時應使用 |
|---------|-------------------|---------------|
| `memberLevel` | `memberlevel` | `memberlevel` 或 `"memberlevel"` |
| `"memberLevel"` | `memberLevel` | `"memberLevel"` |
| `lineId` | `lineid` | `lineid` |
| `"registeredAt"` | `registeredAt` | `"registeredAt"` |

---

## 🔧 修復內容

### 修改檔案：`backend/routes/auth.js`

#### 1. 註冊功能 - INSERT 語句

**修改前：**
```javascript
INSERT INTO users (id, email, password, name, phone, "memberLevel", status, "registeredAt", "lastLoginAt", "createdAt", "updatedAt")
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**修改後：**
```javascript
INSERT INTO users (id, email, password, name, phone, memberlevel, status, "registeredAt", "lastLoginAt", "createdAt", "updatedAt")
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**變更：** `"memberLevel"` → `memberlevel`（移除雙引號，讓 PostgreSQL 自動轉為小寫）

---

#### 2. 登入功能 - 返回數據映射

**修改前：**
```javascript
user: {
    memberLevel: user.memberLevel,  // ❌ 資料庫中是 memberlevel（小寫）
    totalOrders: user.totalOrders,
    totalSpent: user.totalSpent
}
```

**修改後：**
```javascript
user: {
    memberLevel: user.memberlevel,  // ✅ 從資料庫的 memberlevel 讀取
    totalOrders: user.totalOrders,   // ✅ 資料庫中是 "totalOrders"（有雙引號）
    totalSpent: user.totalSpent      // ✅ 資料庫中是 "totalSpent"（有雙引號）
}
```

---

#### 3. 獲取用戶資訊 - SELECT 語句

**修改前：**
```javascript
SELECT id, email, name, phone, avatar, memberLevel, totalOrders, totalSpent, quizCompleted 
FROM users WHERE id = ?
```

**修改後：**
```javascript
SELECT id, email, name, phone, avatar, memberlevel, "totalOrders", "totalSpent", "quizCompleted" 
FROM users WHERE id = ?
```

**變更：**
- `memberLevel` → `memberlevel`（小寫）
- `totalOrders` → `"totalOrders"`（加雙引號）
- `totalSpent` → `"totalSpent"`（加雙引號）
- `quizCompleted` → `"quizCompleted"`（加雙引號）

---

## ✅ 修復結果

### Commit 資訊
```
Commit: ffc42a5
訊息: 修復 memberLevel 欄位名稱大小寫問題
日期: 2026-01-10
```

### 已推送到 GitHub
```
To https://github.com/aa89976566/p.et-taiwan.git
   24f0269..ffc42a5  main -> main
```

---

## 🧪 測試步驟

### 1. 等待 Railway 自動部署（2-3 分鐘）

查看部署狀態：
```bash
cd "/Users/ming/Desktop/keyboard clicking/p.et/網站"
railway logs --tail 20
```

---

### 2. 測試註冊 API

```bash
curl -X POST https://pet-taiwan-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試用戶",
    "email": "newuser@example.com",
    "password": "Test123456"
  }'
```

**預期成功回應：**
```json
{
  "success": true,
  "message": "註冊成功",
  "data": {
    "user": {
      "id": "...",
      "name": "測試用戶",
      "email": "newuser@example.com",
      "phone": "",
      "memberLevel": "normal"
    },
    "token": "..."
  }
}
```

---

### 3. 測試登入 API

```bash
curl -X POST https://pet-taiwan-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "Test123456"
  }'
```

---

### 4. 驗證資料庫

```bash
railway run psql -c "SELECT id, email, name, memberlevel, \"registeredAt\" FROM users ORDER BY \"createdAt\" DESC LIMIT 5;"
```

---

## 📊 其他需要檢查的檔案

以下檔案可能也有類似問題：

### 需要檢查的路由檔案
- `backend/routes/products.js`
- `backend/routes/orders.js`
- `backend/routes/cart.js`
- `backend/routes/coupons.js`
- `backend/routes/subscriptions.js`

### 檢查要點

1. **INSERT/UPDATE 語句**：
   - 沒有雙引號的欄位（如 `memberLevel`, `lineId`）→ 使用小寫（`memberlevel`, `lineid`）
   - 有雙引號的欄位（如 `"registeredAt"`）→ 加雙引號（`"registeredAt"`）

2. **SELECT 語句**：
   - 同上規則

3. **返回給前端的數據**：
   - 前端期望 camelCase（駝峰式）
   - 需要從資料庫的小寫欄位映射到 camelCase
   - 例如：`memberLevel: user.memberlevel`

---

## 🎯 完整測試清單

- [ ] **等待 Railway 部署**（2-3 分鐘）
- [ ] **測試 curl 註冊**
- [ ] **測試 curl 登入**
- [ ] **測試前端註冊**（網站上直接註冊）
- [ ] **測試前端登入**
- [ ] **檢查資料庫**（railway run psql）
- [ ] **測試後台登入**（管理員帳號）
- [ ] **檢查其他路由檔案**

---

## 💡 最佳實踐建議

### 方案 1：統一使用小寫欄位名稱（推薦）

修改 `database.js`，所有 PostgreSQL 欄位都不使用雙引號：

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    memberlevel VARCHAR(50) DEFAULT 'normal',
    registeredat BIGINT,
    lastloginat BIGINT,
    totalorders INTEGER DEFAULT 0,
    totalspent NUMERIC DEFAULT 0
)
```

**優點：**
- 不需要記住哪些欄位有雙引號
- SQL 查詢簡單，不需要雙引號

**缺點：**
- 需要重建資料表或遷移資料

---

### 方案 2：統一使用駝峰式並加雙引號

修改 `database.js`，所有 PostgreSQL 欄位都加雙引號：

```sql
CREATE TABLE IF NOT EXISTS users (
    "id" VARCHAR(255) PRIMARY KEY,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "memberLevel" VARCHAR(50) DEFAULT 'normal',
    "registeredAt" BIGINT
)
```

**優點：**
- 保持駝峰式命名，可讀性好
- 與前端 JSON 格式一致

**缺點：**
- 所有 SQL 查詢都需要加雙引號
- 容易出錯

---

## 🔗 相關連結

- GitHub 倉庫：https://github.com/aa89976566/p.et-taiwan
- Railway 後端：https://pet-taiwan-production.up.railway.app
- 前端網站：https://aa89976566.github.io/p.et-taiwan/
- PostgreSQL 命名規則文檔：https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

---

**修復完成時間：** 2026-01-10 23:30
**修復者：** Claude AI Assistant
