# GitHub Actions 設置完成步驟

## ⚠️ 重要安全提醒

**您剛才提供的 GitHub token 已經在對話中暴露！**

請立即執行以下步驟：

### 1. 撤銷舊 Token（立即執行）

1. 前往 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 找到剛才創建的 token
3. 點擊 "Revoke" 撤銷它
4. 創建新的 token（如果需要）

**對於 GitHub Actions workflow，我們實際上不需要 GitHub token！**
- GitHub Actions 使用內建的 `GITHUB_TOKEN`，不需要手動設置
- 我們需要的是 `DATABASE_URL` secret

---

## ✅ 設置步驟（繼續）

### 步驟 1: 在 GitHub 添加 DATABASE_URL Secret

1. 前往您的 GitHub 倉庫：`https://github.com/YOUR_USERNAME/p.et-taiwan`
2. 點擊 **Settings**（設定）
3. 在左側選單找到 **Secrets and variables** → **Actions**
4. 點擊 **"New repository secret"**
5. 輸入：
   - **Name**: `DATABASE_URL`
   - **Value**: 您的 Railway PostgreSQL 連接字串
     - 格式：`postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require`
     - 或者從 Railway Dashboard 複製完整的連接字串
6. 點擊 **"Add secret"**

---

### 步驟 2: 推送 Workflow 文件到 GitHub

在您的本機終端執行：

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

# 檢查狀態
git status

# 添加 workflow 文件
git add .github/workflows/

# 提交
git commit -m "添加 GitHub Actions 自動資料庫初始化"

# 推送到 GitHub
git push
```

---

### 步驟 3: 手動觸發 Workflow 測試

1. 前往 GitHub 倉庫
2. 點擊 **"Actions"** 標籤
3. 在左側找到 **"Database Init (Simple)"** workflow
4. 點擊 workflow 名稱
5. 點擊右上角的 **"Run workflow"** 按鈕
6. 選擇分支（通常是 `main`）
7. 點擊綠色的 **"Run workflow"** 按鈕

---

### 步驟 4: 查看執行結果

1. 在 Actions 頁面，點擊最新的 workflow run
2. 點擊 **"init-db"** job
3. 展開每個步驟查看日誌

**成功時應該看到**：
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

## 📋 需要設置的 Secrets 清單

在 GitHub Secrets 中，您只需要添加：

| Secret Name | 說明 | 範例格式 |
|------------|------|---------|
| `DATABASE_URL` | Railway PostgreSQL 連接字串 | `postgresql://postgres:password@host:port/db?sslmode=require` |

**不需要設置 GitHub token！** GitHub Actions 會自動使用內建的 `GITHUB_TOKEN`。

---

## 🔍 如何獲取正確的 DATABASE_URL

### 方法 1: 從 Railway Dashboard（推薦）

1. 登入 Railway Dashboard
2. 選擇 PostgreSQL 服務
3. 點擊 **"Connect"** 按鈕
4. 找到 **"Public Networking"** 區塊
5. 複製 **Connection String**（完整的 URL）

### 方法 2: 手動構建

根據您提供的主機 `turntable.proxy.rlwy.net:36497`：

```
postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require
```

**重要**：
- 替換 `YOUR_PASSWORD` 為實際密碼
- 必須包含 `?sslmode=require`（Railway 需要 SSL）
- 確認資料庫名稱是 `railway`（如果不是，請修改）

---

## ✅ 檢查清單

在執行之前，確認：

- [ ] GitHub Secrets 中已添加 `DATABASE_URL`
- [ ] DATABASE_URL 格式正確（包含 `sslmode=require`）
- [ ] Workflow 文件已推送到 GitHub
- [ ] 在 Actions 標籤中可以看到 workflow
- [ ] 手動觸發一次測試執行
- [ ] 查看執行日誌確認成功
- [ ] 在 Railway PostgreSQL Query 介面驗證資料表已建立

---

## 🐛 常見問題

### 問題 1: "DATABASE_URL not found"

**解決方法**：
- 確認 Secret 名稱完全一致（大小寫敏感）：`DATABASE_URL`
- 確認已在正確的倉庫中添加（不是在組織層級）

### 問題 2: "Connection refused" 或 "Connection timeout"

**可能原因**：
- DATABASE_URL 格式錯誤
- 缺少 SSL 參數
- 使用內部 URL（`postgres.railway.internal`）而不是公共 URL

**解決方法**：
- 使用 Railway 的公共 URL（`containers-xxx.railway.app` 或 `turntable.proxy.rlwy.net`）
- 確認包含 `?sslmode=require`
- 從 Railway Dashboard 重新複製完整的連接字串

### 問題 3: "npm run init-db not found"

**解決方法**：
- 簡化版 workflow 已經有 fallback，會自動使用 `node scripts/setup-railway-db.js`
- 確保 `scripts/setup-railway-db.js` 文件已推送到 GitHub

---

## 🎯 完成後的驗證

執行完成後，驗證資料表是否建立：

### 在 Railway PostgreSQL Query 介面執行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**應該會看到 11 個資料表**：
- users
- products
- product_variants
- orders
- order_items
- quiz_results
- subscriptions
- cart_items
- settings
- coupons
- coupon_usage

---

## 🔐 安全提醒（再次）

**重要**：您剛才提供的 GitHub token (`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`) 已經暴露！

1. ⚠️ **立即撤銷**：前往 GitHub Settings → Developer settings → Personal access tokens → 撤銷該 token
2. ✅ **好消息**：對於 GitHub Actions，我們不需要這個 token
3. 🔒 **只需要**：`DATABASE_URL` secret（已經在上面步驟中設置）

---

**現在請按照步驟 1-4 完成設置！** 🚀
