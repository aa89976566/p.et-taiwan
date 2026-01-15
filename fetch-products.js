// 從網站抓取的商品數據
const products = [
    {
        id: 1,
        name: '台灣出貨 可水洗 冰絲寵物涼墊 沙發椅墊 寵物涼蓆',
        category: '寢具',
        price: 50,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98o-luzf7g4h4yjl0b',
        pet: 'dog'
    },
    {
        id: 2,
        name: '預購 單片精緻包裝 寵物手作肉乾 超大雞排乾',
        category: '零食',
        price: 79,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98z-lwvfwgj9i7mc5d',
        pet: 'dog'
    },
    {
        id: 3,
        name: '預購 真空袋量販包 寵物手作肉乾 豪大大雞霸',
        category: '零食',
        price: 379,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98o-lwvg1l1iswl9f1',
        pet: 'dog'
    },
    {
        id: 4,
        name: '寵物手工雨衣 寵物透明雨衣 連帽雨衣',
        category: '服飾',
        price: 520,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98w-luzfg8btdlul8a',
        pet: 'dog'
    },
    {
        id: 5,
        name: '狗狗行軍床 狗屋 狗窩 可拆洗 折疊床',
        category: '寢具',
        price: 320,
        oldPrice: 399,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98x-luzfnsccjd2l51',
        pet: 'dog'
    },
    {
        id: 6,
        name: '猫砂盆 特大號防外濺猫廁所 贈猫砂鏟',
        category: '清潔',
        price: 259,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98o-luzfzejpqo5518',
        pet: 'cat'
    },
    {
        id: 7,
        name: '台灣出貨 寵物帳篷 狗帳篷 通風迷你帳篷',
        category: '寢具',
        price: 288,
        oldPrice: 359,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98w-luzg3fsdnp8xc0',
        pet: 'dog'
    },
    {
        id: 8,
        name: '木天蓼棒 貓咪磨牙棒 天然磨牙棒',
        category: '玩具',
        price: 15,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98s-luzg7jwfqztd95',
        pet: 'cat'
    },
    {
        id: 9,
        name: '貓咪頭套 寵物防舔防咬脖圈 貓咪三角巾',
        category: '服飾',
        price: 88888,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r990-luzgbcqkwrzd3c',
        pet: 'cat'
    },
    {
        id: 10,
        name: '台灣出貨 寵物洗腳泡沫 潔足泡沫 除臭洗腳液',
        category: '清潔',
        price: 65,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98w-luzgeyq3ah110a',
        pet: 'all'
    },
    {
        id: 11,
        name: '貓咪枕頭寵物枕頭 貓咪靠枕 寵物護頸靠枕',
        category: '寢具',
        price: 112,
        oldPrice: 159,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98y-luzgipjw4bht17',
        pet: 'cat'
    },
    {
        id: 12,
        name: '寵物床 寵物涼墊 狗狗涼墊 涼爽寵物床',
        category: '寢具',
        price: 100,
        oldPrice: 125,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98t-luzgme68t0nl98',
        pet: 'all'
    },
    {
        id: 13,
        name: '猫抓板 黃麻猫爬架 猫抓柱耐抓',
        category: '家具',
        price: 140,
        oldPrice: 279,
        image: 'https://down-tw.img.susercontent.com/file/tw-11134207-7r98u-luzgp9ysqxxh59',
        pet: 'cat'
    }
];

console.log(JSON.stringify(products, null, 2));
