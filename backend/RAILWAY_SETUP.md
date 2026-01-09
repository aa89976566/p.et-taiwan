# Railway 資料庫連接設定指南

## 📋 概述

本後端系統支援兩種資料庫：
- **SQLite**：本地開發環境（預設）
- **PostgreSQL**：Railway 生產環境

系統會自動根據環境變數選擇使用的資料庫類型。

---

## 🚀 Railway 設定步驟

### 1. 在 Railway 建立 PostgreSQL 資料庫

1. 登入 [Railway](https://railway.app/)
2. 建立新專案（New Project）
3. 點擊 **"New"** → 選擇 **"Database"** → 選擇 **"Add PostgreSQL"**
4. Railway 會自動建立 PostgreSQL 資料庫

### 2. 取得連接資訊

Railway 會自動提供 `DATABASE_URL` 環境變數，格式如下：

```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### 3. 設定環境變數

在 Railway 專案中設定以下環境變數：

#### 方式一：使用 Railway 自動提供的 DATABASE_URL（推薦）

Railway 會自動提供 `DATABASE_URL`，無需手動設定。

只需要在 Railway 環境變數中設定：
```
DB_TYPE=postgresql
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

#### 方式二：手動設定連接資訊（如果 Railway 沒有自動提供 DATABASE_URL）

如果 Railway 沒有自動提供 `DATABASE_URL`，可以分別設定：

```
DB_TYPE=postgresql
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password
```

### 4. 初始化資料庫表結構

當應用程式首次啟動時，系統會自動執行 `initDatabase()` 函數，建立所需的資料表。

如果表結構已存在，不會重複建立（使用 `CREATE TABLE IF NOT EXISTS`）。

---

## 🔧 本地開發設定

### 使用 SQLite（預設）

本地開發時，不需要設定資料庫相關環境變數，系統會自動使用 SQLite：

```bash
# .env 檔案（可選）
DB_TYPE=sqlite
DB_PATH=./data/jiangchong.db
```

### 本地使用 PostgreSQL

如果你想在本地也使用 PostgreSQL 測試，可以設定：

```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jiangchong
DB_USER=postgres
DB_PASSWORD=your-local-password
```

---

## 📝 環境變數說明

| 變數名稱 | 說明 | 預設值 | 必需 |
|---------|------|--------|------|
| `DB_TYPE` | 資料庫類型：`sqlite` 或 `postgresql` | 自動判斷 | 否 |
| `DATABASE_URL` | PostgreSQL 完整連接字串（Railway 自動提供） | - | Railway 環境 |
| `DB_HOST` | PostgreSQL 主機地址 | localhost | 無 DATABASE_URL 時 |
| `DB_PORT` | PostgreSQL 端口 | 5432 | 無 DATABASE_URL 時 |
| `DB_NAME` | 資料庫名稱 | jiangchong | 無 DATABASE_URL 時 |
| `DB_USER` | 資料庫用戶名 | postgres | 無 DATABASE_URL 時 |
| `DB_PASSWORD` | 資料庫密碼 | - | 無 DATABASE_URL 時 |
| `DB_PATH` | SQLite 資料庫文件路徑 | ./data/jiangchong.db | SQLite 時 |

---

## ✅ 驗證連接

### 檢查 Railway 日誌

部署到 Railway 後，查看應用程式日誌，應該會看到：

```
✅ 已連接到 PostgreSQL 資料庫
✅ PostgreSQL 資料庫表結構初始化完成
🚀 匠寵後端服務器已啟動
```

### 測試 API

```bash
# 健康檢查
curl https://your-app.railway.app/health

# 應該返回：
# {"success":true,"message":"服務運行正常","timestamp":"..."}
```

---

## 🔍 故障排除

### 問題：連接失敗

**錯誤訊息：**
```
❌ PostgreSQL 連接失敗: connection refused
```

**解決方案：**
1. 確認 `DATABASE_URL` 或連接資訊正確
2. 檢查 Railway PostgreSQL 服務是否運行
3. 確認網路連接和防火牆設定

### 問題：SSL 連接錯誤

**錯誤訊息：**
```
SSL connection is required
```

**解決方案：**
確保 `DATABASE_URL` 包含 `?sslmode=require` 或設定：
```javascript
ssl: { rejectUnauthorized: false }
```
（系統已自動處理）

### 問題：表結構初始化失敗

**錯誤訊息：**
```
relation "users" already exists
```

**解決方案：**
這是正常的，表示表已存在。如果需要重置資料庫，請在 Railway PostgreSQL 服務中手動刪除表或使用 Migration 工具。

---

## 📚 相關檔案

- `backend/config/database.js` - 資料庫連接和初始化邏輯
- `backend/.env.example` - 環境變數範例
- `backend/package.json` - 依賴套件（包含 `pg` 和 `sqlite3`）

---

## 🎯 下一步

1. ✅ 在 Railway 建立 PostgreSQL 資料庫
2. ✅ 設定環境變數（Railway 會自動提供 `DATABASE_URL`）
3. ✅ 部署應用程式到 Railway
4. ✅ 檢查日誌確認連接成功
5. ✅ 測試 API 端點

如有問題，請查看 Railway 日誌或聯繫技術支援。
