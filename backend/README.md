# 匠寵後端 API 服務

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

複製 `.env.example` 為 `.env` 並修改配置：

```bash
cp .env.example .env
```

### 3. 初始化資料庫

```bash
npm run init-db
```

### 4. 啟動服務器

開發模式（自動重啟）：
```bash
npm run dev
```

生產模式：
```bash
npm start
```

服務器將在 `http://localhost:3000` 啟動

## API 端點

### 認證
- `POST /api/auth/register` - 用戶註冊
- `POST /api/auth/login` - 用戶登入
- `GET /api/auth/me` - 獲取當前用戶資訊

### 商品
- `GET /api/products` - 獲取商品列表（支援篩選、分頁）
- `GET /api/products/:id` - 獲取單一商品
- `POST /api/products` - 建立商品（需管理員）
- `PUT /api/products/:id` - 更新商品（需管理員）
- `DELETE /api/products/:id` - 刪除商品（需管理員）

### 訂單
- `GET /api/orders` - 獲取訂單列表
- `GET /api/orders/:id` - 獲取單一訂單
- `POST /api/orders` - 建立訂單
- `PUT /api/orders/:id/status` - 更新訂單狀態（需管理員）
- `POST /api/orders/:id/cancel` - 取消訂單

### 購物車
- `GET /api/cart` - 獲取購物車
- `POST /api/cart/add` - 加入購物車
- `PUT /api/cart/:id` - 更新購物車項目
- `DELETE /api/cart/:id` - 刪除購物車項目
- `DELETE /api/cart` - 清空購物車

### 綠界金流
- `POST /api/ecpay/create-payment` - 建立付款表單
- `POST /api/ecpay/notify` - 付款結果通知（Server to Server）

### 測驗
- `POST /api/quiz` - 提交測驗結果
- `GET /api/quiz` - 獲取測驗結果列表
- `GET /api/quiz/:id` - 獲取單一測驗結果

### 管理員
- `GET /api/admin/stats` - 獲取統計數據
- `GET /api/admin/orders` - 獲取所有訂單
- `GET /api/admin/users` - 獲取所有用戶

## 認證

大部分 API 需要 JWT Token，請在請求頭中加入：

```
Authorization: Bearer <your-token>
```

## 資料庫

使用 SQLite 作為資料庫，資料文件位於 `data/jiangchong.db`

## 環境變數

- `PORT` - 服務器端口（預設: 3000）
- `NODE_ENV` - 環境（development/production）
- `JWT_SECRET` - JWT 密鑰
- `JWT_EXPIRE` - JWT 過期時間（預設: 7d）
- `DB_PATH` - 資料庫文件路徑
- `ECPAY_MERCHANT_ID` - 綠界商店代號
- `ECPAY_HASH_KEY` - 綠界 Hash Key
- `ECPAY_HASH_IV` - 綠界 Hash IV
- `FRONTEND_URL` - 前端 URL（CORS）

