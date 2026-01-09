/**
 * 產品管理頁面 JavaScript
 * 連接後端 API 實現完整的 CRUD 功能
 */

// 全局變數
let allProducts = [];
let currentEditingProduct = null;
let productVariants = [];
let imageUrl = '';

// 初始化
async function init() {
    // 等待 API 客戶端載入
    if (!window.ApiClient) {
        console.error('API 客戶端未載入，等待載入...');
        // 等待最多 3 秒
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.ApiClient) {
                console.log('API 客戶端已載入');
                break;
            }
        }
        
        if (!window.ApiClient) {
            alert('API 客戶端載入失敗！請確認 js/api-client.js 已正確載入。\n\n請刷新頁面重試。');
            return;
        }
    }
    
    // 檢查登入
    const adminUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('auth_token');
    
    // 如果有 adminUser 但沒有 token，清除舊的登入資訊並要求重新登入
    if (adminUser && !token) {
        console.warn('⚠️ 發現舊的登入資訊但沒有 token，清除並要求重新登入');
        localStorage.removeItem('adminUser');
        alert('登入資訊已過期，請重新登入');
        window.location.href = 'admin-login.html';
        return;
    }
    
    if (!adminUser || !token) {
        console.error('❌ 未登入或 token 不存在，請先登入');
        window.location.href = 'admin-login.html';
        return;
    }
    
    const user = JSON.parse(adminUser);
    document.getElementById('adminName').textContent = user.name || '管理員';
    document.getElementById('adminRole').textContent = user.role === 'super_admin' ? 'Super Admin' : 'Admin';
    
    // 設置 token 到 ApiClient
    if (window.ApiClient) {
        window.ApiClient.setToken(token);
        console.log('✅ Token 已設置:', token.substring(0, 20) + '...');
    }
    
    // 載入產品列表
    await loadProducts();
}

// 載入產品列表
async function loadProducts() {
    try {
        if (!window.ApiClient) {
            console.error('API 客戶端未載入');
            alert('API 客戶端未載入，請確認 js/api-client.js 已正確載入');
            return;
        }
        
        // 直接調用 API 獲取產品列表
        const response = await window.ApiClient.getProducts({ limit: 100 });
        console.log('API 回應:', response); // 調試用
        
        if (response && response.success) {
            allProducts = response.data && response.data.products ? response.data.products : [];
            console.log('產品列表:', allProducts); // 調試用
            console.log('產品數量:', allProducts.length); // 調試用
            
            if (allProducts.length === 0) {
                console.warn('產品列表為空，資料庫中可能沒有產品');
                // 仍然渲染空列表，讓用戶知道可以新增產品
            }
            
            renderProducts(allProducts);
            updateProductStats();
        } else {
            console.error('載入產品失敗:', response);
            alert('載入產品列表失敗：' + (response.message || '未知錯誤'));
        }
    } catch (error) {
        console.error('載入產品錯誤:', error);
        
        // 提供更詳細的錯誤訊息
        let errorMsg = '載入產品列表時發生錯誤\n\n';
        
        if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
            errorMsg += '❌ 無法連接到後端伺服器\n\n';
            errorMsg += '請確認：\n';
            errorMsg += '1. 後端伺服器已啟動\n';
            errorMsg += '   在終端機執行：cd backend && npm start\n';
            errorMsg += '   應該看到：📍 服務地址: http://localhost:3000\n\n';
            errorMsg += '2. 在瀏覽器測試後端是否可訪問：\n';
            errorMsg += '   http://localhost:3000/health\n';
            errorMsg += '   應該看到 JSON 回應\n\n';
            errorMsg += '3. 檢查瀏覽器控制台（F12）查看詳細錯誤\n\n';
            errorMsg += '詳細說明請查看：🔧_Admin產品管理API連接問題修復.md';
        } else {
            errorMsg += '錯誤訊息：' + error.message;
        }
        
        alert(errorMsg);
    }
}

// 渲染產品列表
function renderProducts(products = allProducts) {
    const tbody = document.getElementById('productTableBody');
    const categoryLabels = {
        'snacks': '台灣夜市零食',
        'snack': '台灣夜市零食',
        'toys': '益智玩具',
        'toy': '益智玩具',
        'subscription': '營養罐訂閱'
    };
    
    if (!tbody) {
        console.error('找不到 productTableBody 元素');
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-box text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">目前沒有商品資料</p>
                    <button onclick="openAddProductModal()" class="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        <i class="fas fa-plus mr-2"></i>新增商品
                    </button>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = products.map(p => {
        const categoryLabel = categoryLabels[p.category] || p.category;
        const stock = p.stock || 0;
        const lowStockThreshold = p.lowStockThreshold || 10;
        const isLowStock = stock > 0 && stock <= lowStockThreshold;
        const isOutOfStock = stock === 0;
        const stockClass = isOutOfStock ? 'text-red-600' : (isLowStock ? 'text-orange-600' : 'text-green-600');
        
        return `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <input type="checkbox" class="w-4 h-4 text-red-500 border-gray-300 rounded" value="${p.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                        ${p.imageUrl ? 
                            `<img src="${p.imageUrl}" class="w-12 h-12 rounded-lg object-cover" alt="${p.name}" onerror="this.src='https://via.placeholder.com/48?text=No+Image'">` :
                            `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <i class="fas fa-image text-gray-400"></i>
                            </div>`
                        }
                        <div>
                            <p class="font-semibold text-gray-800">${p.name}</p>
                            <p class="text-xs text-gray-500">SKU: ${p.sku || 'N/A'}</p>
                            ${p.cyberbizId ? `<p class="text-xs text-blue-500">Cyberbiz: ${p.cyberbizId}</p>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">${p.sku || 'N/A'}</td>
                <td class="px-6 py-4 text-sm text-gray-600">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        ${categoryLabel}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm font-semibold text-gray-800">
                    NT$ ${(p.price || 0).toLocaleString()}
                    ${p.originalPrice && p.originalPrice > p.price ? 
                        `<div class="text-xs text-gray-400 line-through">NT$ ${p.originalPrice.toLocaleString()}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <span class="${stockClass} font-semibold">
                        ${stock}
                        ${isLowStock ? '<i class="fas fa-exclamation-triangle ml-1" title="低庫存警示"></i>' : ''}
                    </span>
                    <div class="text-xs text-gray-500">警示值: ${lowStockThreshold}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${p.status === 'active' ? '上架中' : '已下架'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick='editProduct("${p.id}")' class="text-green-600 hover:text-green-800" title="編輯">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${p.cyberbizId ? 
                            `<button onclick='syncProduct("${p.id}")' class="text-blue-600 hover:text-blue-800" title="同步">
                                <i class="fas fa-sync"></i>
                            </button>` : ''}
                        <button onclick='deleteProduct("${p.id}")' class="text-red-600 hover:text-red-800" title="刪除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 更新產品統計
function updateProductStats() {
    const activeProducts = allProducts.filter(p => p.status === 'active');
    const lowStockProducts = allProducts.filter(p => 
        p.stock > 0 && p.stock <= (p.lowStockThreshold || 10) && p.status === 'active'
    );
    const totalSales = allProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    
    // 更新統計卡片（如果存在）
    const cards = document.querySelectorAll('.kpi-card .text-3xl');
    if (cards.length >= 4) {
        cards[0].textContent = allProducts.length;
        cards[1].textContent = activeProducts.length;
        cards[2].textContent = lowStockProducts.length;
        cards[3].textContent = totalSales.toLocaleString();
    }
}

// 打開新增產品 Modal
function openAddProductModal() {
    currentEditingProduct = null;
    productVariants = [];
    imageUrl = '';
    document.getElementById('modalTitle').textContent = '新增產品';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreviewImg').classList.add('hidden');
    document.getElementById('imagePreview').classList.remove('hidden');
    document.getElementById('variantsList').innerHTML = '<div class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">點擊「新增規格」來添加不同的產品規格（如尺寸、口味、份量等）</div>';
    document.getElementById('productModal').classList.add('active');
}

// 關閉 Modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

// 編輯產品
async function editProduct(id) {
    try {
        if (!window.ApiClient) {
            alert('API 客戶端未載入');
            return;
        }
        
        const response = await window.ApiClient.getProduct(id);
        if (!response.success || !response.data) {
            alert('載入產品失敗：' + (response.message || '未知錯誤'));
            return;
        }
        
        const product = response.data;
        currentEditingProduct = product;
        
        document.getElementById('modalTitle').textContent = '編輯產品';
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productCategory').value = product.category || 'snacks';
        document.getElementById('productSKU').value = product.sku || '';
        document.getElementById('productCyberbizID').value = product.cyberbizId || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stock || 0;
        document.getElementById('productLowStock').value = product.lowStockThreshold || 10;
        document.getElementById('productStatus').value = product.status || 'active';
        document.getElementById('productDescription').value = product.description || '';
        
        // 顯示圖片
        if (product.imageUrl) {
            imageUrl = product.imageUrl;
            const img = document.getElementById('imagePreviewImg');
            const preview = document.getElementById('imagePreview');
            img.src = product.imageUrl;
            img.classList.remove('hidden');
            preview.classList.add('hidden');
        }
        
        // 載入規格（如果有）
        if (product.variants && product.variants.length > 0) {
            productVariants = product.variants.map(v => ({
                name: v.name || '',
                price: v.price || product.price,
                stock: v.stock || 0
            }));
            renderVariants();
        } else {
            productVariants = [];
            document.getElementById('variantsList').innerHTML = '<div class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">點擊「新增規格」來添加不同的產品規格（如尺寸、口味、份量等）</div>';
        }
        
        // 設置圖片 URL
        imageUrl = product.imageUrl || '';
        
        document.getElementById('productModal').classList.add('active');
    } catch (error) {
        console.error('載入產品錯誤:', error);
        alert('載入產品時發生錯誤：' + error.message);
    }
}

// 圖片預覽
function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('圖片大小不能超過 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('imagePreviewImg');
            const preview = document.getElementById('imagePreview');
            imageUrl = e.target.result; // 暫時使用 base64，實際應該上傳到伺服器
            img.src = e.target.result;
            img.classList.remove('hidden');
            preview.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// 產品規格管理
function addVariant() {
    productVariants.push({
        name: '',
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        stock: 0
    });
    renderVariants();
}

function renderVariants() {
    const container = document.getElementById('variantsList');
    
    if (productVariants.length === 0) {
        container.innerHTML = '<div class="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">點擊「新增規格」來添加不同的產品規格（如尺寸、口味、份量等）</div>';
        return;
    }
    
    container.innerHTML = productVariants.map((v, index) => `
        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-semibold text-gray-700">規格 ${index + 1}</span>
                <button type="button" onclick="removeVariant(${index})" class="text-red-500 hover:text-red-600">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
                <div>
                    <label class="block text-xs text-gray-600 mb-1">規格名稱</label>
                    <input type="text" value="${v.name || ''}" onchange="updateVariant(${index}, 'name', this.value)" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="例：大、雞肉、500g">
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">價格 (NT$)</label>
                    <input type="number" value="${v.price || 0}" onchange="updateVariant(${index}, 'price', parseFloat(this.value))" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="0">
                </div>
                <div>
                    <label class="block text-xs text-gray-600 mb-1">庫存</label>
                    <input type="number" value="${v.stock || 0}" onchange="updateVariant(${index}, 'stock', parseInt(this.value))" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="0">
                </div>
            </div>
        </div>
    `).join('');
}

function updateVariant(index, field, value) {
    if (productVariants[index]) {
        productVariants[index][field] = value;
    }
}

function removeVariant(index) {
    if (confirm('確定要刪除此規格嗎？')) {
        productVariants.splice(index, 1);
        renderVariants();
    }
}

// 刪除產品
async function deleteProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) {
        alert('找不到該產品');
        return;
    }
    
    if (!confirm(`確定要刪除產品「${product.name}」嗎？\n\n注意：此操作無法復原！`)) {
        return;
    }
    
    try {
        if (!window.ApiClient) {
            alert('API 客戶端未載入');
            return;
        }
        
        const response = await window.ApiClient.deleteProduct(id);
        if (response.success) {
            alert('產品已成功刪除');
            await loadProducts();
        } else {
            alert('刪除失敗：' + (response.message || '未知錯誤'));
        }
    } catch (error) {
        console.error('刪除產品錯誤:', error);
        alert('刪除產品時發生錯誤：' + error.message);
    }
}

// 同步產品到 Cyberbiz
function syncProduct(id) {
    alert(`同步產品 ID: ${id} 至 Cyberbiz\n\n注意：此功能需要整合 Cyberbiz API`);
}

// 頁面載入時初始化
// 使用立即執行函數確保在腳本載入後執行
(function() {
    function startInit() {
        // 如果 ApiClient 已經載入，直接初始化
        if (window.ApiClient) {
            console.log('✅ ApiClient 已載入，開始初始化');
            init();
        } else {
            // 等待 ApiClient 載入
            console.log('⏳ 等待 ApiClient 載入...');
            let attempts = 0;
            const maxAttempts = 50; // 5 秒
            
            const checkInterval = setInterval(() => {
                attempts++;
                if (window.ApiClient) {
                    clearInterval(checkInterval);
                    console.log('✅ ApiClient 已載入，開始初始化');
                    init();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.error('❌ ApiClient 載入超時');
                    alert('API 客戶端載入失敗！請確認 js/api-client.js 已正確載入。\n\n請檢查：\n1. 瀏覽器控制台是否有錯誤\n2. Network 標籤確認 js/api-client.js 是否載入成功\n3. 刷新頁面重試');
                }
            }, 100);
        }
    }
    
    // 根據 DOM 狀態決定何時開始
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startInit);
    } else {
        // DOM 已載入，立即開始
        startInit();
    }
})();

// 表單提交處理
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!window.ApiClient) {
                alert('API 客戶端未載入');
                return;
            }
            
            // 獲取表單數據
            const productData = {
                name: document.getElementById('productName').value.trim(),
                category: document.getElementById('productCategory').value,
                sku: document.getElementById('productSKU').value.trim(),
                cyberbizId: document.getElementById('productCyberbizID').value.trim() || null,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value) || 0,
                lowStockThreshold: parseInt(document.getElementById('productLowStock').value) || 10,
                status: document.getElementById('productStatus').value,
                description: document.getElementById('productDescription').value.trim() || null,
                imageUrl: imageUrl || null,
                variants: productVariants.length > 0 ? productVariants.filter(v => v.name && v.name.trim()) : null
            };
            
            // 驗證必填欄位
            if (!productData.name || !productData.price) {
                alert('請填寫產品名稱和價格');
                return;
            }
            
            // 確保 token 已設置
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('認證已過期，請重新登入');
                window.location.href = 'admin-login.html';
                return;
            }
            window.ApiClient.setToken(token);
            
            try {
                let response;
                if (currentEditingProduct) {
                    // 更新產品
                    response = await window.ApiClient.updateProduct(currentEditingProduct.id, productData);
                } else {
                    // 新增產品
                    response = await window.ApiClient.createProduct(productData);
                }
                
                if (response.success) {
                    alert(currentEditingProduct ? '產品已成功更新！' : '產品已成功新增！');
                    closeProductModal();
                    await loadProducts();
                } else {
                    alert((currentEditingProduct ? '更新' : '新增') + '失敗：' + (response.message || '未知錯誤'));
                }
            } catch (error) {
                console.error('儲存產品錯誤:', error);
                alert('儲存產品時發生錯誤：' + error.message);
            }
        });
    }
});

// 篩選功能
function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const stock = document.getElementById('stockFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let filtered = [...allProducts];
    
    if (search) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(search)) ||
            (p.sku && p.sku.toLowerCase().includes(search))
        );
    }
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    if (stock === 'low-stock') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
    } else if (stock === 'out-of-stock') {
        filtered = filtered.filter(p => p.stock === 0);
    } else if (stock === 'in-stock') {
        filtered = filtered.filter(p => p.stock > (p.lowStockThreshold || 10));
    }
    
    if (status) {
        filtered = filtered.filter(p => p.status === status);
    }
    
    renderProducts(filtered);
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    if (document.getElementById('stockFilter')) {
        document.getElementById('stockFilter').value = '';
    }
    document.getElementById('statusFilter').value = '';
    renderProducts(allProducts);
}

// 登出
function logout() {
    if (confirm('確定要登出嗎？')) {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('auth_token');
        if (window.ApiClient) {
            window.ApiClient.logout();
        }
        window.location.href = 'admin-login.html';
    }
}

function showUserMenu() {
    alert('用戶選單功能開發中');
}

// 將函數暴露到全局作用域
window.openAddProductModal = openAddProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.syncProduct = syncProduct;
window.previewImage = previewImage;
window.addVariant = addVariant;
window.removeVariant = removeVariant;
window.updateVariant = updateVariant;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.logout = logout;
window.showUserMenu = showUserMenu;
