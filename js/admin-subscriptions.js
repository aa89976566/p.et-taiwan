/**
 * 匠寵 - 訂閱管理功能
 * Version: 1.0.0
 */

// 獲取所有訂閱
function getAllSubscriptions() {
    return window.DataStore.getAll('subscriptions');
}

// 渲染訂閱列表
function renderSubscriptions(subscriptions = null) {
    if (!subscriptions) {
        subscriptions = getAllSubscriptions();
    }
    
    // 按開始日期排序（最新在前）
    subscriptions = subscriptions.sort((a, b) => b.startDate - a.startDate);
    
    const tbody = document.getElementById('subscriptionTableBody');
    
    if (!tbody) {
        console.error('Table body not found');
        return;
    }
    
    if (subscriptions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-sync-alt text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">目前沒有訂閱記錄</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = subscriptions.map(subscription => {
        // 獲取用戶資訊
        const user = window.DataStore.findById('users', subscription.userId);
        const userName = user ? user.name : '未知用戶';
        const userEmail = user ? user.email : '';
        
        // 狀態標籤
        const statusLabels = {
            'active': '進行中',
            'paused': '已暫停',
            'cancelled': '已取消'
        };
        
        const statusColors = {
            'active': 'bg-green-100 text-green-800',
            'paused': 'bg-orange-100 text-orange-800',
            'cancelled': 'bg-gray-100 text-gray-800'
        };
        
        // 頻率標籤
        const frequencyLabels = {
            'weekly': '每週配送',
            'biweekly': '雙週配送',
            'monthly': '每月配送'
        };
        
        // 計算剩餘配送次數
        const remainingDeliveries = subscription.totalDeliveries > 0 ?
            subscription.totalDeliveries - subscription.deliveryCount : '無限';
        
        // 下次配送日期
        const nextDelivery = subscription.status === 'active' && subscription.nextDeliveryDate ?
            new Date(subscription.nextDeliveryDate).toLocaleDateString('zh-TW') : '-';
        
        // 開始日期
        const startDate = new Date(subscription.startDate).toLocaleDateString('zh-TW');
        
        return `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <input type="checkbox" class="w-4 h-4 text-red-500 border-gray-300 rounded" value="${subscription.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-blue-600">${subscription.id.substring(0, 8)}</div>
                    <div class="text-xs text-gray-500">${startDate}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">${userName}</div>
                    <div class="text-xs text-gray-500">${userEmail}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">${subscription.planName}</div>
                    <div class="text-xs text-gray-500">方案 ID: ${subscription.planId}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">${frequencyLabels[subscription.frequency]}</div>
                    <div class="text-xs text-gray-500">數量: ${subscription.quantity}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">NT$ ${subscription.price.toLocaleString()}</div>
                    <div class="text-xs text-gray-500">每次配送</div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-600">
                        已配送: ${subscription.deliveryCount}
                    </div>
                    <div class="text-xs text-gray-500">
                        剩餘: ${remainingDeliveries}
                    </div>
                </td>
                <td class="px-6 py-4">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColors[subscription.status]}">
                        ${statusLabels[subscription.status]}
                    </span>
                    ${subscription.status === 'active' ? `
                        <div class="text-xs text-gray-500 mt-1">
                            下次: ${nextDelivery}
                        </div>
                    ` : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick='viewSubscriptionDetail("${subscription.id}")' 
                            class="text-blue-600 hover:text-blue-800" title="查看詳情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick='editSubscription("${subscription.id}")' 
                            class="text-green-600 hover:text-green-800" title="編輯">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${subscription.status === 'active' ? `
                            <button onclick='pauseSubscription("${subscription.id}")' 
                                class="text-orange-600 hover:text-orange-800" title="暫停">
                                <i class="fas fa-pause"></i>
                            </button>
                        ` : subscription.status === 'paused' ? `
                            <button onclick='resumeSubscription("${subscription.id}")' 
                                class="text-green-600 hover:text-green-800" title="恢復">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : ''}
                        ${subscription.status !== 'cancelled' ? `
                            <button onclick='cancelSubscription("${subscription.id}")' 
                                class="text-red-600 hover:text-red-800" title="取消">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 更新統計
    updateSubscriptionStats();
}

// 更新訂閱統計
function updateSubscriptionStats() {
    const subscriptions = getAllSubscriptions();
    
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
    const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;
    
    // 計算月收入
    const monthlyRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => {
            const multiplier = s.frequency === 'weekly' ? 4 :
                              s.frequency === 'biweekly' ? 2 : 1;
            return sum + (s.price * multiplier);
        }, 0);
    
    // 更新卡片
    const cards = document.querySelectorAll('.kpi-card .text-3xl');
    if (cards.length >= 4) {
        cards[0].textContent = subscriptions.length;
        cards[1].textContent = activeCount;
        cards[2].textContent = pausedCount;
        cards[3].textContent = 'NT$ ' + monthlyRevenue.toLocaleString();
    }
}

// 篩選訂閱
function applyFilters() {
    const searchText = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const frequencyFilter = document.getElementById('frequencyFilter')?.value || '';
    
    let subscriptions = getAllSubscriptions();
    
    // 搜尋過濾
    if (searchText) {
        subscriptions = subscriptions.filter(subscription => {
            const user = window.DataStore.findById('users', subscription.userId);
            const userName = user ? user.name.toLowerCase() : '';
            const userEmail = user ? user.email.toLowerCase() : '';
            
            return subscription.planName.toLowerCase().includes(searchText) ||
                   subscription.planId.toLowerCase().includes(searchText) ||
                   userName.includes(searchText) ||
                   userEmail.includes(searchText);
        });
    }
    
    // 狀態過濾
    if (statusFilter) {
        subscriptions = subscriptions.filter(s => s.status === statusFilter);
    }
    
    // 頻率過濾
    if (frequencyFilter) {
        subscriptions = subscriptions.filter(s => s.frequency === frequencyFilter);
    }
    
    renderSubscriptions(subscriptions);
}

// 重置篩選
function resetFilters() {
    if (document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = '';
    }
    if (document.getElementById('statusFilter')) {
        document.getElementById('statusFilter').value = '';
    }
    if (document.getElementById('frequencyFilter')) {
        document.getElementById('frequencyFilter').value = '';
    }
    renderSubscriptions();
}

// 查看訂閱詳情
function viewSubscriptionDetail(subscriptionId) {
    const subscription = window.DataStore.findById('subscriptions', subscriptionId);
    if (!subscription) {
        alert('找不到該訂閱');
        return;
    }
    
    const user = window.DataStore.findById('users', subscription.userId);
    const userName = user ? user.name : '未知用戶';
    
    const frequencyLabels = {
        'weekly': '每週配送',
        'biweekly': '雙週配送',
        'monthly': '每月配送'
    };
    
    const statusLabels = {
        'active': '進行中',
        'paused': '已暫停',
        'cancelled': '已取消'
    };
    
    alert(`訂閱詳情：

訂閱編號：${subscription.id}
用戶：${userName}
方案名稱：${subscription.planName}
方案 ID：${subscription.planId}

配送資訊：
頻率：${frequencyLabels[subscription.frequency]}
數量：${subscription.quantity}
單次價格：NT$ ${subscription.price.toLocaleString()}

狀態：${statusLabels[subscription.status]}
開始日期：${new Date(subscription.startDate).toLocaleDateString('zh-TW')}
${subscription.status === 'active' ? `下次配送：${new Date(subscription.nextDeliveryDate).toLocaleDateString('zh-TW')}` : ''}
${subscription.endDate ? `結束日期：${new Date(subscription.endDate).toLocaleDateString('zh-TW')}` : ''}

配送統計：
已配送次數：${subscription.deliveryCount}
總配送次數：${subscription.totalDeliveries > 0 ? subscription.totalDeliveries : '無限'}

配送地址：
${subscription.shippingAddress.name}
${subscription.shippingAddress.phone}
${subscription.shippingAddress.zipCode} ${subscription.shippingAddress.city}${subscription.shippingAddress.district}
${subscription.shippingAddress.address}

付款方式：${subscription.paymentMethod}
自動續訂：${subscription.autoRenew ? '是' : '否'}`);
}

// 編輯訂閱
function editSubscription(subscriptionId) {
    alert('編輯訂閱功能開發中\n訂閱 ID: ' + subscriptionId);
    // TODO: 實現編輯訂閱表單
}

// 暫停訂閱
function pauseSubscription(subscriptionId) {
    if (confirm('確定要暫停此訂閱嗎？\n\n暫停後可以隨時恢復。')) {
        window.DataStore.update('subscriptions', subscriptionId, {
            status: 'paused'
        });
        renderSubscriptions();
        alert('訂閱已暫停');
    }
}

// 恢復訂閱
function resumeSubscription(subscriptionId) {
    const subscription = window.DataStore.findById('subscriptions', subscriptionId);
    if (!subscription) return;
    
    // 計算下次配送日期
    const now = Date.now();
    const daysToAdd = subscription.frequency === 'weekly' ? 7 :
                     subscription.frequency === 'biweekly' ? 14 : 30;
    const nextDelivery = now + (daysToAdd * 24 * 60 * 60 * 1000);
    
    if (confirm('確定要恢復此訂閱嗎？')) {
        window.DataStore.update('subscriptions', subscriptionId, {
            status: 'active',
            nextDeliveryDate: nextDelivery
        });
        renderSubscriptions();
        alert('訂閱已恢復');
    }
}

// 取消訂閱
function cancelSubscription(subscriptionId) {
    if (confirm('確定要取消此訂閱嗎？\n\n取消後將無法恢復，但已配送的商品不受影響。')) {
        window.DataStore.update('subscriptions', subscriptionId, {
            status: 'cancelled',
            endDate: Date.now()
        });
        renderSubscriptions();
        alert('訂閱已取消');
    }
}

// 批量操作
function batchExport() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const subscriptionIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (subscriptionIds.length === 0) {
        alert('請先選擇要匯出的訂閱');
        return;
    }
    
    alert(`準備匯出 ${subscriptionIds.length} 筆訂閱\n\n功能開發中...`);
    // TODO: 實現匯出功能
}

// 頁面載入時初始化
window.addEventListener('DOMContentLoaded', () => {
    // 檢查登入
    const adminUser = JSON.parse(localStorage.getItem('adminUser'));
    if (!adminUser) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // 渲染訂閱列表
    if (document.getElementById('subscriptionTableBody')) {
        renderSubscriptions();
    }
});
