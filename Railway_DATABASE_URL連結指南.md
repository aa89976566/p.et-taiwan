# 🎯 Railway DATABASE_URL 連結操作指南

## ⚠️ 重要警告

**你說：「目前我沒有新增 database 連結到 p.et-taiwan」**

### ❌ 這是不可以的！必須連結！

**沒有 DATABASE_URL 會導致：**
- ❌ 後端無法連接到資料庫
- ❌ 服務啟動失敗
- ❌ 所有 API 都無法運作
- ❌ 資料表無法建立

---

## 🔗 如何連結 DATABASE_URL（3 種方法）

### 方法 1: 使用 Variable Reference（最推薦）⭐

#### 步驟：

1. **進入 p.et-taiwan 服務**
2. **點擊 "Variables" 標籤**
3. **尋找頁面頂部的提示訊息**：
   ```
   "Trying to connect this database to a service? 
    Add a Variable Reference"
   ```
4. **點擊 "Variable Reference" 連結**
5. **在彈出的對話框中**：
   - **Service**: 選擇你的 **Postgres** 服務（應該叫 "Postgres" 或 "postgres"）
   - **Variable**: 選擇 **DATABASE_URL**
6. **點擊 "Add" 按鈕**

#### 優點：
- ✅ 自動同步
- ✅ 如果 Postgres URL 改變，會自動更新
- ✅ Railway 推薦的方式

---

### 方法 2: 從 Postgres 服務複製（備選）

#### 步驟 A - 獲取 DATABASE_URL：

1. **在左側服務列表，點擊 "Postgres" 服務**（不是 p.et-taiwan）
2. **點擊 "Connect" 標籤**
3. **找到 "Postgres Connection URL"**
4. **點擊複製按鈕**（應該會複製類似這樣的 URL）：
   ```
   postgresql://postgres:xxxxxxxxxxxxxx@containers-us-west-123.railway.app:5432/railway
   ```

#### 步驟 B - 添加到 p.et-taiwan：

1. **回到 p.et-taiwan 服務**
2. **點擊 "Variables" 標籤**
3. **點擊 "+ New Variable" 按鈕**
4. **輸入**：
   - **變數名稱**: `DATABASE_URL`
   - **變數值**: 貼上剛才複製的 URL
5. **點擊 "Add" 按鈕**

---

### 方法 3: 使用 Variables 標籤的快速連結

#### 步驟：

1. **進入 p.et-taiwan 服務**
2. **點擊 "Variables" 標籤**
3. **點擊右上角的 "Shared Variable" 或連結圖標**
4. **選擇 Postgres 服務的 DATABASE_URL**
5. **點擊 "Add"**

---

## 📊 驗證 DATABASE_URL 是否正確設置

### 檢查方法 1: 在 Variables 標籤查看

連結成功後，你應該在 p.et-taiwan 的 Variables 標籤看到：

```
DATABASE_URL
postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway

🔗 (可能有連結圖標表示這是引用)
```

### 檢查方法 2: 使用 Raw Editor

1. 在 Variables 標籤
2. 點擊 "Raw Editor"
3. 應該看到：
   ```json
   {
     "DATABASE_URL": "${{Postgres.DATABASE_URL}}",
     "DB_TYPE": "postgresql",
     "NODE_ENV": "production",
     "JWT_SECRET": "cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698"
   }
   ```

如果看到 `${{Postgres.DATABASE_URL}}`，表示使用 Variable Reference（最好的方式）。

---

## 🎯 完整的環境變數設置清單

完成後，你的 p.et-taiwan 服務應該有這些環境變數：

### 必需的 4 個變數：

```bash
# 1. 資料庫連接 URL（從 Postgres 服務連結）
DATABASE_URL = postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway

# 2. 資料庫類型
DB_TYPE = postgresql

# 3. 運行環境
NODE_ENV = production

# 4. JWT 密鑰
JWT_SECRET = cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698
```

### 選填（Railway 通常自動提供）：

```bash
# 端口（Railway 自動設置）
PORT = 3000
```

---

## ✅ 完成所有設置後的操作流程

### 1️⃣ 保存 Settings（如果還沒做）

```
位置：Settings → Deploy
操作：點擊左上角的 "Apply 2 changes" 按鈕
```

### 2️⃣ 確認所有環境變數

```
位置：Variables 標籤
檢查：確認 DATABASE_URL, DB_TYPE, NODE_ENV, JWT_SECRET 都已設置
```

### 3️⃣ 重新部署

```
位置：Deployments 標籤
操作：
1. 點擊 "Deployments" 標籤
2. 點擊 "Redeploy" 按鈕
3. 等待部署完成
```

### 4️⃣ 查看部署日誌

```
位置：Deployments → 點擊最新部署 → Logs

預期成功訊息：
✅ 已連接到 PostgreSQL 資料庫
📊 資料庫類型: postgresql
✅ PostgreSQL 連接池已建立
📊 開始建立 PostgreSQL 資料表...
   ✅ users 建立成功
   ✅ products 建立成功
   ... (共 11 個資料表)
✅ PostgreSQL 資料庫表結構初始化完成
🚀 匠寵後端服務器已啟動
   監聽端口: 3000
```

---

## 🐛 常見問題

### 問題 1: 找不到 Variable Reference 選項

**解決方法**：
- 使用方法 2：手動從 Postgres 服務複製 DATABASE_URL
- 確保你在正確的服務（p.et-taiwan，不是 Postgres）

### 問題 2: DATABASE_URL 格式不正確

**正確格式**：
```
postgresql://[用戶名]:[密碼]@[主機]:[端口]/[資料庫名]
```

**示例**：
```
postgresql://postgres:abc123xyz@containers-us-west-123.railway.app:5432/railway
```

### 問題 3: 部署後仍然連接失敗

**檢查清單**：
1. ✅ DATABASE_URL 是否正確設置
2. ✅ Postgres 服務是否正在運行（左側顯示 Online）
3. ✅ DB_TYPE 是否設置為 `postgresql`
4. ✅ NODE_ENV 是否設置為 `production`

---

## 📝 為什麼 DATABASE_URL 這麼重要？

### 你的後端代碼需要它：

**文件**: `backend/config/database.js`

```javascript
// 第 10 行：自動判斷資料庫類型
const DB_TYPE = process.env.DB_TYPE || 
                (process.env.DATABASE_URL ? 'postgresql' : 'sqlite');

// 第 43-46 行：使用 DATABASE_URL 創建連接
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
}
```

**沒有 DATABASE_URL，代碼會：**
1. 無法判斷使用 PostgreSQL
2. 無法創建資料庫連接池
3. 所有資料庫操作都會失敗

---

## 🎯 現在立即要做的事情

### ⚡ 緊急步驟（按順序執行）：

1. **✅ 保存 Settings**
   - 點擊 "Apply 2 changes"

2. **🔗 連結 DATABASE_URL**
   - 使用方法 1（Variable Reference）
   - 或方法 2（手動複製）

3. **📝 添加其他環境變數**
   - DB_TYPE = postgresql
   - NODE_ENV = production
   - JWT_SECRET = cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698

4. **🚀 重新部署**
   - Deployments → Redeploy

5. **👀 查看日誌**
   - 確認部署成功
   - 確認資料表建立

---

## 📞 需要幫助？

如果完成以上步驟後仍有問題，請提供：

1. **部署日誌的截圖**（Logs 標籤）
2. **環境變數的截圖**（Variables 標籤）
3. **具體的錯誤訊息**

---

**記住：DATABASE_URL 是絕對必須的！沒有它，一切都無法運作！** 🎯
