/**
 * 匠寵 - 訂單管理功能
 * Version: 1.0.0
 */

// 獲取所有訂單
function getAllOrders() {
    return window.DataStore.getAll('orders');
}

// 獲取訂單關聯用戶資訊
function getOrderWithUser(order) {
    const user = window.DataStore.findById('users', order.userId);
    return {
        ...order,
        user: user || { name: '訪客', email: '', phone: '' }
    };
}

// 渲染訂單列表
function renderOrders(orders = null) {
    if (!orders) {
        orders = getAllOrders();
    }
    
    // 按日期排序（最新在前）
    orders = orders.sort((a, b) => b.orderDate - a.orderDate);
    
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
        
        const orderDate = new Date(order.orderDate).toLocaleDateString('zh-TW');
        const orderTime = new Date(order.orderDate).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
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
                <div class="font-semibold text-blue-600">${order.id.substring(0, 8)}</div>
                <div class="text-xs text-gray-500">${orderDate} ${orderTime}</div>
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold text-gray-800">${order.receiver.name}</div>
                <div class="text-xs text-gray-500">${user.email}</div>
                <div class="text-xs text-gray-500">${order.receiver.phone}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                    ${order.items.length} 件商品
                    <div class="text-xs text-gray-400 mt-1">
                        ${order.items.slice(0, 2).map(item => item.name).join(', ')}
                        ${order.items.length > 2 ? '...' : ''}
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="font-semibold text-gray-800">NT$ ${order.total.toLocaleString()}</div>
                <div class="text-xs text-gray-400">
                    小計: ${order.subtotal.toLocaleString()} + 運費: ${order.shippingFee}
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${paymentStatusColors[order.payment.status]}">
                    ${paymentStatusLabels[order.payment.status]}
                </span>
                <div class="text-xs text-gray-400 mt-1">
                    ${order.payment.method || '未指定'}
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-600">
                    ${shippingMethodLabels[order.shipping.method] || order.shipping.method}
                </div>
                ${order.shipping.trackingNumber ? 
                    `<div class="text-xs text-blue-500 mt-1">${order.shipping.trackingNumber}</div>` : ''}
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${statusColors[order.status]}">
                    ${statusLabels[order.status]}
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
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const paymentStatusFilter = document.getElementById('paymentStatusFilter') ? 
        document.getElementById('paymentStatusFilter').value : '';
    const deliveryStatusFilter = document.getElementById('deliveryStatusFilter') ? 
        document.getElementById('deliveryStatusFilter').value : '';
    const dateRangeFilter = document.getElementById('dateRangeFilter') ? 
        document.getElementById('dateRangeFilter').value : '';
    
    let orders = getAllOrders();
    
    // 搜尋過濾
    if (searchText) {
        orders = orders.filter(order => {
            const orderWithUser = getOrderWithUser(order);
            return order.id.toLowerCase().includes(searchText) ||
                   order.receiver.name.toLowerCase().includes(searchText) ||
                   order.receiver.phone.includes(searchText) ||
                   (order.shipping.trackingNumber && order.shipping.trackingNumber.toLowerCase().includes(searchText)) ||
                   orderWithUser.user.email.toLowerCase().includes(searchText);
        });
    }
    
    // 付款狀態過濾
    if (paymentStatusFilter) {
        orders = orders.filter(order => order.payment.status === paymentStatusFilter);
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
        
        if (dateRangeFilter === 'today') {
            orders = orders.filter(o => o.orderDate >= todayTimestamp);
        } else if (dateRangeFilter === 'week') {
            const weekAgo = todayTimestamp - (7 * 24 * 60 * 60 * 1000);
            orders = orders.filter(o => o.orderDate >= weekAgo);
        } else if (dateRangeFilter === 'month') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
            orders = orders.filter(o => o.orderDate >= monthStart);
        }
    }
    
    renderOrders(orders);
}

// 重置篩選
function resetFilters() {
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
    renderOrders();
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
window.addEventListener('DOMContentLoaded', () => {
    // 檢查登入
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 渲染訂單列表
    renderOrders();
});
