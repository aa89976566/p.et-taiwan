/**
 * 綠界 ECPay 金流整合系統
 * 版本: v1.0
 * 日期: 2024-12-21
 * 
 * 支援付款方式:
 * - Credit (信用卡)
 * - ATM (虛擬帳號)
 * - CVS (超商代碼)
 * - BARCODE (超商條碼)
 */

// ============================================
// 綠界 ECPay 設定
// ============================================

const ECPAY_CONFIG = {
    // 測試環境
    development: {
        merchantId: '2000132',  // 測試商店代號
        hashKey: '5294y06JbISpM5x9',  // 測試 Hash Key
        hashIV: 'v77hoKGq4kWxNNIS',   // 測試 Hash IV
        apiUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
        returnUrl: window.location.origin + '/payment-return.html',
        clientBackUrl: window.location.origin + '/order-success.html',
        orderResultUrl: window.location.origin + '/api/ecpay/notify'
    },
    // 正式環境（上線時使用）
    production: {
        merchantId: 'YOUR_MERCHANT_ID',  // 替換為正式商店代號
        hashKey: 'YOUR_HASH_KEY',        // 替換為正式 Hash Key
        hashIV: 'YOUR_HASH_IV',          // 替換為正式 Hash IV
        apiUrl: 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
        returnUrl: window.location.origin + '/payment-return.html',
        clientBackUrl: window.location.origin + '/order-success.html',
        orderResultUrl: window.location.origin + '/api/ecpay/notify'
    }
};

// 當前環境設定（開發中使用測試環境）
const ENV = 'development';
const CONFIG = ECPAY_CONFIG[ENV];

// ============================================
// 綠界付款方式設定
// ============================================

const PAYMENT_METHODS = {
    ALL: {
        code: 'ALL',
        name: '全部付款方式',
        description: '綠界提供的所有付款方式'
    },
    Credit: {
        code: 'Credit',
        name: '信用卡',
        description: '線上刷卡（VISA、MasterCard、JCB）',
        icon: 'fas fa-credit-card'
    },
    ATM: {
        code: 'ATM',
        name: 'ATM 虛擬帳號',
        description: '取得虛擬帳號後至 ATM 或網銀轉帳',
        icon: 'fas fa-university',
        expireDays: 3  // 繳費期限（天）
    },
    CVS: {
        code: 'CVS',
        name: '超商代碼繳費',
        description: '至 7-11、全家、萊爾富、OK 繳費',
        icon: 'fas fa-store',
        expireMinutes: 10080  // 繳費期限（分鐘，預設 7 天）
    },
    BARCODE: {
        code: 'BARCODE',
        name: '超商條碼繳費',
        description: '列印繳費條碼至超商櫃台繳費',
        icon: 'fas fa-barcode',
        expireMinutes: 10080  // 繳費期限（分鐘，預設 7 天）
    }
};

// ============================================
// 綠界 API 整合函數
// ============================================

/**
 * 生成綠界訂單編號
 * 格式: ECYYYYMMDDHHMMSS + 隨機4碼
 */
function generateECPayOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `EC${year}${month}${day}${hour}${minute}${second}${random}`;
}

/**
 * 建立綠界付款表單資料
 * @param {Object} orderData - 訂單資料
 * @param {String} paymentMethod - 付款方式 (Credit, ATM, CVS, BARCODE)
 * @returns {Object} 綠界 API 所需參數
 */
function createECPayFormData(orderData, paymentMethod = 'ALL') {
    const merchantTradeNo = generateECPayOrderId();
    const merchantTradeDate = formatDateForECPay(new Date());
    
    // 基本參數
    const formData = {
        MerchantID: CONFIG.merchantId,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: merchantTradeDate,
        PaymentType: 'aio',
        TotalAmount: Math.round(orderData.total),
        TradeDesc: encodeURIComponent('匠寵寵物用品購物'),
        ItemName: encodeURIComponent(getItemNames(orderData.items)),
        ReturnURL: CONFIG.orderResultUrl,
        ChoosePayment: paymentMethod,
        ClientBackURL: CONFIG.clientBackUrl,
        OrderResultURL: CONFIG.returnUrl,
        NeedExtraPaidInfo: 'Y',
        EncryptType: '1'
    };
    
    // ATM 專屬參數
    if (paymentMethod === 'ATM') {
        formData.ExpireDate = 3;  // 繳費期限 3 天
        formData.PaymentInfoURL = CONFIG.orderResultUrl;
    }
    
    // 超商代碼專屬參數
    if (paymentMethod === 'CVS') {
        formData.StoreExpireDate = 10080;  // 繳費期限 7 天（分鐘）
        formData.PaymentInfoURL = CONFIG.orderResultUrl;
        formData.Desc_1 = encodeURIComponent('匠寵寵物用品');
        formData.Desc_2 = '';
        formData.Desc_3 = '';
        formData.Desc_4 = '';
    }
    
    // 超商條碼專屬參數
    if (paymentMethod === 'BARCODE') {
        formData.StoreExpireDate = 10080;  // 繳費期限 7 天（分鐘）
        formData.PaymentInfoURL = CONFIG.orderResultUrl;
        formData.Desc_1 = encodeURIComponent('匠寵寵物用品');
        formData.Desc_2 = '';
        formData.Desc_3 = '';
        formData.Desc_4 = '';
    }
    
    // 計算檢查碼（實際應用中需在後端計算）
    // formData.CheckMacValue = generateCheckMacValue(formData);
    
    return formData;
}

/**
 * 格式化日期為綠界格式
 * 格式: YYYY/MM/DD HH:mm:ss
 */
function formatDateForECPay(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
}

/**
 * 取得商品名稱清單（綠界格式）
 */
function getItemNames(items) {
    if (!items || items.length === 0) {
        return '商品';
    }
    
    // 綠界商品名稱格式: 商品名稱1 x 數量#商品名稱2 x 數量
    return items.map(item => `${item.name} x ${item.quantity || item.qty || 1}`).join('#');
}

/**
 * 產生綠界檢查碼（CheckMacValue）
 * ⚠️ 重要：實際應用中此函數必須在後端執行，以保護 Hash Key/IV
 * 這裡僅作為示範，前端不應包含真實的 Hash Key/IV
 */
function generateCheckMacValue(params) {
    // 步驟 1: 將參數依照字母順序排序（A-Z）
    const sortedKeys = Object.keys(params).sort();
    
    // 步驟 2: 組合成字串
    let checkStr = `HashKey=${CONFIG.hashKey}`;
    sortedKeys.forEach(key => {
        if (key !== 'CheckMacValue') {
            checkStr += `&${key}=${params[key]}`;
        }
    });
    checkStr += `&HashIV=${CONFIG.hashIV}`;
    
    // 步驟 3: URL Encode
    checkStr = encodeURIComponent(checkStr);
    
    // 步驟 4: 轉小寫
    checkStr = checkStr.toLowerCase();
    
    // 步驟 5: SHA256 加密（需要引入 crypto-js 或類似庫）
    // 實際應用中在後端完成
    // const hash = CryptoJS.SHA256(checkStr).toString(CryptoJS.enc.Hex);
    
    // 步驟 6: 轉大寫
    // return hash.toUpperCase();
    
    return 'CHECKSUM_PLACEHOLDER'; // 實際由後端產生
}

/**
 * 提交訂單到綠界付款
 * @param {Object} orderData - 訂單資料
 * @param {String} paymentMethod - 付款方式
 */
async function submitToECPay(orderData, paymentMethod) {
    console.log('🔄 準備提交到綠界金流...');
    console.log('訂單資料:', orderData);
    console.log('付款方式:', paymentMethod);
    
    try {
        // 步驟 1: 建立綠界表單資料
        const formData = createECPayFormData(orderData, paymentMethod);
        console.log('綠界表單資料:', formData);
        
        // 步驟 2: 儲存訂單資料到 localStorage
        localStorage.setItem('pendingOrder', JSON.stringify({
            ...orderData,
            ecpayOrderId: formData.MerchantTradeNo,
            paymentMethod: paymentMethod,
            paymentMethodName: PAYMENT_METHODS[paymentMethod]?.name || paymentMethod,
            timestamp: new Date().toISOString()
        }));
        
        // 步驟 3: 實際應用中需要呼叫後端 API 取得完整的表單資料（含 CheckMacValue）
        // const response = await fetch('/api/ecpay/create-payment', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ orderData, paymentMethod })
        // });
        // const result = await response.json();
        // formData.CheckMacValue = result.checkMacValue;
        
        // 步驟 4: 動態建立表單並提交到綠界
        const form = createECPayForm(formData);
        document.body.appendChild(form);
        
        console.log('✅ 表單已建立，準備跳轉到綠界付款頁面...');
        
        // 提交表單（會跳轉到綠界）
        form.submit();
        
        return {
            success: true,
            merchantTradeNo: formData.MerchantTradeNo
        };
        
    } catch (error) {
        console.error('❌ 綠界付款失敗:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 動態建立綠界付款表單
 */
function createECPayForm(formData) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = CONFIG.apiUrl;
    form.style.display = 'none';
    
    // 將所有參數加入表單
    Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
    });
    
    return form;
}

/**
 * 處理綠界付款結果
 * 在 payment-return.html 中使用
 */
function handleECPayReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const result = {
        merchantTradeNo: urlParams.get('MerchantTradeNo'),
        rtnCode: urlParams.get('RtnCode'),
        rtnMsg: decodeURIComponent(urlParams.get('RtnMsg') || ''),
        tradeNo: urlParams.get('TradeNo'),
        tradeAmt: urlParams.get('TradeAmt'),
        paymentDate: urlParams.get('PaymentDate'),
        paymentType: urlParams.get('PaymentType'),
        paymentTypeChargeFee: urlParams.get('PaymentTypeChargeFee'),
        tradeDate: urlParams.get('TradeDate'),
        simulatePaid: urlParams.get('SimulatePaid')
    };
    
    console.log('綠界付款結果:', result);
    
    // 取得暫存的訂單資料
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        
        // 儲存最終訂單資料
        localStorage.setItem('lastOrder', JSON.stringify({
            ...orderData,
            ecpayResult: result,
            paymentSuccess: result.rtnCode === '1',
            finalizedAt: new Date().toISOString()
        }));
        
        // 清除暫存
        localStorage.removeItem('pendingOrder');
    }
    
    return result;
}

// ============================================
// 導出函數
// ============================================

window.ECPayIntegration = {
    CONFIG,
    PAYMENT_METHODS,
    generateECPayOrderId,
    createECPayFormData,
    submitToECPay,
    handleECPayReturn,
    formatDateForECPay,
    getItemNames
};

console.log('✅ 綠界 ECPay 金流整合系統已載入');
