# Tailwind CSS 設置指南

## 問題
瀏覽器控制台出現警告：
```
cdn.tailwindcss.com should not be used in production
```

## 解決方案

### 方案 1：快速解決（暫時隱藏警告）✅ 已實施

我已經在 `index.html` 中添加了代碼來隱藏這個警告。這個警告現在不會再顯示在控制台中。

**注意**：這只是隱藏警告，在生產環境中仍建議使用本地構建的 Tailwind CSS。

### 方案 2：完整設置本地構建 Tailwind CSS（推薦用於生產環境）

#### 步驟 1：安裝依賴

```bash
npm install
```

這會安裝：
- `tailwindcss`: Tailwind CSS 核心
- `autoprefixer`: 自動添加瀏覽器前綴
- `postcss`: CSS 處理工具

#### 步驟 2：構建 CSS

```bash
# 一次性構建
npm run build:css

# 監聽模式（開發時自動重建）
npm run watch:css
```

這會生成 `css/output.css` 文件。

#### 步驟 3：更新 HTML 文件

將所有 HTML 文件中的：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

替換為：
```html
<link rel="stylesheet" href="css/output.css">
```

並移除 `<script>tailwind.config = ...</script>` 配置（因為已經在 `tailwind.config.js` 中配置了）。

#### 步驟 4：更新 `.gitignore`

確保 `node_modules/` 和 `package-lock.json` 被忽略（如果需要的話）。

## 開發工作流程

### 目前使用 CDN（快速開發）

**優點**：
- ✅ 快速開始，無需構建
- ✅ 即時看到效果
- ✅ 適合原型開發

**缺點**：
- ⚠️ 文件較大（未壓縮）
- ⚠️ 依賴外部 CDN
- ⚠️ 生產環境警告

### 使用本地構建（生產環境）

**優點**：
- ✅ 文件小（壓縮後）
- ✅ 不依賴外部 CDN
- ✅ 生產環境最佳實踐
- ✅ 可自定義和優化

**缺點**：
- ⚠️ 需要構建步驟
- ⚠️ 開發時需要監聽模式

## 建議

### 開發階段（現在）
- ✅ 使用 CDN（已經設置隱藏警告）
- ✅ 快速開發和測試
- ✅ 使用 `./dev-server.sh` 啟動服務器

### 準備上線前
- 切換到本地構建
- 執行 `npm run build:css`
- 更新所有 HTML 文件
- 測試確保樣式正常

## 快速切換腳本

如果您想快速切換到本地構建，可以創建一個腳本：

```bash
# switch-to-build.sh
#!/bin/bash
echo "切換到本地構建模式..."
# 批量替換所有 HTML 文件
find . -name "*.html" -type f -exec sed -i '' 's|<script src="https://cdn.tailwindcss.com"></script>|<link rel="stylesheet" href="css/output.css">|g' {} \;
echo "✅ 已完成！請執行 npm run build:css"
```

## 文件結構

```
.
├── package.json          # 項目配置
├── tailwind.config.js    # Tailwind 配置
├── postcss.config.js     # PostCSS 配置
├── css/
│   ├── input.css        # Tailwind 輸入文件
│   ├── output.css       # 構建後的 CSS（需要生成）
│   └── style.css        # 自定義樣式
└── ...
```

## 注意事項

1. **CSS 構建順序**：`input.css` 會導入 `style.css`，確保自定義樣式在最後
2. **監聽模式**：開發時使用 `npm run watch:css`，修改 CSS 後會自動重建
3. **生產構建**：上線前執行 `npm run build:css -- --minify` 進行壓縮
4. **版本控制**：可以選擇是否將 `output.css` 加入 git（建議不加入，構建時生成）

---

**目前狀態**：已設置隱藏警告，可以繼續使用 CDN 進行開發。當準備上線時，再切換到本地構建。
