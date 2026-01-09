/**
 * 綠界 ECPay 金流路由
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db } = require('../config/database');

const ECPAY_CONFIG = {
    merchantId: process.env.ECPAY_MERCHANT_ID || '2000132',
    hashKey: process.env.ECPAY_HASH_KEY || '5294y06JbISpM5x9',
    hashIV: process.env.ECPAY_HASH_IV || 'v77hoKGq4kWxNNIS',
    apiUrl: process.env.ECPAY_ENV === 'production' 
        ? 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
        : 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
};

/**
 * 生成檢查碼 (CheckMacValue)
 */
function generateCheckMacValue(params) {
    // 步驟 1: 將參數依照字母順序排序
    const sortedKeys = Object.keys(params).sort();
    
    // 步驟 2: 組合成字串
    let checkStr = `HashKey=${ECPAY_CONFIG.hashKey}`;
    sortedKeys.forEach(key => {
        if (key !== 'CheckMacValue' && params[key] !== undefined && params[key] !== null) {
            checkStr += `&${key}=${params[key]}`;
        }
    });
    checkStr += `&HashIV=${ECPAY_CONFIG.hashIV}`;
    
    // 步驟 3: URL Encode
    checkStr = encodeURIComponent(checkStr);
    
    // 步驟 4: 轉小寫
    checkStr = checkStr.toLowerCase();
    
    // 步驟 5: SHA256 加密
    const hash = crypto.createHash('sha256').update(checkStr).digest('hex');
    
    // 步驟 6: 轉大寫
    return hash.toUpperCase();
}

/**
 * 建立付款表單資料
 */
router.post('/create-payment', (req, res) => {
    const { orderData, paymentMethod } = req.body;

    if (!orderData || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: '請提供訂單資料和付款方式'
        });
    }

    // 確保 orderId 存在（可能是 id 或 orderId）
    const orderId = orderData.id || orderData.orderId;
    if (!orderId) {
        return res.status(400).json({
            success: false,
            message: '訂單資料缺少訂單編號（id 或 orderId）'
        });
    }

    // 生成訂單編號
    const now = new Date();
    const merchantTradeNo = `EC${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const merchantTradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // 商品名稱
    const itemNames = orderData.items.map(item => `${item.name} x ${item.quantity}`).join('#');

    // 建立表單資料
    const formData = {
        MerchantID: ECPAY_CONFIG.merchantId,
        MerchantTradeNo: merchantTradeNo,
        MerchantTradeDate: merchantTradeDate,
        PaymentType: 'aio',
        TotalAmount: Math.round(orderData.total),
        TradeDesc: encodeURIComponent('匠寵寵物用品購物'),
        ItemName: encodeURIComponent(itemNames),
        ReturnURL: `${req.protocol}://${req.get('host')}/api/ecpay/notify`,
        ChoosePayment: paymentMethod,
        ClientBackURL: `${req.protocol}://${req.get('host')}/order-success.html?orderId=${orderId}`,
        OrderResultURL: `${req.protocol}://${req.get('host')}/payment-return.html?orderId=${orderId}`,
        NeedExtraPaidInfo: 'Y',
        EncryptType: '1'
    };

    // ATM 專屬參數
    if (paymentMethod === 'ATM') {
        formData.ExpireDate = 3;
        formData.PaymentInfoURL = `${req.protocol}://${req.get('host')}/api/ecpay/notify`;
    }

    // 超商代碼/條碼專屬參數
    if (paymentMethod === 'CVS' || paymentMethod === 'BARCODE') {
        formData.StoreExpireDate = 10080; // 7 天
        formData.PaymentInfoURL = `${req.protocol}://${req.get('host')}/api/ecpay/notify`;
        formData.Desc_1 = encodeURIComponent('匠寵寵物用品');
    }

    // 生成檢查碼
    formData.CheckMacValue = generateCheckMacValue(formData);

    // 更新訂單的 ECPay 交易編號
    if (orderId) {
        db.run(
            'UPDATE orders SET paymentEcpayTradeNo = ?, updatedAt = ? WHERE id = ?',
            [merchantTradeNo, Date.now(), orderId]
        );
    }

    res.json({
        success: true,
        data: {
            formData: formData,
            apiUrl: ECPAY_CONFIG.apiUrl
        }
    });
});

/**
 * 綠界付款結果通知 (Server to Server)
 */
router.post('/notify', (req, res) => {
    const params = req.body;
    
    // 驗證檢查碼
    const receivedCheckMac = params.CheckMacValue;
    delete params.CheckMacValue;
    const calculatedCheckMac = generateCheckMacValue(params);

    if (receivedCheckMac !== calculatedCheckMac) {
        console.error('❌ ECPay 檢查碼驗證失敗');
        return res.status(400).send('0|Error');
    }

    const rtnCode = params.RtnCode;
    const merchantTradeNo = params.MerchantTradeNo;
    const tradeNo = params.TradeNo;
    const tradeAmt = params.TradeAmt;
    const paymentDate = params.PaymentDate;
    const paymentType = params.PaymentType;

    // 更新訂單狀態
    if (rtnCode === '1') {
        // 付款成功
        db.run(
            `UPDATE orders SET 
             paymentStatus = ?, 
             paymentPaidAt = ?,
             paymentTransactionId = ?,
             status = ?,
             updatedAt = ?
             WHERE paymentEcpayTradeNo = ?`,
            ['paid', paymentDate ? new Date(paymentDate).getTime() : Date.now(), tradeNo, 'confirmed', Date.now(), merchantTradeNo]
        );
    } else {
        // 付款失敗
        db.run(
            `UPDATE orders SET 
             paymentStatus = ?,
             updatedAt = ?
             WHERE paymentEcpayTradeNo = ?`,
            ['failed', Date.now(), merchantTradeNo]
        );
    }

    res.send('1|OK');
});

/**
 * 驗證檢查碼
 */
router.post('/verify-checkmac', (req, res) => {
    const params = req.body;
    const receivedCheckMac = params.CheckMacValue;
    delete params.CheckMacValue;
    const calculatedCheckMac = generateCheckMacValue(params);

    res.json({
        success: receivedCheckMac === calculatedCheckMac,
        received: receivedCheckMac,
        calculated: calculatedCheckMac
    });
});

module.exports = router;

