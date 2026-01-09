# 匠寵 JiangChong - 寵物循環經濟電商平台

> 專業的寵物產品電商網站，結合智能測驗、訂閱服務與循環經濟理念

## 🚀 快速開始

### 本地運行

```bash
# 使用 Python HTTP 服務器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

訪問: `http://localhost:8000`

### 後端服務器

```bash
cd backend
npm install
npm start
```

後端服務器將在 `http://localhost:3000` 運行

## 📁 專案結構

```
網站/
├── index.html                    # 首頁
├── products.html                 # 產品列表
├── cart.html                     # 購物車
├── checkout.html                 # 結帳頁
├── member-center.html            # 會員中心
├── subscription-packages.html    # 訂閱方案
├── admin-*.html                  # 後台管理頁面
│
├── css/                          # 樣式文件
├── js/                           # JavaScript 模組
├── data/                         # 數據文件
├── animations/                   # 動畫資源
├── pet-landing/                  # 動畫落地頁
│
├── backend/                      # 後端 API
│   ├── server.js
│   ├── routes/
│   └── models/
│
└── docs/                         # 文檔
    ├── guides/                   # 使用指南
    └── archive/                  # 歷史文檔
```

## ⭐ 核心功能

- 🛍️ **完整購物系統** - 產品瀏覽、購物車、結帳、訂單管理
- 👤 **會員系統** - 登入/註冊、會員中心、訂閱管理
- 🧪 **智能測驗** - 營養需求測驗、益智玩具推薦
- 📊 **後台管理** - 產品管理、訂單管理、用戶管理、內容編輯
- 💳 **訂閱服務** - 靈活的寵物食品訂閱方案
- 🔄 **循環經濟** - 玻璃罐回收與換罐計畫

## 🛠️ 技術棧

### 前端
- HTML5 + CSS3
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6+)
- Font Awesome
- GSAP (動畫)

### 後端
- Node.js + Express
- MongoDB
- JWT 認證
- ECPay 金流整合

## 📖 文檔

詳細使用說明請參考 `docs/guides/` 目錄：

- 📖 首頁展示邏輯與順序調整指南.md
- 📖 首頁產品展示設定指南.md
- 📖 伺服器啟動完整指南.md
- 📖 線上付款使用指南.md

## 🎛️ 後台管理

後台登入頁面: `admin-login.html`

預設帳號: `admin@jiangchong.com`  
預設密碼: `admin123`

## 📝 環境配置

### 前端配置

編輯 `js/config.js`：

```javascript
const CONFIG = {
    ENV: 'production',
    DEBUG: false,
    API_URL: 'http://localhost:3000'
};
```

### 後端環境變數

在 `backend/.env` 中設置：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jiangchong
JWT_SECRET=your-secret-key
ECPAY_MERCHANT_ID=your-merchant-id
ECPAY_HASH_KEY=your-hash-key
ECPAY_HASH_IV=your-hash-iv
```

## 🚀 部署

### 前端部署

可直接部署到任何靜態網站託管服務：

- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### 後端部署

```bash
cd backend
npm install --production
npm start
```

## 📄 授權

MIT License

## 📞 聯繫

- LINE: @902rkfzv
- Email: support@jiangchong.com

