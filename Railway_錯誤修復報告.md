# 🐛 Railway 部署錯誤修復報告

## ❌ 錯誤信息

```
error: undefined variable 'npm-9_x'
at /app/.nixpacks/nixpkgs-5148520bfab61f99fd25fb9ff7bfbb50dad3c9db.nix:19:19
ERROR: failed to build: failed to solve
Error: Docker build failed
```

---

## 🔍 錯誤原因

**問題**: `nixpacks.json` 配置文件中使用了不存在的包名 `npm-9_x`

**錯誤的配置**:
```json
{
  "phases": {
    "setup": {
      "nixPkgs": ["nodejs_20", "npm-9_x"],  ← npm-9_x 不存在！
      ...
    }
  }
}
```

**為什麼會出錯**:
- Nix 包管理器中沒有 `npm-9_x` 這個包
- npm 已經包含在 `nodejs_20` 中，不需要單獨安裝
- Nixpacks 嘗試安裝不存在的包導致構建失敗

---

## ✅ 解決方案

**已修正的配置**:
```json
{
  "phases": {
    "setup": {
      "nixPkgs": ["nodejs_20"]  ← 只需要 nodejs_20
    },
    "install": {
      "cmds": ["cd backend && npm ci --prefer-offline --no-audit"]
    },
    "build": {
      "cmds": []
    },
    "start": {
      "cmd": "cd backend && npm start"
    }
  }
}
```

**修改內容**:
- ✅ 移除了 `npm-9_x`
- ✅ 移除了 `providers: []`（不需要）
- ✅ 移除了 `buildImage`（不需要）
- ✅ 移除了 `nixOverlays` 和 `nixLibs`（不需要）
- ✅ 簡化配置，只保留必要的部分

---

## 📦 為什麼不需要單獨安裝 npm？

Node.js 20 已經包含了 npm：

```bash
nodejs_20 包含：
├── node (v20.x.x)
├── npm (v10.x.x)  ← npm 已經內建！
└── npx
```

所以只需要安裝 `nodejs_20`，npm 會自動可用。

---

## 🚀 已完成的修復

✅ 已修正 `nixpacks.json`
✅ 已提交到 Git
✅ 已推送到 GitHub
✅ Railway 會自動觸發重新部署

---

## 📊 下一步：確認部署成功

### 1️⃣ 等待 Railway 重新部署

推送後，Railway 應該會：
- 自動檢測到新的提交
- 觸發重新構建
- 使用修正後的 `nixpacks.json`

### 2️⃣ 查看新的構建日誌

應該看到：
```
✅ Using Nixpacks
✅ setup: nodejs_20  ← 只有這個，沒有 npm-9_x
✅ install: cd backend && npm ci --prefer-offline --no-audit
✅ start: cd backend && npm start
✅ 構建成功
```

### 3️⃣ 確認服務啟動

部署成功後，應該看到：
```
✅ 已連接到 PostgreSQL 資料庫
📊 資料庫類型: postgresql
✅ PostgreSQL 連接池已建立
📊 開始建立 PostgreSQL 資料表...
   ✅ users 建立成功
   ✅ products 建立成功
   ... (共 11 個資料表)
✅ PostgreSQL 資料庫表結構初始化完成
🚀 匠寵後端服務器已啟動
```

---

## ⚠️ 重要提醒：DATABASE_URL

**構建問題已修復，但還需要確認**：

在 **p.et-taiwan** 服務的 **Variables** 標籤：

```
❌ DATABASE_URL    <empty string>  ← 這個必須修正！
```

**必須改為**：

```
✅ DATABASE_URL    postgresql://postgres:xxxxx@...
```

### 如何修正 DATABASE_URL：

#### 選項 1: Variable Reference（推薦）
1. 刪除空的 DATABASE_URL
2. 點擊 "+ New Variable"
3. 選擇 "Variable Reference"
4. Service: Postgres
5. Variable: DATABASE_URL
6. 點擊 Add

#### 選項 2: 手動複製
1. 去 Postgres 服務 → Connect 標籤
2. 複製 DATABASE_URL
3. 回到 p.et-taiwan → Variables
4. 新增變數貼上

---

## 📋 完整的檢查清單

- [x] ✅ 修正 nixpacks.json（移除 npm-9_x）
- [x] ✅ 提交並推送修正
- [ ] ⏳ 等待 Railway 重新部署（自動進行中）
- [ ] ⚠️ **修正 DATABASE_URL**（手動操作必需！）
- [ ] ⚠️ 確認環境變數完整：
  - DATABASE_URL (postgresql://...)
  - DB_TYPE (postgresql)
  - NODE_ENV (production)
  - JWT_SECRET (cb7a88a14cbdda9c157d864351208cdad01cc1b80549de8478f4c57a84ac5698)
- [ ] ⏳ 查看部署日誌確認成功

---

## 🎯 目前狀態

### 已解決的問題：
✅ Nixpacks 構建錯誤（npm-9_x 不存在）
✅ 配置文件已修正並推送

### 待解決的問題：
⚠️ DATABASE_URL 是空的，必須連結 PostgreSQL
⚠️ 需要確認所有環境變數都正確設置

---

## 💡 經驗總結

### 這次錯誤的教訓：

1. **Nix 包名必須準確**
   - 不能隨意假設包名
   - 應該查詢 Nixpkgs 確認包是否存在

2. **npm 包含在 Node.js 中**
   - 安裝 nodejs_20 就足夠了
   - 不需要單獨安裝 npm

3. **簡化配置**
   - 不需要的配置項應該移除
   - 保持配置文件簡潔明瞭

---

## 🆘 如果還有問題

### 如果構建還是失敗：

1. **查看完整的構建日誌**
   - 在 Railway Dashboard → Deployments → 點擊最新部署 → Build Logs

2. **確認配置文件已更新**
   - 檢查 GitHub 倉庫中的 nixpacks.json
   - 確認是最新版本

3. **手動觸發重新部署**
   - Deployments → Redeploy

### 如果部署成功但崩潰：

這通常是因為 DATABASE_URL 問題：
- 確認 DATABASE_URL 不是空的
- 確認 PostgreSQL 服務在線
- 查看 Deploy Logs 看具體錯誤

---

**現在配置文件已修正！等待 Railway 重新部署，然後記得修正 DATABASE_URL！** 🚀
