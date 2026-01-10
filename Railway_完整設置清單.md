# ✅ Railway 數據庫完整設置清單

## 📋 當前進度

### ✅ 已完成
1. ✅ 創建 PostgreSQL 資料庫服務
2. ✅ 創建後端服務（p.et-taiwan）
3. ✅ 添加 Railway 部署配置文件（railway.toml, nixpacks.json）
4. ✅ 提交並推送配置文件到 GitHub

### 🔲 待完成

---

## 🚀 接下來的操作步驟

### 步驟 1: 在後端服務添加環境變數

**位置**：Railway Dashboard → 選擇 **「p.et-taiwan」** 服務 → **「Variables」** 標籤

**需要添加的環境變數**：

#### 1️⃣ DB_TYPE
```
變數名稱: DB_TYPE
變數值: postgresql
```

#### 2️⃣ NODE_ENV
```
變數名稱: NODE_ENV
變數值: production
```

#### 3️⃣ JWT_SECRET（重要：請保密）
```
變數名稱: JWT_SECRET
變數值: cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
```

#### 4️⃣ DATABASE_URL（檢查是否已存在）
- 如果 PostgreSQL 服務已連結到後端服務，這個變數應該已經自動存在
- 如果沒有，使用 **「Variable Reference」** 連結 PostgreSQL 的 DATABASE_URL

---

### 步驟 2: 重新部署服務

**方法 A：自動部署（推薦）**
- 添加環境變數後，Railway 通常會自動重新部署
- 等待 1-2 分鐘

**方法 B：手動部署**
1. 在 p.et-taiwan 服務頁面
2. 點擊 **「Deployments」** 標籤
3. 點擊 **「Redeploy」** 按鈕

---

### 步驟 3: 查看部署日誌

1. 在 **「Deployments」** 標籤
2. 點擊最新的部署
3. 點擊 **「View Logs」** 或直接查看日誌

**預期看到的成功訊息**：

```
✅ 檢測到 railway.toml 配置
📦 正在構建...
   cd backend && npm install
✅ 構建完成
🚀 啟動服務...
   cd backend && npm start

> jiangchong-backend@1.0.0 start
> node server.js

✅ 已連接到 PostgreSQL 資料庫
📊 資料庫類型: postgresql
🔍 使用 PostgreSQL 資料庫...
✅ PostgreSQL 連接池已建立
📊 開始建立 PostgreSQL 資料表...
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
   監聽端口: 3000
```

如果看到這些訊息，**恭喜！你的數據庫已經完全設置完成！** 🎉

---

### 步驟 4: 驗證資料表

**在 Railway PostgreSQL 服務的 Query 介面執行**：

1. 選擇左側的 **「Postgres」** 服務
2. 點擊 **「Query」** 標籤
3. 執行以下 SQL：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**應該看到 11 個資料表**：
- cart_items
- coupon_usage
- coupons
- order_items
- orders
- product_variants
- products
- quiz_results
- settings
- subscriptions
- users

---

## 🐛 故障排除

### 問題 1: 仍然顯示 "No start command was found"

**原因**：配置文件可能還沒有生效

**解決方法**：
1. 確認 railway.toml 和 nixpacks.json 已經推送到 GitHub
2. 在 Railway 手動設置（備選方案）：
   - 進入 p.et-taiwan 服務
   - 點擊 **「Settings」** 標籤
   - 找到 **「Root Directory」** 設置為：`backend`
   - 或在 **「Start Command」** 設置為：`cd backend && npm start`

### 問題 2: DATABASE_URL 未設定

**解決方法**：
1. 確認 PostgreSQL 服務狀態為 **「Online」**（綠色）
2. 在 p.et-taiwan 的 Variables 標籤：
   - 點擊 **「+ New Variable」**
   - 點擊 **「Variable Reference」**
   - 選擇 PostgreSQL 服務
   - 選擇 DATABASE_URL
   - 點擊 **「Add」**

### 問題 3: 連接失敗

**錯誤訊息範例**：
```
connection refused
ECONNREFUSED
```

**解決方法**：
1. 等待 2-3 分鐘讓 PostgreSQL 服務完全啟動
2. 確認 DATABASE_URL 的值正確
3. 確認 NODE_ENV=production（啟用 SSL）

### 問題 4: 資料表未建立

**解決方法**：
1. 確認部署日誌中有資料表建立的訊息
2. 如果沒有，手動執行（使用 Railway CLI）：
   ```bash
   railway run npm run setup-db
   ```
3. 或在 PostgreSQL Query 介面手動執行建表 SQL

---

## 📊 完整的環境變數檢查清單

部署成功後，你的 **p.et-taiwan** 服務應該有以下環境變數：

| 變數名稱 | 變數值 | 狀態 |
|---------|--------|------|
| `DATABASE_URL` | `postgresql://postgres:...` | 🔲 待檢查 |
| `DB_TYPE` | `postgresql` | 🔲 待添加 |
| `NODE_ENV` | `production` | 🔲 待添加 |
| `JWT_SECRET` | `cb7a88a14...` | 🔲 待添加 |
| `PORT` | `3000` (Railway 自動) | ✅ 通常自動 |

---

## 🎯 成功標準

完成所有步驟後，你應該能夠：

1. ✅ 訪問後端 API 健康檢查：
   ```
   https://your-service.railway.app/health
   ```
   
   應該返回：
   ```json
   {
     "success": true,
     "message": "服務運行正常",
     "timestamp": "..."
   }
   ```

2. ✅ 訪問資料表檢查端點：
   ```
   https://your-service.railway.app/api/check-tables
   ```
   
   應該返回：
   ```json
   {
     "success": true,
     "message": "資料庫連接正常",
     "dbType": "postgresql",
     "tableCount": 11,
     "tables": ["users", "products", ...]
   }
   ```

3. ✅ 在 PostgreSQL Query 介面看到 11 個資料表

---

## 📝 重要提醒

### 🔐 安全性

1. **JWT_SECRET** 是敏感資訊，請妥善保管
2. **DATABASE_URL** 包含資料庫密碼，不要公開分享
3. 定期備份你的資料庫

### 📱 後續步驟

數據庫設置完成後，你可以：

1. ✅ 創建管理員帳號
2. ✅ 在後台添加商品
3. ✅ 測試訂單流程
4. ✅ 連接前端到後端 API
5. ✅ 設置 LINE 登入
6. ✅ 配置付款系統（ECPay）

---

## 📞 需要幫助？

如果遇到問題，請提供：

1. 部署日誌的截圖或完整內容
2. 環境變數設置的截圖（隱藏敏感資訊）
3. 錯誤訊息的完整內容
4. Railway 服務的狀態（Online/Offline）

---

## 🎉 下一步

**現在請執行「步驟 1」：在 Railway 添加環境變數！**

完成後，系統應該會自動重新部署，然後你就可以看到數據庫自動初始化了！

祝你設置順利！🚀

---

**生成時間**: 2026-01-10  
**你的 JWT_SECRET**: `cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698`
