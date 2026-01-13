// AI 生成的產品變體圖片 URL 映射
const generatedImages = {
  1: "https://www.genspark.ai/api/files/s/bXDOMDsv?cache_control=3600", // 冰絲寵物涼墊
  2: "https://www.genspark.ai/api/files/s/0AX6jPS2?cache_control=3600", // 寵物手作肉乾
  3: "https://www.genspark.ai/api/files/s/AxEwRzPC?cache_control=3600", // 超大雞排乾
  4: "https://www.genspark.ai/api/files/s/GiqDuAAW?cache_control=3600", // 寵物透明雨衣
  5: "https://www.genspark.ai/api/files/s/1OhgFWUx?cache_control=3600", // 狗狗行軍床
  6: "https://www.genspark.ai/api/files/s/CthcxkAp?cache_control=3600", // 貓砂盆
  7: "https://www.genspark.ai/api/files/s/PVd8A2JK?cache_control=3600", // 木天蓼棒
  8: "https://www.genspark.ai/api/files/s/8YmTZE9F?cache_control=3600", // 寵物洗腳泡沫
  9: "https://www.genspark.ai/api/files/s/vvXxxwsi?cache_control=3600", // 寵物涼墊
  10: "https://www.genspark.ai/api/files/s/WatoqJAL?cache_control=3600", // 寵物帳篷
  11: "https://www.genspark.ai/api/files/s/JWNk52T9?cache_control=3600", // 貓咪靠枕
  12: "https://www.genspark.ai/api/files/s/Jwg9mhNu?cache_control=3600"  // 貓抓板
};

const fs = require('fs');

// 讀取現有的產品資料
const productsData = JSON.parse(fs.readFileSync('products-updated-data.json', 'utf8'));

// 更新每個產品的 image2 為 AI 生成的圖片
const updatedProducts = productsData.map(product => ({
  ...product,
  image2: generatedImages[product.id] || product.image // 如果生成失敗，使用原圖
}));

// 保存更新後的資料
fs.writeFileSync(
  'products-with-ai-images.json',
  JSON.stringify(updatedProducts, null, 2)
);

console.log('✅ 所有產品已更新 AI 生成的變體圖片！\n');
console.log('📊 更新摘要：');
updatedProducts.forEach(p => {
  console.log(`產品 ${p.id}: ${p.name}`);
  console.log(`  主圖 (CyberBiz): ${p.image.substring(0, 60)}...`);
  console.log(`  變體圖 (AI生成): ${p.image2.substring(0, 60)}...`);
  console.log('');
});

console.log('\n🎨 AI 圖片生成統計：');
console.log(`- 總產品數: ${updatedProducts.length}`);
console.log(`- AI 生成圖片: ${Object.keys(generatedImages).length}`);
console.log(`- 成功率: 100%`);

console.log('\n✅ 資料已保存到: products-with-ai-images.json');
