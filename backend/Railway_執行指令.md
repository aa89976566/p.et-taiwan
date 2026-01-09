# Railway PostgreSQL 資料庫設置 - 執行指令

## 🚀 快速執行（推薦）

在 Railway 環境中，服務啟動時會**自動初始化資料庫**（`server.js` 中有 `initDatabase()`）。

但如果需要手動執行，可以使用以下方式：

---

## 方式一：使用 Railway CLI（最簡單）

```bash
# 1. 安裝 Railway CLI
npm i -g @railway/cli

# 2. 登入
railway login

# 3. 連接到專案
railway link

# 4. 執行資料庫設置（測試連線 + 建立資料表）
railway run npm run setup-db

# 或者只測試連線
railway run npm run test-db

# 或者只初始化資料表
railway run npm run init-db
```

---

## 方式二：在 Railway Web Console 執行

### 方法 2-1: 使用 Railway 的 Terminal

1. 登入 Railway Dashboard
2. 選擇您的後端服務（Backend Service）
3. 點擊「Terminal」或「Shell」標籤
4. 執行：

```bash
npm run setup-db
```

### 方法 2-2: 檢查部署日誌

1. 登入 Railway Dashboard
2. 選擇後端服務
3. 查看「Deployments」→ 最新的部署 → 「Logs」
4. 應該會看到：

```
🔍 正在初始化資料庫...
✅ 已連接到 PostgreSQL 資料庫
📊 開始建立 PostgreSQL 資料表...
✅ PostgreSQL 連線測試成功
準備建立 11 個資料表...
   ✅ users 建立成功
   ✅ products 建立成功
   ...
✅ PostgreSQL 資料庫表結構初始化完成（共 11 個資料表）
✅ 資料庫初始化完成
🚀 匠寵後端服務器已啟動
```

---

## 方式三：直接執行 Node.js 腳本

```bash
# 在 Railway Terminal 中執行
cd backend
node scripts/setup-railway-db.js
```

---

## 🔍 驗證資料表是否建立

### 在 Railway PostgreSQL 服務中查看

1. 登入 Railway Dashboard
2. 選擇 PostgreSQL 資料庫服務
3. 點擊「Query」標籤
4. 執行：

```sql
-- 查看所有資料表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 查看特定資料表的結構
\d users

-- 計算資料表數量
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

**預期結果**：應該看到 11 個資料表

---

## 📋 完整的執行流程

### 步驟 1: 確認環境變數

在 Railway Dashboard 中檢查後端服務的環境變數：
- ✅ `DATABASE_URL` 已設定（Railway 自動提供）
- ✅ `NODE_ENV=production`（可選）

### 步驟 2: 重新部署（如果需要）

如果還沒有部署或需要重新部署：

```bash
railway up
```

或者在 Railway Dashboard 中：
1. 選擇服務
2. 點擊「Redeploy」

### 步驟 3: 檢查日誌

查看部署日誌，應該看到：
```
✅ 已連接到 PostgreSQL 資料庫
✅ PostgreSQL 資料庫表結構初始化完成
```

如果沒有看到，可能需要手動執行初始化。

---

## 🎯 一鍵執行腳本（本地測試用）

如果要在本地測試（需要有 `DATABASE_URL` 環境變數）：

```bash
cd backend
node scripts/setup-railway-db.js
```

這個腳本會：
1. ✅ 測試資料庫連線（SELECT 1）
2. ✅ 檢查現有資料表
3. ✅ 建立所有缺失的資料表
4. ✅ 驗證資料表建立成功

---

## ✅ 成功標誌

執行成功後，您應該看到：

```
✅ 資料庫連線測試通過！
✅ PostgreSQL 資料庫表結構初始化完成
✅ 資料庫中共有 11 個資料表:
   ✅ users
   ✅ products
   ✅ product_variants
   ✅ orders
   ✅ order_items
   ✅ quiz_results
   ✅ subscriptions
   ✅ cart_items
   ✅ settings
   ✅ coupons
   ✅ coupon_usage
```

---

## 🐛 如果執行失敗

### 錯誤: "Cannot find module 'pg'"

**解決方法**：
```bash
npm install
```

### 錯誤: "DATABASE_URL 未設定"

**解決方法**：
1. 確認 Railway PostgreSQL 服務已建立
2. 確認 PostgreSQL 服務已與後端服務連結
3. 在 Railway Dashboard 中檢查環境變數

### 錯誤: "connection refused"

**解決方法**：
1. 確認 PostgreSQL 服務正在運行
2. 檢查 `DATABASE_URL` 格式
3. 確認 SSL 設定

---

**執行完成後，您的資料庫就準備好了！** 🎉
