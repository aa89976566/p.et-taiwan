const fs = require('fs');

// 讀取 products.html
const html = fs.readFileSync('products.html', 'utf-8');

// 提取 allProducts 陣列
const match = html.match(/const allProducts = \[([\s\S]*?)\];/);
if (!match) {
  console.error('❌ 找不到 allProducts 陣列');
  process.exit(1);
}

const productsStr = '[' + match[1] + ']';
const products = eval(productsStr);

console.log('✅ products.html 圖片驗證\n');
console.log(`總產品數: ${products.length}\n`);

products.forEach(p => {
  const hasImage = p.image && p.image.length > 0;
  const hasImage2 = p.image2 && p.image2.length > 0;
  const isDifferent = p.image !== p.image2;
  
  console.log(`產品 ${p.id}: ${p.name}`);
  console.log(`  主圖 (image): ${hasImage ? '✓' : '✗'} ${p.image ? (p.image.includes('genspark.ai/api/files') ? '[AI生成]' : '[CyberBiz]') : ''}`);
  console.log(`  副圖 (image2): ${hasImage2 ? '✓' : '✗'} ${p.image2 ? (p.image2.includes('genspark.ai/api/files') ? '[AI生成]' : '[CyberBiz]') : ''}`);
  console.log(`  兩張圖不同: ${isDifferent ? '✓' : '✗'}`);
  console.log('');
});

// 統計
const withBothImages = products.filter(p => p.image && p.image2).length;
const withDifferentImages = products.filter(p => p.image !== p.image2).length;
const withAIImage2 = products.filter(p => p.image2 && p.image2.includes('genspark.ai/api/files')).length;

console.log('\n📊 統計:');
console.log(`  ✓ 有兩張圖的產品: ${withBothImages}/${products.length}`);
console.log(`  ✓ 兩張圖不同的產品: ${withDifferentImages}/${products.length}`);
console.log(`  ✓ 使用 AI 生成 image2 的產品: ${withAIImage2}/${products.length}`);
