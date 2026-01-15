const https = require('https');
const fs = require('fs');

const products = [
  { id: 1, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e58fafe6b0b4e6b497-e586b0e7b5b2e5afb5e789a9e6b6bce5a28a-e6ada2e6bb91e5a28a-i261408443252150490extraparams7b22displ' },
  { id: 2, url: 'https://aa89976566.cyberbiz.co/products/%E9%A0%90%E8%B3%BC-%E5%96%AE%E7%89%87%E7%B2%BE%E7%B7%BB%E5%8C%85%E8%A3%9D-%E5%AF%B5%E7%89%A9%E6%89%8B%E4%BD%9C%E8%82%89%E4%B9%BE-%E6%89%8B%E4%BD%9C%E9%9B%B6%E9%A3%9F-%E9%9B%9E%E6%8E%92-%E8%B6%85%E5%A4%A7%E9%9B%9E%E6%8E%92%E4%B9%BE-%E8%B1%AA%E5%A4%A7%E5%A4%A7%E9%9B%9E%E9%9C%B8' },
  { id: 3, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e9a090e8b3bc-e79c9fe7a9bae8a28be9878fe8b2a9e58c85-e5afb5e789a9e6898be4bd9ce88289e4b9be-e6898be4bd9ce99bb6e9a39f-e99b9ee68e92-e8b685e5a4a7e99b9ee68e92e4b9be-e8b1aae5a4a7e5a4a7e99b9ee99cb8-i261408440725611069extraparams7b22displ' },
  { id: 4, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6898be5b7a5e99ba8e8a1a3-e5afb5e789a9e9808fe6988ee99ba8e8a1a3-e980a3e5b8bde99ba8e8a1a3-e99ba8e5a4a9e5bf85e58299-e78b97e78b97e99ba8e8a1a3-e5afb5e789a9e5a496e587bae99ba8e8a1a3-i26140842639378' },
  { id: 5, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928be78b97e78b97e8a18ce8bb8de5ba8a-e78b97e5b18b-e78b97e7aaa9-e58fafe68b86e6b497-e68a98e7968ae5ba8a-e8a18ce8bb8de5ba8a-e5afb5e789a9e8a18ce8bb8de5ba8a-e5afb5e789a9e89a9e6b6bce89386-e5a8' },
  { id: 6, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-me8999f-e78cabe7a082e79b86-e789b9e5a4a7e8999fe998b2e5a496e6bfbae78cabe5bb81e68980-e78cabe592aa-e8b685e5a4a7e78cabe6b299e79b86-e8b488e78cabe7a082e98f9f-i261408428512238715extraparams7b22display_mode' },
  { id: 7, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-e69ca8e5a4a9e892bce6a392-e8b293e592aae4b889e8a792e5b7be-e8b293e592aa-e78cabe592aae78988e6a392e592aa-e78cabe5928ae78899e78ea9e585b7-e78cabe592aae5928ae78988-e6978be5ae8ce788b6e78987-i261408426536993031extraparams7b22displ' },
  { id: 8, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6b497e8858ae6b3a1e6b2ab-e5afb5e789a9e6898be8a2-e5afb5e789a9e899b9e899b9e98a80-e78b97e78b97e8878de789a7-e78b97e78b97e8baabe788aa-e8b2"abe78b97e6b497e8888ae789a7e999a4e8879ae6aa80-e8b2"abe6b497e882a2e789a7-i261408429196034057extraparams7b22displ' },
  { id: 9, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e5afb5e789a9e5ba8a-e5afb5e789a9e6b6bce5a28a-e6b6bce789bde5afb5e789a9e5ba8a-e799bbe4b88ae68b8de5b9b3e58fb0-e99bb6e7a2bce6888ae99e8be88896e99bb6e7a2bce59c8b-e78b97e78b97e58f8de5afaae789a9e59481-e68b92e784a1-e78b97e6b688e5a2abe689a3e5bfa3e5a2abe-i261408428688367619extraparams7b22displ' },
  { id: 10, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e5b88ee7af b7-e9808fe9a2a8e8bfb7e4bda0e5b88ee7af b7-e4bebfe694bae694bae7b49ae5b086e8a28b-e6988ee5a4a9e7a5a8e59093e985b7e5a5bd-e9818be58b95e7a4bee78a ace59388e5b18b-e5afb5e789a9e5b896e9a08ae9a086e99a-i261408428450772999extraparams7b22displ' },
  { id: 11, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-e78cabe592aae69e95e9a0ad-e78cabe592aae99d a0e69e95-e5afb5e789a9e8adb7e9a0b8e99d a0e69e95-e8b293e592aae5afb5e789a9-e58fafe6b497e5bc8fe78cabe8b293e789a9-e788bde5bf83e7898be-e5afb5e789a9e78cafe89386e59386-e78cabe989d5e99d a0e8979ae-e992a6e9bd92e789a7-i261408428618251275extraparams7b22displ' },
  { id: 12, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-e78cabe68ab3e69dbf-e9bb83e9bbbae78cabe788ace69eb6-e78cabe68ab3e69fb1e88090e68ab3-e78cabe68ab3e89391-e5aea4e789a9e794a8e59381e7a882e9baa6e78699e5a48fe78cabe68ab3e69dbfe78cabe6909ee4b990-i261408428479877115extraparams7b22displ' }
];

function fetchProductImages(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        // 抓取所有可能的圖片 URL
        const imageRegex = /(https?:\/\/cdn[^"'\s]+\.(jpg|jpeg|png|webp))/gi;
        const images = [...new Set(data.match(imageRegex) || [])];
        
        // 過濾掉太小的縮圖（只保留高品質圖片）
        const filteredImages = images.filter(img => 
          !img.includes('32x32') && 
          !img.includes('thumb') &&
          img.includes('cybassets')
        );
        
        resolve(filteredImages);
      });
    }).on('error', reject);
  });
}

async function main() {
  const results = [];
  
  for (const product of products) {
    console.log(`\n正在抓取產品 ${product.id} 的圖片...`);
    try {
      const images = await fetchProductImages(product.url);
      console.log(`  找到 ${images.length} 張圖片`);
      images.forEach((img, idx) => {
        console.log(`  圖片 ${idx + 1}: ${img}`);
      });
      
      results.push({
        id: product.id,
        url: product.url,
        images: images,
        imageCount: images.length
      });
      
      // 避免請求太快
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  錯誤: ${error.message}`);
      results.push({
        id: product.id,
        url: product.url,
        images: [],
        imageCount: 0,
        error: error.message
      });
    }
  }
  
  fs.writeFileSync('all-product-images-detailed.json', JSON.stringify(results, null, 2));
  console.log('\n✅ 所有圖片已保存到 all-product-images-detailed.json');
  
  // 統計
  console.log('\n📊 統計結果:');
  console.log(`  總產品數: ${results.length}`);
  console.log(`  有多張圖片的產品: ${results.filter(r => r.imageCount > 1).length}`);
  console.log(`  僅有一張圖片的產品: ${results.filter(r => r.imageCount === 1).length}`);
  console.log(`  沒有圖片的產品: ${results.filter(r => r.imageCount === 0).length}`);
}

main();
