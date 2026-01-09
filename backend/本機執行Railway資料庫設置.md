# 在本機執行 Railway 資料庫設置

## 📋 問題分析

1. ✅ `package.json` 中已有 `setup-db` 腳本
2. ✅ 腳本文件存在：`scripts/setup-railway-db.js`
3. ⚠️  `DATABASE_URL` 環境變數需要在同一個終端視窗中設定
4. ⚠️  npm 可能讀取了舊的緩存

---

## ✅ 解決方案：直接執行腳本（推薦）

### 步驟 1: 設定環境變數並執行

在同一個終端視窗中執行：

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan/backend

# 設定 DATABASE_URL（從 Railway Dashboard 複製）
export DATABASE_URL="postgresql://postgres:XLYZXrzrzMDLmxJVMncAlHRlVpnhFRfR@postgres.railway.internal:5432/railway"

# 設定為 PostgreSQL 模式（可選，因為有 DATABASE_URL 會自動判斷）
export DB_TYPE="postgresql"

# 直接執行腳本（不通過 npm）
node scripts/setup-railway-db.js
```

---

## 🔍 如果還是使用 SQLite

如果執行後還是顯示 "已連接到 SQLite 資料庫"，可能是：

### 原因 1: DATABASE_URL 格式問題

Railway 內部使用的 URL 是 `postgres.railway.internal`，這只能在 Railway 內部網路訪問。

**解決方法**：使用 Railway 提供的**外部連接 URL**

1. 在 Railway Dashboard 中
2. 選擇 PostgreSQL 服務
3. 點擊 "Connect" 按鈕
4. 複製 "Public Networking" 的 URL（格式類似：`postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`）

### 原因 2: 需要在 Railway 環境中執行

由於 `postgres.railway.internal` 只能在 Railway 內部網路訪問，您有兩個選擇：

**選項 A: 使用 Railway 的公共 URL**（推薦）

```bash
# 從 Railway Dashboard 複製 Public Networking URL
export DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?sslmode=require"

node scripts/setup-railway-db.js
```

**選項 B: 在 Railway Terminal 中執行**

由於您說找不到 Railway Terminal，可以：
1. 在 Railway Dashboard 中點擊 "p.et-taiwan" 服務
2. 找到 "Deployments" 標籤
3. 點擊最新的部署旁邊的 "View logs"
4. 在日誌頁面應該有 Terminal 或執行命令的選項

---

## 🎯 完整執行命令（一行）

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan/backend && export DATABASE_URL="您的Railway公共URL" && export DB_TYPE="postgresql" && node scripts/setup-railway-db.js
```

---

## 📝 注意事項

1. **Railway Internal URL** (`postgres.railway.internal`) 只能在 Railway 服務內部訪問
   - 不能從本地電腦訪問
   - 需要 Railway 的公共 URL（`containers-xxx.railway.app`）

2. **獲取正確的 DATABASE_URL**：
   - Railway Dashboard → PostgreSQL 服務
   - 點擊 "Connect" 按鈕
   - 複製 "Public Networking" 的連接字串
   - 格式：`postgresql://user:password@host:port/database?sslmode=require`

3. **SSL 設定**：
   - Railway 的公共連接需要 SSL
   - 確保 URL 包含 `?sslmode=require` 或設定 SSL 參數

---

## ✅ 執行後應該看到的輸出

```
🚀 開始設置 Railway PostgreSQL 資料庫...

📋 環境變數檢查:
   NODE_ENV: development
   DB_TYPE: postgresql
   DATABASE_URL: ✅ 已設定

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步驟 1: 測試資料庫連線
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 執行 SELECT 1 測試...
   ✅ SELECT 1 成功！回應: { test: 1 }
🔍 執行 SELECT NOW() 測試...
   ✅ SELECT NOW() 成功！
   📅 資料庫時間: ...
   📦 PostgreSQL 版本: PostgreSQL 15.x

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步驟 2: 建立資料表結構
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔨 開始建立資料表...

✅ PostgreSQL 資料庫表結構初始化完成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
步驟 3: 驗證資料表
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 資料庫中共有 11 個資料表:
   ✅ users
   ✅ products
   ...
```

---

**現在請使用 Railway 的公共 URL 重新執行！** 🚀
