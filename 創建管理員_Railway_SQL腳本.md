# 🔐 創建管理員帳號 - Railway SQL 方式

## 📝 **最簡單的方法：不需要安裝任何東西！**

### **步驟 1：生成加密密碼**

你需要先生成一個加密後的密碼。在你的 Mac 終端執行：

```bash
cd ~/path/to/p.et-taiwan/backend

# 執行這個命令生成加密密碼（不需要安裝 Railway CLI）
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123456', 10, (err, hash) => console.log(hash));"
```

**你會得到類似這樣的結果：**
```
$2a$10$abcdefghijk1234567890abcdefghijklmnopqrstuvwxyz123456
```

**複製這個加密密碼！**

---

### **步驟 2：在 Railway 執行 SQL**

1. **進入 Railway Dashboard**：https://railway.app
2. **選擇你的項目**：p.et-taiwan
3. **點擊 Postgres 服務**（資料庫圖示）
4. **點擊 "Query" 標籤**
5. **貼上以下 SQL 並修改密碼**：

```sql
-- 創建管理員帳號
INSERT INTO users (
    id, 
    email, 
    password,  -- ⚠️ 這裡要替換成你生成的加密密碼！
    name, 
    "memberLevel", 
    status, 
    "registeredAt", 
    "createdAt", 
    "updatedAt",
    "totalOrders",
    "totalSpent",
    "quizCompleted"
) VALUES (
    'admin-' || FLOOR(RANDOM() * 1000000)::TEXT,  -- 自動生成 ID
    'admin@jiangchong.com',  -- ✏️ 可以改成你想要的 Email
    '$2a$10$你生成的加密密碼',  -- ⚠️ 這裡要替換！
    '匠寵管理員',  -- ✏️ 可以改成你想要的名稱
    'admin',  -- 管理員等級
    'active',  -- 狀態：啟用
    EXTRACT(EPOCH FROM NOW()) * 1000,  -- 註冊時間
    EXTRACT(EPOCH FROM NOW()) * 1000,  -- 創建時間
    EXTRACT(EPOCH FROM NOW()) * 1000,  -- 更新時間
    0,  -- 訂單數
    0,  -- 總消費
    0   -- 測驗完成數
);

-- 檢查是否創建成功
SELECT id, email, name, "memberLevel", status 
FROM users 
WHERE email = 'admin@jiangchong.com';
```

6. **點擊 "Run Query" 按鈕**

---

### **步驟 3：驗證**

如果成功，你會看到：

```
id              email                  name        memberLevel  status
admin-123456    admin@jiangchong.com   匠寵管理員   admin        active
```

---

## 🎯 **完整範例（複製貼上版）**

### **先在終端生成密碼：**

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('Admin@123456', 10, (err, hash) => console.log('加密密碼:', hash));"
```

### **然後在 Railway Query 執行（記得替換密碼）：**

```sql
-- 檢查 Email 是否已存在（避免重複）
SELECT email, "memberLevel" FROM users WHERE email = 'admin@jiangchong.com';

-- 如果不存在，執行以下插入語句
INSERT INTO users (
    id, email, password, name, "memberLevel", status, 
    "registeredAt", "createdAt", "updatedAt",
    "totalOrders", "totalSpent", "quizCompleted"
) VALUES (
    'admin-' || FLOOR(RANDOM() * 1000000)::TEXT,
    'admin@jiangchong.com',
    '$2a$10$你的加密密碼在這裡',  -- ⚠️ 替換這裡
    '匠寵管理員',
    'admin',
    'active',
    EXTRACT(EPOCH FROM NOW()) * 1000,
    EXTRACT(EPOCH FROM NOW()) * 1000,
    EXTRACT(EPOCH FROM NOW()) * 1000,
    0, 0, 0
);

-- 驗證創建結果
SELECT id, email, name, "memberLevel", status FROM users WHERE email = 'admin@jiangchong.com';
```

---

## 📝 **預設登入資訊**

```
Email:    admin@jiangchong.com
密碼:     Admin@123456
```

**⚠️ 登入後請立即修改密碼！**

---

## 🌐 **登入後台**

創建成功後，訪問：

- **本地測試**：http://localhost:8000/admin-login.html
- **線上正式**：https://aa89976566.github.io/p.et-taiwan/admin-login.html

---

## 🔄 **如果已經有帳號，想升級為管理員**

如果你已經註冊了一個普通帳號，想升級為管理員：

```sql
-- 查看現有用戶
SELECT id, email, name, "memberLevel" FROM users;

-- 將指定用戶升級為管理員
UPDATE users 
SET "memberLevel" = 'admin', "updatedAt" = EXTRACT(EPOCH FROM NOW()) * 1000 
WHERE email = '你的現有Email@example.com';

-- 驗證
SELECT id, email, name, "memberLevel" FROM users WHERE email = '你的現有Email@example.com';
```

---

## 🆘 **如果密碼生成失敗**

如果 bcrypt 命令失敗，你可以：

### **方法 1：使用在線 bcrypt 生成器**

訪問：https://bcrypt-generator.com/
- 輸入你的密碼：`Admin@123456`
- Rounds 選擇：`10`
- 點擊 Generate
- 複製生成的 Hash

### **方法 2：創建簡單的密碼生成腳本**

```bash
cd backend
cat > generate-password.js << 'EOF'
const bcrypt = require('bcryptjs');
const password = 'Admin@123456';  // 你想要的密碼

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('錯誤:', err);
    } else {
        console.log('\n密碼:', password);
        console.log('加密後:', hash);
        console.log('\n把這個 Hash 複製到 SQL 的 password 欄位！\n');
    }
});
EOF

node generate-password.js
```

---

## ✅ **完成後的下一步**

1. ✅ 訪問後台登入頁面
2. ✅ 使用管理員帳號登入
3. ✅ 修改密碼（安全起見）
4. ✅ 開始添加商品

---

**這個方法不需要 Railway CLI，不需要處理權限問題！** 🎉
