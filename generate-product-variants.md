# 為匠寵產品生成AI變體圖片計劃

## 生成策略

為每個產品生成一張**不同角度或使用場景**的圖片作為 `image2`，確保：
1. 保持產品的核心特徵和顏色
2. 展示不同視角（45度角、俯視圖、側視圖等）
3. 保持專業的電商產品攝影風格
4. 白色或淺色背景，乾淨簡潔

## 12個產品的生成提示詞

### 產品 1: 台灣出貨 可水洗 冰絲寵物涼墊
**Prompt**: Professional product photography of a blue ice silk pet cooling mat, shown from a 45-degree angle on white background. The mat features a smooth, breathable fabric surface with visible cooling texture pattern. Studio lighting, high resolution, e-commerce style.

### 產品 2: 預購 單片精緻包裝 寵物手作肉乾
**Prompt**: Professional product photography of handmade pet chicken jerky in premium packaging, shown at an angle with the opened package displaying the meat treats inside. Clean white background, studio lighting, appetizing presentation, high detail.

### 產品 3: 預購 真空袋量販包 超大雞排乾
**Prompt**: Professional product photography of vacuum-sealed bulk pack of large chicken jerky for pets, showing the transparent package from a side angle with visible meat content. White background, commercial photography style, crisp details.

### 產品 4: 寵物手工雨衣 寵物透明雨衣
**Prompt**: Professional product photography of transparent pet raincoat with hood, displayed on a flat surface from overhead view, showing the full garment layout. Clear material, white background, studio lighting, fashion product style.

### 產品 5: 狗狗行軍床 可拆洗 折疊床
**Prompt**: Professional product photography of elevated dog cot bed shown from a side angle, featuring the steel frame and removable fabric cover. Clean white background, demonstrating the bed's structure and stability, e-commerce quality.

### 產品 6: 貓砂盆 特大號防外濺貓廁所
**Prompt**: Professional product photography of large cat litter box with high walls, shown from a 3/4 view angle revealing the interior depth and included scoop. White background, practical household product photography style.

### 產品 7: 木天蓼棒 貓咪磨牙棒
**Prompt**: Professional product photography of natural silvervine sticks for cats, arranged artfully on white background from overhead view, showing the natural wood texture and organic appearance. Clean, minimalist style.

### 產品 8: 台灣出貨 寵物洗腳泡沫
**Prompt**: Professional product photography of pet paw cleaning foam bottle, shown from a side angle with the pump dispenser clearly visible. White background, bathroom product style, clean and professional.

### 產品 9: 寵物床 寵物涼墊 涼爽寵物床
**Prompt**: Professional product photography of soft pet bed and cooling mat, shown from an elevated angle displaying the comfortable cushioned surface. Pastel colors, white background, cozy home product style.

### 產品 10: 台灣出貨 寵物帳篷 通風迷你帳篷
**Prompt**: Professional product photography of portable pet tent shown from a 45-degree angle with the entrance clearly visible, displaying the ventilated mesh panels. White background, outdoor gear product style.

### 產品 11: 貓咪枕頭 貓咪靠枕 寵物護頸靠枕
**Prompt**: Professional product photography of cute cat neck support pillow shown from the side, displaying its ergonomic curved shape and soft fabric texture. Pastel colors, white background, home comfort product style.

### 產品 12: 貓抓板 黃麻貓爬架 貓抓柱耐抓
**Prompt**: Professional product photography of vertical jute cat scratching post shown from side angle, highlighting the natural fiber wrapping and stable base structure. White background, pet furniture product style.

## 技術參數

- **Model**: fal-ai/flux-2
- **Aspect Ratio**: 1:1
- **Style**: Professional e-commerce product photography
- **Background**: White or light neutral
- **Lighting**: Studio quality, soft shadows
- **Quality**: High resolution, suitable for web display

## 執行順序

依序生成 12 個產品的變體圖片，每個生成後保存到 `/home/user/webapp/generated-images/` 目錄。
