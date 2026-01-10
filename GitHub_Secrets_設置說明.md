# GitHub Secrets 設置 - 完整步驟

## ✅ 準備好的 DATABASE_URL（可直接複製）

```
postgresql://postgres:XLYZXrzrzMDLmxJVMncAlHRlVpnhFRfR@turntable.proxy.rlwy.net:36497/railway?sslmode=require
```

**重要**：我已經將您的內部 URL (`postgres.railway.internal`) 改為公共 URL (`turntable.proxy.rlwy.net:36497`)，這樣才能從 GitHub Actions 訪問。

---

## 📋 在 GitHub 設置 Secret 的完整步驟

### 步驟 1: 前往 Secrets 設置頁面

點擊以下連結（或手動前往）：
```
https://github.com/aa89976566/p.et-taiwan/settings/secrets/actions
```

### 步驟 2: 創建新的 Secret

1. 點擊 **"New repository secret"** 按鈕（右上角）

2. **Name（名稱）**：輸入
   ```
   DATABASE_URL
   ```

3. **Secret（值）**：複製貼上以下完整內容
   ```
   postgresql://postgres:XLYZXrzrzMDLmxJVMncAlHRlVpnhFRfR@turntable.proxy.rlwy.net:36497/railway?sslmode=require
   ```

4. 點擊 **"Add secret"** 按鈕

---

## ✅ 驗證設置

設置完成後，您應該會看到：
- Secret 列表中有一個名為 `DATABASE_URL` 的項目
- 值會顯示為 `••••••••`（隱藏保護）

---

## 🎯 下一步

設置完 Secret 後：
1. 前往 Actions 頁面：https://github.com/aa89976566/p.et-taiwan/actions
2. 選擇 "Database Init (Simple)" workflow
3. 點擊 "Run workflow" 手動觸發
4. 查看執行結果

---

## ⚠️ 注意事項

1. **URL 格式**：
   - ✅ 使用 `turntable.proxy.rlwy.net:36497`（公共 URL，可從外部訪問）
   - ❌ 不使用 `postgres.railway.internal`（內部 URL，只能從 Railway 服務內部訪問）

2. **SSL 參數**：
   - 必須包含 `?sslmode=require`（Railway 需要 SSL 連接）

3. **安全性**：
   - GitHub Secrets 會安全地存儲這個值
   - 在 workflow 中通過 `${{ secrets.DATABASE_URL }}` 訪問
   - 不會在日誌中顯示（除非您明確輸出它）

---

## 🔍 如果執行失敗

### 問題：仍然無法連接

**可能原因**：
- `turntable.proxy.rlwy.net:36497` 可能不是正確的公共 URL
- Railway 的公共 URL 可能不同

**解決方法**：
1. 前往 Railway Dashboard
2. 選擇 PostgreSQL 服務
3. 點擊 "Connect" 按鈕
4. 查看 "Public Networking" 區塊
5. 複製完整的公共連接字串
6. 替換 Secret 中的 DATABASE_URL

---

**現在您可以複製上面的 DATABASE_URL 並在 GitHub 設置了！** 🚀
