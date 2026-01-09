// 品種體重數據庫 - Breed Weight Database

const breedData = {
    // 小型犬 (< 10kg)
    small_dogs: {
        '吉娃娃': { min: 1.5, max: 3, ideal: 2.5 },
        '博美': { min: 2, max: 3.5, ideal: 2.5 },
        '約克夏': { min: 2, max: 3.5, ideal: 2.8 },
        '馬爾濟斯': { min: 2, max: 4, ideal: 3 },
        '西施犬': { min: 4, max: 7, ideal: 5.5 },
        '臘腸狗': { min: 4, max: 9, ideal: 6 },
        '迷你雪納瑞': { min: 5, max: 9, ideal: 7 },
        '法國鬥牛犬': { min: 8, max: 14, ideal: 11 },
        '巴哥': { min: 6, max: 8, ideal: 7 },
        '北京犬': { min: 3, max: 6, ideal: 4.5 }
    },
    
    // 中型犬 (10-25kg)
    medium_dogs: {
        '柴犬': { min: 8, max: 11, ideal: 9.5 },
        '柯基': { min: 10, max: 13, ideal: 11.5 },
        '米格魯': { min: 9, max: 11, ideal: 10 },
        '雪納瑞': { min: 14, max: 20, ideal: 17 },
        '邊境牧羊犬': { min: 14, max: 20, ideal: 17 },
        '英國鬥牛犬': { min: 18, max: 25, ideal: 22 },
        '柴犬': { min: 8, max: 11, ideal: 9.5 },
        '威爾斯柯基': { min: 10, max: 13, ideal: 11.5 },
        '比格犬': { min: 9, max: 11, ideal: 10 },
        '美國可卡犬': { min: 11, max: 14, ideal: 12.5 }
    },
    
    // 大型犬 (> 25kg)
    large_dogs: {
        '黃金獵犬': { min: 25, max: 34, ideal: 30 },
        '拉布拉多': { min: 25, max: 36, ideal: 30 },
        '哈士奇': { min: 16, max: 27, ideal: 22 },
        '薩摩耶': { min: 16, max: 30, ideal: 23 },
        '德國牧羊犬': { min: 22, max: 40, ideal: 32 },
        '杜賓犬': { min: 27, max: 40, ideal: 34 },
        '羅威那': { min: 36, max: 61, ideal: 48 },
        '阿拉斯加雪橇犬': { min: 34, max: 45, ideal: 40 },
        '秋田犬': { min: 34, max: 54, ideal: 44 },
        '大麥町': { min: 16, max: 32, ideal: 24 }
    },
    
    // 貓咪 (2-7kg)
    cats: {
        '美國短毛貓': { min: 3.5, max: 7, ideal: 5 },
        '英國短毛貓': { min: 4, max: 8, ideal: 6 },
        '波斯貓': { min: 3, max: 7, ideal: 5 },
        '暹羅貓': { min: 2.5, max: 5.5, ideal: 4 },
        '緬因貓': { min: 4.5, max: 11, ideal: 7 },
        '布偶貓': { min: 4.5, max: 9, ideal: 6.5 },
        '俄羅斯藍貓': { min: 3, max: 7, ideal: 5 },
        '蘇格蘭摺耳貓': { min: 2.5, max: 6, ideal: 4 },
        '孟加拉貓': { min: 4, max: 7, ideal: 5.5 },
        '挪威森林貓': { min: 4, max: 9, ideal: 6.5 },
        '米克斯貓': { min: 2.5, max: 6, ideal: 4 },
        '橘貓': { min: 3, max: 8, ideal: 5.5 }
    },
    
    // 通用範圍
    generic: {
        '米克斯狗': { min: 3, max: 25, ideal: 10 },
        '米克斯貓': { min: 2.5, max: 6, ideal: 4 },
        '混種犬': { min: 5, max: 30, ideal: 15 },
        '不確定': { min: 2, max: 50, ideal: 10 }
    }
};

// 體重評估函數
function assessWeight(petType, breed, weight) {
    // 基本驗證
    if (!weight || weight <= 0) {
        return {
            valid: false,
            message: '請輸入有效的體重',
            status: 'error'
        };
    }
    
    // 極端值檢查
    if (weight > 100) {
        return {
            valid: false,
            message: '體重似乎不太合理，請確認是否輸入正確（單位：公斤）',
            status: 'error'
        };
    }
    
    if (weight < 0.5) {
        return {
            valid: false,
            message: '體重過輕，請確認是否輸入正確',
            status: 'error'
        };
    }
    
    // 如果沒有提供品種，只做基本驗證
    if (!breed || breed.trim() === '') {
        if (petType === 'cat' && weight > 15) {
            return {
                valid: true,
                message: '這個體重對貓咪來說有點重喔！建議諮詢獸醫師。',
                status: 'warning',
                condition: 'overweight'
            };
        } else if (petType === 'dog' && weight > 60) {
            return {
                valid: true,
                message: '這個體重對一般狗狗來說偏重，請確認是否為大型犬。',
                status: 'warning',
                condition: 'overweight'
            };
        }
        return {
            valid: true,
            status: 'ok'
        };
    }
    
    // 品種特定評估
    let breedInfo = null;
    let category = '';
    
    // 搜尋品種資料
    if (petType === 'cat') {
        breedInfo = breedData.cats[breed];
        category = '貓咪';
    } else {
        // 在所有狗類別中搜尋
        for (let size in breedData) {
            if (size.includes('dogs')) {
                if (breedData[size][breed]) {
                    breedInfo = breedData[size][breed];
                    category = size === 'small_dogs' ? '小型犬' : 
                              size === 'medium_dogs' ? '中型犬' : '大型犬';
                    break;
                }
            }
        }
        
        // 如果沒找到，檢查通用類別
        if (!breedInfo && breedData.generic[breed]) {
            breedInfo = breedData.generic[breed];
            category = '混種犬';
        }
    }
    
    // 如果找不到品種資料，返回基本驗證結果
    if (!breedInfo) {
        return {
            valid: true,
            status: 'ok',
            message: `無法找到「${breed}」的標準體重資料，已記錄您的資料。`
        };
    }
    
    // 計算體態狀況
    const { min, max, ideal } = breedInfo;
    const deviation = ((weight - ideal) / ideal) * 100;
    
    let condition, status, message, recommendation;
    
    if (weight < min * 0.8) {
        condition = 'severely_underweight';
        status = 'error';
        message = `${breed}（${category}）的標準體重為 ${min}-${max}kg，目前體重 ${weight}kg 明顯過輕！`;
        recommendation = '建議立即諮詢獸醫師，確認健康狀況。';
    } else if (weight < min) {
        condition = 'underweight';
        status = 'warning';
        message = `${breed}（${category}）的標準體重為 ${min}-${max}kg，目前體重 ${weight}kg 稍微偏輕。`;
        recommendation = '建議增加營養攝取，選擇高熱量配方。';
    } else if (weight > max * 1.3) {
        condition = 'severely_overweight';
        status = 'error';
        message = `${breed}（${category}）的標準體重為 ${min}-${max}kg，目前體重 ${weight}kg 明顯過重！`;
        recommendation = '建議儘快諮詢獸醫師，制定減重計畫。';
    } else if (weight > max) {
        condition = 'overweight';
        status = 'warning';
        message = `${breed}（${category}）的標準體重為 ${min}-${max}kg，目前體重 ${weight}kg 稍微過重。`;
        recommendation = '建議選擇低脂、高纖維的減重配方，並增加運動量。';
    } else {
        condition = 'ideal';
        status = 'success';
        message = `${breed}（${category}）的標準體重為 ${min}-${max}kg，目前體重 ${weight}kg 非常理想！`;
        recommendation = '維持現有的飲食與運動習慣即可。';
    }
    
    return {
        valid: true,
        status: status,
        condition: condition,
        message: message,
        recommendation: recommendation,
        breedInfo: {
            min: min,
            max: max,
            ideal: ideal,
            category: category
        },
        deviation: Math.round(deviation)
    };
}

// 取得品種建議列表
function getBreedSuggestions(petType) {
    const suggestions = [];
    
    if (petType === 'cat') {
        suggestions.push(...Object.keys(breedData.cats));
    } else if (petType === 'dog') {
        suggestions.push(...Object.keys(breedData.small_dogs));
        suggestions.push(...Object.keys(breedData.medium_dogs));
        suggestions.push(...Object.keys(breedData.large_dogs));
    }
    
    suggestions.push(...Object.keys(breedData.generic));
    
    return suggestions.sort();
}

// 匯出函數
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        breedData,
        assessWeight,
        getBreedSuggestions
    };
}
