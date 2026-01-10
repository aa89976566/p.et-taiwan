# Railway 查看資料表 - 完整指南

## 🔍 方法 1: 在 Railway Dashboard 的 Database 標籤中查看

### 步驟：

1. **前往 Railway Dashboard**
   - 登入 https://railway.app

2. **選擇 PostgreSQL 服務**
   - 在左側面板，找到 **"Postgres"** 服務（PostgreSQL 圖標 🗄️）
   - **點擊 Postgres 服務卡片**

3. **進入 Database 標籤**
   - 在服務詳情頁頂部，點擊 **"Database"** 標籤
   - 您會看到子標籤：
     - **Data** ⭐（查看資料表的地方）
     - **Extensions**（擴展）
     - **Credentials**（認證資訊）

4. **查看 Data 標籤**
   - 點擊 **"Data"** 子標籤
   - 如果資料表已建立，您會看到資料表列表
   - 如果沒有資料表，會顯示 "You have no tables"

5. **執行 SQL 查詢（如果 Railway 提供此功能）**
   - 在 Data 標籤中，尋找：
     - "Query" 按鈕
     - "Run Query" 按鈕
     - SQL 輸入框
   - 如果沒有，可能需要使用其他方法

---

## 🔍 方法 2: 通過檢查後端服務日誌（最簡單）

### 步驟：

1. **前往 Railway Dashboard**
   - 選擇 **"p.et-taiwan"** 服務（後端服務）

2. **查看 Logs**
   - 點擊 **"Logs"** 標籤
   - 或點擊最新的部署 → **"View logs"**

3. **查找資料庫初始化訊息**

**如果初始化成功，應該會看到：**
```
🔍 正在初始化資料庫...
📊 資料庫類型: postgresql
🔍 使用 PostgreSQL 資料庫...
✅ PostgreSQL 連接池已建立
📊 開始建立 PostgreSQL 資料表...
✅ PostgreSQL 連線測試成功
準備建立 11 個資料表...

   ✅ users 建立成功
   ✅ products 建立成功
   ✅ product_variants 建立成功
   ✅ orders 建立成功
   ✅ order_items 建立成功
   ✅ quiz_results 建立成功
   ✅ subscriptions 建立成功
   ✅ cart_items 建立成功
   ✅ settings 建立成功
   ✅ coupons 建立成功
   ✅ coupon_usage 建立成功

✅ PostgreSQL 資料庫表結構初始化完成（共 11 個資料表）
✅ 資料庫初始化完成
🚀 匠寵後端服務器已啟動
```

**如果初始化失敗，會看到錯誤訊息。**

---

## 🔍 方法 3: 創建一個檢查資料表的 API 端點

我可以幫您創建一個簡單的 API 端點來檢查資料表。這樣您就可以通過瀏覽器或 API 調用來查看資料表列表。

---

## 🔍 方法 4: 使用 Railway CLI 執行 SQL

如果 Railway CLI 可用：

```bash
# 安裝 Railway CLI
npm install -g @railway/cli

# 登入
railway login

# 連接到專案
railway link

# 執行 SQL 查詢
railway run psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
```

---

## ✅ 推薦檢查步驟

### 步驟 1: 檢查後端服務日誌（最簡單）⭐

1. Railway Dashboard → "p.et-taiwan" 服務
2. 點擊 "Logs" 標籤
3. 查看是否有資料庫初始化的成功訊息

### 步驟 2: 檢查 Database Data 標籤

1. Railway Dashboard → Postgres 服務
2. 點擊 "Database" → "Data" 標籤
3. 查看是否顯示資料表列表（而不是 "You have no tables"）

### 步驟 3: 如果找不到 Query 功能

我可以幫您創建一個 API 端點來檢查資料表。

---

## 🎯 現在請先執行步驟 1

**請前往 Railway Dashboard → "p.et-taiwan" 服務 → Logs，告訴我您看到了什麼！**

這樣我就能知道資料庫是否已經成功初始化了。
