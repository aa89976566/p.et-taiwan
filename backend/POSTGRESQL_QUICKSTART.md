# PostgreSQL 快速設置指南

## ✅ 已完成的設定

您的後端已經配置好 PostgreSQL 支援，包括：
- ✅ PostgreSQL 驅動程式 (`pg`) 已添加到 `package.json`
- ✅ 資料庫連接模組已更新支援 PostgreSQL
- ✅ SQL 語法自動轉換（SQLite → PostgreSQL）
- ✅ Railway 連接字串自動識別

---

## 🚀 在 Railway 設置 PostgreSQL（3 步驟）

### 步驟 1：建立 PostgreSQL 資料庫

1. 登入 [Railway](https://railway.app/)
2. 在您的專案中，點擊 **"New"** 
3. 選擇 **"Database"** → **"Add PostgreSQL"**
4. Railway 會自動建立並提供 `DATABASE_URL`

### 步驟 2：設定環境變數

在 Railway 專案的環境變數（Environment Variables）中設定：

```bash
DB_TYPE=postgresql
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-change-this
```

> **注意**：Railway 會自動提供 `DATABASE_URL`，無需手動設定！

### 步驟 3：部署

部署後，系統會自動：
- ✅ 連接 PostgreSQL 資料庫
- ✅ 建立所有需要的資料表
- ✅ 開始服務

---

## 📋 檢查清單

在 Railway 部署前，確認：

- [ ] Railway PostgreSQL 資料庫已建立
- [ ] 環境變數 `DB_TYPE=postgresql` 已設定
- [ ] 環境變數 `NODE_ENV=production` 已設定
- [ ] 環境變數 `JWT_SECRET` 已設定（重要！）
- [ ] Railway 自動提供的 `DATABASE_URL` 存在（自動提供，無需手動設定）

---

## 🔍 驗證連接

部署後，檢查 Railway 日誌，應該看到：

```
✅ 已連接到 PostgreSQL 資料庫
✅ PostgreSQL 資料庫表結構初始化完成
🚀 匠寵後端服務器已啟動
📍 服務地址: http://localhost:3000
```

---

## 🛠️ 本地測試 PostgreSQL（可選）

如果想在本地也測試 PostgreSQL：

### 1. 安裝 PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# 或使用 Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### 2. 建立資料庫

```bash
createdb jiangchong
```

### 3. 設定環境變數

創建 `backend/.env` 檔案：

```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jiangchong
DB_USER=postgres
DB_PASSWORD=your-password
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### 4. 啟動服務

```bash
cd backend
npm install
npm start
```

---

## ❓ 常見問題

### Q: Railway 沒有提供 DATABASE_URL？

A: 確保 PostgreSQL 服務已經建立並啟動。如果仍沒有，可以手動設定：
```bash
DB_HOST=your-postgres-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password
```

### Q: 連接失敗怎麼辦？

A: 
1. 檢查 Railway PostgreSQL 服務狀態
2. 確認 `DATABASE_URL` 或連接資訊正確
3. 檢查 Railway 日誌查看詳細錯誤訊息

### Q: 表已存在錯誤？

A: 這是正常的！表示資料表已經建立。如果確實需要重置，可以在 Railway PostgreSQL 查詢介面中執行 `DROP TABLE`。

---

## 📚 相關檔案

- `backend/config/database.js` - 資料庫連接邏輯
- `backend/env.example` - 環境變數範例
- `backend/RAILWAY_SETUP.md` - 詳細設置文件
- `backend/package.json` - 依賴套件（已包含 `pg`）

---

## ✨ 下一步

1. ✅ 在 Railway 建立 PostgreSQL
2. ✅ 設定環境變數
3. ✅ 部署應用程式
4. ✅ 檢查日誌確認成功
5. ✅ 測試 API 端點

完成！您的應用程式已經準備好使用 PostgreSQL 了！🎉
