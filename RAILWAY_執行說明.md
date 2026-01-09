# Railway 資料庫設置 - 執行說明

## 🎯 三種執行方式

---

## 方式一：在 Railway Web Console 執行（最簡單）✅

### 步驟：

1. **登入 Railway Dashboard**
   - 前往 https://railway.app
   - 登入您的帳號

2. **選擇您的後端服務（Backend Service）**

3. **進入 Terminal/Shell**
   - 點擊服務名稱進入詳情
   - 找到「Terminal」或「Shell」標籤
   - 點擊進入終端機

4. **執行以下命令**：

```bash
cd backend
npm run setup-db
```

**預期輸出**：
```
✅ 已連接到 PostgreSQL 資料庫
📊 開始建立 PostgreSQL 資料表...
✅ PostgreSQL 連線測試成功
準備建立 11 個資料表...
   ✅ users 建立成功
   ✅ products 建立成功
   ...
✅ PostgreSQL 資料庫表結構初始化完成（共 11 個資料表）
```

---

## 方式二：使用 Railway CLI（需要安裝 CLI）

### 步驟 1: 安裝 Railway CLI

```bash
# 使用 npm（全域安裝）
npm install -g @railway/cli

# 或使用 Homebrew (macOS)
brew install railway

# 或使用其他安裝方式
curl -fsSL https://railway.app/install.sh | sh
```

### 步驟 2: 登入 Railway

```bash
railway login
```

### 步驟 3: 連接到專案

```bash
cd backend
railway link
```

### 步驟 4: 執行資料庫設置

```bash
railway run npm run setup-db
```

**或直接執行腳本**：

```bash
railway run node scripts/setup-railway-db.js
```

---

## 方式三：本地執行（如果有 DATABASE_URL）

### 如果您已經有 DATABASE_URL 環境變數：

```bash
cd backend

# 設定環境變數（從 Railway Dashboard 複製）
export DATABASE_URL="postgresql://..."

# 執行設置
npm run setup-db
```

**或使用提供的腳本**：

```bash
cd backend
export DATABASE_URL="your-database-url"
./執行資料庫設置.sh
```

---

## 📋 執行後驗證

### 在 Railway PostgreSQL 服務中驗證

1. 登入 Railway Dashboard
2. 選擇 PostgreSQL 資料庫服務
3. 點擊「Query」標籤
4. 執行以下 SQL：

```sql
-- 查看所有資料表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 應該看到 11 個資料表
```

**預期的資料表**：
- users
- products
- product_variants
- orders
- order_items
- quiz_results
- subscriptions
- cart_items
- settings
- coupons
- coupon_usage

---

## 🎯 推薦執行方式

**最簡單的方式是使用 Railway Web Console**：

1. 登入 Railway Dashboard
2. 選擇後端服務
3. 進入 Terminal
4. 執行：`cd backend && npm run setup-db`

這樣不需要安裝任何額外的工具！

---

## ⚠️ 注意事項

1. **自動初始化**：如果您的 `server.js` 已經配置了自動初始化，服務啟動時會自動建立資料表。您只需要重新部署服務即可。

2. **重新部署**：在 Railway Dashboard 中，選擇服務 → 「Deployments」→ 點擊「Redeploy」來重新部署。

3. **查看日誌**：在「Deployments」→ 最新的部署 → 「Logs」中查看初始化日誌。

---

## 🐛 如果遇到問題

### 問題 1: "DATABASE_URL 未設定"

**解決方法**：
- 確認 PostgreSQL 服務已建立
- 確認 PostgreSQL 服務已與後端服務連結
- 在 Railway Dashboard 中檢查環境變數

### 問題 2: "Cannot find module 'pg'"

**解決方法**：
```bash
cd backend
npm install
```

### 問題 3: 權限錯誤

**解決方法**：
- 在 Railway Web Console 中執行，不需要本地權限

---

**選擇最適合您的方式執行即可！** 🚀
