/**
 * 匠寵 - 結帳系統整合
 * Version: 1.0.0
 */

// 獲取購物車內容
function getCart() {
    return JSON.parse(localStorage.getItem('jiangchong_cart') || '[]');
}

// 更新購物車
function updateCart(cart) {
    localStorage.setItem('jiangchong_cart', JSON.stringify(cart));
}

// 清空購物車
function clearCart() {
    localStorage.removeItem('jiangchong_cart');
}

// 優惠券相關變數
let appliedCoupon = null;
let couponDiscount = 0;

// 計算購物車總額
function calculateCartTotal() {
    const cart = getCart();
    
    // 過濾掉零元商品和無效商品
    const validCart = cart.filter(item => {
        const price = parseFloat(item.price) || 0;
        const productId = item.productId;
        return price > 0 && productId !== undefined && productId !== null && productId !== '';
    });
    
    const subtotal = validCart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return sum + (price * quantity);
    }, 0);
    
    // 運費計算 (滿1000免運)
    // 如果小計 >= 1000，無論選擇什麼配送方式都免運
    const isFreeShipping = subtotal >= 1000;
    
    // 獲取當前選擇的配送方式（如果有的話）
    let shippingMethod = null;
    if (typeof document !== 'undefined') {
        const selectedMethod = document.querySelector('input[name="shippingMethod"]:checked');
        shippingMethod = selectedMethod ? selectedMethod.value : null;
    }
    
    // 根據配送方式計算運費（如果未滿1000）
    let shippingFee = 0;
    if (!isFreeShipping) {
        if (shippingMethod === 'hsinchu_logistics') {
            shippingFee = 120; // 新竹物流運費
        } else if (shippingMethod === '711_store' || shippingMethod === 'family_store') {
            shippingFee = 60; // 超商取貨運費
        }
    }
    
    // 折扣計算 (滿1000折100 + 優惠券折扣)
    const baseDiscount = subtotal >= 1000 ? 100 : 0;
    const discount = baseDiscount + couponDiscount;
    
    const total = subtotal + shippingFee - discount;
    
    return {
        subtotal,
        shippingFee,
        discount,
        total,
        itemCount: validCart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
        isFreeShipping: isFreeShipping
    };
}

// 渲染購物車項目
function renderCartItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500 mb-4">購物車是空的</p>
                <a href="index.html" class="inline-block px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    返回首頁選購
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            ${item.imageUrl ? 
                `<img src="${item.imageUrl}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">` :
                `<div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <i class="fas fa-image text-gray-400"></i>
                </div>`
            }
            
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.name}</h4>
                <p class="text-sm text-gray-500">NT$ ${item.price.toLocaleString()} / 件</p>
            </div>
            
            <div class="flex items-center gap-2">
                <button onclick="updateCartItemQuantity(${index}, -1)" 
                    class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">
                    <i class="fas fa-minus text-sm"></i>
                </button>
                <span class="w-12 text-center font-semibold">${item.quantity}</span>
                <button onclick="updateCartItemQuantity(${index}, 1)" 
                    class="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300">
                    <i class="fas fa-plus text-sm"></i>
                </button>
            </div>
            
            <div class="text-right">
                <p class="font-bold text-lg">NT$ ${(item.price * item.quantity).toLocaleString()}</p>
                <button onclick="removeCartItem(${index})" 
                    class="text-red-500 hover:text-red-700 text-sm mt-1">
                    <i class="fas fa-trash mr-1"></i>移除
                </button>
            </div>
        </div>
    `).join('');
    
    updateCartSummary();
}

// 套用優惠碼
async function applyCouponCode() {
    const codeInput = document.getElementById('couponCodeInput');
    const messageEl = document.getElementById('couponMessage');
    const appliedCouponEl = document.getElementById('appliedCoupon');
    const appliedCouponNameEl = document.getElementById('appliedCouponName');
    
    const code = codeInput.value.trim().toUpperCase();
    
    if (!code) {
        messageEl.textContent = '請輸入優惠碼';
        messageEl.className = 'text-xs mt-1 text-red-500';
        return;
    }
    
    // 計算當前小計
    const totals = calculateCartTotal();
    
    try {
        if (window.ApiClient) {
            const response = await window.ApiClient.validateCoupon(code, totals.subtotal);
            
            if (response.success && response.data) {
                appliedCoupon = response.data.coupon;
                couponDiscount = response.data.discountAmount;
                
                // 顯示成功訊息
                messageEl.textContent = `✅ 優惠碼「${appliedCoupon.name}」已套用！`;
                messageEl.className = 'text-xs mt-1 text-green-600';
                
                // 顯示已套用的優惠券
                appliedCouponNameEl.textContent = `${appliedCoupon.name} (折 NT$ ${couponDiscount.toLocaleString()})`;
                appliedCouponEl.classList.remove('hidden');
                
                // 更新訂單摘要
                updateCartSummary();
            } else {
                throw new Error(response.message || '優惠碼驗證失敗');
            }
        } else {
            throw new Error('API 客戶端未載入');
        }
    } catch (error) {
        console.error('優惠碼驗證失敗:', error);
        messageEl.textContent = `❌ ${error.message || '優惠碼無效或已過期'}`;
        messageEl.className = 'text-xs mt-1 text-red-500';
        appliedCouponEl.classList.add('hidden');
        appliedCoupon = null;
        couponDiscount = 0;
        updateCartSummary();
    }
}

// 移除優惠券
function removeCoupon() {
    appliedCoupon = null;
    couponDiscount = 0;
    
    const codeInput = document.getElementById('couponCodeInput');
    const messageEl = document.getElementById('couponMessage');
    const appliedCouponEl = document.getElementById('appliedCoupon');
    
    codeInput.value = '';
    messageEl.textContent = '';
    messageEl.className = 'text-xs mt-1';
    appliedCouponEl.classList.add('hidden');
    
    updateCartSummary();
}

// 更新購物車項目數量
function updateCartItemQuantity(index, change) {
    const cart = getCart();
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCart(cart);
    renderCartItems('cartItemsContainer');
    
    // 更新導航欄購物車數量
    if (window.FrontProducts) {
        window.FrontProducts.updateCartCount();
    }
}

// 移除購物車項目
function removeCartItem(index) {
    const cart = getCart();
    if (index < 0 || index >= cart.length) return;
    
    if (confirm(`確定要移除「${cart[index].name}」嗎？`)) {
        cart.splice(index, 1);
        updateCart(cart);
        renderCartItems('cartItemsContainer');
        
        // 更新導航欄購物車數量
        if (window.FrontProducts) {
            window.FrontProducts.updateCartCount();
        }
    }
}

// 更新購物車摘要
function updateCartSummary() {
    const totals = calculateCartTotal();
    
    // 更新小計
    const subtotalEl = document.getElementById('subtotal');
    if (subtotalEl) {
        subtotalEl.textContent = 'NT$ ' + totals.subtotal.toLocaleString();
    }
    
    // 更新運費
    const shippingFeeEl = document.getElementById('shippingFee');
    if (shippingFeeEl) {
        shippingFeeEl.textContent = totals.shippingFee === 0 ? '免運' : 'NT$ ' + totals.shippingFee;
    }
    
    // 更新折扣
    const discountEl = document.getElementById('discount');
    if (discountEl) {
        discountEl.textContent = totals.discount > 0 ? '-NT$ ' + totals.discount.toLocaleString() : '-NT$ 0';
    }
    
    // 更新總計
    const totalEl = document.getElementById('total');
    if (totalEl) {
        totalEl.textContent = 'NT$ ' + totals.total.toLocaleString();
    }
    
    // 更新數量
    const countElements = document.querySelectorAll('.cart-item-count');
    countElements.forEach(el => {
        el.textContent = totals.itemCount;
    });
}

// 提交訂單（整合後端 API 和綠界金流）
async function submitCheckoutOrder(formData) {
    const cart = getCart();
    if (cart.length === 0) {
        alert('購物車是空的');
        return null;
    }
    
    const totals = calculateCartTotal();
    
    // 獲取當前用戶
    const currentUser = window.UserAuth ? window.UserAuth.getCurrentUser() : null;
    
    // 建立訂單資料
    const orderData = {
        userId: currentUser ? currentUser.id : null,
        items: cart.map(item => ({
            productId: item.productId,
            name: item.name || item.productName || '商品',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            variant: item.variant || '',
            imageUrl: item.imageUrl || item.productImageUrl || ''
        })),
        subtotal: totals.subtotal,
        shippingFee: totals.shippingFee,
        discount: totals.discount,
        total: totals.total,
        
        receiver: {
            name: formData.receiverName,
            phone: formData.receiverPhone,
            email: formData.receiverEmail || ''
        },
        shipping: {
            method: formData.shippingMethod,
            courier: formData.courier || '',
            address: formData.address || '',
            city: formData.city || '',
            district: formData.district || '',
            zipCode: formData.zipCode || '',
            storeId: formData.storeId || '',
            storeName: formData.storeName || '',
            storeAddress: formData.storeAddress || ''
        },
        payment: {
            method: formData.paymentMethod,
            status: 'pending'
        },
        notes: formData.notes || ''
    };
    
    try {
        let savedOrder;
        
        // 優先使用後端 API
        if (window.ApiClient) {
            try {
                const response = await window.ApiClient.createOrder(orderData);
                if (response.success && response.data) {
                    // 確保 savedOrder 有 id 欄位（後端回傳的可能是 orderId）
                    savedOrder = {
                        ...response.data,
                        id: response.data.id || response.data.orderId
                    };
                    console.log('✅ 訂單已透過後端 API 建立:', savedOrder);
                    
                    // 如果有使用優惠券，記錄使用記錄
                    if (appliedCoupon && savedOrder.id) {
                        try {
                            await window.ApiClient.useCoupon(
                                appliedCoupon.id,
                                savedOrder.id,
                                couponDiscount
                            );
                            console.log('✅ 優惠券使用記錄已建立');
                        } catch (error) {
                            console.warn('優惠券使用記錄失敗:', error);
                        }
                    }
                    
                    // 如果使用綠界金流，處理付款
                    // 支援的付款方式：Credit (信用卡), ATM (轉帳), CVS (超商代碼), BARCODE (超商條碼)
                    console.log('🔍 檢查付款方式:', formData.paymentMethod);
                    if (formData.paymentMethod && 
                        ['Credit', 'credit_card', 'ATM', 'atm', 'CVS', 'convenience_store', 'BARCODE', 'barcode'].includes(formData.paymentMethod)) {
                        console.log('✅ 使用綠界金流付款，準備跳轉...');
                        // 直接跳轉到綠界支付頁面
                        try {
                            console.log('🔍 準備調用 handleECPayPayment，訂單:', savedOrder.id, '付款方式:', formData.paymentMethod);
                            await handleECPayPayment(savedOrder, formData.paymentMethod);
                            // 如果 handleECPayPayment 成功，會自動跳轉到綠界，不會執行到這裡
                            console.warn('⚠️ handleECPayPayment 完成但未跳轉，可能有問題');
                            console.warn('⚠️ 這不應該發生，表單提交應該導致頁面跳轉');
                            // 如果沒有跳轉，可能是表單提交失敗，顯示錯誤
                            alert('付款處理完成，但未能跳轉到支付頁面。請檢查 Console 查看詳細資訊。');
                            return savedOrder;
                        } catch (error) {
                            console.error('❌ handleECPayPayment 執行失敗:', error);
                            console.error('❌ 錯誤詳情:', {
                                message: error.message,
                                stack: error.stack,
                                order: savedOrder,
                                paymentMethod: formData.paymentMethod
                            });
                            // 顯示詳細錯誤訊息
                            alert(`付款處理失敗: ${error.message}\n\n訂單已建立，但無法跳轉到付款頁面。\n\n請查看 Console 了解詳細錯誤。`);
                            // 如果付款處理失敗，仍然跳轉到訂單成功頁（訂單已建立）
                            window.location.href = `order-success.html?orderId=${savedOrder.id}`;
                            return savedOrder;
                        }
                    } else {
                        console.log('⚠️ 付款方式不符合綠界金流條件，使用其他付款方式');
                    }
                    
                    // 其他付款方式（貨到付款等）
                    if (window.FrontProducts) {
                        window.FrontProducts.updateCartCount();
                    }
                    
                    // 清空購物車
                    clearCart();
                    
                    // 跳轉到訂單成功頁
                    window.location.href = `order-success.html?orderId=${savedOrder.id}`;
                    return savedOrder;
                }
            } catch (error) {
                console.warn('後端 API 建立訂單失敗，回退到本地:', error.message);
                // 回退到本地儲存
            }
        }
        
        // 回退到本地儲存（當後端不可用時）
        if (!window.DataStore) {
            throw new Error('數據系統未載入');
        }
        
        const localOrderData = {
            ...orderData,
            userId: currentUser ? currentUser.id : 'guest',
            orderDate: Date.now(),
            status: 'pending',
            deliveryStatus: 'pending',
            paymentStatus: 'pending'
        };
        
        savedOrder = window.DataStore.add('orders', localOrderData);
        
        // 更新商品庫存與銷量
        cart.forEach(item => {
            if (item.productId && window.DataStore) {
                const product = window.DataStore.findById('products', item.productId);
                if (product) {
                    window.DataStore.update('products', item.productId, {
                        stock: Math.max(0, product.stock - item.quantity),
                        salesCount: (product.salesCount || 0) + item.quantity
                    });
                }
            }
        });
        
        // 清空購物車
        clearCart();
        
        if (window.FrontProducts) {
            window.FrontProducts.updateCartCount();
        }
        
        console.log('✅ 訂單已透過本地儲存建立:', savedOrder);
        
        // 跳轉到訂單成功頁（本地儲存模式）
        window.location.href = `order-success.html?orderId=${savedOrder.id}`;
        return savedOrder;
        
    } catch (error) {
        console.error('❌ 建立訂單失敗:', error);
        alert('訂單建立失敗: ' + error.message);
        return null;
    }
}

// 處理綠界金流付款
async function handleECPayPayment(order, paymentMethod) {
    try {
        console.log('💳 開始處理綠界金流付款...', { order, paymentMethod });
        
        // 檢查必要參數
        if (!order || (!order.id && !order.orderId)) {
            throw new Error('訂單資料不完整（缺少 id 或 orderId）');
        }
        
        // 確保 order.id 存在（統一使用 id）
        if (!order.id && order.orderId) {
            order.id = order.orderId;
        }
        
        if (!paymentMethod) {
            throw new Error('付款方式未指定');
        }
        
        // 映射付款方式到綠界格式
        const ecpayPaymentMethodMap = {
            'Credit': 'Credit',           // 信用卡
            'credit_card': 'Credit',     // 信用卡（備用）
            'ATM': 'ATM',                // ATM 轉帳
            'atm': 'ATM',                // ATM 轉帳（備用）
            'CVS': 'CVS',                // 超商代碼
            'convenience_store': 'CVS',  // 超商代碼（備用）
            'BARCODE': 'BARCODE',        // 超商條碼
            'barcode': 'BARCODE'         // 超商條碼（備用）
        };
        
        const ecpayMethod = ecpayPaymentMethodMap[paymentMethod] || paymentMethod;
        console.log('📝 付款方式映射:', paymentMethod, '->', ecpayMethod);
        
        // 檢查後端 API 是否可用
        if (!window.ApiClient) {
            throw new Error('後端 API 未載入，無法使用綠界金流。請確認後端伺服器是否運行。');
        }
        
        // 檢查 createPayment 方法是否存在
        if (typeof window.ApiClient.createPayment !== 'function') {
            throw new Error('createPayment 方法不存在，請檢查 API 客戶端是否正確載入。');
        }
        
        console.log('📡 呼叫後端 API 建立付款表單...');
        console.log('📦 訂單資料:', {
            id: order.id || order.orderId,
            total: order.total,
            items: order.items?.length || 0,
            fullOrder: order
        });
        
        const response = await window.ApiClient.createPayment(order, ecpayMethod);
        
        console.log('📥 後端 API 回應:', response);
        
        if (!response) {
            throw new Error('後端 API 無回應');
        }
        
        if (!response.success) {
            throw new Error(response.message || '建立付款表單失敗');
        }
        
        if (!response.data) {
            throw new Error('後端 API 回應資料不完整');
        }
        
        const { formData, apiUrl } = response.data;
        
        if (!formData || !apiUrl) {
            throw new Error('付款表單資料不完整');
        }
        
        console.log('✅ 付款表單已建立，準備跳轉到綠界支付頁面');
        console.log('🔗 綠界 API URL:', apiUrl);
        console.log('📋 表單資料欄位數:', Object.keys(formData).length);
        
        // 建立表單並提交到綠界
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = apiUrl;
        form.style.display = 'none';
        form.id = 'ecpay-payment-form';
        
        // 添加所有表單欄位
        Object.keys(formData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = formData[key];
            form.appendChild(input);
            console.log(`  - ${key}: ${formData[key]}`);
        });
        
        // 添加到頁面
        document.body.appendChild(form);
        
        // 顯示載入訊息
        console.log('🚀 正在跳轉到綠界支付頁面...');
        
        // 延遲一點點確保表單已添加到 DOM
        setTimeout(() => {
            try {
                console.log('🔄 準備提交表單到綠界...');
                console.log('📋 表單元素:', form);
                console.log('📋 表單 action:', form.action);
                console.log('📋 表單 method:', form.method);
                console.log('📋 表單欄位數:', form.querySelectorAll('input').length);
                
                // 驗證表單是否正確
                if (!form.action || form.action === '') {
                    throw new Error('表單 action 為空');
                }
                
                if (form.querySelectorAll('input').length === 0) {
                    throw new Error('表單沒有任何欄位');
                }
                
                // 提交表單
                form.submit();
                console.log('✅ 表單已提交，應該會跳轉到綠界支付頁面');
                
                // 如果表單提交成功，應該會跳轉，不會執行到這裡
                // 但如果沒有跳轉，等待一段時間後檢查
                setTimeout(() => {
                    console.warn('⚠️ 表單提交後沒有跳轉，可能有問題');
                    console.warn('⚠️ 當前 URL:', window.location.href);
                }, 1000);
                
            } catch (submitError) {
                console.error('❌ 表單提交失敗:', submitError);
                throw new Error(`表單提交失敗: ${submitError.message}`);
            }
        }, 100);
        
        // 注意：這裡不應該執行後續代碼，因為表單提交會導致頁面跳轉
        // 但如果表單提交失敗，會繼續執行
        return true;
        
    } catch (error) {
        console.error('❌ 綠界付款處理失敗:', error);
        console.error('錯誤詳情:', {
            message: error.message,
            stack: error.stack,
            order: order,
            paymentMethod: paymentMethod
        });
        
        // 重新拋出錯誤，讓調用者處理
        throw error;
    }
}

// 導出到全局
window.CheckoutSystem = {
    submitCheckoutOrder,
    handleECPayPayment,
    calculateCartTotal,
    applyCouponCode: () => {
        // 這個函數在 checkout.html 中定義
        if (typeof window.applyCouponCode === 'function') {
            return window.applyCouponCode();
        }
    },
    removeCoupon: () => {
        // 這個函數在 checkout.html 中定義
        if (typeof window.removeCoupon === 'function') {
            return window.removeCoupon();
        }
    }
};

// 驗證結帳表單
function validateCheckoutForm(formData) {
    const errors = [];
    
    // 驗證收件人
    if (!formData.receiverName || formData.receiverName.trim() === '') {
        errors.push('請輸入收件人姓名');
    }
    
    // 驗證電話
    if (!formData.receiverPhone || formData.receiverPhone.trim() === '') {
        errors.push('請輸入收件人電話');
    } else {
        const phonePattern = /^09\d{8}$/;
        if (!phonePattern.test(formData.receiverPhone.replace(/[- ]/g, ''))) {
            errors.push('電話格式不正確（請輸入09開頭的手機號碼）');
        }
    }
    
    // 驗證配送方式
    if (!formData.shippingMethod) {
        errors.push('請選擇配送方式');
    }
    
    // 如果是宅配，驗證地址
    if (formData.shippingMethod === 'home_delivery') {
        if (!formData.address || formData.address.trim() === '') {
            errors.push('請輸入配送地址');
        }
        if (!formData.city || formData.city.trim() === '') {
            errors.push('請選擇縣市');
        }
    }
    
    // 如果是超商取貨，驗證店舖
    if (formData.shippingMethod && formData.shippingMethod.includes('_store')) {
        if (!formData.storeId || !formData.storeName) {
            errors.push('請選擇取貨門市');
        }
    }
    
    // 驗證付款方式
    if (!formData.paymentMethod) {
        errors.push('請選擇付款方式');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// 導出函數
window.CheckoutSystem = {
    getCart,
    updateCart,
    clearCart,
    calculateCartTotal,
    renderCartItems,
    updateCartItemQuantity,
    removeCartItem,
    updateCartSummary,
    submitCheckoutOrder,
    validateCheckoutForm,
    handleECPayPayment,
    applyCouponCode,
    removeCoupon
};

// 將優惠碼函數暴露到全局（供 HTML 直接調用）
window.applyCouponCode = applyCouponCode;
window.removeCoupon = removeCoupon;
