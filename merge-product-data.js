// 根據抓取的結果生成更新後的產品資料
const fs = require('fs');

// 讀取抓取的圖片資料
const imageData = JSON.parse(fs.readFileSync('product-images-genspark.json', 'utf8'));

// 產品基本資料
const productsData = [
    { id: 1, name: '台灣出貨 可水洗 冰絲寵物涼墊', category: '匠寵嚴選', price: 50, pet: 'all' },
    { id: 2, name: '預購 單片精緻包裝 寵物手作肉乾', category: '匠寵嚴選', price: 79, pet: 'dog' },
    { id: 3, name: '預購 真空袋量販包 超大雞排乾', category: '匠寵嚴選', price: 379, pet: 'dog' },
    { id: 4, name: '寵物手工雨衣 寵物透明雨衣', category: '匠寵嚴選', price: 520, oldPrice: 680, pet: 'all' },
    { id: 5, name: '狗狗行軍床 可拆洗 折疊床', category: '匠寵嚴選', price: 320, oldPrice: 399, pet: 'dog' },
    { id: 6, name: '貓砂盆 特大號防外濺貓廁所', category: '匠寵嚴選', price: 259, pet: 'cat' },
    { id: 7, name: '木天蓼棒 貓咪磨牙棒', category: '匠寵嚴選', price: 15, pet: 'cat' },
    { id: 8, name: '台灣出貨 寵物洗腳泡沫', category: '匠寵嚴選', price: 65, pet: 'all' },
    { id: 9, name: '寵物床 寵物涼墊 涼爽寵物床', category: '匠寵嚴選', price: 100, oldPrice: 125, pet: 'all' },
    { id: 10, name: '台灣出貨 寵物帳篷 通風迷你帳篷', category: '匠寵嚴選', price: 288, oldPrice: 359, pet: 'dog' },
    { id: 11, name: '貓咪枕頭 貓咪靠枕 寵物護頸靠枕', category: '匠寵嚴選', price: 112, oldPrice: 159, pet: 'cat' },
    { id: 12, name: '貓抓板 黃麻貓爬架 貓抓柱耐抓', category: '匠寵嚴選', price: 140, oldPrice: 279, pet: 'cat' }
];

// 合併資料
const mergedProducts = productsData.map(product => {
    const imgData = imageData.find(img => img.id === product.id);
    const images = imgData ? imgData.gensparkImages : [];
    
    return {
        ...product,
        // 使用第一張圖片作為主圖（選擇較大尺寸的 240x240）
        image: images[0] || '',
        // 使用第一張圖片作為懸停圖（暫時相同，因為 CyberBiz 只有一張圖）
        image2: images[0] || '',
        // 保存所有圖片URL供未來使用
        allImages: images
    };
});

console.log('📦 更新後的產品資料：\n');
console.log(JSON.stringify(mergedProducts, null, 2));

// 保存到文件
fs.writeFileSync(
    'products-updated-data.json',
    JSON.stringify(mergedProducts, null, 2)
);

console.log('\n✅ 已保存到 products-updated-data.json');
console.log('\n⚠️  注意：CyberBiz 網站上每個產品只有一張圖片');
console.log('💡 建議：可以考慮：');
console.log('   1. 請商家提供更多產品圖片（多角度、使用場景等）');
console.log('   2. 使用 AI 生成相似但不同的產品圖片');
console.log('   3. 暫時使用同一張圖片作為 image 和 image2');
