/**
 * 匠寵 - 商品管理功能
 * Version: 1.0.0
 */

// 獲取所有商品
function getAllProducts() {
    return window.DataStore.getAll('products');
}

// 渲染商品列表
function renderProducts(products = null) {
    if (!products) {
        products = getAllProducts();
    }
    
    const tbody = document.getElementById('productTableBody');
    
    if (products.length === 0) {
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
    
    tbody.innerHTML = products.map(product => {
        const categoryLabels = {
            'snacks': '台灣夜市零食',
            'toys': '益智玩具',
            'subscription': '營養罐訂閱',
            'crowdfunding': '群眾募資'
        };
        
        const statusLabels = {
            'active': '上架中',
            'inactive': '已下架',
            'out_of_stock': '缺貨'
        };
        
        const statusColors = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'out_of_stock': 'bg-red-100 text-red-800'
        };
        
        // 庫存狀態
        let stockStatus = 'in-stock';
        let stockClass = 'text-green-600';
        if (product.stock === 0) {
            stockStatus = 'out-of-stock';
            stockClass = 'text-red-600';
        } else if (product.stock <= product.lowStockThreshold) {
            stockStatus = 'low-stock';
            stockClass = 'text-orange-600';
        }
        
        return `
        <tr class="table-row">
            <td class="px-6 py-4">
                <input type="checkbox" class="w-4 h-4 text-red-500 border-gray-300 rounded" value="${product.id}">
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" class="w-12 h-12 rounded-lg object-cover" alt="${product.name}">` :
                        `<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <i class="fas fa-image text-gray-400"></i>
                        </div>`
                    }
                    <div>
                        <p class="font-semibold text-gray-800">${product.name}</p>
                        <p class="text-xs text-gray-500">SKU: ${product.sku}</p>
                        ${product.cyberbizId ? 
                            `<p class="text-xs text-blue-500">Cyberbiz: ${product.cyberbizId}</p>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
                ${categoryLabels[product.category] || product.category}
            </td>
            <td class="px-6 py-4">
                <div class="text-sm">
                    <div class="font-semibold text-gray-800">NT$ ${product.price.toLocaleString()}</div>
                    ${product.originalPrice && product.originalPrice > product.price ? 
                        `<div class="text-xs text-gray-400 line-through">NT$ ${product.originalPrice.toLocaleString()}</div>` : ''}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="${stockClass} font-semibold">
                    ${product.stock}
                    ${product.stock <= product.lowStockThreshold && product.stock > 0 ? 
                        `<i class="fas fa-exclamation-triangle ml-1" title="低庫存警示"></i>` : ''}
                </div>
                <div class="text-xs text-gray-500">
                    警示值: ${product.lowStockThreshold}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                    <div>銷量: ${product.salesCount || 0}</div>
                    <div class="text-xs text-gray-400">瀏覽: ${product.viewCount || 0}</div>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${statusColors[product.status]}">
                    ${statusLabels[product.status]}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <button onclick='viewProduct("${product.id}")' class="text-blue-600 hover:text-blue-800" title="查看">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick='editProduct("${product.id}")' class="text-green-600 hover:text-green-800" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${product.cyberbizId ? 
                        `<button onclick='syncToCyberbiz("${product.id}")' class="text-purple-600 hover:text-purple-800" title="同步至Cyberbiz">
                            <i class="fas fa-sync"></i>
                        </button>` : ''}
                    <button onclick='deleteProduct("${product.id}")' class="text-red-600 hover:text-red-800" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    // 更新統計
    updateProductStats();
}

// 更新商品統計
function updateProductStats() {
    const products = getAllProducts();
    const activeProducts = products.filter(p => p.status === 'active');
    const lowStockProducts = products.filter(p => 
        p.stock > 0 && p.stock <= p.lowStockThreshold && p.status === 'active'
    );
    
    // 計算分類數
    const categories = [...new Set(products.map(p => p.category))];
    
    // 本月銷量
    const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    
    // 更新卡片 (如果存在)
    const cards = document.querySelectorAll('.kpi-card .text-3xl');
    if (cards.length >= 4) {
        cards[0].textContent = products.length;
        cards[1].textContent = activeProducts.length;
        cards[2].textContent = lowStockProducts.length;
        cards[3].textContent = totalSales.toLocaleString();
    }
    
    // 更新副標題
    const subtitles = document.querySelectorAll('.kpi-card .text-xs');
    if (subtitles.length >= 1) {
        subtitles[0].textContent = `${categories.length} 個分類`;
    }
}

// 篩選商品
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter') ? 
        document.getElementById('stockFilter').value : '';
    const statusFilter = document.getElementById('statusFilter').value;
    
    let products = getAllProducts();
    
    // 搜尋過濾
    if (searchText) {
        products = products.filter(product => 
            product.name.toLowerCase().includes(searchText) ||
            product.sku.toLowerCase().includes(searchText) ||
            (product.cyberbizId && product.cyberbizId.toLowerCase().includes(searchText))
        );
    }
    
    // 分類過濾
    if (categoryFilter) {
        products = products.filter(product => product.category === categoryFilter);
    }
    
    // 庫存過濾
    if (stockFilter) {
        if (stockFilter === 'low') {
            products = products.filter(product => 
                product.stock > 0 && product.stock <= product.lowStockThreshold
            );
        } else if (stockFilter === 'out') {
            products = products.filter(product => product.stock === 0);
        } else if (stockFilter === 'in') {
            products = products.filter(product => product.stock > product.lowStockThreshold);
        }
    }
    
    // 狀態過濾
    if (statusFilter) {
        products = products.filter(product => product.status === statusFilter);
    }
    
    renderProducts(products);
}

// 重置篩選
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    if (document.getElementById('stockFilter')) {
        document.getElementById('stockFilter').value = '';
    }
    document.getElementById('statusFilter').value = '';
    renderProducts();
}

// 查看商品詳情
function viewProduct(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('找不到該商品');
        return;
    }
    
    const categoryLabels = {
        'snacks': '台灣夜市零食',
        'toys': '益智玩具',
        'subscription': '營養罐訂閱',
        'crowdfunding': '群眾募資'
    };
    
    alert(`商品詳情：

名稱：${product.name}
SKU：${product.sku}
${product.cyberbizId ? `Cyberbiz ID：${product.cyberbizId}\n` : ''}
分類：${categoryLabels[product.category]}
售價：NT$ ${product.price.toLocaleString()}
${product.originalPrice ? `原價：NT$ ${product.originalPrice.toLocaleString()}\n` : ''}
庫存：${product.stock} 件
低庫存警示值：${product.lowStockThreshold}
狀態：${product.status === 'active' ? '上架中' : product.status === 'inactive' ? '已下架' : '缺貨'}

統計資訊：
銷售數量：${product.salesCount || 0}
瀏覽次數：${product.viewCount || 0}
評分：${product.rating || 0} / 5

商品描述：
${product.description || '無描述'}

建立時間：${new Date(product.createdAt).toLocaleString('zh-TW')}
更新時間：${new Date(product.updatedAt).toLocaleString('zh-TW')}`);
}

// 編輯商品
function editProduct(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('找不到該商品');
        return;
    }
    
    // TODO: 實現編輯商品表單
    alert('編輯商品功能開發中\n商品 ID: ' + productId);
}

// 新增商品
function openAddProductModal() {
    alert('新增商品功能開發中\n\n請準備：\n- 商品名稱\n- SKU 編號\n- Cyberbiz ID (如適用)\n- 分類\n- 價格與庫存\n- 商品圖片\n- 商品描述');
}

// 刪除商品
function deleteProduct(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('找不到該商品');
        return;
    }
    
    if (confirm(`確定要刪除商品「${product.name}」嗎？\n\n注意：此操作無法復原！\n相關訂單記錄不會被刪除。`)) {
        window.DataStore.delete('products', productId);
        renderProducts();
        alert('已成功刪除商品');
    }
}

// 同步至 Cyberbiz
function syncToCyberbiz(productId) {
    const product = window.DataStore.findById('products', productId);
    if (!product) {
        alert('找不到該商品');
        return;
    }
    
    if (!product.cyberbizId) {
        alert('此商品未設定 Cyberbiz ID');
        return;
    }
    
    // 模擬同步
    alert(`正在同步商品至 Cyberbiz...\n\n商品：${product.name}\nCyberbiz ID：${product.cyberbizId}\n\n注意：實際同步需要 Cyberbiz API 整合`);
    
    // TODO: 實際的 Cyberbiz API 呼叫
    /*
    fetch(`https://your-cyberbiz-api/products/${product.cyberbizId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN'
        },
        body: JSON.stringify({
            name: product.name,
            price: product.price,
            stock: product.stock,
            status: product.status
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('同步成功！');
        console.log('Cyberbiz sync result:', data);
    })
    .catch(error => {
        alert('同步失敗：' + error.message);
    });
    */
}

// 批量操作
function batchDelete() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const productIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (productIds.length === 0) {
        alert('請先選擇要刪除的商品');
        return;
    }
    
    if (confirm(`確定要刪除選中的 ${productIds.length} 個商品嗎？\n\n注意：此操作無法復原！`)) {
        productIds.forEach(id => {
            window.DataStore.delete('products', id);
        });
        renderProducts();
        alert(`已成功刪除 ${productIds.length} 個商品`);
    }
}

function batchUpdateStatus(newStatus) {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const productIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (productIds.length === 0) {
        alert('請先選擇要更新的商品');
        return;
    }
    
    const statusLabels = {
        'active': '上架',
        'inactive': '下架'
    };
    
    if (confirm(`確定要將選中的 ${productIds.length} 個商品${statusLabels[newStatus]}嗎？`)) {
        productIds.forEach(id => {
            window.DataStore.update('products', id, { status: newStatus });
        });
        renderProducts();
        alert(`已成功${statusLabels[newStatus]} ${productIds.length} 個商品`);
    }
}

function batchExport() {
    alert('批量匯出功能開發中');
    // TODO: 實現匯出功能 (CSV/Excel)
}

// 庫存警示檢查
function checkLowStock() {
    const products = getAllProducts();
    const lowStockProducts = products.filter(p => 
        p.stock > 0 && p.stock <= p.lowStockThreshold && p.status === 'active'
    );
    
    if (lowStockProducts.length === 0) {
        alert('目前沒有低庫存商品');
        return;
    }
    
    const message = '低庫存警示：\n\n' + 
        lowStockProducts.map(p => 
            `${p.name} (SKU: ${p.sku})\n目前庫存: ${p.stock} / 警示值: ${p.lowStockThreshold}`
        ).join('\n\n');
    
    alert(message);
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    // 檢查登入
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 渲染商品列表
    renderProducts();
});
