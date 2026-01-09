/**
 * 匠寵 - 訂單管理功能
 * Version: 2.0.0 - 使用 API
 */

// 訂單緩存
let ordersCache = [];
let ordersCacheTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2分鐘緩存

// 獲取所有訂單（從 API）
async function getAllOrders(useCache = false) {
    // 檢查緩存
    if (useCache && ordersCache.length > 0 && (Date.now() - ordersCacheTime < CACHE_DURATION)) {
        return ordersCache;
    }
    
    // 從 API 獲取
    if (window.ApiClient) {
        try {
            const response = await window.ApiClient.getAdminOrders({ limit: 1000 });
            if (response.success && response.data && response.data.orders) {
                ordersCache = response.data.orders;
                ordersCacheTime = Date.now();
                console.log('✅ 從 API 載入訂單:', ordersCache.length, '筆');
                return ordersCache;
            }
        } catch (error) {
            console.error('❌ 載入訂單失敗:', error);
            // 如果有緩存，返回緩存數據
            if (ordersCache.length > 0) {
                console.warn('⚠️ 使用緩存數據');
                return ordersCache;
            }
        }
    }
    
    // 回退到 DataStore（如果有）
    if (window.DataStore) {
        console.warn('⚠️ ApiClient 不可用，使用 DataStore 回退');
        return window.DataStore.getAll('orders') || [];
    }
    
    return [];
}

// 獲取訂單關聯用戶資訊
function getOrderWithUser(order) {
    // 從訂單資料中提取用戶資訊
    return {
        ...order,
        user: {
            name: order.receiverName || '訪客',
            email: order.receiverEmail || '',
            phone: order.receiverPhone || ''
        }
    };
}

// 渲染訂單列表
async function renderOrders(orders = null) {
    if (!orders) {
        orders = await getAllOrders();
    }
    
    // 按日期排序（最新在前）
    orders = orders.sort((a, b) => {
        const dateA = a.orderDate || a.createdAt || 0;
        const dateB = b.orderDate || b.createdAt || 0;
        return dateB - dateA;
    });
    
    const tbody = document.getElementById('orderTableBody');
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-shopping-cart text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">目前沒有訂單資料</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const orderWithUser = getOrderWithUser(order);
        const user = orderWithUser.user;
        
        // 適配不同的日期欄位
        const orderDateValue = order.orderDate || order.createdAt || Date.now();
        const orderDate = new Date(orderDateValue).toLocaleDateString('zh-TW');
        const orderTime = new Date(orderDateValue).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 適配不同的資料結構
        const receiverName = order.receiverName || (order.receiver && order.receiver.name) || '未知';
        const receiverEmail = order.receiverEmail || (order.receiver && order.receiver.email) || '';
        const receiverPhone = order.receiverPhone || (order.receiver && order.receiver.phone) || '';
        const items = order.items || [];
        const total = order.total || 0;
        const subtotal = order.subtotal || 0;
        const shippingFee = order.shippingFee || 0;
        const paymentStatus = order.paymentStatus || (order.payment && order.payment.status) || 'pending';
        const paymentMethod = order.paymentMethod || (order.payment && order.payment.method) || '未指定';
        const shippingMethod = order.shippingMethod || (order.shipping && order.shipping.method) || '未指定';
        const shippingTrackingNumber = order.shippingCourier || (order.shipping && order.shipping.trackingNumber) || '';
        
        // 訂單狀態
        const statusLabels = {
            'pending': '待確認',
            'confirmed': '已確認',
            'processing': '處理中',
            'shipped': '已出貨',
            'delivered': '已送達',
            'completed': '已完成',
            'cancelled': '已取消'
        };
        
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-blue-100 text-blue-800',
            'processing': 'bg-purple-100 text-purple-800',
            'shipped': 'bg-indigo-100 text-indigo-800',
            'delivered': 'bg-green-100 text-green-800',
            'completed': 'bg-gray-100 text-gray-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        
        // 付款狀態
        const paymentStatusLabels = {
            'pending': '待付款',
            'paid': '已付款',
            'failed': '付款失敗',
            'refunded': '已退款'
        };
        
        const paymentStatusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'paid': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-gray-100 text-gray-800'
        };
        
        // 物流方式
        const shippingMethodLabels = {
            'home_delivery': '宅配到府',
            '711_store': '7-11取貨',
            'family_store': '全家取貨',
            'hilife_store': '萊爾富取貨',
            'ok_store': 'OK超商取貨'
        };
        
        return `
        <tr class="table-row">
            <td class="px-6 py-4">
                <input type="checkbox" class="w-4 h-4 text-red-500 border-gray-300 rounded" value="${order.id}">
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold text-blue-600">${order.id ? order.id.substring(0, 8) : 'N/A'}</div>
                <div class="text-xs text-gray-500">${orderDate} ${orderTime}</div>
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold text-gray-800">${receiverName}</div>
                <div class="text-xs text-gray-500">${receiverEmail || user.email}</div>
                <div class="text-xs text-gray-500">${receiverPhone || user.phone}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                    ${items.length} 件商品
                    <div class="text-xs text-gray-400 mt-1">
                        ${items.slice(0, 2).map(item => item.name || '商品').join(', ')}
                        ${items.length > 2 ? '...' : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold text-gray-800">NT$ ${total.toLocaleString()}</div>
                <div class="text-xs text-gray-400">
                    小計: ${subtotal.toLocaleString()} + 運費: ${shippingFee.toLocaleString()}
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${paymentStatusColors[paymentStatus] || paymentStatusColors.pending}">
                    ${paymentStatusLabels[paymentStatus] || paymentStatus}
                </span>
                <div class="text-xs text-gray-400 mt-1">
                    ${paymentMethod}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                    ${shippingMethodLabels[shippingMethod] || shippingMethod}
                </div>
                ${shippingTrackingNumber ? 
                    `<div class="text-xs text-blue-500 mt-1">${shippingTrackingNumber}</div>` : ''}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${statusColors[order.status] || statusColors.pending}">
                    ${statusLabels[order.status] || order.status}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <button onclick='viewOrderDetail("${order.id}")' class="text-blue-600 hover:text-blue-800" title="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick='editOrder("${order.id}")' class="text-green-600 hover:text-green-800" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${order.shipping.trackingNumber ? 
                        `<button onclick='trackShipment("${order.id}")' class="text-purple-600 hover:text-purple-800" title="追蹤物流">
                            <i class="fas fa-truck"></i>
                        </button>` : ''}
                    ${order.status === 'pending' || order.status === 'confirmed' ? 
                        `<button onclick='cancelOrder("${order.id}")' class="text-red-600 hover:text-red-800" title="取消訂單">
                            <i class="fas fa-times"></i>
                        </button>` : ''}
                </div>
            </td>
        </tr>
    `}).join('');
    
    // 更新統計
    updateOrderStats();
}

// 更新訂單統計
function updateOrderStats() {
    const orders = getAllOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // 今日訂單
    const todayOrders = orders.filter(o => o.orderDate >= todayTimestamp);
    
    // 待處理訂單
    const pendingOrders = orders.filter(o => 
        o.status === 'pending' || o.status === 'confirmed'
    );
    
    // 今日營收
    const todayRevenue = todayOrders
        .filter(o => o.payment.status === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
    
    // 本月營收
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
    const monthRevenue = orders
        .filter(o => o.orderDate >= monthStart && o.payment.status === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
    
    // 更新卡片 (如果存在)
    const cards = document.querySelectorAll('.kpi-card .text-3xl');
    if (cards.length >= 4) {
        cards[0].textContent = todayOrders.length;
        cards[1].textContent = pendingOrders.length;
        cards[2].textContent = 'NT$ ' + todayRevenue.toLocaleString();
        cards[3].textContent = 'NT$ ' + monthRevenue.toLocaleString();
    }
}

// 篩選訂單
async function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const paymentStatusFilter = document.getElementById('paymentStatusFilter') ? 
        document.getElementById('paymentStatusFilter').value : '';
    const deliveryStatusFilter = document.getElementById('deliveryStatusFilter') ? 
        document.getElementById('deliveryStatusFilter').value : '';
    const dateRangeFilter = document.getElementById('dateRangeFilter') ? 
        document.getElementById('dateRangeFilter').value : '';
    
    let orders = await getAllOrders(true); // 使用緩存
    
    // 搜尋過濾
    if (searchText) {
        orders = orders.filter(order => {
            const orderWithUser = getOrderWithUser(order);
            const receiverName = order.receiverName || (order.receiver && order.receiver.name) || '';
            const receiverPhone = order.receiverPhone || (order.receiver && order.receiver.phone) || '';
            const trackingNumber = order.shippingCourier || (order.shipping && order.shipping.trackingNumber) || '';
            const email = order.receiverEmail || orderWithUser.user.email || '';
            
            return (order.id && order.id.toLowerCase().includes(searchText)) ||
                   receiverName.toLowerCase().includes(searchText) ||
                   receiverPhone.includes(searchText) ||
                   trackingNumber.toLowerCase().includes(searchText) ||
                   email.toLowerCase().includes(searchText);
        });
    }
    
    // 付款狀態過濾
    if (paymentStatusFilter) {
        orders = orders.filter(order => {
            const status = order.paymentStatus || (order.payment && order.payment.status);
            return status === paymentStatusFilter;
        });
    }
    
    // 物流狀態過濾
    if (deliveryStatusFilter) {
        orders = orders.filter(order => order.status === deliveryStatusFilter);
    }
    
    // 日期範圍過濾
    if (dateRangeFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        orders = orders.filter(o => {
            const orderDate = o.orderDate || o.createdAt || 0;
            if (dateRangeFilter === 'today') {
                return orderDate >= todayTimestamp;
            } else if (dateRangeFilter === 'week') {
                const weekAgo = todayTimestamp - (7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            } else if (dateRangeFilter === 'month') {
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
                return orderDate >= monthStart;
            }
            return true;
        });
    }
    
    await renderOrders(orders);
}

// 重置篩選
async function resetFilters() {
    document.getElementById('searchInput').value = '';
    if (document.getElementById('paymentStatusFilter')) {
        document.getElementById('paymentStatusFilter').value = '';
    }
    if (document.getElementById('deliveryStatusFilter')) {
        document.getElementById('deliveryStatusFilter').value = '';
    }
    if (document.getElementById('dateRangeFilter')) {
        document.getElementById('dateRangeFilter').value = '';
    }
    await renderOrders();
}

// 查看訂單詳情
function viewOrderDetail(orderId) {
    const order = window.DataStore.findById('orders', orderId);
    if (!order) {
        alert('找不到該訂單');
        return;
    }
    
    const orderWithUser = getOrderWithUser(order);
    const items = order.items.map(item => 
        `${item.name} x ${item.quantity} = NT$ ${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    
    const shippingInfo = order.shipping.method === 'home_delivery' ?
        `${order.shipping.city}${order.shipping.district}${order.shipping.address}` :
        `${order.shipping.storeName}\n${order.shipping.storeAddress}`;
    
    alert(`訂單詳情：

訂單編號：${order.id}
訂單時間：${new Date(order.orderDate).toLocaleString('zh-TW')}

收件人資訊：
姓名：${order.receiver.name}
電話：${order.receiver.phone}
Email：${order.receiver.email}

商品明細：
${items}

金額資訊：
小計：NT$ ${order.subtotal.toLocaleString()}
運費：NT$ ${order.shippingFee}
折扣：NT$ ${order.discount}
總計：NT$ ${order.total.toLocaleString()}

配送資訊：
方式：${order.shipping.method}
${shippingInfo}
${order.shipping.trackingNumber ? `追蹤號碼：${order.shipping.trackingNumber}` : ''}

付款資訊：
方式：${order.payment.method}
狀態：${order.payment.status}
${order.payment.transactionId ? `交易編號：${order.payment.transactionId}` : ''}

訂單狀態：${order.status}
${order.notes ? `備註：${order.notes}` : ''}`);
}

// 編輯訂單
function editOrder(orderId) {
    alert('編輯訂單功能開發中\n訂單 ID: ' + orderId);
    // TODO: 實現編輯訂單表單
}

// 追蹤物流
function trackShipment(orderId) {
    const order = window.DataStore.findById('orders', orderId);
    if (!order) {
        alert('找不到該訂單');
        return;
    }
    
    if (!order.shipping.trackingNumber) {
        alert('此訂單尚無追蹤編號');
        return;
    }
    
    alert(`物流追蹤資訊：

訂單編號：${order.id}
追蹤號碼：${order.shipping.trackingNumber}
物流商：${order.shipping.courier}
配送方式：${order.shipping.method}
目前狀態：${order.deliveryStatus}

${order.shipping.shippedAt ? `出貨時間：${new Date(order.shipping.shippedAt).toLocaleString('zh-TW')}` : ''}
${order.shipping.deliveredAt ? `送達時間：${new Date(order.shipping.deliveredAt).toLocaleString('zh-TW')}` : ''}

注意：實際追蹤需要物流商 API 整合`);
    
    // TODO: 實際的物流追蹤 API 呼叫
}

// 取消訂單
function cancelOrder(orderId) {
    const order = window.DataStore.findById('orders', orderId);
    if (!order) {
        alert('找不到該訂單');
        return;
    }
    
    const reason = prompt('請輸入取消原因：');
    if (!reason) return;
    
    if (confirm(`確定要取消訂單「${order.id}」嗎？\n\n注意：此操作無法復原！`)) {
        window.DataStore.update('orders', orderId, {
            status: 'cancelled',
            cancelReason: reason
        });
        renderOrders();
        alert('訂單已取消');
    }
}

// 更新訂單備註
function updateOrderNotes(orderId) {
    const order = window.DataStore.findById('orders', orderId);
    if (!order) {
        alert('找不到該訂單');
        return;
    }
    
    const notes = prompt('請輸入訂單備註：', order.notes || '');
    if (notes === null) return;
    
    window.DataStore.update('orders', orderId, { notes: notes });
    alert('備註已更新');
    renderOrders();
}

// 批量操作
function batchExport() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const orderIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (orderIds.length === 0) {
        alert('請先選擇要匯出的訂單');
        return;
    }
    
    alert(`準備匯出 ${orderIds.length} 筆訂單\n\n功能開發中...`);
    // TODO: 實現匯出功能
}

function batchPrint() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const orderIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (orderIds.length === 0) {
        alert('請先選擇要列印的訂單');
        return;
    }
    
    alert(`準備列印 ${orderIds.length} 筆訂單的出貨單\n\n功能開發中...`);
    // TODO: 實現列印功能
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', async () => {
    // 檢查登入
    const adminToken = localStorage.getItem('admin_token') || localStorage.getItem('auth_token');
    if (!adminToken) {
        const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (!adminUser) {
            alert('請先登入管理員帳號');
            window.location.href = 'admin-login.html';
            return;
        }
    }
    
    // 設置認證令牌
    if (window.ApiClient) {
        window.ApiClient.setToken(adminToken);
    }
    
    // 顯示載入中
    const tbody = document.getElementById('orderTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-4"></i>
                    <p>載入訂單中...</p>
                </td>
            </tr>
        `;
    }
    
    // 載入並渲染訂單列表
    try {
        await renderOrders();
    } catch (error) {
        console.error('❌ 載入訂單失敗:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="px-6 py-12 text-center text-red-500">
                        <i class="fas fa-exclamation-triangle text-2xl mb-4"></i>
                        <p class="text-lg mb-2">載入訂單失敗</p>
                        <p class="text-sm">${error.message}</p>
                        <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            重新載入
                        </button>
                    </td>
                </tr>
            `;
        }
    }
});
