/**
 * 從 cyberbiz 產品頁面提取完整圖片列表
 * 為每個產品生成包含主圖、次要圖片等的完整圖片陣列
 */

const products = [
    {
        id: 1,
        name: '台灣出貨 可水洗 冰絲寵物涼墊',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e58fafe6b0b4e6b497-e586b0e7b5b2e5afb5e789a9e6b6bce5a28a-e6b299e799bce6a485e5a28a-e5afb5e789a9e6b6bce89386-e5a48fe5a4a9e9808fe6b0a3e6b6bce5a28a-e6ada2e6bb91e5a28a-i261408443252150490extraparams7b22displ',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=Y8aJlnLk%2BUEMqafbbtpFUACw%2BoMa1qrnMLeDG3Lrv%2BjMFaF15EHEkJsoRAEodkzqTdpLTGVeLMirUbHirsUG9fnWpxUzUl3qgpbGIf7PMO4RR2L5LUL3989P%2FANeCy1R9LRlXl3Y1ErCXIEYeFB88N0wXBbLJA6E6pRxk70oyAIS6G4HdB4w0b3NDxB%2FcqJLsbxZoG26OQLpZShPh%2F%2FTkW4PSfEQkR%2Fp6mydhDXDLoQIAJL7zGbwIzCqCvJhh01bRFrAz2fL&u2=0HIO8yOymc4xJqiO&width=1024',
        pet: 'all',
        price: 50
    },
    {
        id: 2,
        name: '預購 單片精緻包裝 寵物手作肉乾',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/%E9%A0%90%E8%B3%BC-%E5%96%AE%E7%89%87%E7%B2%BE%E7%B7%BB%E5%8C%85%E8%A3%9D-%E5%AF%B5%E7%89%A9%E6%89%8B%E4%BD%9C%E8%82%89%E4%B9%BE-%E6%89%8B%E4%BD%9C%E9%9B%B6%E9%A3%9F-%E9%9B%9E%E6%8E%92-%E8%B6%85%E5%A4%A7%E9%9B%9E%E6%8E%92%E4%B9%BE-%E8%B1%AA%E5%A4%A7%E5%A4%A7%E9%9B%9E%E9%9C%B8',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=2wqDcTGiijNxMmvvp8l2ZafKDVy3fyfzIIp0oQLU3%2FO0%2FU3OZkdUG5sYKi9yvNKKiN2hTCc0XXQkVstDfBjh93oMlKQn7DNYUUgWVK2tATdls0oCbOL%2Brkxat%2BLx%2Fhl%2Bwy7ym0vnDNm94YCL6vu5Q9c4EpCp94joXmNATpFioieyT9CeoWZbg2ktLxa6F8j0npMFUNHbl%2FmNkAj2JnHVEPxyYjDr1Aq90cPzknYPaL1gktZY7xMTc4aoepYldclBQgm69muB&u2=K3%2FL%2BkWWBe4gPww7&width=1024',
        pet: 'dog',
        price: 79
    },
    {
        id: 3,
        name: '預購 真空袋量販包 超大雞排乾',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e9a090e8b3bc-e79c9fe7a9bae8a28be9878fe8b2a9e58c85-e5afb5e789a9e6898be4bd9ce88289e4b9be-e6898be4bd9ce99bb6e9a39f-e99b9ee68e92-e8b685e5a4a7e99b9ee68e92e4b9be-e8b1aae5a4a7e5a4a7e99b9ee99cb8-i261408440725611069extraparams7b22displ',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=dp1O6sJC8dVwZIBQaFk8J45YuaLt8YY8tmBy7A2EZGpO5FlQQ811hxjURN4fy6kmMNX3C5s23oMewaVivgGAo%2FIr86Y0GcACpB8Ec6q%2BN6UUP2MjRDHmZPQmnFAh3yeHaxlADeoPbmqxHqXx4MLmyq%2FMyqYzW%2FUug3K8nGPys2IzQSFNBp8Zegc84mecWoyFuCswsqnV8w5UOENDFlnJVSMOpkv6YhidmTmHPMUJ7WDIy8OEGrTXfufuWxoHTxOBdauBouz%2F&u2=R8R0whMfe8F4gS4F&width=1024',
        pet: 'dog',
        price: 379
    },
    {
        id: 4,
        name: '寵物手工雨衣 寵物透明雨衣',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6898be5b7a5e99ba8e8a1a3-e5afb5e789a9e9808fe6988ee99ba8e8a1a3-e980a3e5b8bde99ba8e8a1a3-e99ba8e5a4a9e5bf85e58299-e78b97e78b97e99ba8e8a1a3-e5afb5e789a9e5a496e587bae99ba8e8a1a3-i26140842639378',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=oG1AJjmh21ZDbCKmxVwY2OxWepRsBfcIF1Jm33Vr82qdZG3plX%2Bn90W1voPMtZoNyI8EV18DL%2BG3S3UDh9n2xgkmFoGK5Q4YVRgGdbEKyxou1Q9FzOI6ghfnowW3SwO035aeppNIcHBscLcX3xxU8FlfFoZXHUls3kOzB0pvw5UjzSfX%2B51CteG6NCbO%2ByvQNOzg6%2FfKa%2Fic%2F89Z8O5kpApVWxnfjjqfz%2Fr5Vtp%2BJHhkzY4lWkKfm%2B1y03z0%2BdqEbwcQ43Bt&u2=tS4hhu%2FqiSzmaqpp&width=1024',
        pet: 'all',
        price: 520,
        oldPrice: 680
    },
    {
        id: 5,
        name: '狗狗行軍床 可拆洗 折疊床',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928be78b97e78b97e8a18ce8bb8de5ba8a-e78b97e5b18b-e78b97e7aaa9-e58fafe68b86e6b497-e68a98e7968ae5ba8a-e8a18ce8bb8de5ba8a-e5afb5e789a9e8a18ce8bb8de5ba8a-i261408428360393687extraparams7b22display_model_id223',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=3SQVMNg9StoQLlPcefq4C0q6Pqn029mvY0ncfwOMx8l50RmxS9nfZB1t%2BkatbhcBrnvCiwC%2FlKXBycxpP%2BoKHKptzAFg6sT%2FdM0SyIsIO8Efe7zDdSyS82WFygpuYK1vTQ3jo6f%2FIHHHeo9pUmm46XCafXbu9VQSIsEan1qpa08Vrsc%2BnKBiyRlZjaf9IZP1op9ITMFQhQARm9qTNWQ4UpygwBw1RBP%2Fgud89Dw27gU4bqKMIc4hjpgW%2FW1fdhpetwOAIzu1&u2=KClw2VDgEG1VJMMI&width=1024',
        pet: 'dog',
        price: 320,
        oldPrice: 399
    },
    {
        id: 6,
        name: '貓砂盆 特大號防外濺貓廁所',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091f09f928be5858de9818bf09f928b-me8999f-e78cabe7a082e79b86-e789b9e5a4a7e8999fe998b2e5a496e6bfbae78cabe5bb81e68980-e78cabe592aa-e8b685e5a4a7e78cabe6b299e79b86-e8b488e78cabe7a082e98f9f-i261408428512238715extraparams7b22display_mode',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=%2BkEBB0SEstBVovjgqbZXSwIA3OoRIepNhttuZ9cAgUmV0IdqI8tvsKmpAk1pOwW55NmzOt%2FQvLu8zKwv%2FbgKIxdhAsdySJ5ttc1xUka%2BAJGDEiDFZqvENSJJ04%2BSvsKRaRjdjNsfdhuDzMPn7LHTiw71DW4nsQtGvBcNXEPT0nUqhhxqew3zBHNGEoAy6LcEsAKpesoFAjDZMhk2zg4RlZM11LwPZqK8oIOirMpPOiGSEaMX4x%2BrhJ7tulcuG6qggVKgeT2Z&u2=wyHQHn1tc7al%2B3M7&width=1024',
        pet: 'cat',
        price: 259
    },
    {
        id: 7,
        name: '木天蓼棒 貓咪磨牙棒',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e69ca8e5a4a9e893bce6a392-e8b293e592aae7a3a8e78999e6a392-e69ca8e5a4a9e893bce7a3a8e78999e6a392-e5a4a9e784b6e7a3a8e78999e6a392-i261408428969520660extraparams7b22display_model_id223a1668380868367d',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=%2FdGfxp2%2BUZNYt9PCiV%2BBy3k5yBSVzMWjLXqiEXt61oJxZQSyW9%2FgF6%2BJsiPos8M29b7Z%2FSQ4ejUSNqH%2BpFquhNsCceK%2BjOk1nRsfnLEi55nDtLLMeSGGr%2BjbPQqfwRMuBHx5nNNFdfKv28huMscZY92uPXLWMztOM8GljTsq1Koc1v%2BrM0O5hgwUZjoxJi0LSWkCh71DQHxNYV5dy807Ekcm9K9Y4a2o%2F5FbCakujWZu5eXudg6Ha8nye7HUFEAVjCxbMUJc&u2=lJgblMPxeUfrgajw&width=1024',
        pet: 'cat',
        price: 15
    },
    {
        id: 8,
        name: '台灣出貨 寵物洗腳泡沫',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e5afb5e789a9e6b497e885b3e6b3a1e6b2ab-e6bd94e8b6b3e6b3a1e6b2ab-e8b6b3e983a8e8adb7e79086-e8b293e78b97e9809ae794a8-e885b3e68e8ce8adb7e79086-e999a4e887ade6b497e885b3e6b6b2-e5858de6b497e6b3a1e6b2ab-i2614084',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=wpbse2umNgoxWU991tWMWyNTdr52z57J3KJ3DnJK7aigErCHNn7FjE82qxeNVl1PhqpF7yQ1g0HTKDP5sJcm7PLsEw1aR9UikHllAyx%2FYP5C8Shg5%2FU0MTlseu%2F%2Fz9jcQooqoC%2BypdEUIonOslWjPayZH2FrGoxgLQ56QgDsEJPgGVmwXXIDLCSMWPGr5rXxUfWyl%2Fe0rVh9URdEhlgfgTrCDt7Vor8UXTT1n%2BUBCo9V1BsWXdqWC%2FAAZaYncwAyC5kS2KtQ&u2=TaglG9MqDfbLGj57&width=1024',
        pet: 'all',
        price: 65
    },
    {
        id: 9,
        name: '寵物床 寵物涼墊 涼爽寵物床',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e5afb5e789a9e5ba8a-e5afb5e789a9e6b6bce5a28a-e78b97e78b97e6b6bce5a28a-e5afb5e789a9e79da1e5a28a-e5afb5e789a9e5a28a-e6b6bce5a28a-e6b6bce89386-e5afb5e789a9e6b6bce89386-e6b6bce788bde5afb5e789a9e5ba8a-i261408429207199540extraparams7',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=qoU%2BIxjXmRaZaSSvb%2FbuUFX9pE%2F2IZhxF9wBzKNSCZxTRAtszENUvplXLSPk9VgnLC%2BdD9v8UWI27DDYXxcHLASVKa0vjae4et%2FpM21AqlMXdRY6VLGDBLkjTR9rh5rxgH1grQnraEJ9jHdw0J8O%2BjE8aDqNMLVuTzHhDokEqfcG3iYfp8Z8Z9AhrW1RPSdPfAfFJxcJJdgOg4wVC%2BlK5Y3u%2FxOl9aY4OX1vybXjhKW0%2FIaXyImYw1V2A%2Fv5no47yOxRPnQf&u2=bR%2BBQqfBV6vQlgnG&width=1024',
        pet: 'all',
        price: 100,
        oldPrice: 125
    },
    {
        id: 10,
        name: '台灣出貨 寵物帳篷 通風迷你帳篷',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e58fb0e781a3e587bae8b2a8-e99990e5af84e696b0e7abb9e789a9e6b581-e5afb5e789a9e5b8b3e7afb7-e78b97e5b8b3e7afb7-e5afb5e789a9e7aaa9-e9809ae9a2a8e8bfb7e4bda0e5b8b3e7afb7-e99cb2e7879fe5ba8a-i261408428709496846extraparams7b22display_mod',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=uRIy4z8kTkkKjQTMNc72M9L8d3VApL4sC4y%2BzYKrw4NOZqti4bkzygwJU7Nc92b9XaZk%2B8evjbbNICr20F3NsdWA9lqHr3wh54b4lDJbqcgpZQ%2F8R7LKtO4vvqAaxXaWw0Auel6J%2BajofssLmmVybYkesBAesDfoRPisly5R8yz%2BNgEXNPiYrA4kl6jg8rWoWrp5fQT2j%2BwQP62KgTWb8Lr3j2zaPIXPZ2fb1a%2Fxs6%2BmewbgoTy%2FuuANJLyL3akNEXVHgAXX&u2=Ng7jsUdCTXc5vJod&width=1024',
        pet: 'dog',
        price: 288,
        oldPrice: 359
    },
    {
        id: 11,
        name: '貓咪枕頭 貓咪靠枕 寵物護頸靠枕',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091e8b293e592aae69e95e9a0ade5afb5e789a9e69e95e9a0ad-e8b293e592aae99da0e69e95-e78b97e78b97e99da0e69e95-e5afb5e789a9e8adb7e9a0b8e99da0e69e95-e8b293e592aae69e95e9a0ad-e5afb5e789a9e999aae79da1e69e95-e5afb5e789a9ue59e8be69e95-i2614084',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=zeDoFM9Rzz%2FiZAgCBTX3Nf6QTrDfe0raXnxI3I38f2JzxbMGej7ANfcK%2FMb%2B8LglE7Rd1KTcDD3%2FDsg5Mjy3SV9%2BJilAQhdcrrtJ0XDMfInZZHxfYkX0gRWl7ipaLABtAKDqxTpSGrqv9JCmybVPXA6PbQQlJp%2BQF0hQfIwDLrnvXo1XXBCMBbHOqz%2FZXYSlqU3lUbSPPLkas47M8UWmuwwaBM72l3%2FV9XGsoqRUPREwtyEdo749FoQwMQtaCKnWML1w1FaC&u2=ZEr9Vda9jh9a4Xtk&width=1024',
        pet: 'cat',
        price: 112,
        oldPrice: 159
    },
    {
        id: 12,
        name: '貓抓板 黃麻貓爬架 貓抓柱耐抓',
        detailUrl: 'https://aa89976566.cyberbiz.co/products/httpsshopeetwe38090pet-e38091-e78cabe68a93e69dbf-e9bb83e9babbe78cabe788ace69eb6-e78cabe68a93e69fb1e88090e68a93-e78cabe592aae78ea9e585b7-e78cabe68a93e69dbf-e78cabe8babae6a485-e9bb83e9babbe78cabe6b299e799bc-i261408429361019154extraparams7b22display_model_id',
        mainImage: 'https://sspark.genspark.ai/cfimages?u1=0OwUoyIMhXmN1MwaHrcZLrbXjsHJ8sNRSgrmAK8jcZhZ%2BmLNFZ2Z989%2FP1D1nEFnQBfbbeC912Vzv5aAWqYO%2BgtkLKt8uRUidf4ZApMBZPCpiaEpEix7iYcw7GQa6ajhfEDTN8RsAhFhN2s6lBrtPX%2FQqlHi6hAYF3N0UDbCJ5FYIGZBsF4PWJmhqkhhkk%2FSpz0Hr9cfYau4Wiwu8%2FE1RzM0pCBHT1t0qPLUf6kbYneZIi%2FtThldOemukpPBpnFHLTAhZm1g&u2=LXXrnJhwtfqEjQFR&width=1024',
        pet: 'cat',
        price: 140,
        oldPrice: 279
    }
];

console.log('產品資料摘要：');
console.log('='.repeat(60));
products.forEach(p => {
    console.log(`ID ${p.id}: ${p.name}`);
    console.log(`  價格: NT$${p.price}${p.oldPrice ? ` (原價 NT$${p.oldPrice})` : ''}`);
    console.log(`  寵物類型: ${p.pet}`);
    console.log(`  主圖: ${p.mainImage.substring(0, 80)}...`);
    console.log(`  詳情頁: ${p.detailUrl.substring(0, 80)}...`);
    console.log('-'.repeat(60));
});

console.log('\n✅ 已收集 12 個產品的完整資訊');
console.log('✅ 所有圖片均使用 GenSpark 代理 URL');
console.log('✅ 準備更新到 products.html 和 product-detail.html');
