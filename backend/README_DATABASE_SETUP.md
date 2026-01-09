# Railway PostgreSQL 資料庫設置 - 完整指南

## ✅ 已完成準備

1. ✅ 資料庫配置支援 PostgreSQL
2. ✅ 自動初始化腳本已準備
3. ✅ 測試腳本已準備
4. ✅ 錯誤處理已完善

---

## 🎯 快速執行（3 步驟）

### 步驟 1️⃣: 確認連線

**在 Railway 環境中執行**：

```bash
railway run npm run test-db
```

**或使用 Railway Web Console Terminal**：

```bash
cd backend
node scripts/test-db-connection.js
```

**預期輸出**：
```
✅ 已連接到 PostgreSQL 資料庫
✅ SELECT 1 成功！回應: { test: 1 }
✅ SELECT NOW() 成功！
✅ PostgreSQL 連線測試通過
```

---

### 步驟 2️⃣: 建立資料表

**方法 A: 自動建立（推薦）**

服務啟動時會自動建立資料表。只需：

1. 確認 Railway 後端服務已重新部署
2. 查看部署日誌，應該看到：
   ```
   ✅ 已連接到 PostgreSQL 資料庫
   📊 開始建立 PostgreSQL 資料表...
   ✅ PostgreSQL 連線測試成功
   準備建立 11 個資料表...
      ✅ users 建立成功
      ✅ products 建立成功
      ...
   ✅ PostgreSQL 資料庫表結構初始化完成
   ```

**方法 B: 手動建立**

如果需要手動執行：

```bash
railway run npm run setup-db
```

或：

```bash
railway run npm run init-db
```

---

### 步驟 3️⃣: 驗證資料表

**在 Railway PostgreSQL 服務的 Query 介面執行**：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**預期結果**：應該看到 11 個資料表

---

## 📋 預期建立的資料表清單

| # | 資料表名稱 | 說明 |
|---|-----------|------|
| 1 | `users` | 用戶表 |
| 2 | `products` | 商品表 |
| 3 | `product_variants` | 商品規格表 |
| 4 | `orders` | 訂單表 |
| 5 | `order_items` | 訂單項目表 |
| 6 | `quiz_results` | 測驗結果表 |
| 7 | `subscriptions` | 訂閱表 |
| 8 | `cart_items` | 購物車表 |
| 9 | `settings` | 設定表 |
| 10 | `coupons` | 優惠券表 |
| 11 | `coupon_usage` | 優惠券使用記錄表 |

---

## 🔧 如果資料表未建立

### 檢查 1: 確認 DATABASE_URL 已設定

在 Railway Dashboard：
1. 選擇後端服務
2. 進入「Variables」標籤
3. 確認 `DATABASE_URL` 存在

### 檢查 2: 查看啟動日誌

在 Railway Dashboard：
1. 選擇後端服務
2. 進入「Deployments」
3. 查看最新的部署日誌

應該看到資料庫初始化的訊息。如果沒有，表示 `initDatabase()` 沒有被調用或執行失敗。

### 檢查 3: 手動執行初始化

```bash
railway run node scripts/setup-railway-db.js
```

---

## 🎯 成功標誌

當您看到以下訊息時，表示設置成功：

```
✅ 已連接到 PostgreSQL 資料庫
✅ PostgreSQL 連線測試成功
✅ PostgreSQL 資料庫表結構初始化完成（共 11 個資料表）
✅ 資料庫初始化完成
🚀 匠寵後端服務器已啟動
```

---

## 📝 下一步

資料表建立完成後，您可以：

1. ✅ 在後台新增產品
2. ✅ 在前台創建訂單
3. ✅ 測試所有 API 功能
4. ✅ 確認資料能正確儲存和讀取

---

**完成！** 🎉
