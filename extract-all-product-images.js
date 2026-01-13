const https = require('https');
const http = require('http');

// 所有產品的詳情頁URL
const products = [
    { id: 1, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e58fafe6b0b4e6b497-e586b0e7b5b2e5afb5e789a9e6b6bce5a28a-e6b299e799bce6a485e5a28a-e5afb5e789a9e6b6bce89386-e5a48fe5a4a9e9808fe6b0a3e6b6bce5a28a-e6ada2e6bb91e5a28a-i261408443252150490extraparams7b22displ' },
    { id: 2, url: 'https://aa89976566.cyberbiz.co/products/%E9%A0%90%E8%B3%BC-%E5%96%AE%E7%89%87%E7%B2%BE%E7%B7%BB%E5%8C%85%E8%A3%9D-%E5%AF%B5%E7%89%A9%E6%89%8B%E4%BD%9C%E8%82%89%E4%B9%BE-%E6%89%8B%E4%BD%9C%E9%9B%B6%E9%A3%9F-%E9%9B%9E%E6%8E%92-%E8%B6%85%E5%A4%A7%E9%9B%9E%E6%8E%92%E4%B9%BE-%E8%B1%AA%E5%A4%A7%E5%A4%A7%E9%9B%9E%E9%9C%B8' },
    { id: 3, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e9a090e8b3bc-e79c9fe7a9bae8a28be9878fe8b2a9e58c85-e5afb5e789a9e6898be4bd9ce88289e4b9be-e6898be4bd9ce99bb6e9a39f-e99b9ee68e92-e8b685e5a4a7e99b9ee68e92e4b9be-e8b1aae5a4a7e5a4a7e99b9ee99cb8-i261408440725611069extraparams7b22displ' },
    { id: 4, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6898be5b7a5e99ba8e8a1a3-e5afb5e789a9e9808fe6988ee99ba8e8a1a3-e980a3e5b8bde99ba8e8a1a3-e99ba8e5a4a9e5bf85e58299-e78b97e78b97e99ba8e8a1a3-e5afb5e789a9e5a496e587bae99ba8e8a1a3-i26140842639378' },
    { id: 5, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928be78b97e78b97e8a18ce8bb8de5ba8a-e78b97e5b18b-e78b97e7aaa9-e58fafe68b86e6b497-e68a98e7968ae5ba8a-e8a18ce8bb8de5ba8a-e5afb5e789a9e8a18ce8bb8de5ba8a-i261408428360393687extraparams7b22display_model_id223' },
    { id: 6, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-me8999f-e78cabe7a082e79b86-e789b9e5a4a7e8999fe998b2e5a496e6bfbae78cabe5bb81e68980-e78cabe592aa-e8b685e5a4a7e78cabe6b299e79b86-e8b488e78cabe7a082e98f9f-i261408428512238715extraparams7b22display_mode' },
    { id: 7, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e69ca8e5a4a9e893bce6a392-e8b293e592aae7a3a8e78999e6a392-e69ca8e5a4a9e893bce7a3a8e78999e6a392-e5a4a9e784b6e7a3a8e78999e6a392-i261408428969520660extraparams7b22display_model_id223a1668380868367d' },
    { id: 8, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6b497e885b3e6b3a1e6b2ab-e6bd94e8b6b3e6b3a1e6b2ab-e8b6b3e983a8e8adb7e79086-e8b293e78b97e9809ae794a8-e885b3e68e8ce8adb7e79086-e999a4e887ade6b497e885b3e6b6b2-e5858de6b497e6b3a1e6b2ab-i2614084' },
    { id: 9, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e5afb5e789a9e5ba8a-e5afb5e789a9e6b6bce5a28a-e78b97e78b97e6b6bce5a28a-e5afb5e789a9e79da1e5a28a-e5afb5e789a9e5a28a-e6b6bce5a28a-e6b6bce89386-e5afb5e789a9e6b6bce89386-e6b6bce788bde5afb5e789a9e5ba8a-i261408429207199540extraparams7' },
    { id: 10, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e99990e5af84e696b0e7abb9e789a9e6b581-e5afb5e789a9e5b8b3e7afb7-e78b97e5b8b3e7afb7-e5afb5e789a9e7aaa9-e9809ae9a2a8e8bfb7e4bda0e5b8b3e7afb7-e99cb2e7879fe5ba8a-i261408428709496846extraparams7b22display_mod' },
    { id: 11, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e8b293e592aae69e95e9a0ade5afb5e789a9e69e95e9a0ad-e8b293e592aae99da0e69e95-e78b97e78b97e99da0e69e95-e5afb5e789a9e8adb7e9a0b8e99da0e69e95-e8b293e592aae69e95e9a0ad-e5afb5e789a9e999aae79da1e69e95-e5afb5e789a9ue59e8be69e95-i2614084' },
    { id: 12, url: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091-e78cabe68a93e69dbf-e9bb83e9babbe78cabe788ace69eb6-e78cabe68a93e69fb1e88090e68a93-e78cabe592aae78ea9e585b7-e78cabe68a93e69dbf-e78cabe8babae6a485-e9bb83e9babbe78cabe6b299e799bc-i261408429361019154extraparams7b22display_model_id' }
];

function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function extractImages(html) {
    const images = [];
    
    // 匹配 CyberBiz CDN 圖片 URL
    const cdnPattern = /https:\/\/cdn\d*\.cybassets\.com\/media\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi;
    const matches = html.match(cdnPattern) || [];
    
    matches.forEach(url => {
        // 移除縮圖尺寸，獲取原始圖片
        const cleanUrl = url.replace(/\/thumb\/\d+x\d+/, '').replace(/\?.*$/, '');
        if (!images.includes(cleanUrl)) {
            images.push(cleanUrl);
        }
    });
    
    return images;
}

async function extractAllProductImages() {
    console.log('開始抓取所有產品圖片...\n');
    const results = [];
    
    for (const product of products) {
        try {
            console.log(`正在處理產品 ${product.id}...`);
            const html = await fetchHTML(product.url);
            const images = extractImages(html);
            
            results.push({
                id: product.id,
                url: product.url,
                images: images,
                imageCount: images.length
            });
            
            console.log(`  找到 ${images.length} 張圖片`);
            
            // 避免請求過快
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`產品 ${product.id} 處理失敗:`, error.message);
            results.push({
                id: product.id,
                url: product.url,
                images: [],
                imageCount: 0,
                error: error.message
            });
        }
    }
    
    console.log('\n=== 抓取完成 ===\n');
    
    // 輸出結果
    results.forEach(result => {
        console.log(`產品 ${result.id}: ${result.imageCount} 張圖片`);
        if (result.images && result.images.length > 0) {
            result.images.forEach((img, idx) => {
                console.log(`  [${idx + 1}] ${img.substring(0, 80)}...`);
            });
        }
        console.log('');
    });
    
    // 保存結果到 JSON 文件
    const fs = require('fs');
    fs.writeFileSync(
        'product-images-raw.json',
        JSON.stringify(results, null, 2)
    );
    
    console.log('✅ 結果已保存到 product-images-raw.json');
    
    return results;
}

// 執行
extractAllProductImages().catch(console.error);
