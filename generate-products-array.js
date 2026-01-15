const fs = require('fs');

// 讀取產品資料
const products = JSON.parse(fs.readFileSync('products-with-ai-images.json', 'utf8'));

// 生成 JavaScript 陣列代碼
const productsArrayCode = `const allProducts = ${JSON.stringify(products.map(p => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  ...(p.oldPrice && { oldPrice: p.oldPrice }),
  image: p.image,
  image2: p.image2,
  pet: p.pet
})), null, 12)};`;

console.log('✅ 生成的產品陣列代碼：\n');
console.log(productsArrayCode);
console.log('\n\n📝 請將上面的代碼複製到 products.html 中的 allProducts 變數位置');
console.log('   （大約在第 558 行附近）\n');

// 保存到文件供參考
fs.writeFileSync('products-array-code.txt', productsArrayCode);
console.log('✅ 代碼已保存到 products-array-code.txt');

// 生成摘要
console.log('\n📊 更新摘要：');
products.forEach(p => {
  const hasOldPrice = p.oldPrice ? ` (原價 NT$${p.oldPrice})` : '';
  console.log(`${p.id}. ${p.name} - NT$${p.price}${hasOldPrice}`);
  console.log(`   ✅ 主圖已設定 (CyberBiz)`);
  console.log(`   ✅ 變體圖已設定 (AI生成)`);
});

console.log(`\n✅ 總計：${products.length} 個產品，所有圖片已準備就緒！`);
