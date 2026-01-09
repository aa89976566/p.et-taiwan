# 推送 Workflow 完成步驟

## ✅ 當前狀態

- ✅ Workflow 文件已創建並提交（commit 85cd6dd）
- ⏳ 等待推送到 GitHub
- 📍 遠程倉庫：`https://github.com/aa89976566/p.et-taiwan.git`

---

## 🚀 方法 1: 設置 Credential Helper（推薦）

在您的終端執行以下命令，設置 credential helper，之後就不需要每次都輸入認證資訊：

```bash
# 設置 macOS keychain 作為 credential helper
git config --global credential.helper osxkeychain

# 然後執行推送（第一次還是會提示輸入，之後就會記住）
cd /Users/ming/Documents/GitHub/p.et-taiwan
git push origin main
```

當提示時：
- **Username**: `aa89976566`（您的 GitHub 用戶名）
- **Password**: `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`（使用 token 作為密碼）

**注意**：第一次輸入後，macOS keychain 會記住，之後就不需要再輸入了。

---

## 🚀 方法 2: 直接在 URL 中包含 Token（一次性）

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

git push https://aa89976566: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@github.com/aa89976566/p.et-taiwan.git main
```

**注意**：這種方式會在命令歷史中留下 token，不建議長期使用。

---

## 🚀 方法 3: 使用 SSH（最安全，長期推薦）

如果您想改用 SSH（不需要每次輸入 token）：

```bash
# 1. 檢查是否有 SSH key
ls -la ~/.ssh/id_rsa.pub

# 如果沒有，生成一個新的 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 複製 public key
cat ~/.ssh/id_rsa.pub

# 3. 添加到 GitHub
# 前往 GitHub → Settings → SSH and GPG keys → New SSH key
# 貼上剛才複製的 key

# 4. 更改 remote URL 為 SSH
git remote set-url origin git@github.com:aa89976566/p.et-taiwan.git

# 5. 推送
git push origin main
```

---

## ✅ 推送成功後應該看到

```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to X threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), X.XX KiB | X.XX MiB/s, done.
Total X (delta X), reused X (delta X), pack-reused X
remote: Resolving deltas: 100% (X/X), completed with X local objects.
To https://github.com/aa89976566/p.et-taiwan.git
   xxxxxxx..85cd6dd  main -> main
```

---

## 📋 推送完成後的下一步

### 步驟 1: 在 GitHub 添加 DATABASE_URL Secret

1. 前往：https://github.com/aa89976566/p.et-taiwan/settings/secrets/actions
2. 點擊 **"New repository secret"**
3. 輸入：
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:YOUR_PASSWORD@turntable.proxy.rlwy.net:36497/railway?sslmode=require`
     - 替換 `YOUR_PASSWORD` 為實際密碼
4. 點擊 **"Add secret"**

### 步驟 2: 手動觸發 Workflow

1. 前往：https://github.com/aa89976566/p.et-taiwan/actions
2. 在左側選擇 **"Database Init (Simple)"** workflow
3. 點擊 **"Run workflow"** 按鈕
4. 選擇分支 `main`
5. 點擊綠色的 **"Run workflow"** 按鈕

### 步驟 3: 查看執行結果

1. 點擊最新的 workflow run
2. 查看執行日誌
3. 確認資料表已成功建立

---

## 🔐 安全提醒

⚠️ **重要**：您使用的 GitHub token 已經在對話中暴露！

建議完成推送後：
1. 前往 GitHub Settings → Developer settings → Personal access tokens
2. 撤銷舊的 token
3. 創建新的 token（如果需要）
4. 或者改用 SSH 認證（更安全）

---

**現在請在終端執行方法 1 來完成推送！** 🚀
