# GitHub Actions 自動資料庫初始化設置指南

## ✅ 已創建的 Workflow 文件

我已經為您創建了兩個 GitHub Actions workflow：

1. **`.github/workflows/database-init.yml`** - 自動觸發（推送代碼時）
2. **`.github/workflows/database-setup-on-demand.yml`** - 手動觸發（按需執行）

---

## 📋 設置步驟

### 步驟 1: 在 GitHub 添加 DATABASE_URL Secret

1. 前往您的 GitHub 倉庫
2. 點擊 **Settings**（設定）
3. 在左側選單找到 **Secrets and variables** → **Actions**
4. 點擊 **New repository secret**
5. 輸入：
   - **Name**: `DATABASE_URL`
   - **Value**: 您的 Railway PostgreSQL 連接字串
     - 格式：`postgresql://postgres:password@turntable.proxy.rlwy.net:36497/railway?sslmode=require`
     - 或者：`postgresql://postgres:password@containers-xxx.railway.app:5432/railway?sslmode=require`
6. 點擊 **Add secret**

---

### 步驟 2: 確保 package.json 中有 setup-db 腳本

確認 `backend/package.json` 包含：

```json
{
  "scripts": {
    "setup-db": "node scripts/setup-railway-db.js",
    "test-db": "node scripts/test-db-connection.js"
  }
}
```

**✅ 已經有了！** 您之前已經添加了這些腳本。

---

### 步驟 3: 推送代碼到 GitHub

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

# 添加新文件
git add .github/workflows/

# 提交
git commit -m "添加 GitHub Actions 自動資料庫初始化"

# 推送到 GitHub
git push
```

---

## 🚀 執行方式

### 方式 1: 自動執行（推送代碼時）

當您推送代碼到 `main` 或 `master` 分支時，如果修改了以下文件，會自動觸發：

- `backend/config/database.js`
- `backend/scripts/**`
- `backend/package.json`
- `.github/workflows/database-init.yml`

### 方式 2: 手動執行（按需）

1. 前往 GitHub 倉庫
2. 點擊 **Actions** 標籤
3. 選擇 **"Database Setup (On Demand)"** workflow
4. 點擊 **"Run workflow"** 按鈕
5. 選擇分支（通常是 `main`）
6. 點擊 **"Run workflow"**

---

## 🔍 查看執行結果

1. 前往 GitHub 倉庫
2. 點擊 **Actions** 標籤
3. 點擊最新的 workflow run
4. 查看執行日誌

**成功時應該看到**：
```
✅ 已連接到 PostgreSQL 資料庫
✅ SELECT 1 成功！
✅ SELECT NOW() 成功！
✅ PostgreSQL 資料庫表結構初始化完成
✅ 資料表數量: 11
✅ 所有資料表都已建立！
```

---

## 📝 DATABASE_URL 格式

根據您提供的主機 `turntable.proxy.rlwy.net:36497`，完整的 DATABASE_URL 應該是：

```
postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require
```

**請替換 `YOUR_PASSWORD` 為實際的資料庫密碼**

如果 Railway 提供了完整的連接字串，請直接使用那個。

---

## 🛠️ 自訂 Workflow

### 修改觸發條件

編輯 `.github/workflows/database-init.yml`：

```yaml
on:
  push:
    branches:
      - main
      - develop  # 添加其他分支
    paths:
      - 'backend/**'  # 監聽所有 backend 變更
```

### 修改執行時機

- **每次推送**: 移除 `paths` 限制
- **特定標籤**: 添加 `tags: ['v*']`
- **Pull Request**: 添加 `pull_request:`

---

## ⚠️ 注意事項

1. **安全性**: DATABASE_URL 包含敏感資訊，必須使用 GitHub Secrets，不要直接寫在 workflow 文件中

2. **權限**: 確保 GitHub Actions 有權限訪問 Secrets
   - Settings → Actions → General
   - Workflow permissions → 選擇適當的權限

3. **SSL**: Railway 的連接需要 SSL，確保 URL 包含 `?sslmode=require`

4. **資料表不會重複建立**: 使用 `CREATE TABLE IF NOT EXISTS`，所以可以安全地重複執行

---

## 🔧 故障排除

### 問題 1: "DATABASE_URL not found"

**解決方法**:
- 確認已在 GitHub Secrets 中添加 `DATABASE_URL`
- 檢查 Secret 名稱是否完全一致（大小寫敏感）

### 問題 2: "Connection refused"

**解決方法**:
- 確認 DATABASE_URL 格式正確
- 確認 Railway 資料庫服務正在運行
- 檢查是否需要 SSL（添加 `?sslmode=require`）

### 問題 3: "npm run setup-db not found"

**解決方法**:
- 確認 `backend/package.json` 包含 `setup-db` 腳本
- 確認已推送最新的 `package.json` 到 GitHub

---

## ✅ 完成後的檢查清單

- [ ] GitHub Secrets 中已添加 `DATABASE_URL`
- [ ] Workflow 文件已推送到 GitHub
- [ ] 手動觸發一次 workflow 測試
- [ ] 確認資料表已成功建立（在 Railway PostgreSQL Query 介面查看）
- [ ] 確認自動觸發工作正常（推送代碼後）

---

**設置完成後，每次推送代碼或手動觸發，GitHub Actions 就會自動初始化資料庫！** 🎉
