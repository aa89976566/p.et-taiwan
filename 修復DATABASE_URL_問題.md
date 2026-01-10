# 修復 DATABASE_URL 問題 - 完整解決方案

## 🔍 問題原因

GitHub Actions 中使用的 `DATABASE_URL` 是內部 URL (`postgres.railway.internal`)，這個 URL **只能從 Railway 服務內部訪問**，無法從 GitHub Actions 訪問。

---

## ✅ 解決方案 1: 使用 Railway 公共 URL（推薦）

### 步驟 1: 獲取 Railway 的公共 DATABASE_URL

**方法 A: 從 Railway Dashboard 獲取（最準確）**

1. 前往 Railway Dashboard
2. 選擇 PostgreSQL 服務
3. 點擊 **"Connect"** 按鈕
4. 找到 **"Public Networking"** 區塊
5. 複製完整的 **Connection String**

**格式類似**：
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?sslmode=require
```

**方法 B: 使用代理 URL（如果 Railway 提供了）**

根據您之前提供的資訊，如果 `turntable.proxy.rlwy.net:36497` 是有效的公共 URL，使用：

```
postgresql://postgres:XLYZXrzrzMDLmxJVMncAlHRlVpnhFRfR@turntable.proxy.rlwy.net:36497/railway?sslmode=require
```

### 步驟 2: 更新 GitHub Secret

1. 前往：https://github.com/aa89976566/p.et-taiwan/settings/secrets/actions
2. 找到 `DATABASE_URL` secret
3. 點擊 **編輯**（鉛筆圖標）
4. **更新 Value** 為公共 URL（不是 `postgres.railway.internal`）
5. 點擊 **"Update secret"**

### 步驟 3: 重新執行 Workflow

更新完成後，重新執行 GitHub Actions workflow。

---

## ✅ 解決方案 2: 在 GitHub Actions 中使用臨時 PostgreSQL（測試用）

如果您想先在 CI 中測試（不連接到真實的 Railway 資料庫），可以修改 workflow：

### 修改 workflow 文件

```yaml
jobs:
  init-db:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: railway
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/railway
      DB_TYPE: postgresql
```

但這會使用**臨時的測試資料庫**，不會影響真實的 Railway 資料庫。

---

## 🎯 推薦做法

**強烈建議使用方案 1**，因為：
- ✅ 會初始化真實的 Railway 資料庫
- ✅ 資料表會真正建立
- ✅ 後續可以使用這些資料表

---

## 📋 檢查清單

- [ ] 確認 Railway 是否提供公共 URL
- [ ] 更新 GitHub Secrets 中的 DATABASE_URL 為公共 URL
- [ ] 確保 URL 包含 `?sslmode=require`（Railway 需要 SSL）
- [ ] 重新執行 workflow
- [ ] 驗證資料表是否成功建立

---

## ⚠️ 如果 Railway 沒有提供公共 URL

如果 Railway 的 PostgreSQL 服務**沒有公共 URL**，您需要：

1. **在 Railway 服務中直接執行初始化**（不使用 GitHub Actions）
   - 在 Railway "p.et-taiwan" 服務的 Terminal 中執行
   - 或者讓服務啟動時自動初始化（已經配置好了）

2. **或者使用 Railway CLI** 在本地執行

---

**請先嘗試方案 1，確認 GitHub Secrets 中的 DATABASE_URL 是否正確設置！** 🚀
