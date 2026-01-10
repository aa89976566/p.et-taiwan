# 設置 Git 認證 - 完整步驟

## 🔐 方案 1: 使用 GitHub Token（推薦）

### 步驟 1: 創建新的 GitHub Token

1. **前往 GitHub Token 設置頁面**：
   ```
   https://github.com/settings/tokens/new
   ```

2. **填寫 Token 資訊**：
   - **Note（名稱）**: `Git Operations for p.et-taiwan`
   - **Expiration（有效期）**: 選擇 `90 days` 或 `No expiration`
   - **Select scopes（選擇權限）**: 勾選以下兩個：
     - ✅ `repo` - Full control of private repositories
     - ✅ `workflow` - Update GitHub Action workflows

3. **點擊 "Generate token"**（綠色按鈕）

4. **複製 Token**：
   - ⚠️ **重要**：Token 只會顯示一次，請立即複製並保存！
   - Token 格式類似：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步驟 2: 使用新 Token 推送

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

# 使用新 token 替換 YOUR_NEW_TOKEN
git push https://aa89976566:YOUR_NEW_TOKEN@github.com/aa89976566/p.et-taiwan.git main
```

### 步驟 3: 設置 Credential Helper（避免每次輸入）

```bash
# 設置 macOS keychain 作為 credential helper
git config --global credential.helper osxkeychain

# 然後正常推送（第一次還是會提示輸入，之後就會記住）
git push origin main
```

當提示時：
- **Username**: `aa89976566`
- **Password**: 輸入剛才創建的新 token

---

## 🔐 方案 2: 使用 SSH（最安全，長期推薦）

### 步驟 1: 檢查是否已有 SSH Key

```bash
ls -la ~/.ssh/id_ed25519.pub
# 或
ls -la ~/.ssh/id_rsa.pub
```

### 步驟 2: 如果沒有 SSH Key，創建一個

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"

# 按 Enter 使用預設位置
# 可以設置密碼或直接按 Enter（不設置密碼）
```

### 步驟 3: 複製 Public Key

```bash
cat ~/.ssh/id_ed25519.pub
# 或
cat ~/.ssh/id_rsa.pub
```

### 步驟 4: 添加到 GitHub

1. 前往：https://github.com/settings/ssh/new
2. **Title**: `MacBook Air - p.et-taiwan`
3. **Key**: 貼上剛才複製的 public key
4. 點擊 **"Add SSH key"**

### 步驟 5: 更改 Remote URL 為 SSH

```bash
cd /Users/ming/Documents/GitHub/p.et-taiwan

# 更改為 SSH URL
git remote set-url origin git@github.com:aa89976566/p.et-taiwan.git

# 測試連接
ssh -T git@github.com

# 如果看到 "Hi aa89976566! You've successfully authenticated..." 就成功了

# 推送
git push origin main
```

---

## 🚀 快速解決（現在就可以做）

### 選項 A: 創建新 Token 並立即推送

1. 前往 https://github.com/settings/tokens/new
2. 創建 token（勾選 `repo` 和 `workflow`）
3. 複製新 token
4. 在終端執行：
   ```bash
   cd /Users/ming/Documents/GitHub/p.et-taiwan
   git push https://aa89976566:NEW_TOKEN_HERE@github.com/aa89976566/p.et-taiwan.git main
   ```

### 選項 B: 使用 GitHub CLI（如果已安裝）

```bash
# 如果已安裝 GitHub CLI
gh auth login

# 然後正常推送
git push origin main
```

---

## 📋 推薦流程

**最快的方式**（現在就做）：

1. ✅ 創建新的 GitHub Token（5 分鐘）
2. ✅ 使用新 token 推送一次
3. ✅ 設置 credential helper，之後就不需要再輸入

**最安全的方式**（長期推薦）：

1. ✅ 設置 SSH key
2. ✅ 更改 remote URL 為 SSH
3. ✅ 之後都不需要 token，更安全

---

**現在請前往創建新的 GitHub Token，然後使用新 token 推送！** 🚀
