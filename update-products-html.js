const fs = require('fs');

// 讀取 products.html
let html = fs.readFileSync('products.html', 'utf8');

// 讀取新的產品資料
const products = JSON.parse(fs.readFileSync('products-with-ai-images.json', 'utf8'));

// 生成新的 JavaScript 代碼（優化格式）
const newProductsCode = products.map(p => {
  const parts = [
    `id: ${p.id}`,
    `name: '${p.name}'`,
    `category: '${p.category}'`,
    `price: ${p.price}`
  ];
  
  if (p.oldPrice) {
    parts.push(`oldPrice: ${p.oldPrice}`);
  }
  
  parts.push(`image: '${p.image}'`);
  parts.push(`image2: '${p.image2}'`);
  parts.push(`pet: '${p.pet}'`);
  
  return `            { ${parts.join(', ')} }`;
}).join(',\n');

const newAllProducts = `        const allProducts = [\n${newProductsCode}\n        ];`;

// 使用正則表達式替換舊的 allProducts 陣列
const oldProductsPattern = /const allProducts = \[\s*[\s\S]*?\n        \];/;

if (oldProductsPattern.test(html)) {
  html = html.replace(oldProductsPattern, newAllProducts);
  
  // 保存更新後的文件
  fs.writeFileSync('products-updated.html', html);
  
  console.log('✅ products.html 已更新！');
  console.log('✅ 新文件已保存到 products-updated.html');
  console.log('\n📊 更新統計：');
  console.log(`- 總產品數: ${products.length}`);
  console.log(`- 所有產品都有 AI 生成的 image2`);
  console.log(`- 優惠商品: ${products.filter(p => p.oldPrice).length} 個`);
  
  console.log('\n🎨 圖片來源：');
  console.log('- image (主圖): CyberBiz CDN → GenSpark 代理');
  console.log('- image2 (懸停圖): AI 生成 (fal-ai/flux-2)');
} else {
  console.error('❌ 找不到 allProducts 陣列');
}
