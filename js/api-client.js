/**
 * 匠寵 - API 客戶端
 * 用於連接後端 API
 */

const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * 設定認證 Token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * 獲取請求頭
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // 獲取 session ID（用於訪客購物車）
        const sessionId = localStorage.getItem('session_id') || this.generateSessionId();
        if (!localStorage.getItem('session_id')) {
            localStorage.setItem('session_id', sessionId);
        }
        headers['X-Session-Id'] = sessionId;

        return headers;
    }

    /**
     * 生成 Session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 發送請求
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // 檢查 response 是否為 JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`伺服器回應格式錯誤 (${response.status}): ${text.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: 請求失敗`);
            }

            return data;
        } catch (error) {
            console.error('API 請求錯誤:', {
                url: url,
                error: error.message,
                stack: error.stack
            });
            
            // 如果是網路錯誤，提供更友好的錯誤訊息
            if (error.message.includes('fetch') || error.name === 'TypeError') {
                throw new Error(`無法連接到伺服器 ${url}。請確認後端伺服器已啟動在 http://localhost:3000`);
            }
            
            throw error;
        }
    }

    // ==================== 認證 API ====================

    /**
     * 用戶註冊
     */
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    /**
     * 用戶登入
     */
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    /**
     * 用戶登出
     */
    logout() {
        this.setToken(null);
    }

    /**
     * 獲取當前用戶資訊
     */
    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // ==================== 商品 API ====================

    /**
     * 獲取商品列表
     */
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/products${queryString ? '?' + queryString : ''}`);
    }

    /**
     * 獲取單一商品
     */
    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    /**
     * 建立商品（管理員）
     */
    async createProduct(productData) {
        return await this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    /**
     * 更新商品（管理員）
     */
    async updateProduct(id, productData) {
        return await this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    /**
     * 刪除商品（管理員）
     */
    async deleteProduct(id) {
        return await this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    // ==================== 購物車 API ====================

    /**
     * 獲取購物車
     */
    async getCart() {
        return await this.request('/cart');
    }

    /**
     * 加入購物車
     */
    async addToCart(productId, quantity = 1, variant = '') {
        return await this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity, variant })
        });
    }

    /**
     * 更新購物車項目
     */
    async updateCartItem(itemId, quantity) {
        return await this.request(`/cart/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    /**
     * 刪除購物車項目
     */
    async removeCartItem(itemId) {
        return await this.request(`/cart/${itemId}`, {
            method: 'DELETE'
        });
    }

    /**
     * 清空購物車
     */
    async clearCart() {
        return await this.request('/cart', {
            method: 'DELETE'
        });
    }

    // ==================== 訂單 API ====================

    /**
     * 獲取訂單列表
     */
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/orders${queryString ? '?' + queryString : ''}`);
    }

    /**
     * 獲取單一訂單
     */
    async getOrder(id) {
        return await this.request(`/orders/${id}`);
    }

    /**
     * 建立訂單
     */
    async createOrder(orderData) {
        return await this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    /**
     * 取消訂單
     */
    async cancelOrder(orderId, reason) {
        return await this.request(`/orders/${orderId}/cancel`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    // ==================== 優惠券 API ====================

    /**
     * 獲取所有優惠券（管理員）
     */
    async getCoupons() {
        return await this.request('/coupons/admin', {
            method: 'GET'
        });
    }

    /**
     * 驗證優惠碼
     */
    async validateCoupon(code, subtotal) {
        return await this.request('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, subtotal })
        });
    }

    /**
     * 建立優惠券（管理員）
     */
    async createCoupon(couponData) {
        return await this.request('/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData)
        });
    }

    /**
     * 更新優惠券（管理員）
     */
    async updateCoupon(id, couponData) {
        return await this.request(`/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(couponData)
        });
    }

    /**
     * 刪除優惠券（管理員）
     */
    async deleteCoupon(id) {
        return await this.request(`/coupons/${id}`, {
            method: 'DELETE'
        });
    }

    /**
     * 記錄優惠券使用
     */
    async useCoupon(couponId, orderId, discountAmount) {
        return await this.request(`/coupons/${couponId}/use`, {
            method: 'POST',
            body: JSON.stringify({ orderId, discountAmount })
        });
    }

    // ==================== 綠界金流 API ====================

    /**
     * 建立付款表單
     */
    async createPayment(orderData, paymentMethod) {
        return await this.request('/ecpay/create-payment', {
            method: 'POST',
            body: JSON.stringify({ orderData, paymentMethod })
        });
    }

    // ==================== 測驗 API ====================

    /**
     * 提交測驗結果
     */
    async submitQuiz(quizData) {
        return await this.request('/quiz', {
            method: 'POST',
            body: JSON.stringify(quizData)
        });
    }

    /**
     * 獲取測驗結果列表
     */
    async getQuizResults() {
        return await this.request('/quiz');
    }

    /**
     * 獲取單一測驗結果
     */
    async getQuizResult(id) {
        return await this.request(`/quiz/${id}`);
    }
}

// 建立全局實例
window.ApiClient = new ApiClient();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
