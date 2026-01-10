# 創建管理員帳號 - Web Console 方案（最簡單）

## ✨ 無需安裝任何東西！直接在 Railway 網頁執行

---

## 🚀 步驟（3 分鐘完成）

### **步驟 1：打開 Railway Web Console**

1. 登入 Railway Dashboard：https://railway.app/
2. 選擇你的專案：`p.et-taiwan`
3. 選擇 **Backend Service**（p.et-taiwan）
4. 點擊頂部的 **"Terminal"** 或 **"Shell"** 標籤

### **步驟 2：執行創建管理員腳本**

在 Terminal 中輸入以下命令：

```bash
cd backend && node scripts/create-admin.js
```

按 **Enter** 執行。

---

## 📋 預期輸出

你應該看到：

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

## 🎯 登入後台

### 步驟 1：打開後台登入頁面

```
https://aa89976566.github.io/p.et-taiwan/admin-login.html
```

### 步驟 2：使用預設管理員帳號登入

- **Email**: `admin@jiangchong.com`
- **密碼**: `Admin@123456`

### 步驟 3：修改密碼（重要！）

登入後請立即修改密碼：
1. 點擊右上角用戶名
2. 選擇「個人資料」或「修改密碼」
3. 設置新密碼

---

## 🛠️ 如果出現錯誤

### 錯誤 1：找不到 scripts 目錄

**解決方案**：確保在正確的目錄

```bash
# 查看當前目錄
pwd

# 如果不在 backend 目錄，先導航到專案根目錄
cd /app

# 然後執行
cd backend && node scripts/create-admin.js
```

### 錯誤 2：DATABASE_URL 未設定

**解決方案**：檢查環境變數

```bash
# 在 Railway Terminal 中檢查
echo $DATABASE_URL
```

如果是空的，回到 Railway Dashboard：
1. 選擇 Backend Service
2. Variables 標籤
3. 確保 `DATABASE_URL` 已設定

### 錯誤 3：users 資料表不存在

**解決方案**：先初始化資料庫

```bash
cd backend && npm run setup-db
```

然後再執行創建管理員腳本。

---

## 📸 截圖指引

### 1. Railway Dashboard 位置
```
Railway Dashboard
  └── 你的專案 (p.et-taiwan)
       └── Backend Service
            └── Terminal 標籤 👈 在這裡
```

### 2. Terminal 界面
- 看起來像一個黑色的命令行窗口
- 有一個輸入框可以輸入命令
- 顯示類似 `root@xxxxx:/app#` 的提示符

---

## ✅ 完成檢查清單

- [ ] 打開 Railway Dashboard
- [ ] 選擇 Backend Service
- [ ] 進入 Terminal 標籤
- [ ] 執行 `cd backend && node scripts/create-admin.js`
- [ ] 看到 "✅ 管理員帳號建立成功！" 訊息
- [ ] 打開後台登入頁面
- [ ] 使用 `admin@jiangchong.com` / `Admin@123456` 登入
- [ ] 登入成功，看到後台管理界面
- [ ] 修改密碼

---

## 🎉 下一步

創建管理員帳號成功後：

### 1. 添加商品（10 分鐘）
   - 登入後台
   - 商品管理 → 新增商品
   - 填寫商品資訊（名稱、價格、描述、圖片）
   - 建議先添加 3-5 個測試商品

### 2. 測試購物流程（5 分鐘）
   - 前台瀏覽商品
   - 加入購物車
   - 結帳下單
   - 後台查看訂單

### 3. 完善網站內容（1 小時）
   - 添加更多商品
   - 設置優惠券
   - 調整首頁配置
   - 測試所有功能

---

## 💡 為什麼這個方案最簡單？

| 方案 | 需要安裝 | 需要權限 | 複雜度 | 推薦度 |
|------|---------|---------|--------|--------|
| **Web Console** | ❌ 不需要 | ❌ 不需要 | ⭐ 最簡單 | ✅✅✅ 強烈推薦 |
| Railway CLI (npx) | ❌ 不需要 | ❌ 不需要 | ⭐⭐ 簡單 | ✅✅ 推薦 |
| Railway CLI (安裝) | ✅ 需要 | ✅ 需要 | ⭐⭐⭐ 複雜 | ✅ 可用 |

---

## 🆘 需要幫助？

如果遇到任何問題：

1. **截圖**：拍下 Terminal 的輸出
2. **描述**：說明你執行了什麼命令
3. **錯誤訊息**：完整的錯誤訊息

我會立即幫你解決！

---

建立日期：2026-01-10
最後更新：2026-01-10
狀態：✅ 可用
