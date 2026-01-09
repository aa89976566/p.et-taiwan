/**
 * 匠寵 - 全局配置
 * 用于管理开发/生产环境设置
 */

const CONFIG = {
    // 环境设置
    ENV: 'production', // 'development' 或 'production'
    
    // 调试设置
    DEBUG: false,
    ENABLE_CONSOLE_LOG: false,
    
    // 数据设置
    AUTO_GENERATE_MOCK_DATA: false, // 生产环境应设为 false
    
    // 商店设置
    STORE_NAME: '匠寵',
    STORE_URL: window.location.origin,
    
    // 支付设置（ECPay）
    ECPAY_ENABLED: false,
    ECPAY_TEST_MODE: true,
    
    // 储存键名
    STORAGE_KEYS: {
        CART: 'jiangchong_cart',
        USER: 'jiangchong_user',
        HOMEPAGE_CONFIG: 'jiangchong_homepage_config'
    },
    
    // 分页设置
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        ORDERS_PAGE_SIZE: 20,
        PRODUCTS_PAGE_SIZE: 12
    },
    
    // 价格设置
    PRICING: {
        FREE_SHIPPING_THRESHOLD: 1000, // 满 1000 免运费
        DISCOUNT_THRESHOLD: 1000,      // 满 1000 折扣 100
        DISCOUNT_AMOUNT: 100,
        DEFAULT_SHIPPING_FEE: 80
    }
};

// 日志工具
window.logger = {
    log: (...args) => {
        if (CONFIG.ENABLE_CONSOLE_LOG) {
            console.log(...args);
        }
    },
    error: (...args) => {
        // 错误总是记录
        console.error(...args);
    },
    warn: (...args) => {
        if (CONFIG.DEBUG) {
            console.warn(...args);
        }
    },
    debug: (...args) => {
        if (CONFIG.DEBUG) {
            console.debug(...args);
        }
    }
};

// 导出配置
window.CONFIG = CONFIG;
