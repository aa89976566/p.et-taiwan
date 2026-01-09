/**
 * 匠寵 - 模擬數據生成器
 * 用於開發測試和展示
 * Version: 1.0.0
 */

class MockDataGenerator {
    constructor(dataStore) {
        this.store = dataStore;
    }

    /**
     * 生成完整模擬數據
     */
    generateAll() {
        logger.log('🔄 開始生成模擬數據...');
        
        this.generateProducts();
        this.generateUsers();
        this.generateOrders();
        this.generateQuizResults();
        this.generateSubscriptions();
        
        logger.log('✅ 模擬數據生成完成！');
    }

    /**
     * 生成商品數據
     */
    generateProducts() {
        const products = [
            // 台灣夜市手作零食系列
            {
                name: '壕大大雞排乾',
                sku: 'SNACK-001',
                cyberbizId: 'chicken-fillet',
                category: 'snacks',
                price: 250,
                originalPrice: 300,
                stock: 150,
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=1',
                description: '精選台灣優質雞胸肉，手工製作，無添加防腐劑',
                salesCount: 342,
                viewCount: 1250,
                rating: 4.8
            },
            {
                name: '香酥地瓜條',
                sku: 'SNACK-002',
                cyberbizId: 'sweet-potato',
                category: 'snacks',
                price: 180,
                originalPrice: 220,
                stock: 85,
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=2',
                description: '台灣本土有機地瓜，低溫烘烤保留營養',
                salesCount: 256,
                viewCount: 890,
                rating: 4.6
            },
            {
                name: '嫩煎豬肉乾',
                sku: 'SNACK-003',
                cyberbizId: 'pork-jerky',
                category: 'snacks',
                price: 220,
                originalPrice: 260,
                stock: 120,
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=3',
                description: '精選豬里肌肉，慢火烘烤，口感軟嫩',
                salesCount: 198,
                viewCount: 720,
                rating: 4.7
            },
            {
                name: '鮭魚鬆餅',
                sku: 'SNACK-004',
                cyberbizId: 'salmon-cookie',
                category: 'snacks',
                price: 280,
                originalPrice: 320,
                stock: 8,  // 低庫存
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=4',
                description: '挪威鮭魚製作，富含Omega-3',
                salesCount: 421,
                viewCount: 1580,
                rating: 4.9
            },

            // 益智玩具系列
            {
                name: '互動益智球',
                sku: 'TOY-001',
                cyberbizId: 'smart-ball',
                category: 'toys',
                price: 450,
                originalPrice: 550,
                stock: 65,
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=5',
                description: '智能互動設計，訓練寵物智力與反應',
                salesCount: 145,
                viewCount: 680,
                rating: 4.5
            },
            {
                name: '益智迷宮碗',
                sku: 'TOY-002',
                cyberbizId: 'maze-bowl',
                category: 'toys',
                price: 380,
                originalPrice: 450,
                stock: 45,
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=6',
                description: '減緩進食速度，促進消化健康',
                salesCount: 167,
                viewCount: 590,
                rating: 4.6
            },

            // 營養罐訂閱
            {
                name: '營養罐月配方案',
                sku: 'SUB-001',
                cyberbizId: 'nutrition-monthly',
                category: 'subscription',
                price: 1200,
                originalPrice: 1500,
                stock: 999,  // 訂閱商品不限庫存
                status: 'active',
                imageUrl: 'https://picsum.photos/300/300?random=7',
                description: '每月配送優質營養罐，客製化配方',
                salesCount: 89,
                viewCount: 450,
                rating: 4.8
            }
        ];

        products.forEach(product => {
            this.store.add('products', product);
        });

        logger.log(`✅ 已生成 ${products.length} 個商品`);
    }

    /**
     * 生成用戶數據
     */
    generateUsers() {
        const names = ['張小明', '李小華', '王大明', '陳小美', '林志明', '黃淑芬', '吳佳穎', '劉建國'];
        const pets = [
            { name: '毛毛', type: 'dog', breed: '柴犬', age: 3 },
            { name: '球球', type: 'dog', breed: '貴賓', age: 2 },
            { name: '咪咪', type: 'cat', breed: '英國短毛', age: 4 },
            { name: '皮皮', type: 'dog', breed: '柯基', age: 1 },
            { name: '妮妮', type: 'cat', breed: '美國短毛', age: 3 }
        ];

        const levels = ['normal', 'normal', 'silver', 'gold', 'normal', 'silver', 'normal', 'platinum'];

        const users = names.map((name, index) => {
            const now = Date.now();
            const registeredDaysAgo = Math.floor(Math.random() * 365);
            
            return {
                email: `user${index + 1}@example.com`,
                name: name,
                phone: `09${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
                avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
                lineId: `@user${index + 1}`,
                memberLevel: levels[index],
                status: index === 7 ? 'inactive' : 'active',
                registeredAt: now - (registeredDaysAgo * 24 * 60 * 60 * 1000),
                lastLoginAt: now - (Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
                totalOrders: Math.floor(Math.random() * 20) + 1,
                totalSpent: Math.floor(Math.random() * 30000) + 1000,
                quizCompleted: Math.floor(Math.random() * 5),
                pets: [pets[index % pets.length]]
            };
        });

        users.forEach(user => {
            this.store.add('users', user);
        });

        logger.log(`✅ 已生成 ${users.length} 個用戶`);
    }

    /**
     * 生成訂單數據
     */
    generateOrders() {
        const users = this.store.getAll('users');
        const products = this.store.getAll('products');
        
        if (users.length === 0 || products.length === 0) {
            console.warn('⚠️ 請先生成用戶和商品數據');
            return;
        }

        const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed'];
        const paymentStatuses = ['pending', 'paid', 'paid', 'paid', 'paid'];  // 大多數已付款
        const shippingMethods = ['home_delivery', '711_store', 'family_store'];
        const paymentMethods = ['credit_card', 'atm', 'cvs_code', 'line_pay'];
        
        const cities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'];
        const districts = ['中正區', '大安區', '信義區', '松山區', '中山區'];

        const orders = [];
        const now = Date.now();

        // 生成過去30天的訂單
        for (let i = 0; i < 50; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const orderDaysAgo = Math.floor(Math.random() * 30);
            const orderDate = now - (orderDaysAgo * 24 * 60 * 60 * 1000);
            
            // 隨機選擇1-3個商品
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let subtotal = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const itemTotal = product.price * quantity;
                
                orderItems.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: quantity,
                    variant: ''
                });
                
                subtotal += itemTotal;
            }

            const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
            const shippingFee = 60;
            const discount = subtotal >= 1000 ? 100 : 0;
            const total = subtotal + shippingFee - discount;

            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

            const order = {
                userId: user.id,
                orderDate: orderDate,
                items: orderItems,
                subtotal: subtotal,
                shippingFee: shippingFee,
                discount: discount,
                total: total,
                
                receiver: {
                    name: user.name,
                    phone: user.phone,
                    email: user.email
                },
                
                shipping: {
                    method: shippingMethod,
                    courier: shippingMethod === 'home_delivery' ? 'black_cat' : '',
                    address: shippingMethod === 'home_delivery' ? `${districts[Math.floor(Math.random() * districts.length)]}測試路123號` : '',
                    city: shippingMethod === 'home_delivery' ? cities[Math.floor(Math.random() * cities.length)] : '',
                    district: shippingMethod === 'home_delivery' ? districts[Math.floor(Math.random() * districts.length)] : '',
                    zipCode: shippingMethod === 'home_delivery' ? '100' : '',
                    storeId: shippingMethod !== 'home_delivery' ? '123456' : '',
                    storeName: shippingMethod === '711_store' ? '統一超商-測試門市' : shippingMethod === 'family_store' ? '全家便利商店-測試店' : '',
                    storeAddress: shippingMethod !== 'home_delivery' ? '台北市中正區測試路100號' : '',
                    estimatedDays: 2,
                    trackingNumber: status === 'shipped' || status === 'delivered' ? `TW${Math.floor(Math.random() * 1000000000)}` : '',
                    shippedAt: status === 'shipped' || status === 'delivered' ? orderDate + (24 * 60 * 60 * 1000) : 0,
                    deliveredAt: status === 'delivered' ? orderDate + (3 * 24 * 60 * 60 * 1000) : 0
                },
                
                payment: {
                    method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                    status: paymentStatus,
                    paidAt: paymentStatus === 'paid' ? orderDate + (60 * 60 * 1000) : 0,
                    transactionId: paymentStatus === 'paid' ? `TXN${Math.floor(Math.random() * 1000000)}` : '',
                    ecpayTradeNo: paymentStatus === 'paid' ? `${Date.now()}${Math.floor(Math.random() * 1000)}` : ''
                },
                
                status: status,
                deliveryStatus: status === 'shipped' ? 'in_transit' : status === 'delivered' ? 'delivered' : 'pending',
                notes: Math.random() > 0.7 ? '請在下午3點後配送' : '',
                cancelReason: '',
                refundReason: '',
                
                createdAt: orderDate,
                updatedAt: orderDate,
                completedAt: status === 'completed' ? orderDate + (5 * 24 * 60 * 60 * 1000) : 0
            };

            orders.push(order);
        }

        orders.forEach(order => {
            this.store.add('orders', order);
        });

        logger.log(`✅ 已生成 ${orders.length} 筆訂單`);
    }

    /**
     * 生成測驗結果數據
     */
    generateQuizResults() {
        const users = this.store.getAll('users');
        
        if (users.length === 0) {
            console.warn('⚠️ 請先生成用戶數據');
            return;
        }

        const quizTypes = ['nutrition', 'toy'];
        const categories = ['活潑好動型', '溫和親人型', '敏感謹慎型', '獨立自主型'];
        
        const results = [];
        const now = Date.now();

        // 為每個用戶生成1-2個測驗結果
        users.forEach(user => {
            const quizCount = Math.floor(Math.random() * 2) + 1;
            
            for (let i = 0; i < quizCount; i++) {
                const quizType = quizTypes[Math.floor(Math.random() * quizTypes.length)];
                const completedDaysAgo = Math.floor(Math.random() * 60);
                const completedAt = now - (completedDaysAgo * 24 * 60 * 60 * 1000);
                
                const result = {
                    userId: user.id,
                    quizType: quizType,
                    petInfo: user.pets[0],
                    answers: {
                        q1: 'A',
                        q2: 'B',
                        q3: 'C'
                    },
                    result: {
                        category: categories[Math.floor(Math.random() * categories.length)],
                        score: Math.floor(Math.random() * 40) + 60,
                        recommendations: ['SNACK-001', 'TOY-001']
                    },
                    completedAt: completedAt,
                    createdAt: completedAt
                };
                
                results.push(result);
            }
        });

        results.forEach(result => {
            this.store.add('quizResults', result);
        });

        logger.log(`✅ 已生成 ${results.length} 個測驗結果`);
    }

    /**
     * 生成訂閱數據
     */
    generateSubscriptions() {
        const users = this.store.getAll('users');
        const products = this.store.getAll('products').filter(p => p.category === 'subscription');
        
        if (users.length === 0 || products.length === 0) {
            console.warn('⚠️ 請先生成用戶和訂閱商品數據');
            return;
        }

        const frequencies = ['monthly', 'biweekly', 'weekly'];
        const statuses = ['active', 'active', 'active', 'paused', 'cancelled'];
        
        const subscriptions = [];
        const now = Date.now();

        // 隨機為一些用戶生成訂閱
        const subscriberCount = Math.floor(users.length * 0.3);  // 30% 用戶有訂閱
        
        for (let i = 0; i < subscriberCount; i++) {
            const user = users[i];
            const product = products[0];  // 營養罐訂閱
            const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const startDaysAgo = Math.floor(Math.random() * 180);
            const startDate = now - (startDaysAgo * 24 * 60 * 60 * 1000);
            
            // 計算下次配送日期
            let nextDeliveryDays = 30;  // monthly
            if (frequency === 'biweekly') nextDeliveryDays = 14;
            if (frequency === 'weekly') nextDeliveryDays = 7;
            
            const subscription = {
                userId: user.id,
                planId: `PLAN-${i + 1}`,
                planName: product.name,
                productId: product.id,
                frequency: frequency,
                quantity: 1,
                price: product.price,
                status: status,
                nextDeliveryDate: status === 'active' ? now + (nextDeliveryDays * 24 * 60 * 60 * 1000) : 0,
                startDate: startDate,
                endDate: status === 'cancelled' ? now : 0,
                deliveryCount: Math.floor(startDaysAgo / nextDeliveryDays),
                totalDeliveries: 12,
                shippingAddress: {
                    name: user.name,
                    phone: user.phone,
                    address: '台北市測試路123號',
                    city: '台北市',
                    district: '中正區',
                    zipCode: '100'
                },
                paymentMethod: 'credit_card',
                autoRenew: status === 'active',
                createdAt: startDate,
                updatedAt: now
            };
            
            subscriptions.push(subscription);
        }

        subscriptions.forEach(subscription => {
            this.store.add('subscriptions', subscription);
        });

        logger.log(`✅ 已生成 ${subscriptions.length} 個訂閱`);
    }

    /**
     * 清除所有數據
     */
    clearAll() {
        if (confirm('確定要清除所有數據嗎？此操作無法復原！')) {
            localStorage.removeItem('jiangchong_data');
            location.reload();
        }
    }
}

// 導出到全局
window.MockDataGenerator = MockDataGenerator;

// 如果數據為空，自動生成模擬數據
window.addEventListener('DOMContentLoaded', () => {
    const dataStore = window.DataStore;
    const products = dataStore.getAll('products');
    
    if (products.length === 0) {
        logger.log('🔄 檢測到空數據，自動生成模擬數據...');
        const generator = new MockDataGenerator(dataStore);
        generator.generateAll();
    }
});
