/**
 * 匠寵 - 統一數據管理系統
 * 前後台數據同步與一致性管理
 * Version: 1.0.0
 * Date: 2024-12-21
 */

// ==================== 數據結構定義 ====================

/**
 * 統一數據結構
 */
const DataSchema = {
    // 用戶數據結構
    User: {
        id: '',                 // 用戶 ID (UUID)
        email: '',              // Email
        name: '',               // 姓名
        phone: '',              // 電話
        avatar: '',             // 頭像 URL
        lineId: '',             // LINE ID
        memberLevel: '',        // 會員等級: normal, silver, gold, platinum
        status: '',             // 狀態: active, inactive, suspended
        registeredAt: 0,        // 註冊時間 (timestamp)
        lastLoginAt: 0,         // 最後登入時間
        totalOrders: 0,         // 總訂單數
        totalSpent: 0,          // 總消費金額
        quizCompleted: 0,       // 完成測驗數
        pets: []                // 寵物資料 [{name, type, breed, age, ...}]
    },

    // 商品數據結構
    Product: {
        id: '',                 // 商品 ID
        name: '',               // 商品名稱
        sku: '',                // SKU 編號
        cyberbizId: '',         // Cyberbiz 商品 ID
        category: '',           // 分類: snacks, toys, subscription, crowdfunding
        price: 0,               // 售價
        originalPrice: 0,       // 原價
        stock: 0,               // 庫存數量
        lowStockThreshold: 10,  // 低庫存警示值
        status: '',             // 狀態: active, inactive, out_of_stock
        imageUrl: '',           // 商品圖片
        description: '',        // 商品描述
        variants: [],           // 規格選項 [{name, price, stock}]
        salesCount: 0,          // 銷售數量
        viewCount: 0,           // 瀏覽次數
        rating: 0,              // 評分 (1-5)
        createdAt: 0,           // 建立時間
        updatedAt: 0            // 更新時間
    },

    // 訂單數據結構
    Order: {
        id: '',                 // 訂單編號
        userId: '',             // 用戶 ID
        orderDate: 0,           // 訂單日期 (timestamp)
        items: [],              // 商品項目 [{productId, name, price, quantity, variant}]
        subtotal: 0,            // 小計
        shippingFee: 0,         // 運費
        discount: 0,            // 折扣
        total: 0,               // 總金額
        
        // 收件人資訊
        receiver: {
            name: '',           // 收件人姓名
            phone: '',          // 收件人電話
            email: ''           // 收件人 Email
        },
        
        // 配送資訊
        shipping: {
            method: '',         // 配送方式: home_delivery, 711_store, family_store, hilife_store, ok_store
            courier: '',        // 物流商: black_cat, hsinchu, post_office, t_cat
            address: '',        // 配送地址
            city: '',           // 城市
            district: '',       // 區域
            zipCode: '',        // 郵遞區號
            storeId: '',        // 超商店號
            storeName: '',      // 超商店名
            storeAddress: '',   // 超商地址
            deliveryInfo: {},   // 物流詳細資訊
            estimatedDays: 0,   // 預計到貨天數
            trackingNumber: '', // 追蹤編號
            shippedAt: 0,       // 出貨時間
            deliveredAt: 0      // 到貨時間
        },
        
        // 付款資訊
        payment: {
            method: '',         // 付款方式: credit_card, atm, cvs_code, line_pay, apple_pay, cod
            status: '',         // 付款狀態: pending, paid, failed, refunded
            paidAt: 0,          // 付款時間
            transactionId: '',  // 交易編號
            ecpayTradeNo: ''    // 綠界交易編號
        },
        
        // 訂單狀態
        status: '',             // 訂單狀態: pending, confirmed, processing, shipped, delivered, completed, cancelled
        deliveryStatus: '',     // 物流狀態: pending, preparing, shipped, in_transit, arrived, picked_up, delivered
        
        // 其他資訊
        notes: '',              // 訂單備註
        cancelReason: '',       // 取消原因
        refundReason: '',       // 退款原因
        
        // 時間戳記
        createdAt: 0,           // 建立時間
        updatedAt: 0,           // 更新時間
        completedAt: 0          // 完成時間
    },

    // 測驗數據結構
    QuizResult: {
        id: '',                 // 測驗 ID
        userId: '',             // 用戶 ID
        quizType: '',           // 測驗類型: nutrition, toy
        petInfo: {              // 寵物資訊
            name: '',
            type: '',           // 類型: dog, cat
            breed: '',          // 品種
            age: 0,             // 年齡
            weight: 0,          // 體重
            activityLevel: '',  // 活動量
            healthIssues: []    // 健康問題
        },
        answers: {},            // 答案記錄
        result: {               // 測驗結果
            category: '',       // 結果分類
            score: 0,           // 分數
            recommendations: [] // 推薦商品
        },
        completedAt: 0,         // 完成時間
        createdAt: 0            // 建立時間
    },

    // 訂閱數據結構
    Subscription: {
        id: '',                 // 訂閱 ID
        userId: '',             // 用戶 ID
        planId: '',             // 方案 ID
        planName: '',           // 方案名稱
        productId: '',          // 商品 ID
        frequency: '',          // 配送頻率: monthly, biweekly, weekly
        quantity: 1,            // 數量
        price: 0,               // 單次價格
        status: '',             // 狀態: active, paused, cancelled
        nextDeliveryDate: 0,    // 下次配送日期
        startDate: 0,           // 開始日期
        endDate: 0,             // 結束日期 (如適用)
        deliveryCount: 0,       // 已配送次數
        totalDeliveries: 0,     // 總配送次數 (如適用)
        shippingAddress: {},    // 配送地址
        paymentMethod: '',      // 付款方式
        autoRenew: true,        // 自動續訂
        createdAt: 0,           // 建立時間
        updatedAt: 0            // 更新時間
    }
};

// ==================== 數據存儲管理 ====================

class DataStore {
    constructor() {
        this.storageKey = 'jiangchong_data';
        this.init();
    }

    /**
     * 初始化數據存儲
     */
    init() {
        const data = this.getData();
        if (!data.users) data.users = [];
        if (!data.products) data.products = [];
        if (!data.orders) data.orders = [];
        if (!data.quizResults) data.quizResults = [];
        if (!data.subscriptions) data.subscriptions = [];
        if (!data.settings) data.settings = this.getDefaultSettings();
        this.saveData(data);
    }

    /**
     * 獲取所有數據
     */
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('獲取數據失敗:', error);
            return {};
        }
    }

    /**
     * 保存數據
     */
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存數據失敗:', error);
            return false;
        }
    }

    /**
     * 獲取默認設定
     */
    getDefaultSettings() {
        return {
            // 網站設定
            siteName: '匠寵 - 寵物循環經濟平台',
            siteUrl: 'https://your-domain.com',
            contactEmail: 'service@jiangchong.com',
            
            // LINE 設定
            lineOfficialAccount: '@jiangchong',
            lineAddFriendUrl: 'https://line.me/R/ti/p/@jiangchong',
            lineQRCodeUrl: 'https://www.genspark.ai/api/files/s/p1ymWhU0',
            
            // Cyberbiz 設定
            cyberbizShopUrl: 'https://a89976566.cyberbiz.co',
            cyberbizEnabled: true,
            
            // ECPay 設定
            ecpayMerchantId: 'YOUR_MERCHANT_ID',
            ecpayHashKey: 'YOUR_HASH_KEY',
            ecpayHashIV: 'YOUR_HASH_IV',
            ecpayEnabled: false,  // 需後端配合
            
            // 物流設定
            shippingMethods: {
                home_delivery: {
                    enabled: true,
                    name: '宅配到府',
                    fee: 60,
                    freeShippingThreshold: 1000,
                    estimatedDays: '2-3'
                },
                store_pickup: {
                    enabled: true,
                    name: '超商取貨',
                    fee: 60,
                    freeShippingThreshold: 0,
                    estimatedDays: '2-4'
                }
            },
            
            // 庫存警示
            lowStockThreshold: 10,
            
            // 會員等級設定
            memberLevels: {
                normal: { name: '一般會員', discount: 0 },
                silver: { name: '銀卡會員', discount: 0.05, minSpent: 5000 },
                gold: { name: '金卡會員', discount: 0.1, minSpent: 10000 },
                platinum: { name: '白金會員', discount: 0.15, minSpent: 30000 }
            }
        };
    }

    // ==================== CRUD 操作 ====================

    /**
     * 新增記錄
     */
    add(collection, item) {
        const data = this.getData();
        if (!data[collection]) data[collection] = [];
        
        // 生成 ID
        if (!item.id) {
            item.id = this.generateId();
        }
        
        // 添加時間戳記
        const now = Date.now();
        item.createdAt = now;
        item.updatedAt = now;
        
        data[collection].push(item);
        this.saveData(data);
        
        return item;
    }

    /**
     * 更新記錄
     */
    update(collection, id, updates) {
        const data = this.getData();
        if (!data[collection]) return null;
        
        const index = data[collection].findIndex(item => item.id === id);
        if (index === -1) return null;
        
        // 更新時間戳記
        updates.updatedAt = Date.now();
        
        data[collection][index] = {
            ...data[collection][index],
            ...updates
        };
        
        this.saveData(data);
        return data[collection][index];
    }

    /**
     * 刪除記錄
     */
    delete(collection, id) {
        const data = this.getData();
        if (!data[collection]) return false;
        
        const index = data[collection].findIndex(item => item.id === id);
        if (index === -1) return false;
        
        data[collection].splice(index, 1);
        this.saveData(data);
        
        return true;
    }

    /**
     * 查詢單一記錄
     */
    findById(collection, id) {
        const data = this.getData();
        if (!data[collection]) return null;
        
        return data[collection].find(item => item.id === id) || null;
    }

    /**
     * 查詢多筆記錄
     */
    find(collection, filter = {}) {
        const data = this.getData();
        if (!data[collection]) return [];
        
        let results = data[collection];
        
        // 應用過濾條件
        Object.keys(filter).forEach(key => {
            if (filter[key] !== undefined && filter[key] !== '') {
                results = results.filter(item => {
                    const value = this.getNestedValue(item, key);
                    return value === filter[key] || 
                           (typeof value === 'string' && value.includes(filter[key]));
                });
            }
        });
        
        return results;
    }

    /**
     * 獲取所有記錄
     */
    getAll(collection) {
        const data = this.getData();
        return data[collection] || [];
    }

    /**
     * 生成唯一 ID
     */
    generateId() {
        return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => {
            return Math.floor(Math.random() * 16).toString(16);
        });
    }

    /**
     * 獲取嵌套屬性值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj);
    }
}

// ==================== 統計數據服務 ====================

class StatsService {
    constructor(dataStore) {
        this.store = dataStore;
    }

    /**
     * 獲取今日統計
     */
    getTodayStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const orders = this.store.getAll('orders');
        const users = this.store.getAll('users');
        const quizResults = this.store.getAll('quizResults');

        // 今日訂單
        const todayOrders = orders.filter(o => o.createdAt >= todayTimestamp);
        
        // 今日營收
        const todayRevenue = todayOrders
            .filter(o => o.payment.status === 'paid')
            .reduce((sum, o) => sum + o.total, 0);

        // 今日新增會員
        const todayNewUsers = users.filter(u => u.registeredAt >= todayTimestamp).length;

        // 待處理訂單
        const pendingOrders = orders.filter(o => 
            o.status === 'pending' || o.status === 'confirmed'
        ).length;

        // 今日完成測驗
        const todayQuizzes = quizResults.filter(q => q.completedAt >= todayTimestamp).length;

        return {
            todayRevenue,
            todayOrders: todayOrders.length,
            todayNewUsers,
            pendingOrders,
            todayQuizzes
        };
    }

    /**
     * 獲取本月統計
     */
    getMonthStats() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthTimestamp = firstDayOfMonth.getTime();

        const orders = this.store.getAll('orders');
        const users = this.store.getAll('users');
        const quizResults = this.store.getAll('quizResults');

        // 本月訂單
        const monthOrders = orders.filter(o => o.createdAt >= monthTimestamp);
        
        // 本月營收
        const monthRevenue = monthOrders
            .filter(o => o.payment.status === 'paid')
            .reduce((sum, o) => sum + o.total, 0);

        // 本月新增會員
        const monthNewUsers = users.filter(u => u.registeredAt >= monthTimestamp).length;

        // 本月完成測驗
        const monthQuizzes = quizResults.filter(q => q.completedAt >= monthTimestamp).length;

        return {
            monthRevenue,
            monthOrders: monthOrders.length,
            monthNewUsers,
            monthQuizzes
        };
    }

    /**
     * 獲取產品銷售排行
     */
    getTopProducts(limit = 10) {
        const products = this.store.getAll('products');
        return products
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, limit);
    }

    /**
     * 獲取低庫存商品
     */
    getLowStockProducts() {
        const products = this.store.getAll('products');
        return products.filter(p => 
            p.stock > 0 && p.stock <= p.lowStockThreshold && p.status === 'active'
        );
    }

    /**
     * 獲取營收趨勢 (過去30天)
     */
    getRevenueTrend(days = 30) {
        const orders = this.store.getAll('orders');
        const today = new Date();
        const trend = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dayStart = date.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;

            const dayOrders = orders.filter(o => 
                o.createdAt >= dayStart && 
                o.createdAt < dayEnd &&
                o.payment.status === 'paid'
            );

            const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

            trend.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                revenue: dayRevenue,
                orders: dayOrders.length
            });
        }

        return trend;
    }
}

// ==================== 初始化與導出 ====================

// 創建全局實例
const dataStore = new DataStore();
const statsService = new StatsService(dataStore);

// 導出到全局
window.DataStore = dataStore;
window.StatsService = statsService;
window.DataSchema = DataSchema;

// 使用logger如果存在，否则使用console
if (window.logger) {
    logger.log('✅ 數據管理系統已初始化');
} else {
    console.log('✅ 數據管理系統已初始化');
}
