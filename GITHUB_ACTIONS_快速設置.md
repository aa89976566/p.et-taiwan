# GitHub Actions 快速設置指南

## ✅ 已創建的 Workflow

我已經為您創建了 **3 個 workflow 文件**：

1. **`.github/workflows/database-init.yml`** - 完整版（自動 + 手動觸發）
2. **`.github/workflows/database-setup-on-demand.yml`** - 手動觸發版
3. **`.github/workflows/database-init-simple.yml`** - 簡化版（推薦）⭐

---

## 🚀 快速設置（3 步驟）

### 步驟 1: 在 GitHub 添加 DATABASE_URL Secret

1. 前往 GitHub 倉庫
2. **Settings** → **Secrets and variables** → **Actions**
3. 點擊 **"New repository secret"**
4. 輸入：
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require`
     - ⚠️ 替換 `YOUR_PASSWORD` 為實際密碼
     - 如果 Railway 提供了完整 URL，直接使用那個
5. 點擊 **"Add secret"**

### 步驟 2: 推送 Workflow 文件到 GitHub

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

# 添加 workflow 文件
git add .github/workflows/

# 提交
git commit -m "添加 GitHub Actions 資料庫自動初始化"

# 推送
git push
```

### 步驟 3: 手動觸發執行

1. 前往 GitHub 倉庫 → **Actions** 標籤
2. 選擇 **"Database Init (Simple)"** workflow
3. 點擊 **"Run workflow"** → 選擇分支 → **"Run workflow"**

---

## 📋 DATABASE_URL 格式

根據您提供的主機 `turntable.proxy.rlwy.net:36497`：

**完整格式**：
```
postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require
```

**如何獲取完整 URL**：
1. Railway Dashboard → PostgreSQL 服務
2. 點擊 **"Connect"** 按鈕
3. 複製完整的連接字串（Connection String）
4. 貼到 GitHub Secrets 中

---

## 🎯 推薦使用：簡化版 Workflow

**`.github/workflows/database-init-simple.yml`** 是最簡單的版本：

```yaml
- name: Init DB
  run: npm run init-db || node scripts/setup-railway-db.js
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

**特點**：
- ✅ 簡單易懂
- ✅ 自動 fallback（如果 npm script 不存在，直接執行腳本）
- ✅ 手動 + 自動觸發
- ✅ 執行快速

---

## ✅ 執行後應該看到的結果

在 GitHub Actions 的執行日誌中應該看到：

```
🚀 開始設置 Railway PostgreSQL 資料庫...
✅ 已連接到 PostgreSQL 資料庫
✅ SELECT 1 成功！
✅ PostgreSQL 連線測試成功
準備建立 11 個資料表...
   ✅ users 建立成功
   ✅ products 建立成功
   ...
✅ PostgreSQL 資料庫表結構初始化完成（共 11 個資料表）
```

---

## 🔍 驗證資料表是否建立

執行完成後，在 Railway PostgreSQL 的 Query 介面執行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

應該會看到 11 個資料表。

---

## ⚠️ 重要提示

1. **DATABASE_URL 必須包含 SSL 參數**：
   - 添加 `?sslmode=require` 到 URL 末尾
   - Railway 需要 SSL 連接

2. **密碼不要暴露**：
   - 絕對不要將 DATABASE_URL 寫在代碼中
   - 必須使用 GitHub Secrets

3. **可以安全重複執行**：
   - 使用 `CREATE TABLE IF NOT EXISTS`
   - 不會重複建立或刪除現有資料

---

## 🐛 故障排除

### 問題：Workflow 執行失敗 "Connection refused"

**可能原因**：
- DATABASE_URL 格式錯誤
- 缺少 SSL 參數
- 密碼錯誤

**解決方法**：
1. 確認 DATABASE_URL 格式正確
2. 確認包含 `?sslmode=require`
3. 從 Railway Dashboard 重新複製完整的連接字串

### 問題：npm run init-db 找不到

**解決方法**：
- 簡化版 workflow 已經有 fallback：`npm run init-db || node scripts/setup-railway-db.js`
- 會自動使用備用方案

---

## 📝 下一步

1. ✅ 添加 DATABASE_URL 到 GitHub Secrets
2. ✅ 推送 workflow 文件到 GitHub
3. ✅ 手動觸發一次測試
4. ✅ 確認資料表已建立
5. ✅ 之後每次推送代碼，會自動執行（如果修改了相關文件）

---

**完成！現在您可以使用 GitHub Actions 自動初始化資料庫了！** 🎉
