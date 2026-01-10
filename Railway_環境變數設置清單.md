# Railway 環境變數設置清單

## 🎯 操作位置

**重要**：這些環境變數應該添加到你的**後端服務（p.et-taiwan）**，而不是 PostgreSQL 資料庫服務！

---

## 📋 必須添加的環境變數

在 Railway Dashboard 中：

1. 選擇你的專案
2. 點擊 **「p.et-taiwan」** 服務（後端服務）
3. 進入 **「Variables」** 標籤
4. 點擊 **「New Variable」** 添加以下變數：

### 1️⃣ DATABASE_URL（通常會自動提供）

如果你已經將 PostgreSQL 服務連結到後端服務，Railway 應該會自動提供這個變數。

**檢查方式**：
- 在 Variables 標籤中搜尋 `DATABASE_URL`
- 如果存在，它的值應該類似：`postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway`

**如果沒有自動提供**：
1. 確認 PostgreSQL 服務已與後端服務連結
2. 或者手動添加（從 PostgreSQL 服務的 Connect 標籤複製完整的 DATABASE_URL）

---

### 2️⃣ DB_TYPE（必須添加）

```
變數名稱: DB_TYPE
變數值: postgresql
```

**說明**：告訴系統使用 PostgreSQL 資料庫

---

### 3️⃣ NODE_ENV（必須添加）

```
變數名稱: NODE_ENV
變數值: production
```

**說明**：設定為生產環境，啟用 SSL 連接

---

### 4️⃣ PORT（選填，Railway 通常會自動設定）

```
變數名稱: PORT
變數值: 3000
```

**說明**：Railway 通常會自動提供 PORT 變數，如果沒有再手動添加

---

### 5️⃣ JWT_SECRET（必須添加）

```
變數名稱: JWT_SECRET
變數值: your-super-secret-key-change-this-in-production
```

**重要**：請使用一個強壯的密鑰，例如：
- 隨機生成的長字串（至少 32 個字符）
- 可以使用線上工具生成：https://www.grc.com/passwords.htm
- 或使用命令：`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

**示例**：
```
JWT_SECRET=8f4a9b2c1d3e5f7g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2
```

---

## ✅ 完整的環境變數列表（最終應該有的）

添加完成後，你的後端服務應該有以下環境變數：

| 變數名稱 | 變數值範例 | 來源 | 必需 |
|---------|-----------|------|------|
| `DATABASE_URL` | `postgresql://postgres:xxxxx@...` | Railway 自動提供 | ✅ 是 |
| `DB_TYPE` | `postgresql` | 手動添加 | ✅ 是 |
| `NODE_ENV` | `production` | 手動添加 | ✅ 是 |
| `JWT_SECRET` | `your-secret-key-here` | 手動添加 | ✅ 是 |
| `PORT` | `3000` | Railway 自動提供（或手動） | ⚠️ 通常自動 |

---

## 🔗 如何連結 PostgreSQL 服務到後端服務

如果 `DATABASE_URL` 沒有自動出現：

### 方法 1: 使用 Variable Reference

1. 在後端服務的 Variables 標籤
2. 點擊 **「Variable Reference」**
3. 選擇 PostgreSQL 服務
4. 選擇 `DATABASE_URL`
5. 這樣會自動連結並使用 PostgreSQL 的 URL

### 方法 2: 手動複製

1. 進入 PostgreSQL 服務
2. 點擊 **「Connect」** 標籤
3. 複製 **「Postgres Connection URL」**
4. 回到後端服務的 Variables 標籤
5. 添加新變數：
   - 名稱：`DATABASE_URL`
   - 值：貼上剛剛複製的 URL

---

## 📊 添加步驟截圖說明

### 步驟 1: 進入後端服務
- 在左側選擇 **「p.et-taiwan」** 服務（不是 Postgres 服務）

### 步驟 2: 進入 Variables 標籤
- 點擊頂部的 **「Variables」** 標籤

### 步驟 3: 添加新變數
- 點擊 **「New Variable」** 按鈕
- 輸入變數名稱和值
- 點擊 **「Add」** 或 **「Save」**

### 步驟 4: 重複步驟 3
- 為每個需要的環境變數重複此步驟

---

## ⚠️ 重要提醒

1. **不要在 PostgreSQL 服務中添加這些變數**
   - 你的截圖顯示的是 PostgreSQL 服務的變數
   - 這些環境變數應該添加到**後端服務（p.et-taiwan）**

2. **添加後需要重新部署**
   - 添加環境變數後，Railway 通常會自動重新部署
   - 如果沒有，請手動觸發重新部署

3. **JWT_SECRET 安全性**
   - 不要使用簡單的密鑰如 "123456" 或 "secret"
   - 使用強壯的隨機字串
   - 生產環境中妥善保管此密鑰

---

## 🚀 驗證環境變數設置

添加完成後，在部署日誌中應該會看到：

```
✅ 已連接到 PostgreSQL 資料庫
📊 資料庫類型: postgresql
🔍 使用 PostgreSQL 資料庫...
✅ PostgreSQL 連接池已建立
📊 開始建立 PostgreSQL 資料表...
```

如果看到這些訊息，表示環境變數設置成功！

---

## 🆘 如果遇到問題

### 問題 1: "DATABASE_URL 環境變數未設定"

**解決方法**：
- 確認 PostgreSQL 服務已與後端服務連結
- 使用 Variable Reference 連結資料庫
- 或手動從 PostgreSQL 服務複製 DATABASE_URL

### 問題 2: "找不到後端服務"

**解決方法**：
- 確認你點擊的是 **「p.et-taiwan」** 服務
- 不是 **「Postgres」** 資料庫服務
- 左側應該有兩個服務，選擇有代碼的那個

### 問題 3: 添加變數後沒有生效

**解決方法**：
- 等待自動重新部署完成
- 或手動重新部署：Deployments → Redeploy

---

**完成後繼續下一步：初始化資料表** 🎉
