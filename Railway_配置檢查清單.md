# 🔍 Railway 部署配置檢查清單

## ✅ 已完成的配置

- ✅ `railway.toml` 配置文件已創建並提交
- ✅ `nixpacks.json` 配置文件已創建並提交
- ✅ 配置文件已推送到 GitHub

---

## ⚠️ 你需要在 Railway Dashboard 完成的步驟

### 🔴 **關鍵步驟 1: 連結 DATABASE_URL（必須！）**

**目前狀態**: ❌ 你說沒有連結資料庫

**為什麼必須**: 後端服務需要 `DATABASE_URL` 才能連接到 PostgreSQL 資料庫

**操作步驟**:

1. 進入 Railway Dashboard
2. 選擇 **p.et-taiwan** 服務（你的後端服務）
3. 點擊 **"Variables"** 標籤
4. 點擊 **"+ New Variable"** 或 **"Variable Reference"**
5. 選擇 **"Variable Reference"**
6. 在彈出視窗中：
   - **Service**: 選擇 **"Postgres"** 或你的 PostgreSQL 服務名稱
   - **Variable**: 選擇 **"DATABASE_URL"**
7. 點擊 **"Add"**
8. 確認 Variables 列表中出現 `DATABASE_URL`

**驗證**: 你應該在 Variables 標籤看到 `DATABASE_URL` 變數，值類似：
```
postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
```

---

### 🔴 **關鍵步驟 2: 添加必要的環境變數**

在 **p.et-taiwan** 的 **Variables** 標籤中，添加以下變數：

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

#### 3️⃣ JWT_SECRET
```
變數名稱: JWT_SECRET
變數值: cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
```

---

### 🔧 **步驟 3: 檢查 Settings 配置**

#### 在 **Settings > Deploy** 標籤中：

**Pre-deploy Command（前置部署命令）**:
- **建議**: 留空或刪除
- **原因**: `nixpacks.json` 會自動處理依賴安裝

**Custom Start Command（自訂啟動命令）**:
- **保持**: `cd backend && npm start`
- **狀態**: ✅ 你已經設置正確

**Root Directory（根目錄）**:
- **檢查**: 是否有設置為 `backend`
- **如果沒有**: 不用設置，因為我們在啟動命令中使用 `cd backend`

---

## 📋 **最終的環境變數列表**

完成後，你的 **p.et-taiwan** 服務的 **Variables** 標籤應該有：

```
✅ DATABASE_URL       postgresql://postgres:xxxxx@...  (從 Postgres 連結)
✅ DB_TYPE           postgresql
✅ NODE_ENV          production
✅ JWT_SECRET        cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
✅ PORT              3000 (或 Railway 自動提供的端口)
```

**總共至少 4 個必需變數，DATABASE_URL 最關鍵！**

---

## 🚀 **步驟 4: 重新部署**

1. 完成環境變數設置後
2. Railway 應該會自動觸發重新部署
3. 如果沒有，手動觸發：
   - 點擊 **"Deployments"** 標籤
   - 點擊 **"Redeploy"** 或 **"Deploy"** 按鈕

---

## ✅ **驗證部署成功**

### 查看部署日誌

在 **Deployments** 標籤中，點擊最新的部署，查看 **Logs**

**預期看到的成功訊息**:

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
✅ 資料庫初始化完成
🚀 匠寵後端服務器已啟動
   監聽端口: 3000
```

---

## ❌ **如果看到錯誤訊息**

### 錯誤 1: "DATABASE_URL 環境變數未設定"

**原因**: DATABASE_URL 沒有連結

**解決**: 按照上面的步驟連結 Postgres 的 DATABASE_URL

---

### 錯誤 2: "connection refused" 或 "ECONNREFUSED"

**原因**: DATABASE_URL 錯誤或 PostgreSQL 服務未運行

**解決**:
1. 確認左側 Postgres 服務顯示 **"Online"**（綠色）
2. 重新連結 DATABASE_URL
3. 檢查 DATABASE_URL 的值是否完整

---

### 錯誤 3: "Cannot find module 'pg'"

**原因**: 依賴沒有正確安裝

**解決**:
1. 確認 `backend/package.json` 包含 `"pg": "^8.11.3"`
2. 重新部署
3. 查看構建日誌確認 `npm install` 是否成功

---

## 📊 **快速檢查表**

使用這個檢查表確認所有設置正確：

- [ ] ✅ 已提交 `railway.toml` 到 Git
- [ ] ✅ 已提交 `nixpacks.json` 到 Git
- [ ] ✅ 已推送到 GitHub
- [ ] ⚠️ **在 Railway 連結了 DATABASE_URL**（你說還沒做）
- [ ] ⚠️ **添加了 DB_TYPE 環境變數**
- [ ] ⚠️ **添加了 NODE_ENV 環境變數**
- [ ] ⚠️ **添加了 JWT_SECRET 環境變數**
- [ ] Settings > Deploy 的 Custom Start Command 設置為 `cd backend && npm start`
- [ ] 已觸發重新部署
- [ ] 查看部署日誌確認成功

---

## 🎯 **你現在需要做的事情（按順序）**

### 1️⃣ **最優先**: 連結 DATABASE_URL
   - 在 p.et-taiwan 的 Variables 標籤
   - 使用 Variable Reference 連結 Postgres 的 DATABASE_URL

### 2️⃣ 添加其他環境變數
   - DB_TYPE = postgresql
   - NODE_ENV = production
   - JWT_SECRET = (上面提供的密鑰)

### 3️⃣ 確認 Settings 配置
   - Custom Start Command = `cd backend && npm start`

### 4️⃣ 重新部署並查看日誌
   - 確認資料庫連接成功
   - 確認資料表自動建立

---

## 🆘 **需要幫助？**

如果你遇到任何錯誤，請提供：
1. 部署日誌的截圖（包含錯誤訊息）
2. Variables 標籤的截圖（隱藏敏感資訊）
3. Settings > Deploy 的截圖

---

**現在就去 Railway Dashboard 連結 DATABASE_URL 吧！這是最關鍵的一步！** 🚀
