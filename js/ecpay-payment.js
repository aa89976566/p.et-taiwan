/**
 * 綠界 ECPay 金流整合腳本
 * 前端處理付款流程與資料準備
 */

class ECPayPayment {
    constructor() {
        this.settings = this.loadSettings();
        this.testMode = this.settings?.environment === 'test';
        
        // 綠界 API 端點
        this.apiEndpoint = this.testMode 
            ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'  // 測試環境
            : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';        // 正式環境
    }

    /**
     * 載入金流設定
     * 注意：現在付款流程使用後端 API，前端不需要設定
     * 此方法保留以向後兼容，但不會顯示警告
     */
    loadSettings() {
        const saved = localStorage.getItem('ecpaySettings');
        if (!saved) {
            // 不再顯示警告，因為付款流程已改為使用後端 API
            // console.warn('未找到綠界金流設定');
            return null;
        }
        return JSON.parse(saved);
    }

    /**
     * 檢查金流設定是否完整
     */
    isConfigured() {
        if (!this.settings) return false;
        return !!(this.settings.merchantId && this.settings.hashKey && this.settings.hashIV);
    }

    /**
     * 準備付款資料
     * @param {Object} orderData - 訂單資料
     * @returns {Object} - 綠界所需的付款參數
     */
    preparePaymentData(orderData) {
        if (!this.isConfigured()) {
            throw new Error('綠界金流尚未設定，請至後台完成設定');
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const merchantTradeNo = `JC${Date.now()}`; // 訂單編號（唯一值）

        // 商品名稱（綠界限制 200 字元）
        let itemName = '匠寵商品';
        if (orderData.items && orderData.items.length > 0) {
            itemName = orderData.items.map(item => 
                `${item.name}x${item.quantity || item.qty || 1}`
            ).join('#');
            
            // 限制長度
            if (itemName.length > 200) {
                itemName = itemName.substring(0, 197) + '...';
            }
        }

        // 基本付款參數
        const paymentData = {
            MerchantID: this.settings.merchantId,
            MerchantTradeNo: merchantTradeNo,
            MerchantTradeDate: this.formatDate(new Date()),
            PaymentType: 'aio',
            TotalAmount: Math.round(orderData.total || orderData.amount?.total || 0),
            TradeDesc: '匠寵網路商城訂單',
            ItemName: itemName,
            ReturnURL: this.settings.notifyUrl || window.location.origin + '/api/payment/notify',
            ChoosePayment: this.getChoosePayment(orderData.paymentMethod),
            ClientBackURL: this.settings.returnUrl || window.location.origin + '/order-success.html',
            NeedExtraPaidInfo: 'Y',
            
            // 客戶資料
            CustomerName: orderData.receiver?.name || orderData.customer?.name || '客戶',
            CustomerPhone: orderData.receiver?.phone || orderData.customer?.phone || '',
            CustomerEmail: orderData.receiver?.email || orderData.customer?.email || 'customer@example.com'
        };

        // 根據付款方式添加特定參數
        this.addPaymentSpecificParams(paymentData, orderData.paymentMethod);

        return {
            ...paymentData,
            merchantTradeNo: merchantTradeNo,
            orderData: orderData
        };
    }

    /**
     * 取得綠界付款方式代碼
     */
    getChoosePayment(method) {
        const mapping = {
            'credit_card': 'Credit',           // 信用卡
            'atm': 'ATM',                      // ATM 轉帳
            'convenience_store': 'CVS',        // 超商代碼
            'barcode': 'BARCODE',              // 超商條碼
            'all': 'ALL'                       // 顯示所有付款方式
        };
        return mapping[method] || 'ALL';
    }

    /**
     * 添加特定付款方式的額外參數
     */
    addPaymentSpecificParams(paymentData, method) {
        switch(method) {
            case 'credit_card':
                // 信用卡分期（可選）
                // paymentData.CreditInstallment = '3,6,12'; // 3, 6, 12 期
                break;
                
            case 'atm':
                // ATM 轉帳有效天數（預設3天）
                paymentData.ExpireDate = 3;
                break;
                
            case 'convenience_store':
                // 超商代碼有效天數（預設3天）
                paymentData.StoreExpireDate = 3;
                // paymentData.Desc_1 = ''; // 交易描述1（可選）
                break;
                
            case 'barcode':
                // 超商條碼有效天數（預設7天）
                paymentData.StoreExpireDate = 7;
                break;
        }
    }

    /**
     * 格式化日期為綠界要求格式: yyyy/MM/dd HH:mm:ss
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    }

    /**
     * 提交付款表單到綠界
     * @param {Object} paymentData - 付款資料
     */
    submitPayment(paymentData) {
        console.log('=== 提交付款到綠界 ===');
        console.log('環境:', this.testMode ? '測試' : '正式');
        console.log('訂單編號:', paymentData.merchantTradeNo);
        console.log('金額:', paymentData.TotalAmount);
        console.log('付款方式:', paymentData.ChoosePayment);
        console.log('付款資料:', paymentData);

        // 驗證金額
        if (!paymentData.TotalAmount || paymentData.TotalAmount < 1) {
            alert('❌ 付款金額錯誤\n\n訂單金額必須大於 NT$ 1');
            return false;
        }

        // 驗證客戶資料
        if (!paymentData.CustomerEmail || !paymentData.CustomerPhone) {
            alert('❌ 客戶資料不完整\n\n請確認Email和電話號碼已填寫');
            return false;
        }

        // 儲存訂單資料以便回傳使用
        try {
            sessionStorage.setItem('pendingOrder_' + paymentData.merchantTradeNo, 
                                  JSON.stringify(paymentData.orderData));
            sessionStorage.setItem('lastPaymentTime', Date.now().toString());
        } catch (e) {
            console.error('儲存訂單資料失敗:', e);
        }

        // 顯示付款資訊確認
        const confirmMessage = this.buildPaymentConfirmMessage(paymentData);
        
        if (!confirm(confirmMessage)) {
            console.log('用戶取消付款');
            return false;
        }

        // 顯示載入中提示
        this.showPaymentLoadingUI();
        
        // 注意：實際生產環境中，CheckMacValue 必須在後端計算！
        // 這裡僅為示範前端流程
        
        // 實際應用中應該：
        // 1. 將訂單資料發送到後端
        // 2. 後端計算 CheckMacValue
        // 3. 後端產生 HTML Form 並回傳
        // 4. 前端 submit 該 Form 到綠界
        
        // 模擬後端處理（實際要在後端實作）
        this.simulatePaymentFlow(paymentData);
        
        return true;
    }

    /**
     * 建立付款確認訊息
     */
    buildPaymentConfirmMessage(paymentData) {
        let message = '🔐 確認付款資訊\n\n';
        message += `訂單編號: ${paymentData.merchantTradeNo}\n`;
        message += `付款金額: NT$ ${paymentData.TotalAmount.toLocaleString()}\n`;
        message += `付款方式: ${this.getPaymentMethodName(paymentData.ChoosePayment)}\n`;
        message += `商品名稱: ${paymentData.ItemName}\n\n`;
        
        if (this.testMode) {
            message += '⚠️ 測試環境\n';
            message += '測試信用卡號: 4311-9522-2222-2222\n';
            message += '有效期限: 任意未來日期\n';
            message += 'CVV: 任意 3 碼\n\n';
        }
        
        message += '確認要前往付款頁面嗎？';
        return message;
    }

    /**
     * 顯示付款載入中 UI
     */
    showPaymentLoadingUI() {
        // 創建載入中遮罩
        const loadingHTML = `
            <div id="ecpayLoading" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                 background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: center; 
                 justify-content: center; flex-direction: column;">
                <div style="text-align: center; color: white;">
                    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #00AA00; 
                         border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; 
                         margin: 0 auto 20px;"></div>
                    <h3 style="font-size: 24px; margin-bottom: 10px;">正在前往付款頁面...</h3>
                    <p style="font-size: 16px; opacity: 0.9;">請稍候，系統正在處理您的訂單</p>
                    <p style="font-size: 14px; opacity: 0.7; margin-top: 20px;">請勿關閉或重新整理頁面</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }

    /**
     * 隱藏付款載入中 UI
     */
    hidePaymentLoadingUI() {
        const loading = document.getElementById('ecpayLoading');
        if (loading) {
            loading.remove();
        }
    }

    /**
     * 模擬付款流程（實際需在後端實作）
     */
    simulatePaymentFlow(paymentData) {
        // 這裡應該發送到您的後端 API
        // 後端會計算 CheckMacValue 並建立付款表單
        
        // 範例：發送到後端 API
        /*
        fetch('/api/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('後端 API 錯誤');
            }
            return response.json();
        })
        .then(data => {
            // 後端回傳包含 CheckMacValue 的完整資料
            // 建立 Form 並提交到綠界
            this.createPaymentForm(data);
        })
        .catch(error => {
            console.error('付款 API 錯誤:', error);
            this.hidePaymentLoadingUI();
            alert('❌ 付款系統連線失敗\n\n' + error.message + '\n\n請稍後再試或聯繫客服');
        });
        */

        // 目前直接跳轉到訂單完成頁面（模擬）
        setTimeout(() => {
            this.hidePaymentLoadingUI();
            
            // 儲存付款狀態
            localStorage.setItem('lastPaymentStatus', JSON.stringify({
                success: true,
                orderId: paymentData.merchantTradeNo,
                amount: paymentData.TotalAmount,
                method: paymentData.ChoosePayment,
                timestamp: new Date().toISOString()
            }));
            
            window.location.href = 'order-success.html';
        }, 2000);
    }

    /**
     * 建立付款表單並提交到綠界
     * @param {Object} formData - 包含 CheckMacValue 的完整付款資料
     */
    createPaymentForm(formData) {
        // 建立隱藏表單
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = this.apiEndpoint;
        
        // 添加所有參數為隱藏欄位
        for (const [key, value] of Object.entries(formData)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        }
        
        // 添加到頁面並提交
        document.body.appendChild(form);
        form.submit();
    }

    /**
     * 取得付款方式中文名稱
     */
    getPaymentMethodName(code) {
        const names = {
            'Credit': '信用卡',
            'ATM': 'ATM 虛擬帳號',
            'CVS': '超商代碼',
            'BARCODE': '超商條碼',
            'ALL': '所有付款方式'
        };
        return names[code] || code;
    }

    /**
     * 處理付款回傳結果
     * @param {Object} returnData - 綠界回傳的資料
     */
    handlePaymentReturn(returnData) {
        console.log('=== 付款回傳結果 ===');
        console.log(returnData);

        // 驗證 CheckMacValue（應在後端驗證）
        // 取得原始訂單資料
        const orderData = sessionStorage.getItem('pendingOrder_' + returnData.MerchantTradeNo);
        
        if (returnData.RtnCode === '1' || returnData.RtnCode === 1) {
            // 付款成功
            this.showPaymentSuccessMessage(returnData);
            
            // 清除暫存
            sessionStorage.removeItem('pendingOrder_' + returnData.MerchantTradeNo);
            
            // 儲存成功記錄
            this.savePaymentRecord(returnData, 'success');
            
            // 延遲跳轉到成功頁面
            setTimeout(() => {
                window.location.href = 'order-success.html?payment=success&order=' + returnData.MerchantTradeNo;
            }, 2000);
            
        } else {
            // 付款失敗
            this.showPaymentFailureMessage(returnData);
            
            // 儲存失敗記錄
            this.savePaymentRecord(returnData, 'failed');
            
            // 詢問用戶是否重試
            setTimeout(() => {
                if (confirm('是否要重新嘗試付款？')) {
                    window.location.href = 'checkout.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 3000);
        }
    }

    /**
     * 顯示付款成功訊息
     */
    showPaymentSuccessMessage(returnData) {
        const message = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                 background: rgba(0,0,0,0.9); z-index: 9999; display: flex; 
                 align-items: center; justify-center: center;">
                <div style="background: white; border-radius: 20px; padding: 40px; 
                     max-width: 500px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="width: 80px; height: 80px; background: #10B981; border-radius: 50%; 
                         margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <svg style="width: 50px; height: 50px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 style="font-size: 28px; color: #111827; margin-bottom: 10px; font-weight: bold;">付款成功！</h2>
                    <p style="font-size: 16px; color: #6B7280; margin-bottom: 20px;">您的訂單已成功付款</p>
                    <div style="background: #F3F4F6; border-radius: 10px; padding: 20px; margin-bottom: 20px; text-align: left;">
                        <p style="margin-bottom: 8px;"><strong>訂單編號:</strong> ${returnData.MerchantTradeNo}</p>
                        <p style="margin-bottom: 8px;"><strong>交易編號:</strong> ${returnData.TradeNo || 'N/A'}</p>
                        <p><strong>付款金額:</strong> <span style="color: #10B981; font-size: 20px; font-weight: bold;">NT$ ${(returnData.TradeAmt || returnData.TotalAmount || 0).toLocaleString()}</span></p>
                    </div>
                    <p style="font-size: 14px; color: #9CA3AF;">正在跳轉到訂單詳情頁面...</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', message);
    }

    /**
     * 顯示付款失敗訊息
     */
    showPaymentFailureMessage(returnData) {
        const errorMsg = returnData.RtnMsg || '付款處理失敗';
        const message = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                 background: rgba(0,0,0,0.9); z-index: 9999; display: flex; 
                 align-items: center; justify-content: center;">
                <div style="background: white; border-radius: 20px; padding: 40px; 
                     max-width: 500px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                    <div style="width: 80px; height: 80px; background: #EF4444; border-radius: 50%; 
                         margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                        <svg style="width: 50px; height: 50px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 style="font-size: 28px; color: #111827; margin-bottom: 10px; font-weight: bold;">付款失敗</h2>
                    <p style="font-size: 16px; color: #6B7280; margin-bottom: 20px;">很抱歉，付款處理時發生錯誤</p>
                    <div style="background: #FEE2E2; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                        <p style="color: #DC2626; font-weight: 500;">錯誤訊息: ${errorMsg}</p>
                    </div>
                    <p style="font-size: 14px; color: #9CA3AF;">您可以重新嘗試付款或選擇其他付款方式</p>
                    <p style="font-size: 12px; color: #9CA3AF; margin-top: 10px;">如有問題請聯繫客服</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', message);
    }

    /**
     * 儲存付款記錄
     */
    savePaymentRecord(returnData, status) {
        try {
            const records = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
            records.push({
                orderId: returnData.MerchantTradeNo,
                tradeNo: returnData.TradeNo,
                amount: returnData.TradeAmt || returnData.TotalAmount,
                status: status,
                returnCode: returnData.RtnCode,
                returnMsg: returnData.RtnMsg,
                timestamp: new Date().toISOString()
            });
            
            // 只保留最近 50 筆記錄
            if (records.length > 50) {
                records.splice(0, records.length - 50);
            }
            
            localStorage.setItem('paymentRecords', JSON.stringify(records));
        } catch (e) {
            console.error('儲存付款記錄失敗:', e);
        }
    }
}

// 全域可用
window.ECPayPayment = ECPayPayment;

// 初始化
window.addEventListener('DOMContentLoaded', function() {
    window.ecpayInstance = new ECPayPayment();
    
    // 如果有付款回傳參數，處理回傳結果
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('MerchantTradeNo')) {
        const returnData = {};
        for (const [key, value] of urlParams.entries()) {
            returnData[key] = value;
        }
        window.ecpayInstance.handlePaymentReturn(returnData);
    }
});

console.log('✅ 綠界 ECPay 金流模組已載入');
