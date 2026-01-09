/**
 * 匠寵 - 前台商品展示功能
 * Version: 1.0.0
 */

// 獲取商品數據
function getFrontProducts() {
    if (!window.DataStore) {
        console.warn('DataStore not loaded, using fallback data');
        return [];
    }
    return window.DataStore.getAll('products').filter(p => p.status === 'active');
}

// 渲染商品卡片 (首頁用)
function renderProductCards(containerId, category = null, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    let products = getFrontProducts();
    
    // 分類過濾
    if (category) {
        products = products.filter(p => p.category === category);
    }
    
    // 限制數量
    if (limit) {
        products = products.slice(0, limit);
    }
    
    // 按銷量排序
    products = products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <p class="text-gray-500">暫無商品</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => {
        const discount = product.originalPrice && product.originalPrice > product.price ?
            Math.round((1 - product.price / product.originalPrice) * 100) : 0;
        
        const stockStatus = product.stock === 0 ? 'out-of-stock' :
            product.stock <= product.lowStockThreshold ? 'low-stock' : 'in-stock';
        
        const categoryParam = product.category ? '?category=' + product.category : '';
        const categoryValue = product.category || '';
        return `
            <div class="product-card group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer" onclick="window.location.href='products.html${categoryParam}'">
                <!-- 商品圖片 -->
                <div class="relative overflow-hidden aspect-square">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">` :
                        `<div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <i class="fas fa-image text-gray-400 text-6xl"></i>
                        </div>`
                    }
                    
                    ${discount > 0 ? `
                        <div class="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ${discount}% OFF
                        </div>
                    ` : ''}
                    
                    ${stockStatus === 'low-stock' ? `
                        <div class="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            <i class="fas fa-fire mr-1"></i>即將售罄
                        </div>
                    ` : ''}
                    
                    ${stockStatus === 'out-of-stock' ? `
                        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span class="text-white text-2xl font-bold">已售完</span>
                        </div>
                    ` : ''}
                    
                    ${product.rating ? `
                        <div class="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                            <i class="fas fa-star text-yellow-400"></i>
                            <span>${product.rating}</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- 商品資訊 -->
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-500 transition-colors">
                        ${product.name}
                    </h3>
                    
                    ${product.description ? `
                        <p class="text-sm text-gray-600 mb-4 line-clamp-2">
                            ${product.description}
                        </p>
                    ` : ''}
                    
                    <!-- 價格 -->
                    <div class="flex items-baseline gap-2 mb-4">
                        <span class="text-3xl font-bold text-red-500">
                            NT$ ${product.price.toLocaleString()}
                        </span>
                        ${product.originalPrice && product.originalPrice > product.price ? `
                            <span class="text-lg text-gray-400 line-through">
                                NT$ ${product.originalPrice.toLocaleString()}
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- 銷售資訊 -->
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>
                            <i class="fas fa-shopping-bag mr-1"></i>
                            已售 ${product.salesCount || 0}
                        </span>
                        <span>
                            <i class="fas fa-eye mr-1"></i>
                            ${product.viewCount || 0} 次瀏覽
                        </span>
                    </div>
                    
                    <!-- 按鈕 -->
                    <div class="flex gap-2" onclick="event.stopPropagation()">
                        ${stockStatus !== 'out-of-stock' ? `
                            <button onclick="addToCartFromDataStore('${product.id}'); event.stopPropagation();" 
                                class="flex-1 bg-gradient-to-r from-red-500 to-orange-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                <i class="fas fa-shopping-cart mr-2"></i>加入購物車
                            </button>
                        ` : `
                            <button disabled 
                                class="flex-1 bg-gray-300 text-gray-500 py-3 rounded-xl font-semibold cursor-not-allowed">
                                已售完
                            </button>
                        `}
                        
                        <button onclick="event.stopPropagation(); window.location.href='products.html${categoryParam}';" 
                            class="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-500 hover:text-red-500 transition-all duration-300">
                            <i class="fas fa-eye"></i>
                        </button>
                        
                        <button onclick="toggleFavorite('${product.id}'); event.stopPropagation();" 
                            class="px-4 py-3 border-2 ${window.MemberFavorites && window.MemberFavorites.isFavorite(product.id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700'} rounded-xl hover:border-red-500 hover:text-red-500 transition-all duration-300">
                            <i class="fas fa-heart ${window.MemberFavorites && window.MemberFavorites.isFavorite(product.id) ? 'text-red-500' : ''}"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 查看商品詳情
function viewProductDetail(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    // 更新瀏覽次數
    window.DataStore.update('products', productId, {
        viewCount: (product.viewCount || 0) + 1
    });
    
    // 顯示商品詳情 Modal
    showProductDetailModal(product);
}

// 顯示商品詳情 Modal
function showProductDetailModal(product) {
    // 創建 Modal HTML
    const modalHTML = `
        <div id="productDetailModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onclick="closeProductDetailModal()">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 class="text-2xl font-bold text-gray-800">商品詳情</h3>
                    <button onclick="closeProductDetailModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <!-- Modal Content -->
                <div class="p-6">
                    <div class="grid md:grid-cols-2 gap-8">
                        <!-- 左側：商品圖片 -->
                        <div class="space-y-4">
                            <div class="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                ${product.imageUrl ? 
                                    `<img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover">` :
                                    `<div class="w-full h-full flex items-center justify-center">
                                        <i class="fas fa-image text-gray-300 text-6xl"></i>
                                    </div>`
                                }
                            </div>
                            ${product.rating ? `
                                <div class="flex items-center gap-2">
                                    <div class="flex text-yellow-400">
                                        ${Array(5).fill(0).map((_, i) => 
                                            i < Math.floor(product.rating) ? 
                                            '<i class="fas fa-star"></i>' : 
                                            '<i class="far fa-star"></i>'
                                        ).join('')}
                                    </div>
                                    <span class="text-gray-600">${product.rating} / 5</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- 右側：商品資訊 -->
                        <div class="space-y-6">
                            <div>
                                <h2 class="text-3xl font-bold text-gray-800 mb-2">${product.name}</h2>
                                <p class="text-gray-600">${product.description || '暫無描述'}</p>
                            </div>
                            
                            <!-- 價格 -->
                            <div class="border-t border-b border-gray-200 py-4">
                                <div class="flex items-baseline gap-3">
                                    <span class="text-4xl font-bold text-red-500">NT$ ${product.price.toLocaleString()}</span>
                                    ${product.originalPrice && product.originalPrice > product.price ? `
                                        <span class="text-xl text-gray-400 line-through">NT$ ${product.originalPrice.toLocaleString()}</span>
                                        <span class="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold">
                                            省 NT$ ${(product.originalPrice - product.price).toLocaleString()}
                                        </span>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- 庫存狀態 -->
                            <div class="flex items-center gap-4 text-sm">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-box text-gray-500"></i>
                                    <span class="text-gray-700">庫存：<strong>${product.stock}</strong> 件</span>
                                </div>
                                ${product.stock <= product.lowStockThreshold && product.stock > 0 ? `
                                    <span class="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                                        <i class="fas fa-fire mr-1"></i>即將售罄
                                    </span>
                                ` : ''}
                            </div>
                            
                            <!-- 銷售資訊 -->
                            <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <p class="text-gray-600 text-sm mb-1">已售出</p>
                                    <p class="text-2xl font-bold text-gray-800">${product.salesCount || 0}</p>
                                </div>
                                <div>
                                    <p class="text-gray-600 text-sm mb-1">瀏覽次數</p>
                                    <p class="text-2xl font-bold text-gray-800">${product.viewCount || 0}</p>
                                </div>
                            </div>
                            
                            <!-- 操作按鈕 -->
                            <div class="space-y-3">
                                ${product.stock > 0 ? `
                                    <div class="flex gap-2">
                                        <button onclick="addToCartFromModal('${product.id}')" 
                                            class="flex-1 bg-gradient-to-r from-red-500 to-orange-400 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                                            <i class="fas fa-shopping-cart mr-2"></i>加入購物車
                                        </button>
                                        <button onclick="buyNow('${product.id}')" 
                                            class="flex-1 bg-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-all duration-300">
                                            <i class="fas fa-bolt mr-2"></i>立即購買
                                        </button>
                                        <button onclick="toggleFavorite('${product.id}'); closeProductDetailModal();" 
                                            class="px-6 py-4 border-2 ${window.MemberFavorites && window.MemberFavorites.isFavorite(product.id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700'} rounded-xl hover:border-red-500 hover:text-red-500 transition-all duration-300">
                                            <i class="fas fa-heart ${window.MemberFavorites && window.MemberFavorites.isFavorite(product.id) ? 'text-red-500' : ''}"></i>
                                        </button>
                                    </div>
                                ` : `
                                    <button disabled 
                                        class="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                                        商品已售完
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 插入 Modal 到頁面
    const existingModal = document.getElementById('productDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 關閉商品詳情 Modal
function closeProductDetailModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.remove();
    }
}

// 從 Modal 加入購物車
function addToCartFromModal(productId) {
    addToCartFromDataStore(productId);
    // 可選：關閉 Modal 或保持打開
    // closeProductDetailModal();
}

// 立即購買
function buyNow(productId) {
    addToCartFromDataStore(productId);
    closeProductDetailModal();
    // 跳轉到結帳頁
    setTimeout(() => {
        window.location.href = 'checkout.html';
    }, 500);
}

// 加入購物車（使用統一的 addToCart 函數）
// 注意：這個函數只處理單個 productId 的情況
// 如果已經有完整的參數（productId, productName, price），應該直接調用 window.addToCart
function addToCartFromDataStore(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('商品不存在');
        return;
    }
    
    if (product.stock === 0) {
        alert('此商品已售完');
        return;
    }
    
    // 使用統一的 addToCart 函數（從 local-cart.js）
    if (window.addToCart && typeof window.addToCart === 'function') {
        window.addToCart(productId, product.name, product.price, product.imageUrl || '', 1);
    } else {
        // 回退方案：直接使用 localCart
        if (window.localCart) {
            window.localCart.addItem(productId, product.name, product.price, product.imageUrl || '');
            window.localCart.showAddToCartNotification(product.name, product.price);
        }
    }
    
    // 更新購物車數量顯示
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    } else if (window.localCart) {
        window.localCart.updateCartUI();
    }
}

// 切換收藏
function toggleFavorite(productId) {
    if (!window.MemberFavorites) {
        alert('收藏功能載入中，請稍候再試');
        return;
    }

    const isFavorite = window.MemberFavorites.isFavorite(productId);
    const added = window.MemberFavorites.toggleFavorite(productId);
    
    if (added) {
        showToast('已加入收藏！', 'success');
    } else {
        showToast('已移除收藏', 'info');
    }

    // 更新按鈕狀態（如果頁面上有）
    updateFavoriteButtons(productId, added);
    
    // 更新導航欄收藏數量（如果有）
    updateFavoriteCount();
}

// 更新收藏按鈕狀態
function updateFavoriteButtons(productId, isFavorite) {
    document.querySelectorAll(`[onclick*="toggleFavorite('${productId}')"]`).forEach(btn => {
        const icon = btn.querySelector('.fa-heart');
        if (isFavorite) {
            btn.classList.remove('border-gray-300', 'text-gray-700');
            btn.classList.add('border-red-500', 'text-red-500', 'bg-red-50');
            if (icon) icon.classList.add('text-red-500');
        } else {
            btn.classList.remove('border-red-500', 'text-red-500', 'bg-red-50');
            btn.classList.add('border-gray-300', 'text-gray-700');
            if (icon) icon.classList.remove('text-red-500');
        }
    });
}

// 更新收藏數量顯示
function updateFavoriteCount() {
    if (window.MemberFavorites) {
        const count = window.MemberFavorites.getFavoriteCount();
        const countElement = document.getElementById('favorite-count');
        if (countElement) {
            countElement.textContent = count;
            countElement.style.display = count > 0 ? 'flex' : 'none';
        }
    }
}

// 更新購物車數量顯示
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('jiangchong_cart') || '[]');
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalCount;
        if (totalCount > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

// 顯示提示訊息
function showToast(message, type = 'info') {
    // 創建 toast 元素
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;
    
    // 根據類型設定顏色
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500'
    };
    toast.classList.add(colors[type] || colors.info);
    
    // 設定圖標
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    const icon = icons[type] || icons.info;
    
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icon} text-xl"></i>
            <span class="font-semibold">${message}</span>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // 顯示動畫
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // 3秒後移除
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    // 更新購物車數量
    updateCartCount();
});

// 導出函數供全局使用
window.FrontProducts = {
    renderProductCards,
    viewProductDetail,
    addToCart: window.addToCart || addToCartFromDataStore, // 使用全局 addToCart 或回退到 addToCartFromDataStore
    updateCartCount,
    updateFavoriteCount,
    showToast
};

// 跳轉到產品列表頁面
function goToProductsPage(category) {
    let url = 'products.html';
    if (category && category.trim() !== '') {
        url += '?category=' + category;
    }
    window.location.href = url;
}

// 導出全局函數
window.toggleFavorite = toggleFavorite;
window.goToProductsPage = goToProductsPage;
