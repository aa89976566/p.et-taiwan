# Railway CLI 安裝與使用指南

## ❌ 遇到的問題

在 macOS 上安裝 Railway CLI 時遇到權限錯誤：
```bash
npm error code EACCES
npm error path /usr/local/lib/node_modules/@railway
npm error errno -13
```

## ✅ 解決方案（三種方式，推薦方案 A）

---

## **方案 A：使用 npx（最簡單，推薦）** ⭐

**無需安裝**，直接使用 npx 運行 Railway CLI：

```bash
# 登入
npx @railway/cli login

# 連結專案
cd /path/to/your/project
npx @railway/cli link

# 執行命令
npx @railway/cli run node backend/scripts/create-admin.js
```

**優點**：
- ✅ 無需處理權限問題
- ✅ 無需全局安裝
- ✅ 每次使用最新版本
- ✅ 簡單快速

---

## **方案 B：修復 npm 權限（一勞永逸）**

### 步驟 1：更改 npm 全局目錄為用戶目錄

```bash
# 創建 npm 全局目錄
mkdir ~/.npm-global

# 配置 npm 使用新目錄
npm config set prefix '~/.npm-global'

# 添加到 PATH（根據你的 shell 選擇）
# 如果使用 zsh（macOS 預設）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 如果使用 bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bash_profile
source ~/.bash_profile
```

### 步驟 2：重新安裝 Railway CLI

```bash
npm install -g @railway/cli
```

### 步驟 3：驗證安裝

```bash
railway --version
```

---

## **方案 C：使用 sudo（不推薦，但快速）**

```bash
sudo npm install -g @railway/cli
```

⚠️ **注意**：使用 sudo 可能會導致其他權限問題，不建議作為長期解決方案。

---

## 🚀 使用 Railway CLI 創建管理員帳號

### 方法 1：使用 npx（推薦）

```bash
# 1. 登入 Railway
npx @railway/cli login

# 2. 進入專案目錄
cd /path/to/p.et-taiwan

# 3. 連結專案（首次使用需要）
npx @railway/cli link

# 4. 執行創建管理員腳本
npx @railway/cli run node backend/scripts/create-admin.js
```

### 方法 2：使用已安裝的 CLI

```bash
# 1. 登入 Railway
railway login

# 2. 進入專案目錄
cd /path/to/p.et-taiwan

# 3. 連結專案（首次使用需要）
railway link

# 4. 執行創建管理員腳本
railway run node backend/scripts/create-admin.js
```

---

## 📋 預期輸出

執行成功後，你應該看到：

```
🔌 正在連接到 Railway PostgreSQL 資料庫...
✅ 資料庫連接成功
🔍 檢查 users 資料表是否存在...
✅ users 資料表已存在

🔐 開始建立管理員帳號...
📧 Email: admin@jiangchong.com
🔑 密碼: Admin@123456
👤 姓名: 管理員
👑 角色: admin

✅ 管理員帳號建立成功！

📝 登入資訊：
   Email: admin@jiangchong.com
   密碼: Admin@123456
   後台登入: https://aa89976566.github.io/p.et-taiwan/admin-login.html

⚠️  請立即登入並修改密碼！
```

---

## 🆘 常見問題

### Q: npx 命令找不到？
**A:** 確保你安裝了 Node.js（v14 或更高版本）。npx 是隨 npm 一起安裝的。

```bash
# 檢查版本
node --version
npm --version
npx --version
```

### Q: railway link 要求選擇專案？
**A:** 首次使用需要選擇你的專案：
1. 執行 `npx @railway/cli link`
2. 選擇 `p.et-taiwan` 或你的專案名稱
3. 選擇 `production` 環境

### Q: 執行腳本時出現 "DATABASE_URL is not set"？
**A:** 確保：
1. 已登入 Railway：`npx @railway/cli login`
2. 已連結專案：`npx @railway/cli link`
3. 使用 `railway run` 命令（會自動注入環境變數）

---

## 🎯 快速命令參考

```bash
# 使用 npx（無需安裝）
npx @railway/cli login                                    # 登入
npx @railway/cli link                                     # 連結專案
npx @railway/cli run node backend/scripts/create-admin.js # 執行腳本
npx @railway/cli logs                                     # 查看日誌
npx @railway/cli status                                   # 查看狀態

# 使用已安裝的 CLI
railway login
railway link
railway run node backend/scripts/create-admin.js
railway logs
railway status
```

---

## 📚 相關文件

- [Railway CLI 官方文檔](https://docs.railway.app/develop/cli)
- [npm 權限問題解決](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- 創建管理員帳號指南.md
- 系統狀態檢查報告.md

---

## 💡 建議

**最佳實踐**：
1. ✅ 使用 **npx** 來運行 Railway CLI（無需安裝）
2. ✅ 如果需要頻繁使用，採用**方案 B**修復權限
3. ❌ 避免使用 sudo 安裝 npm 套件

**下一步**：
1. 使用 npx 執行創建管理員腳本
2. 登入後台測試
3. 添加商品
4. 測試完整購物流程

---

建立日期：2026-01-10
最後更新：2026-01-10
