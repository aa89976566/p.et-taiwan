# 📖 IndexedDB 遷移指南

**日期**: 2024-12-21  
**狀態**: ✅ 已完成

---

## 🎯 什麼是 IndexedDB？

IndexedDB 是瀏覽器提供的客戶端數據庫，比 localStorage 支持更大的存儲空間：

| 特性 | localStorage | IndexedDB |
|------|-------------|-----------|
| 存儲限制 | 5-10MB | 數百 MB 到數 GB |
| 數據類型 | 僅字符串 | 多種數據類型 |
| 查詢能力 | 無 | 支持索引查詢 |
| 適用場景 | 小數據 | 大數據、圖片、文件 |

---

## 🔄 自動遷移機制

系統已經實現了**自動遷移機制**：

### 自動選擇存儲方式

- **小圖片（< 2MB）**: 自動使用 Base64 存儲在 localStorage
- **大圖片（> 2MB）**: 自動存儲到 IndexedDB
- **引用格式**: `indexeddb://hero-bg-image`

### 工作流程

1. 上傳圖片時，系統自動檢測圖片大小
2. 如果 > 2MB，自動保存到 IndexedDB
3. 配置中保存引用：`indexeddb://hero-bg-image`
4. 首頁載入時，自動從 IndexedDB 讀取

---

## 🛠️ 手動遷移工具

如果您的圖片已經在 localStorage 中，可以使用遷移工具手動遷移：

### 使用遷移工具

1. **打開遷移工具**
   ```
   http://localhost:8080/migrate-to-indexeddb.html
   ```

2. **查看當前狀態**
   - 工具會自動顯示：
     - localStorage 中的圖片數據
     - IndexedDB 中的圖片數據
     - 數據大小統計

3. **執行遷移**
   - 點擊「遷移所有圖片到 IndexedDB」
   - 確認遷移
   - 等待完成

4. **驗證結果**
   - 刷新數據查看遷移結果
   - 打開首頁確認圖片正常顯示

---

## 📋 遷移工具功能

### 1. 查看數據狀態

- ✅ 顯示 localStorage 中的圖片
- ✅ 顯示 IndexedDB 中的圖片
- ✅ 顯示數據大小統計
- ✅ 顯示圖片預覽

### 2. 遷移操作

- ✅ **遷移所有圖片**: 將 localStorage 中的圖片遷移到 IndexedDB
- ✅ **清除 IndexedDB**: 刪除 IndexedDB 中的所有數據
- ✅ **刷新數據**: 重新載入並顯示當前數據
- ✅ **導出數據**: 導出數據報告（JSON 格式）

---

## 🔍 如何檢查數據

### 方法 1: 使用遷移工具

訪問 `migrate-to-indexeddb.html` 查看所有數據。

### 方法 2: 使用瀏覽器開發者工具

#### Chrome/Edge

1. 打開開發者工具（F12）
2. 切換到「Application」標籤
3. 左側選擇「IndexedDB」→「HeroImagesDB」→「images」
4. 查看存儲的圖片數據

#### Firefox

1. 打開開發者工具（F12）
2. 切換到「存儲」標籤
3. 展開「IndexedDB」→「HeroImagesDB」→「images」
4. 查看存儲的圖片數據

### 方法 3: 使用 Console

```javascript
// 檢查 IndexedDB 中的圖片
const request = indexedDB.open('HeroImagesDB', 1);
request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(['images'], 'readonly');
    const store = transaction.objectStore('images');
    const getAllRequest = store.getAll();
    getAllRequest.onsuccess = () => {
        console.log('IndexedDB 中的圖片:', getAllRequest.result);
    };
};
```

---

## 🧪 測試步驟

### 測試 1: 自動遷移

1. [ ] 上傳一張大圖片（> 2MB）
2. [ ] 檢查 Console 日誌
3. [ ] 確認顯示「✅ 圖片已保存到 IndexedDB」
4. [ ] 檢查配置中的引用格式：`indexeddb://hero-bg-image`
5. [ ] 打開首頁，確認圖片正常顯示

### 測試 2: 手動遷移

1. [ ] 打開 `migrate-to-indexeddb.html`
2. [ ] 查看 localStorage 中的圖片
3. [ ] 點擊「遷移所有圖片到 IndexedDB」
4. [ ] 確認遷移成功
5. [ ] 刷新數據，確認圖片已遷移
6. [ ] 打開首頁，確認圖片正常顯示

### 測試 3: 數據清理

1. [ ] 打開遷移工具
2. [ ] 點擊「清除 IndexedDB」
3. [ ] 確認清除成功
4. [ ] 刷新數據，確認 IndexedDB 為空

---

## ⚠️ 注意事項

### 瀏覽器支持

- ✅ Chrome/Edge: 完全支持
- ✅ Firefox: 完全支持
- ✅ Safari: 完全支持（iOS 8+）
- ⚠️ 舊版瀏覽器: 會自動回退到 Base64

### 數據安全

- IndexedDB 數據存儲在本地瀏覽器中
- 清除瀏覽器數據會刪除 IndexedDB
- 建議定期備份重要數據

### 性能考慮

- 大圖片使用 IndexedDB 可以提升性能
- 減少 localStorage 的使用，避免達到大小限制
- 圖片載入時會自動從 IndexedDB 讀取

---

## 🔧 故障排除

### 問題 1: 遷移失敗

**解決方案**:
1. 檢查瀏覽器是否支持 IndexedDB
2. 檢查 Console 是否有錯誤
3. 嘗試清除 IndexedDB 後重新遷移

### 問題 2: 圖片無法顯示

**解決方案**:
1. 檢查配置中的引用格式是否正確：`indexeddb://hero-bg-image`
2. 檢查 IndexedDB 中是否有對應的數據
3. 檢查 Console 是否有讀取錯誤

### 問題 3: IndexedDB 不可用

**解決方案**:
1. 系統會自動回退到 Base64
2. 檢查瀏覽器版本是否過舊
3. 嘗試使用其他瀏覽器

---

## 📊 數據結構

### IndexedDB 結構

```javascript
Database: HeroImagesDB
Version: 1
ObjectStore: images
KeyPath: id

數據格式:
{
    id: 'hero-bg-image',
    data: 'data:image/jpeg;base64,...',
    timestamp: 1234567890
}
```

### 配置引用格式

```javascript
// localStorage 中的配置
{
    sections: [
        {
            id: 'hero',
            content: {
                bgImage: 'indexeddb://hero-bg-image'  // IndexedDB 引用
            }
        }
    ]
}
```

---

## ✅ 完成項目

- ✅ 自動遷移機制（大圖片自動存儲到 IndexedDB）
- ✅ 手動遷移工具（`migrate-to-indexeddb.html`）
- ✅ 數據查看功能
- ✅ 數據清理功能
- ✅ 數據導出功能
- ✅ 首頁自動讀取 IndexedDB 圖片

---

**更新日期**: 2024-12-21  
**最後更新**: 2024-12-21



