/**
 * 匠寵 - 測驗系統整合
 * Version: 1.0.0
 */

// 保存測驗結果
function saveQuizResult(quizData) {
    if (!window.DataStore) {
        console.error('DataStore not available');
        return null;
    }
    
    // 獲取當前用戶 (如果有登入)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    const quizResult = {
        userId: currentUser ? currentUser.id : 'guest',
        quizType: quizData.quizType, // 'nutrition' or 'toy'
        petInfo: quizData.petInfo || {},
        answers: quizData.answers || {},
        result: quizData.result || {},
        completedAt: Date.now()
    };
    
    // 保存至數據系統
    const saved = window.DataStore.add('quizResults', quizResult);
    
    // 如果有用戶，更新用戶的測驗完成數
    if (currentUser) {
        const user = window.DataStore.findById('users', currentUser.id);
        if (user) {
            window.DataStore.update('users', currentUser.id, {
                quizCompleted: (user.quizCompleted || 0) + 1
            });
        }
    }
    
    console.log('✅ Quiz result saved:', saved);
    return saved;
}

// 獲取測驗結果
function getQuizResults(userId = null) {
    if (!window.DataStore) {
        return [];
    }
    
    let results = window.DataStore.getAll('quizResults');
    
    if (userId) {
        results = results.filter(r => r.userId === userId);
    }
    
    // 按完成時間排序 (最新在前)
    return results.sort((a, b) => b.completedAt - a.completedAt);
}

// 渲染測驗統計 (後台用)
function renderQuizStats() {
    const results = getQuizResults();
    
    if (results.length === 0) {
        return {
            total: 0,
            byType: {},
            byCategory: {},
            recent: []
        };
    }
    
    // 統計資料
    const stats = {
        total: results.length,
        byType: {},
        byCategory: {},
        byDate: {},
        recent: results.slice(0, 10)
    };
    
    // 按測驗類型統計
    results.forEach(result => {
        // 類型統計
        if (!stats.byType[result.quizType]) {
            stats.byType[result.quizType] = 0;
        }
        stats.byType[result.quizType]++;
        
        // 結果分類統計
        const category = result.result.category;
        if (category) {
            if (!stats.byCategory[category]) {
                stats.byCategory[category] = 0;
            }
            stats.byCategory[category]++;
        }
        
        // 日期統計
        const date = new Date(result.completedAt).toLocaleDateString('zh-TW');
        if (!stats.byDate[date]) {
            stats.byDate[date] = 0;
        }
        stats.byDate[date]++;
    });
    
    return stats;
}

// 渲染測驗列表 (後台用)
function renderQuizList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }
    
    const results = getQuizResults();
    
    if (results.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <i class="fas fa-clipboard-list text-4xl mb-4 text-gray-300"></i>
                    <p class="text-lg">目前沒有測驗記錄</p>
                </td>
            </tr>
        `;
        return;
    }
    
    container.innerHTML = results.map(result => {
        const quizTypeLabels = {
            'nutrition': '營養測驗',
            'toy': '玩具測驗'
        };
        
        const completedDate = new Date(result.completedAt).toLocaleDateString('zh-TW');
        const completedTime = new Date(result.completedAt).toLocaleTimeString('zh-TW', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // 獲取用戶資訊
        let userName = '訪客';
        if (result.userId !== 'guest' && window.DataStore) {
            const user = window.DataStore.findById('users', result.userId);
            if (user) {
                userName = user.name;
            }
        }
        
        return `
            <tr class="table-row">
                <td class="px-6 py-4">
                    <div class="font-semibold text-blue-600">${result.id.substring(0, 8)}</div>
                    <div class="text-xs text-gray-500">${completedDate} ${completedTime}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-semibold text-gray-800">${userName}</div>
                    ${result.userId !== 'guest' ? 
                        `<div class="text-xs text-gray-500">ID: ${result.userId.substring(0, 8)}</div>` : 
                        `<div class="text-xs text-gray-500">未登入</div>`
                    }
                </td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        ${quizTypeLabels[result.quizType] || result.quizType}
                    </span>
                </td>
                <td class="px-6 py-4">
                    ${result.petInfo && result.petInfo.name ? `
                        <div class="font-semibold text-gray-800">${result.petInfo.name}</div>
                        <div class="text-xs text-gray-500">
                            ${result.petInfo.breed || ''} ${result.petInfo.age ? `· ${result.petInfo.age}歲` : ''}
                        </div>
                    ` : '<span class="text-gray-400">未填寫</span>'}
                </td>
                <td class="px-6 py-4">
                    ${result.result && result.result.category ? `
                        <div class="font-semibold text-gray-800">${result.result.category}</div>
                        ${result.result.score ? `
                            <div class="text-xs text-gray-500">分數: ${result.result.score}</div>
                        ` : ''}
                    ` : '<span class="text-gray-400">無結果</span>'}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center space-x-2">
                        <button onclick='viewQuizDetail("${result.id}")' class="text-blue-600 hover:text-blue-800" title="查看詳情">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick='deleteQuizResult("${result.id}")' class="text-red-600 hover:text-red-800" title="刪除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 查看測驗詳情
function viewQuizDetail(resultId) {
    const result = window.DataStore.findById('quizResults', resultId);
    if (!result) {
        alert('找不到該測驗記錄');
        return;
    }
    
    const quizTypeLabels = {
        'nutrition': '營養測驗',
        'toy': '玩具測驗'
    };
    
    let userName = '訪客';
    if (result.userId !== 'guest' && window.DataStore) {
        const user = window.DataStore.findById('users', result.userId);
        if (user) {
            userName = user.name;
        }
    }
    
    const petInfo = result.petInfo && result.petInfo.name ?
        `寵物名稱：${result.petInfo.name}
品種：${result.petInfo.breed || '未填寫'}
年齡：${result.petInfo.age || '未填寫'} 歲
體重：${result.petInfo.weight || '未填寫'} kg
活動量：${result.petInfo.activityLevel || '未填寫'}` :
        '未填寫寵物資訊';
    
    const recommendations = result.result && result.result.recommendations ?
        result.result.recommendations.join(', ') :
        '無推薦商品';
    
    alert(`測驗詳情：

測驗編號：${result.id}
完成時間：${new Date(result.completedAt).toLocaleString('zh-TW')}
測驗類型：${quizTypeLabels[result.quizType] || result.quizType}
用戶：${userName}

${petInfo}

測驗結果：
分類：${result.result?.category || '無'}
分數：${result.result?.score || '無'}
推薦商品：${recommendations}`);
}

// 刪除測驗結果
function deleteQuizResult(resultId) {
    if (confirm('確定要刪除此測驗記錄嗎？\n\n注意：此操作無法復原！')) {
        window.DataStore.delete('quizResults', resultId);
        renderQuizList('quizTableBody');
        alert('已成功刪除測驗記錄');
    }
}

// 匯出測驗數據
function exportQuizData() {
    const results = getQuizResults();
    
    if (results.length === 0) {
        alert('沒有測驗數據可匯出');
        return;
    }
    
    // 轉換為 CSV 格式
    const headers = ['測驗ID', '完成時間', '用戶', '測驗類型', '寵物名稱', '品種', '年齡', '結果分類', '分數'];
    const rows = results.map(result => {
        let userName = '訪客';
        if (result.userId !== 'guest' && window.DataStore) {
            const user = window.DataStore.findById('users', result.userId);
            if (user) userName = user.name;
        }
        
        return [
            result.id,
            new Date(result.completedAt).toLocaleString('zh-TW'),
            userName,
            result.quizType,
            result.petInfo?.name || '',
            result.petInfo?.breed || '',
            result.petInfo?.age || '',
            result.result?.category || '',
            result.result?.score || ''
        ].map(cell => `"${cell}"`).join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    
    // 下載 CSV
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz_results_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('測驗數據已匯出為 CSV 檔案');
}

// 導出函數
window.QuizSystem = {
    saveQuizResult,
    getQuizResults,
    renderQuizStats,
    renderQuizList,
    viewQuizDetail,
    deleteQuizResult,
    exportQuizData
};
