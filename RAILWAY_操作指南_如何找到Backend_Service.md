# Railway Web Console 操作指南 - 如何找到 Backend Service

## 🎯 第一步：登入 Railway Dashboard

1. 前往 https://railway.app
2. 點擊右上角的「Login」或「Sign In」
3. 使用您的帳號登入（GitHub、Google 等）

---

## 📍 第二步：找到您的專案（Project）

登入後，您會看到 **Dashboard** 頁面，顯示所有專案。

### 情況 A：如果您的專案已經存在

1. 在 Dashboard 中，您會看到專案列表
2. 找到您的專案（可能是 "p-et-taiwan" 或類似的名稱）
3. **點擊專案名稱** 進入專案詳情頁

### 情況 B：如果看不到專案

1. 確認是否使用正確的帳號登入
2. 檢查是否有其他工作區（Workspace）
3. 如果專案不存在，可能需要先建立：
   - 點擊「New Project」
   - 選擇「Deploy from GitHub repo」（如果已經有 Git 倉庫）
   - 或選擇其他部署方式

---

## 🔍 第三步：找到 Backend Service

進入專案詳情頁後，您會看到一個 **服務列表**（Services List）。

### 識別 Backend Service 的方法：

#### 方法 1：看服務名稱
- 通常命名為：`backend`、`api`、`server`、`node-backend` 等
- 或您的專案名稱後綴 `-backend`

#### 方法 2：看服務類型標籤
- Backend Service 通常顯示為 **"Web Service"** 或 **"Service"**
- 可能會有 **Node.js**、**Express** 等標籤

#### 方法 3：看服務圖標
- Backend Service 通常有 **齒輪** ⚙️ 或 **代碼** 💻 圖標
- PostgreSQL 資料庫會有 **資料庫** 🗄️ 圖標（這是另一個服務）

#### 方法 4：看服務配置
- 點擊每個服務，查看詳情
- Backend Service 通常會：
  - 有 `server.js` 或 `package.json`
  - 顯示 Node.js 版本
  - 有 API 端點（URL）

---

## 🖥️ 第四步：進入 Backend Service 的 Terminal

找到 Backend Service 後：

### 步驟：

1. **點擊 Backend Service 卡片**（整個卡片都可以點）
   - 會進入服務詳情頁（Service Detail Page）

2. 在服務詳情頁中，您會看到多個標籤（Tabs）：
   - **Deployments** - 部署歷史
   - **Metrics** - 監控指標
   - **Settings** - 設定
   - **Variables** - 環境變數
   - **Logs** - 日誌
   - **Terminal** 或 **Shell** ⭐ **這就是我們要的！**

3. **點擊 "Terminal" 或 "Shell" 標籤**

4. 您會看到一個**終端機視窗**，類似這樣：
   ```
   $ 
   ```

---

## ✅ 第五步：在 Terminal 中執行命令

進入 Terminal 後，執行以下命令：

```bash
cd backend
npm run setup-db
```

**完整的命令流程**：

```bash
# 1. 確認當前目錄（通常是 / 或 /app）
pwd

# 2. 查看目錄結構
ls -la

# 3. 進入 backend 目錄（如果存在的話）
cd backend

# 如果沒有 backend 目錄，可能是根目錄就是 backend，直接執行：
npm run setup-db
```

---

## 🗺️ Railway Dashboard 結構示意圖

```
Railway Dashboard
│
├── Projects (專案列表)
│   │
│   └── [您的專案名稱]
│       │
│       ├── Services (服務列表)
│       │   │
│       │   ├── [Backend Service] ⚙️ ← 點擊這裡
│       │   │   │
│       │   │   ├── Overview (總覽)
│       │   │   ├── Deployments (部署)
│       │   │   ├── Metrics (監控)
│       │   │   ├── Settings (設定)
│       │   │   ├── Variables (環境變數)
│       │   │   ├── Logs (日誌)
│       │   │   └── Terminal ⭐ ← 點擊這裡進入終端機
│       │   │
│       │   └── [PostgreSQL Database] 🗄️ (資料庫服務，另一個服務)
│       │
│       └── Settings (專案設定)
│
└── Account (帳號設定)
```

---

## 🔍 如果找不到 Backend Service？

### 檢查 1：確認服務是否存在

可能的情況：
- **服務還沒有建立**：需要先建立服務
- **服務名稱不同**：可能命名為其他名稱
- **服務在不同的專案中**：檢查其他專案

### 檢查 2：建立新的 Backend Service（如果不存在）

1. 在專案詳情頁，點擊 **"+ New"** 或 **"Add Service"**
2. 選擇 **"GitHub Repo"** 或 **"Empty Service"**
3. 如果是 GitHub Repo：
   - 選擇您的倉庫
   - Railway 會自動偵測並設定為 Node.js 服務
4. 如果是 Empty Service：
   - 選擇 **"Node"** 模板
   - Railway 會建立一個基本的 Node.js 服務

### 檢查 3：查看所有服務

在專案詳情頁，查看所有服務卡片。每個卡片都是一個服務：
- **Web Service** = Backend Service
- **Database** = 資料庫服務

---

## 📝 快速檢查清單

在執行資料庫設置前，確認：

- [ ] 已登入 Railway Dashboard
- [ ] 找到正確的專案（Project）
- [ ] 找到 Backend Service（可能是 "backend"、"api" 等名稱）
- [ ] 點擊進入 Backend Service 詳情頁
- [ ] 找到並點擊 "Terminal" 或 "Shell" 標籤
- [ ] 終端機視窗已開啟（看到 `$` 提示符）
- [ ] 確認當前目錄（執行 `pwd`）
- [ ] 找到 `backend` 目錄或 `package.json`（執行 `ls -la`）

---

## 🎯 完整執行流程（圖示）

```
1. 登入 Railway
   └─> Dashboard

2. 點擊專案
   └─> Project Detail Page

3. 找到 Backend Service 卡片
   └─> 點擊進入

4. 點擊 Terminal 標籤
   └─> Terminal Window

5. 執行命令
   cd backend
   npm run setup-db
```

---

## 💡 提示

1. **Terminal 位置**：Terminal 標籤通常在服務詳情頁的上方或側邊欄
2. **如果找不到 Terminal**：可能是權限問題，確認您的帳號有該服務的訪問權限
3. **多個服務**：如果有多個服務，確認選擇的是**後端服務**（不是資料庫服務）
4. **服務名稱**：如果您的專案結構不同，Backend Service 可能就在根目錄，不需要 `cd backend`

---

## 🆘 如果還是有問題

請告訴我：
1. 您在 Railway Dashboard 看到什麼？（專案列表、服務列表等）
2. 您看到哪些服務？
3. 點擊服務後看到哪些標籤（Tabs）？
4. 是否有 Terminal 或 Shell 選項？

我可以根據您的具體情況提供更詳細的指引！

---

**現在請試著按照以上步驟找到 Backend Service，然後告訴我您看到了什麼！** 🚀
