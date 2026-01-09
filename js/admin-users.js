/**
 * 匠寵 - 用戶管理功能
 * Version: 1.0.0
 */

// 獲取所有用戶數據
function getAllUsers() {
    return window.DataStore.getAll('users');
}

// 渲染用戶列表
function renderUsers(users = null) {
    if (!users) {
        users = getAllUsers();
    }
    
    const tbody = document.getElementById('userTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-users text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">目前沒有用戶資料</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = users.map(user => {
        const registeredDate = new Date(user.registeredAt).toLocaleDateString('zh-TW');
        const lastLoginDate = user.lastLoginAt ? 
            new Date(user.lastLoginAt).toLocaleDateString('zh-TW') : '從未登入';
            
        const levelLabels = {
            'normal': '一般會員',
            'silver': '銀卡會員',
            'gold': '金卡會員',
            'platinum': '白金會員'
        };
        
        const levelColors = {
            'normal': 'bg-gray-100 text-gray-700',
            'silver': 'bg-gray-200 text-gray-800',
            'gold': 'bg-yellow-100 text-yellow-800',
            'platinum': 'bg-purple-100 text-purple-800'
        };
        
        return `
        <tr class="table-row">
            <td class="px-6 py-4">
                <input type="checkbox" class="w-4 h-4 text-red-500 border-gray-300 rounded" value="${user.id}">
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                    ${user.avatar ? 
                        `<img src="${user.avatar}" class="w-10 h-10 rounded-full" alt="${user.name}">` :
                        `<div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${user.name.charAt(0)}
                        </div>`
                    }
                    <div>
                        <p class="font-semibold text-gray-800">${user.name}</p>
                        <p class="text-xs text-gray-500">${user.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${user.phone}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs rounded-full ${levelColors[user.memberLevel]}">
                    ${levelLabels[user.memberLevel]}
                </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
                <div>${registeredDate}</div>
                <div class="text-xs text-gray-400">最後登入: ${lastLoginDate}</div>
            </td>
            <td class="px-6 py-4">
                <span class="status-badge status-${user.status}">
                    ${user.status === 'active' ? '啟用' : user.status === 'inactive' ? '停用' : '已暫停'}
                </span>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                    <button onclick='viewUserDetail("${user.id}")' class="text-blue-600 hover:text-blue-800" title="查看詳情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick='editUser("${user.id}")' class="text-green-600 hover:text-green-800" title="編輯">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick='toggleUserStatus("${user.id}")' class="text-orange-600 hover:text-orange-800" title="${user.status === 'active' ? '停用' : '啟用'}">
                        <i class="fas fa-${user.status === 'active' ? 'ban' : 'check-circle'}"></i>
                    </button>
                    <button onclick='deleteUser("${user.id}")' class="text-red-600 hover:text-red-800" title="刪除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    // 更新統計
    updateUserStats();
}

// 更新統計資訊
function updateUserStats() {
    const users = getAllUsers();
    const activeUsers = users.filter(u => u.status === 'active');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    const newUsersThisMonth = users.filter(u => {
        const date = new Date(u.registeredAt);
        return date.getMonth() === today.getMonth() && 
               date.getFullYear() === today.getFullYear();
    }).length;
    
    const activeInLast30Days = users.filter(u => {
        return u.lastLoginAt && (Date.now() - u.lastLoginAt) < (30 * 24 * 60 * 60 * 1000);
    }).length;
    
    const inactiveUsers = users.filter(u => u.status === 'inactive' || u.status === 'suspended').length;
    
    // 更新卡片 (如果存在)
    const cards = document.querySelectorAll('.kpi-card .text-3xl');
    if (cards.length >= 4) {
        cards[0].textContent = users.length.toLocaleString();
        cards[1].textContent = newUsersThisMonth;
        cards[2].textContent = activeInLast30Days;
        cards[3].textContent = inactiveUsers;
    }
}

// 篩選用戶
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const levelFilter = document.getElementById('levelFilter') ? 
        document.getElementById('levelFilter').value : '';
    
    let users = getAllUsers();
    
    // 搜尋過濾
    if (searchText) {
        users = users.filter(user => 
            user.name.toLowerCase().includes(searchText) ||
            user.email.toLowerCase().includes(searchText) ||
            user.phone.includes(searchText)
        );
    }
    
    // 狀態過濾
    if (statusFilter) {
        users = users.filter(user => user.status === statusFilter);
    }
    
    // 會員等級過濾
    if (levelFilter) {
        users = users.filter(user => user.memberLevel === levelFilter);
    }
    
    renderUsers(users);
}

// 重置篩選
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    if (document.getElementById('levelFilter')) {
        document.getElementById('levelFilter').value = '';
    }
    renderUsers();
}

// 查看用戶詳情
function viewUserDetail(userId) {
    const user = window.DataStore.findById('users', userId);
    if (!user) {
        alert('找不到該用戶');
        return;
    }
    
    const levelLabels = {
        'normal': '一般會員',
        'silver': '銀卡會員',
        'gold': '金卡會員',
        'platinum': '白金會員'
    };
    
    const petInfo = user.pets && user.pets.length > 0 ? 
        user.pets.map(pet => `${pet.name} (${pet.breed}, ${pet.age}歲)`).join('\n') :
        '無寵物資料';
    
    alert(`用戶詳情：

姓名：${user.name}
Email：${user.email}
電話：${user.phone}
LINE ID：${user.lineId || '未綁定'}
會員等級：${levelLabels[user.memberLevel]}
狀態：${user.status === 'active' ? '啟用' : '停用'}

統計資訊：
註冊時間：${new Date(user.registeredAt).toLocaleString('zh-TW')}
最後登入：${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('zh-TW') : '從未登入'}
總訂單數：${user.totalOrders}
總消費金額：NT$ ${user.totalSpent.toLocaleString()}
完成測驗數：${user.quizCompleted}

寵物資訊：
${petInfo}`);
}

// 編輯用戶
function editUser(userId) {
    alert('編輯用戶功能開發中\n用戶 ID: ' + userId);
    // TODO: 實現編輯用戶表單
}

// 切換用戶狀態
function toggleUserStatus(userId) {
    const user = window.DataStore.findById('users', userId);
    if (!user) {
        alert('找不到該用戶');
        return;
    }
    
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '啟用' : '停用';
    
    if (confirm(`確定要${action}用戶「${user.name}」嗎？`)) {
        window.DataStore.update('users', userId, { status: newStatus });
        renderUsers();
        alert(`已成功${action}用戶`);
    }
}

// 刪除用戶
function deleteUser(userId) {
    const user = window.DataStore.findById('users', userId);
    if (!user) {
        alert('找不到該用戶');
        return;
    }
    
    if (confirm(`確定要刪除用戶「${user.name}」嗎？\n\n注意：此操作無法復原！`)) {
        window.DataStore.delete('users', userId);
        renderUsers();
        alert('已成功刪除用戶');
    }
}

// 批量操作
function batchDelete() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const userIds = Array.from(checkboxes)
        .filter(cb => cb.value)
        .map(cb => cb.value);
    
    if (userIds.length === 0) {
        alert('請先選擇要刪除的用戶');
        return;
    }
    
    if (confirm(`確定要刪除選中的 ${userIds.length} 個用戶嗎？\n\n注意：此操作無法復原！`)) {
        userIds.forEach(id => {
            window.DataStore.delete('users', id);
        });
        renderUsers();
        alert(`已成功刪除 ${userIds.length} 個用戶`);
    }
}

function batchExport() {
    alert('批量匯出功能開發中');
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
    
    // 渲染用戶列表
    renderUsers();
});
