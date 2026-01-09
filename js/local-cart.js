/**
 * 匠寵本地購物車系統
 * 使用 localStorage 儲存購物車資料
 */

// 注意：已移除 Cyberbiz 相關設定，所有結帳流程都在本網站完成

// 購物車管理類別
class LocalCart {
    constructor() {
        this.storageKey = 'jiangchong_cart';
        this.cart = this.loadCart();
    }

    // 從 localStorage 載入購物車
    loadCart() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('載入購物車失敗:', error);
            return [];
        }
    }

    // 儲存購物車到 localStorage
    saveCart() {
        try {
            // 確保所有數量都是數字類型
            const cartToSave = this.cart.map(item => ({
                ...item,
                quantity: parseInt(item.quantity) || 1,
                price: parseFloat(item.price) || 0
            }));
            
            localStorage.setItem(this.storageKey, JSON.stringify(cartToSave));
            console.log('💾 購物車已保存:', cartToSave);
            this.updateCartUI();
            
            // 觸發購物車更新事件
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart: cartToSave }
            }));
        } catch (error) {
            console.error('儲存購物車失敗:', error);
        }
    }

    // 加入商品到購物車
    addItem(productId, productName, price, imageUrl = '', quantity = 1) {
        console.log('🛒 addItem 被調用:', { productId, productName, price, imageUrl, quantity });
        
        // 參數驗證
        if (!productId) {
            console.error('addItem: productId 不能為空');
            return false;
        }
        
        // 確保價格和數量是數字
        price = parseFloat(price) || 0;
        quantity = parseInt(quantity) || 1;
        
        if (isNaN(price) || price < 0) {
            console.warn('addItem: 價格無效，使用 0', price);
            price = 0;
        }
        
        if (isNaN(quantity) || quantity < 1) {
            console.warn('addItem: 數量無效，使用 1', quantity);
            quantity = 1;
        }
        
        // 確保 productId 是字符串（統一格式）
        productId = String(productId);
        
        // 檢查商品是否已存在（使用多種比較方式）
        const existingItem = this.cart.find(item => {
            const itemId = String(item.productId || '');
            return itemId === productId || itemId === String(productId);
        });
        
        if (existingItem) {
            // 商品已存在，增加數量（確保是數字類型，避免字符串拼接）
            const currentQuantity = parseInt(existingItem.quantity) || 1;
            const newQuantity = currentQuantity + quantity;
            existingItem.quantity = newQuantity;
            console.log(`✅ 商品已存在，數量從 ${currentQuantity} 增加到 ${newQuantity}`);
        } else {
            // 新商品，加入購物車
            const newItem = {
                productId: productId,
                productName: productName || '商品',
                price: price,
                imageUrl: imageUrl || '',
                quantity: quantity,
                addedAt: Date.now()
            };
            this.cart.push(newItem);
            console.log('✅ 新商品已加入:', newItem);
        }
        
        this.saveCart();
        return true;
    }

    // 更新商品數量
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // 移除商品
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.productId !== productId);
        this.saveCart();
    }

    // 清空購物車
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // 取得購物車商品數量
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // 取得購物車總金額
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // 取得購物車內容
    getItems() {
        return this.cart;
    }

    // 更新所有購物車 UI
    updateCartUI() {
        // 更新購物車數量徽章
        this.updateCartBadge();
        // 更新購物車浮動視窗（如果已開啟）
        if (document.getElementById('cart-dropdown')) {
            this.renderCartDropdown();
        }
    }

    // 更新購物車數量徽章
    updateCartBadge() {
        const badge = document.getElementById('cart-count');
        const count = this.getItemCount();
        
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // 渲染購物車浮動視窗
    renderCartDropdown() {
        const dropdown = document.getElementById('cart-dropdown');
        if (!dropdown) return;

        const items = this.getItems();
        const total = this.getTotal();
        const count = this.getItemCount();

        if (items.length === 0) {
            dropdown.innerHTML = `
                <div class="p-8 text-center">
                    <i class="fas fa-shopping-cart text-gray-300 text-4xl mb-3"></i>
                    <p class="text-gray-500">購物車是空的</p>
                    <p class="text-sm text-gray-400 mt-2">快去挑選喜歡的商品吧！</p>
                </div>
            `;
            return;
        }

        const itemsHtml = items.map(item => `
            <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    ${item.imageUrl ? 
                        `<img src="${item.imageUrl}" alt="${item.productName}" class="w-full h-full object-cover">` :
                        `<div class="w-full h-full flex items-center justify-center text-gray-400">
                            <i class="fas fa-image"></i>
                        </div>`
                    }
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-sm text-gray-900 truncate">${item.productName}</h4>
                    <p class="text-sm text-gray-600 mt-1">NT$ ${item.price} × ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="localCart.updateQuantity('${item.productId}', ${item.quantity - 1})" 
                            class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">
                        <i class="fas fa-minus text-xs text-gray-600"></i>
                    </button>
                    <span class="w-8 text-center font-medium text-sm">${item.quantity}</span>
                    <button onclick="localCart.updateQuantity('${item.productId}', ${item.quantity + 1})" 
                            class="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center">
                        <i class="fas fa-plus text-xs text-gray-600"></i>
                    </button>
                    <button onclick="localCart.removeItem('${item.productId}')" 
                            class="ml-2 text-red-500 hover:text-red-700 transition">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        `).join('');

        dropdown.innerHTML = `
            <div class="max-h-96 overflow-y-auto">
                ${itemsHtml}
            </div>
            <div class="border-t border-gray-200 mt-3 pt-3">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-gray-600">小計 (${count} 件商品)</span>
                    <span class="text-xl font-bold text-primary">NT$ ${total}</span>
                </div>
                <button onclick="localCart.proceedToCheckout()" 
                        class="w-full bg-gradient-to-r from-primary to-pink-500 text-white py-3 rounded-full font-bold hover:shadow-lg transition transform hover:scale-105">
                    <i class="fas fa-shopping-bag mr-2"></i>前往結帳
                </button>
                <button onclick="localCart.clearCart(); localCart.toggleCartDropdown();" 
                        class="w-full mt-2 text-gray-500 hover:text-gray-700 py-2 text-sm transition">
                    清空購物車
                </button>
            </div>
        `;
    }

    // 切換購物車浮動視窗顯示
    toggleCartDropdown() {
        let dropdown = document.getElementById('cart-dropdown');
        
        if (!dropdown) {
            // 建立購物車浮動視窗
            dropdown = document.createElement('div');
            dropdown.id = 'cart-dropdown';
            dropdown.className = 'fixed top-20 right-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl p-4 z-50 transform transition-all duration-300';
            dropdown.style.display = 'none';
            document.body.appendChild(dropdown);
        }

        if (dropdown.style.display === 'none') {
            this.renderCartDropdown();
            dropdown.style.display = 'block';
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                dropdown.style.opacity = '1';
                dropdown.style.transform = 'translateY(0)';
            }, 10);
        } else {
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                dropdown.style.display = 'none';
            }, 300);
        }
    }

    // 前往結帳（導向本網站結帳頁面）
    proceedToCheckout() {
        const items = this.getItems();
        
        if (items.length === 0) {
            alert('購物車是空的！');
            return;
        }

        // 關閉購物車浮動視窗
        this.toggleCartDropdown();

        // 直接跳轉到本網站結帳頁面
        window.location.href = 'checkout.html';
    }

    // 顯示加入購物車成功提示
    showAddToCartNotification(productName, price) {
        // 確保參數有效
        const displayName = productName || '商品';
        const displayPrice = (price !== undefined && price !== null) ? parseFloat(price) : 0;
        
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-white shadow-2xl rounded-2xl p-4 z-50 transform transition-all duration-300';
        notification.style.minWidth = '320px';
        
        notification.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="font-bold text-gray-900">已加入購物車</p>
                    <p class="text-sm text-gray-600 mt-1">${displayName}</p>
                    <p class="text-xs text-gray-500 mt-1">金額：NT$ ${displayPrice.toLocaleString()}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="text-gray-400 hover:text-gray-600 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mt-3 flex gap-2">
                <button onclick="localCart.toggleCartDropdown(); this.parentElement.parentElement.remove();" 
                        class="flex-1 bg-secondary text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-teal-600 transition">
                    查看購物車
                </button>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-full text-sm font-medium hover:bg-gray-200 transition">
                    繼續購物
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3 秒後自動移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
}

// 建立全域購物車實例
const localCart = new LocalCart();

// 重寫 addToCart 函數（支持多種調用方式）
function addToCart(productId, productName, price, imageUrl = '', quantity = 1) {
    // 防止重複調用
    if (addToCart._calling) {
        console.warn('addToCart 正在執行中，跳過重複調用');
        return;
    }
    addToCart._calling = true;
    
    try {
        // 參數驗證和處理
        if (!productId) {
            console.error('addToCart: productId 不能為空');
            return;
        }
        
        // 如果只傳了 productId，或者 productName/price 為空/undefined，嘗試從 DataStore 獲取商品信息
        if ((!productName || productName === 'undefined') && (!price || price === 'undefined' || price === 0) && window.DataStore) {
            const product = window.DataStore.findById('products', productId);
            if (product) {
                productName = product.name || productName || '商品';
                price = product.price || price || 0;
                imageUrl = product.imageUrl || imageUrl || '';
            }
        }
        
        // 確保參數有效（處理 undefined 和 null）
        productName = (productName && productName !== 'undefined') ? String(productName) : '商品';
        price = (price && price !== 'undefined' && price !== null) ? parseFloat(price) : 0;
        imageUrl = imageUrl || '';
        
        if (isNaN(price) || price < 0) {
            console.warn('addToCart: 價格無效，使用 0', price);
            price = 0;
        }
        
        // 加入本地購物車（傳入數量參數）
        localCart.addItem(productId, productName, price, imageUrl, quantity);
        
        // 顯示提示訊息
        localCart.showAddToCartNotification(productName, price);
        
        // 追蹤事件（如果有 Google Analytics）
        if (typeof gtag !== 'undefined') {
            gtag('event', 'add_to_cart', {
                'event_category': 'ecommerce',
                'event_label': productName,
                'value': price,
                'items': [{
                    'id': productId,
                    'name': productName,
                    'price': price,
                    'quantity': quantity
                }]
            });
        }
    } finally {
        // 清除標記，允許下次調用
        setTimeout(() => {
            addToCart._calling = false;
        }, 100);
    }
}

// 點擊外部關閉購物車浮動視窗
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('cart-dropdown');
    const cartButton = document.getElementById('cart-button');
    
    if (dropdown && dropdown.style.display !== 'none') {
        if (!dropdown.contains(event.target) && !cartButton.contains(event.target)) {
            localCart.toggleCartDropdown();
        }
    }
});

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', function() {
    localCart.updateCartUI();
});

// 導出給其他腳本使用
window.localCart = localCart;
window.addToCart = addToCart;
