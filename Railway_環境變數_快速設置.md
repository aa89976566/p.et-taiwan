# 🚀 Railway 環境變數快速設置指南

## ⚠️ 重要：操作位置

你的截圖顯示的是 **PostgreSQL 資料庫服務** 的變數頁面。

**但是！環境變數應該添加到你的「後端服務」，而不是資料庫服務！**

---

## 📍 正確的操作步驟

### 步驟 1: 切換到後端服務

在 Railway Dashboard 左側：

```
目前位置：
├─ Postgres ← 你現在在這裡（❌ 錯誤位置）
│  └─ Variables (你看到的畫面)
│
└─ p.et-taiwan ← 你應該在這裡（✅ 正確位置）
   └─ Variables (需要添加環境變數的地方)
```

**操作**：點擊左側的 **「p.et-taiwan」** 服務

---

### 步驟 2: 進入 Variables 標籤

在 **p.et-taiwan** 服務頁面頂部，點擊 **「Variables」** 標籤

---

### 步驟 3: 添加環境變數

點擊 **「+ New Variable」** 按鈕，依次添加以下變數：

---

## 📝 需要添加的 4 個環境變數

### 1️⃣ DATABASE_URL

**檢查是否已存在**：
- 如果已經連結了 PostgreSQL 服務，這個變數應該已經自動存在
- 搜尋看看是否有 `DATABASE_URL`

**如果沒有**：
```
點擊 「+ New Variable」
選擇 「Variable Reference」
選擇你的 PostgreSQL 服務
選擇 DATABASE_URL
點擊 「Add」
```

---

### 2️⃣ DB_TYPE

```
變數名稱: DB_TYPE
變數值: postgresql
```

點擊 **「Add」** 按鈕

---

### 3️⃣ NODE_ENV

```
變數名稱: NODE_ENV
變數值: production
```

點擊 **「Add」** 按鈕

---

### 4️⃣ JWT_SECRET

```
變數名稱: JWT_SECRET
變數值: cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
```

**重要**：這是為你生成的安全密鑰，請妥善保管！

點擊 **「Add」** 按鈕

---

## ✅ 完成後的檢查

添加完成後，你的 **p.et-taiwan** 服務的 Variables 頁面應該有：

```
✅ DATABASE_URL      postgresql://postgres:xxxxx@...
✅ DB_TYPE          postgresql
✅ NODE_ENV         production
✅ JWT_SECRET       cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
✅ PORT            3000 (Railway 可能自動提供)
```

---

## 🔄 重新部署

添加環境變數後：

1. Railway 通常會**自動重新部署**
2. 如果沒有自動部署，請手動觸發：
   - 點擊 **「Deployments」** 標籤
   - 點擊 **「Redeploy」** 按鈕

---

## 📊 驗證部署成功

### 查看部署日誌

1. 在 **p.et-taiwan** 服務中
2. 點擊 **「Deployments」** 標籤
3. 點擊最新的部署
4. 查看 **「Logs」**

### 預期看到的訊息

```
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
🚀 匠寵後端服務器已啟動
   監聽端口: 3000
```

如果看到這些訊息，**恭喜！你的資料庫已經自動初始化完成！** 🎉

---

## 🐛 如果遇到錯誤

### 錯誤 1: "DATABASE_URL 環境變數未設定"

**原因**：DATABASE_URL 沒有正確添加

**解決方法**：
1. 確認你在 **p.et-taiwan** 服務（不是 Postgres 服務）
2. 使用 Variable Reference 連結 PostgreSQL 的 DATABASE_URL
3. 或從 Postgres 服務的 Connect 標籤手動複製 DATABASE_URL

### 錯誤 2: "connection refused"

**原因**：PostgreSQL 服務未啟動或連接資訊錯誤

**解決方法**：
1. 確認左側的 **Postgres** 服務顯示為 **「Online」**（綠色）
2. 確認 DATABASE_URL 的值正確
3. 等待幾分鐘後重新部署

### 錯誤 3: 沒有看到資料表建立日誌

**原因**：可能是舊的部署，或初始化失敗

**解決方法**：
1. 手動重新部署服務
2. 或使用 Railway CLI 執行：`railway run npm run setup-db`

---

## 🎯 視覺化操作流程

```
1. Railway Dashboard 
   └─> 選擇你的專案

2. 左側服務列表
   ├─ Postgres (資料庫) ← 不要在這裡操作
   └─ p.et-taiwan (後端) ← ✅ 在這裡操作

3. p.et-taiwan 服務頁面
   └─> 點擊 「Variables」 標籤

4. Variables 頁面
   └─> 點擊 「+ New Variable」
       ├─> 添加 DB_TYPE = postgresql
       ├─> 添加 NODE_ENV = production
       ├─> 添加 JWT_SECRET = (生成的密鑰)
       └─> 添加或連結 DATABASE_URL

5. 等待自動重新部署
   └─> 或手動觸發重新部署

6. 查看部署日誌
   └─> 確認資料表建立成功
```

---

## 📞 下一步

完成環境變數設置並重新部署後：

1. ✅ 資料表會自動建立
2. ✅ 後端 API 可以正常運作
3. ✅ 可以開始測試功能
4. ✅ 前端可以連接到後端

---

**如果還有問題，請提供：**
- 部署日誌的截圖
- 環境變數的截圖（隱藏敏感資訊）
- 錯誤訊息的完整內容

祝你設置順利！🚀
