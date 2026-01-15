// 從網站抓取的真實圖片 URL（GenSpark 代理格式）
const products = [
  {
    id: 1,
    name: "台灣出貨 可水洗 冰絲寵物涼墊",
    category: "冰感涼爽系列",
    price: 50,
    image: "https://sspark.genspark.ai/cfimages?u1=Y8aJlnLk%2BUEMqafbbtpFUACw%2BoMa1qrnMLeDG3Lrv%2BjMFaF15EHEkJsoRAEodkzqTdpLTGVeLMirUbHirsUG9fnWpxUzUl3qgpbGIf7PMO4RR2L5LUL3989P%2FANeCy1R9LRlXl3Y1ErCXIEYeFB88N0wXBbLJA6E6pRxk70oyAIS6G4HdB4w0b3NDxB%2FcqJLsbxZoG26OQLpZShPh%2F%2FTkW4PSfEQkR%2Fp6mydhDXDLoQIAJL7zGbwIzCqCvJhh01bRFrAz2fL&u2=0HIO8yOymc4xJqiO&width=1024",
    pet: "all"
  },
  {
    id: 2,
    name: "預購 單片精緻包裝 寵物手作肉乾",
    category: "營養健康零食",
    price: 79,
    image: "https://sspark.genspark.ai/cfimages?u1=2wqDcTGiijNxMmvvp8l2ZafKDVy3fyfzIIp0oQLU3%2FO0%2FU3OZkdUG5sYKi9yvNKKiN2hTCc0XXQkVstDfBjh93oMlKQn7DNYUUgWVK2tATdls0oCbOL%2Brkxat%2BLx%2Fhl%2Bwy7ym0vnDNm94YCL6vu5Q9c4EpCp94joXmNATpFioieyT9CeoWZbg2ktLxa6F8j0npMFUNHbl%2FmNkAj2JnHVEPxyYjDr1Aq90cPzknYPaL1gktZY7xMTc4aoepYldclBQgm69muB&u2=K3%2FL%2BkWWBe4gPww7&width=1024",
    pet: "dog"
  },
  {
    id: 3,
    name: "預購 真空袋量販包 超大雞排乾",
    category: "營養健康零食",
    price: 379,
    image: "https://sspark.genspark.ai/cfimages?u1=dp1O6sJC8dVwZIBQaFk8J45YuaLt8YY8tmBy7A2EZGpO5FlQQ811hxjURN4fy6kmMNX3C5s23oMewaVivgGAo%2FIr86Y0GcACpB8Ec6q%2BN6UUP2MjRDHmZPQmnFAh3yeHaxlADeoPbmqxHqXx4MLmyq%2FMyqYzW%2FUug3K8nGPys2IzQSFNBp8Zegc84mecWoyFuCswsqnV8w5UOENDFlnJVSMOpkv6YhidmTmHPMUJ7WDIy8OEGrTXfufuWxoHTxOBdauBouz%2F&u2=R8R0whMfe8F4gS4F&width=1024",
    pet: "dog"
  },
  {
    id: 4,
    name: "寵物手工雨衣 寵物透明雨衣",
    category: "戶外必備",
    price: 520,
    oldPrice: 680,
    image: "https://sspark.genspark.ai/cfimages?u1=oG1AJjmh21ZDbCKmxVwY2OxWepRsBfcIF1Jm33Vr82qdZG3plX%2Bn90W1voPMtZoNyI8EV18DL%2BG3S3UDh9n2xgkmFoGK5Q4YVRgGdbEKyxou1Q9FzOI6ghfnowW3SwO035aeppNIcHBscLcX3xxU8FlfFoZXHUls3kOzB0pvw5UjzSfX%2B51CteG6NCbO%2ByvQNOzg6%2FfKa%2Fic%2F89Z8O5kpApVWxnfjjqfz%2Fr5Vtp%2BJHhkzY4lWkKfm%2B1y03z0%2BdqEbwcQ43Bt&u2=tS4hhu%2FqiSzmaqpp&width=1024",
    pet: "all"
  },
  {
    id: 5,
    name: "狗狗行軍床 可拆洗 折疊床",
    category: "舒適睡墊",
    price: 320,
    oldPrice: 399,
    image: "https://sspark.genspark.ai/cfimages?u1=3SQVMNg9StoQLlPcefq4C0q6Pqn029mvY0ncfwOMx8l50RmxS9nfZB1t%2BkatbhcBrnvCiwC%2FlKXBycxpP%2BoKHKptzAFg6sT%2FdM0SyIsIO8Efe7zDdSyS82WFygpuYK1vTQ3jo6f%2FIHHHeo9pUmm46XCafXbu9VQSIsEan1qpa08Vrsc%2BnKBiyRlZjaf9IZP1op9ITMFQhQARm9qTNWQ4UpygwBw1RBP%2Fgud89Dw27gU4bqKMIc4hjpgW%2FW1fdhpetwOAIzu1&u2=KClw2VDgEG1VJMMI&width=1024",
    pet: "dog"
  },
  {
    id: 6,
    name: "貓砂盆 特大號防外濺貓廁所",
    category: "貓咪用品",
    price: 259,
    image: "https://sspark.genspark.ai/cfimages?u1=%2BkEBB0SEstBVovjgqbZXSwIA3OoRIepNhttuZ9cAgUmV0IdqI8tvsKmpAk1pOwW55NmzOt%2FQvLu8zKwv%2FbgKIxdhAsdySJ5ttc1xUka%2BAJGDEiDFZqvENSJJ04%2BSvsKRaRjdjNsfdhuDzMPn7LHTiw71DW4nsQtGvBcNXEPT0nUqhhxqew3zBHNGEoAy6LcEsAKpesoFAjDZMhk2zg4RlZM11LwPZqK8oIOirMpPOiGSEaMX4x%2BrhJ7tulcuG6qggVKgeT2Z&u2=wyHQHn1tc7al%2B3M7&width=1024",
    pet: "cat"
  },
  {
    id: 7,
    name: "木天蓼棒 貓咪磨牙棒",
    category: "貓咪玩具",
    price: 15,
    image: "https://sspark.genspark.ai/cfimages?u1=%2FdGfxp2%2BUZNYt9PCiV%2BBy3k5yBSVzMWjLXqiEXt61oJxZQSyW9%2FgF6%2BJsiPos8M29b7Z%2FSQ4ejUSNqH%2BpFquhNsCceK%2BjOk1nRsfnLEi55nDtLLMeSGGr%2BjbPQqfwRMuBHx5nNNFdfKv28huMscZY92uPXLWMztOM8GljTsq1Koc1v%2BrM0O5hgwUZjoxJi0LSWkCh71DQHxNYV5dy807Ekcm9K9Y4a2o%2F5FbCakujWZu5eXudg6Ha8nye7HUFEAVjCxbMUJc&u2=lJgblMPxeUfrgajw&width=1024",
    pet: "cat"
  },
  {
    id: 8,
    name: "台灣出貨 寵物洗腳泡沫",
    category: "清潔保養",
    price: 65,
    image: "https://sspark.genspark.ai/cfimages?u1=wpbse2umNgoxWU991tWMWyNTdr52z57J3KJ3DnJK7aigErCHNn7FjE82qxeNVl1PhqpF7yQ1g0HTKDP5sJcm7PLsEw1aR9UikHllAyx%2FYP5C8Shg5%2FU0MTlseu%2F%2Fz9jcQooqoC%2BypdEUIonOslWjPayZH2FrGoxgLQ56QgDsEJPgGVmwXXIDLCSMWPGr5rXxUfWyl%2Fe0rVh9URdEhlgfgTrCDt7Vor8UXTT1n%2BUBCo9V1BsWXdqWC%2FAAZaYncwAyC5kS2KtQ&u2=TaglG9MqDfbLGj57&width=1024",
    pet: "all"
  },
  {
    id: 9,
    name: "寵物床 寵物涼墊 涼爽寵物床",
    category: "冰感涼爽系列",
    price: 100,
    oldPrice: 125,
    image: "https://sspark.genspark.ai/cfimages?u1=qoU%2BIxjXmRaZaSSvb%2FbuUFX9pE%2F2IZhxF9wBzKNSCZxTRAtszENUvplXLSPk9VgnLC%2BdD9v8UWI27DDYXxcHLASVKa0vjae4et%2FpM21AqlMXdRY6VLGDBLkjTR9rh5rxgH1grQnraEJ9jHdw0J8O%2BjE8aDqNMLVuTzHhDokEqfcG3iYfp8Z8Z9AhrW1RPSdPfAfFJxcJJdgOg4wVC%2BlK5Y3u%2FxOl9aY4OX1vybXjhKW0%2FIaXyImYw1V2A%2Fv5no47yOxRPnQf&u2=bR%2BBQqfBV6vQlgnG&width=1024",
    pet: "all"
  },
  {
    id: 10,
    name: "台灣出貨 寵物帳篷 通風迷你帳篷",
    category: "戶外必備",
    price: 288,
    oldPrice: 359,
    image: "https://sspark.genspark.ai/cfimages?u1=uRIy4z8kTkkKjQTMNc72M9L8d3VApL4sC4y%2BzYKrw4NOZqti4bkzygwJU7Nc92b9XaZk%2B8evjbbNICr20F3NsdWA9lqHr3wh54b4lDJbqcgpZQ%2F8R7LKtO4vvqAaxXaWw0Auel6J%2BajofssLmmVybYkesBAesDfoRPisly5R8yz%2BNgEXNPiYrA4kl6jg8rWoWrp5fQT2j%2BwQP62KgTWb8Lr3j2zaPIXPZ2fb1a%2Fxs6%2BmewbgoTy%2FuuANJLyL3akNEXVHgAXX&u2=Ng7jsUdCTXc5vJod&width=1024",
    pet: "dog"
  },
  {
    id: 11,
    name: "貓咪枕頭 貓咪靠枕 寵物護頸靠枕",
    category: "貓咪用品",
    price: 112,
    oldPrice: 159,
    image: "https://sspark.genspark.ai/cfimages?u1=zeDoFM9Rzz%2FiZAgCBTX3Nf6QTrDfe0raXnxI3I38f2JzxbMGej7ANfcK%2FMb%2B8LglE7Rd1KTcDD3%2FDsg5Mjy3SV9%2BJilAQhdcrrtJ0XDMfInZZHxfYkX0gRWl7ipaLABtAKDqxTpSGrqv9JCmybVPXA6PbQQlJp%2BQF0hQfIwDLrnvXo1XXBCMBbHOqz%2FZXYSlqU3lUbSPPLkas47M8UWmuwwaBM72l3%2FV9XGsoqRUPREwtyEdo749FoQwMQtaCKnWML1w1FaC&u2=ZEr9Vda9jh9a4Xtk&width=1024",
    pet: "cat"
  },
  {
    id: 12,
    name: "貓抓板 黃麻貓爬架 貓抓柱耐抓",
    category: "貓咪家具",
    price: 140,
    oldPrice: 279,
    image: "https://sspark.genspark.ai/cfimages?u1=0OwUoyIMhXmN1MwaHrcZLrbXjsHJ8sNRSgrmAK8jcZhZ%2BmLNFZ2Z989%2FP1D1nEFnQBfbbeC912Vzv5aAWqYO%2BgtkLKt8uRUidf4ZApMBZPCpiaEpEix7iYcw7GQa6ajhfEDTN8RsAhFhN2s6lBrtPX%2FQqlHi6hAYF3N0UDbCJ5FYIGZBsF4PWJmhqkhhkk%2FSpz0Hr9cfYau4Wiwu8%2FE1RzM0pCBHT1t0qPLUf6kbYneZIi%2FtThldOemukpPBpnFHLTAhZm1g&u2=LXXrnJhwtfqEjQFR&width=1024",
    pet: "cat"
  }
];

console.log('// 商品數據（使用 GenSpark 代理圖片 URL）');
console.log('const allProducts = ' + JSON.stringify(products, null, 2) + ';');
