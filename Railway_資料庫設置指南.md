# Railway PostgreSQL 資料庫設置指南

**日期**: 2024-12-28  
**狀態**: ✅ 準備就緒

---

## ✅ 已完成的準備工作

1. ✅ PostgreSQL 驅動 (`pg`) 已安裝
2. ✅ 資料庫配置已支援 PostgreSQL
3. ✅ SQL 語法自動轉換（SQLite → PostgreSQL）
4. ✅ 資料表結構定義完整
5. ✅ 測試和初始化腳本已準備

---

## 🚀 執行步驟

### 步驟 1: 確認資料庫連線

在 Railway 環境中執行（或本地如果有 DATABASE_URL）：

```bash
cd backend
npm run test-db
```

**或手動執行**：
```bash
node scripts/test-db-connection.js
```

**預期輸出**：
```
✅ 已連接到 PostgreSQL 資料庫
✅ SELECT 1 成功
✅ SELECT NOW() 成功
⚠️  資料庫中沒有任何資料表（這是正常的，稍後會建立）
```

---

### 步驟 2: 建立資料表

在 Railway 環境中執行：

```bash
cd backend
npm run setup-db
```

**或使用現有的初始化腳本**：
```bash
npm run init-db
```

**或手動執行**：
```bash
node scripts/setup-railway-db.js
```

**預期輸出**：
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

## 📋 在 Railway 中執行的方式

### 方式一：使用 Railway CLI（推薦）

```bash
# 安裝 Railway CLI（如果還沒有）
npm i -g @railway/cli

# 登入 Railway
railway login

# 連接到專案
railway link

# 執行資料庫設置
railway run npm run setup-db
```

### 方式二：使用 Railway Web Console

1. 登入 Railway Dashboard
2. 選擇您的專案
3. 點擊後端服務（Backend Service）
4. 進入「Variables」標籤，確認 `DATABASE_URL` 已設定
5. 進入「Deployments」標籤
6. 點擊最新的部署（Deployment）
7. 進入「Logs」查看啟動日誌

**注意**：如果 `server.js` 中已經有自動初始化資料庫的邏輯，啟動時應該會自動建立資料表。

### 方式三：修改 server.js 自動初始化

檢查 `server.js` 是否已經有自動初始化：

```javascript
initDatabase()
    .then(() => {
        // 啟動伺服器
        app.listen(PORT, ...);
    })
```

如果已有，資料表應該會在服務啟動時自動建立。

---

## 🔍 驗證資料表是否建立成功

### 方式一：在 Railway PostgreSQL 服務中查看

1. 登入 Railway Dashboard
2. 選擇 PostgreSQL 資料庫服務
3. 點擊「Query」標籤
4. 執行以下 SQL：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**預期結果**：應該看到 11 個資料表

### 方式二：使用 API 測試

啟動後端服務後，訪問：
```
GET http://localhost:3000/health
```

應該返回：
```json
{
  "success": true,
  "message": "服務運行正常"
}
```

---

## 📝 預期建立的資料表

1. ✅ **users** - 用戶表
2. ✅ **products** - 商品表
3. ✅ **product_variants** - 商品規格表
4. ✅ **orders** - 訂單表
5. ✅ **order_items** - 訂單項目表
6. ✅ **quiz_results** - 測驗結果表
7. ✅ **subscriptions** - 訂閱表
8. ✅ **cart_items** - 購物車表
9. ✅ **settings** - 設定表
10. ✅ **coupons** - 優惠券表
11. ✅ **coupon_usage** - 優惠券使用記錄表

---

## 🐛 故障排除

### 問題 1: DATABASE_URL 未設定

**錯誤訊息**：
```
❌ 錯誤: DATABASE_URL 環境變數未設定
```

**解決方法**：
1. 確認 Railway PostgreSQL 服務已建立
2. 確認 PostgreSQL 服務已與後端服務連結
3. Railway 應該自動提供 `DATABASE_URL` 環境變數
4. 如果沒有，檢查「Variables」標籤

### 問題 2: 連接失敗

**錯誤訊息**：
```
❌ PostgreSQL 連接失敗: connection refused
```

**解決方法**：
1. 確認 PostgreSQL 服務正在運行（Railway Dashboard）
2. 檢查 `DATABASE_URL` 格式是否正確
3. 確認 SSL 設定（生產環境需要 `sslmode=require`）

### 問題 3: 資料表已存在

**訊息**：
```
⚠️  資料表已存在，將使用 CREATE TABLE IF NOT EXISTS（不會重複建立）
```

**這是正常的**！表示資料表已經建立，不會重複建立。

### 問題 4: 權限錯誤

**錯誤訊息**：
```
permission denied for schema public
```

**解決方法**：
Railway 的 PostgreSQL 應該已經有正確的權限。如果出現此錯誤，可能需要：
1. 確認用戶是否有 CREATE TABLE 權限
2. 聯繫 Railway 支援

---

## 📋 快速檢查清單

在 Railway 環境中執行以下檢查：

- [ ] `DATABASE_URL` 環境變數已設定
- [ ] PostgreSQL 服務正在運行
- [ ] 後端服務可以連接到 PostgreSQL
- [ ] `SELECT 1` 測試成功
- [ ] `SELECT NOW()` 測試成功
- [ ] 所有 11 個資料表已建立
- [ ] API 服務可以正常啟動
- [ ] 可以執行資料庫操作（查詢、插入、更新）

---

## 🎯 完成後的驗證

### 1. 測試建立用戶

```bash
curl -X POST http://your-api-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "測試用戶"
  }'
```

### 2. 測試建立產品（需要管理員權限）

```bash
curl -X POST http://your-api-url/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "測試產品",
    "price": 100,
    "category": "snacks"
  }'
```

### 3. 測試查詢產品

```bash
curl http://your-api-url/api/products
```

---

## 📝 注意事項

1. **資料表建立**：
   - 使用 `CREATE TABLE IF NOT EXISTS`，所以可以安全地重複執行
   - 不會刪除現有資料

2. **外鍵約束**：
   - 所有外鍵關係已正確設定
   - 刪除父記錄時會自動處理子記錄（ON DELETE CASCADE）

3. **資料類型**：
   - 時間戳使用 `BIGINT`（存儲 Unix 時間戳，毫秒）
   - 金額使用 `NUMERIC`（確保精度）
   - 文字使用 `TEXT` 或 `VARCHAR`

4. **索引**：
   - 主鍵自動創建索引
   - UNIQUE 約束自動創建索引
   - 外鍵也會自動創建索引

---

**設置完成後，您的應用程式就可以正常使用 PostgreSQL 資料庫了！** 🎉
