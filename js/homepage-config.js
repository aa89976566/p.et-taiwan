/**
 * 匠寵 - 首頁 Section 管理系統
 * Version: 1.0.0
 * 
 * 功能：
 * - 控制首頁區塊的顯示/隱藏
 * - 管理區塊的排序
 * - 保存區塊的內容設定
 */

// 預設的首頁配置
const DEFAULT_HOMEPAGE_CONFIG = {
    sections: [
        {
            id: 'hero',
            name: 'Hero 主視覺',
            enabled: true,
            order: 1,
            content: {
                title: '從台灣夜市到健康餐桌',
                subtitle: '手工製作，天然無添加',
                ctaText: '立即選購',
                ctaLink: '#products',
                bgImage: ''
            }
        },
        {
            id: 'toys-hero',
            name: '益智玩具 Hero 區塊',
            enabled: true,
            order: 2,
            content: {}
        },
        {
            id: 'snacks-hero',
            name: '手作零食 Hero 區塊',
            enabled: true,
            order: 3,
            content: {}
        },
        {
            id: 'products',
            name: '產品系列',
            enabled: true,
            order: 4,
            content: {
                title: '三大產品系列',
                subtitle: '滿足不同需求',
                showSnacks: true,
                showSubscription: true,
                showToys: true,
                displayMode: 'tabs', // tabs, grid, carousel
                productsToys: [], // 益智玩具系列的自訂產品列表
                productsSnacks: [], // 手作零食系列的自訂產品列表
                productsSubscription: [] // 訂閱系列的自訂產品列表
            }
        },
        {
            id: 'quiz',
            name: '智能測驗',
            enabled: true,
            order: 5,
            content: {
                title: '找到最適合的產品',
                subtitle: '透過科學測驗，為你的毛孩量身推薦',
                showNutritionQuiz: true,
                showToyQuiz: true,
                ctaText: '立即測驗'
            }
        },
        {
            id: 'subscription',
            name: '訂閱服務',
            enabled: true,
            order: 6,
            content: {
                title: '訂閱服務',
                subtitle: '定期配送，新鮮直達',
                showBasicPlan: true,
                showPremiumPlan: true,
                showJarProgram: true,
                recommendedPlan: 'premium'
            }
        },
        {
            id: 'crowdfunding',
            name: '集資項目',
            enabled: false, // 預設關閉
            order: 9,
            content: {
                title: '支持匠寵，一起創造更好的寵物生活',
                subtitle: '我們正在開發新產品線，需要你的支持',
                projectName: '淨寵循環 - 寵物循環經濟革命',
                projectDescription: '創新益智玩具，延緩毛孩老化，讓牠們活力十足',
                zeczecLink: 'https://www.zeczec.com/projects/jiangchong',
                coverImage: 'https://www.genspark.ai/api/files/s/VwgxRxOz',
                goalAmount: 500000,
                currentAmount: 285000,
                supporters: 156,
                daysLeft: 45
            }
        },
        {
            id: 'jar-exchange',
            name: '換罐計畫',
            enabled: true,
            order: 7,
            content: {
                title: '換罐計畫',
                subtitle: '環保愛地球，回饋愛毛孩',
                description: '將玻璃罐帶回店內，享受專屬優惠',
                benefits: [
                    '每次兌換可獲得 NT$ 50 折扣券',
                    '累計10次升級為VIP會員',
                    '免費參加工作坊和活動'
                ],
                mainImage: '',
                cta1Text: '了解更多換罐計畫',
                cta2Text: '查看合作店家'
            }
        },
        {
            id: 'about',
            name: '關於我們',
            enabled: true,
            order: 8,
            content: {
                title: '關於匠寵',
                subtitle: '從台灣到世界，為毛孩創造更好的生活',
                description: '我們相信，每一隻毛孩都值得最好的照顧...',
                showTeam: true,
                showMission: true,
                showValues: true
            }
        },
        {
            id: 'scientific-evidence',
            name: '科學實證區塊',
            enabled: true,
            order: 10,
            content: {}
        },
        {
            id: 'testimonials',
            name: '用戶評價與環保成果區塊',
            enabled: true,
            order: 11,
            content: {}
        },
        {
            id: 'final-cta',
            name: '最終行動呼籲區塊',
            enabled: true,
            order: 12,
            content: {}
        }
    ]
};

// 獲取首頁配置
function getHomepageConfig() {
    const saved = localStorage.getItem('homepageConfig');
    let config;
    
    if (saved) {
        try {
            config = JSON.parse(saved);
        } catch (e) {
            console.error('❌ 配置解析失敗，使用預設配置:', e);
            config = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
        }
    } else {
        config = JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
    }
    
    // 驗證並修復 order 值
    config = validateAndFixConfig(config);
    
    return config;
}

// 驗證並修復配置
function validateAndFixConfig(config) {
    if (!config || !config.sections || !Array.isArray(config.sections)) {
        console.warn('⚠️ 配置格式錯誤，使用預設配置');
    return JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_CONFIG));
    }
    
    // 合併新區塊：檢查是否有新區塊需要加入到現有配置中
    const defaultSectionIds = DEFAULT_HOMEPAGE_CONFIG.sections.map(s => s.id);
    const existingSectionIds = config.sections.map(s => s.id);
    const missingSectionIds = defaultSectionIds.filter(id => !existingSectionIds.includes(id));
    
    if (missingSectionIds.length > 0) {
        console.log('🔄 發現新區塊，正在加入配置:', missingSectionIds);
        missingSectionIds.forEach(sectionId => {
            const defaultSection = DEFAULT_HOMEPAGE_CONFIG.sections.find(s => s.id === sectionId);
            if (defaultSection) {
                // 深拷貝預設配置
                const newSection = JSON.parse(JSON.stringify(defaultSection));
                config.sections.push(newSection);
                console.log(`✅ 已加入新區塊: ${defaultSection.name} (${sectionId})`);
            }
        });
    }
    
    // 檢查並修復 order 值
    const sections = config.sections;
    const orders = sections.map(s => s.order);
    const hasInvalid = orders.some(o => o === undefined || o === null || isNaN(o));
    const hasDuplicate = new Set(orders.filter(o => o !== undefined && o !== null)).size !== orders.filter(o => o !== undefined && o !== null).length;
    
    if (hasInvalid || hasDuplicate || missingSectionIds.length > 0) {
        console.warn('⚠️ 檢測到 order 值問題或新區塊，正在修復...', {
            hasInvalid,
            hasDuplicate,
            missingSections: missingSectionIds,
            orders
        });
        
        // 按預設配置的順序重新分配 order 值
        config.sections.forEach(section => {
            const defaultSection = DEFAULT_HOMEPAGE_CONFIG.sections.find(s => s.id === section.id);
            if (defaultSection) {
                // 保持預設的 order 值
                section.order = defaultSection.order;
            } else if (section.order === undefined || section.order === null || isNaN(section.order)) {
                // 如果沒有預設配置，使用最大值 + 1
                const maxOrder = Math.max(...DEFAULT_HOMEPAGE_CONFIG.sections.map(s => s.order));
                section.order = maxOrder + 1;
            }
        });
        
        // 按 order 排序
        config.sections.sort((a, b) => (a.order || 999) - (b.order || 999));
        
        // 保存修復後的配置
        saveHomepageConfig(config);
        console.log('✅ 配置已修復並保存');
    }
    
    return config;
}

// 保存首頁配置
function saveHomepageConfig(config) {
    localStorage.setItem('homepageConfig', JSON.stringify(config));
    if (window.logger) {
        window.logger.log('✅ 首頁配置已保存');
    } else {
        console.log('✅ 首頁配置已保存');
    }
}

// 更新單個 Section
function updateSectionConfig(sectionId, updates) {
    const config = getHomepageConfig();
    const section = config.sections.find(s => s.id === sectionId);
    
    if (section) {
        if (updates.enabled !== undefined) section.enabled = updates.enabled;
        if (updates.order !== undefined) section.order = updates.order;
        if (updates.content) {
            section.content = { ...section.content, ...updates.content };
        }
        
        saveHomepageConfig(config);
        return true;
    }
    
    return false;
}

// 切換 Section 顯示狀態
function toggleSection(sectionId) {
    const config = getHomepageConfig();
    const section = config.sections.find(s => s.id === sectionId);
    
    if (section) {
        section.enabled = !section.enabled;
        saveHomepageConfig(config);
        console.log(`✅ Section ${sectionId} 狀態已切換為: ${section.enabled ? '啟用' : '禁用'}`);
        
        // 自動發布變更
        publishHomepageChanges();
        
        return section.enabled;
    }
    
    return false;
}

// 重新排序 Sections
function reorderSections(newOrder) {
    // newOrder: array of section IDs in new order
    const config = getHomepageConfig();
    
    // 確保所有 sections 都有 order 值
    newOrder.forEach((sectionId, index) => {
        const section = config.sections.find(s => s.id === sectionId);
        if (section) {
            section.order = index + 1;
        } else {
            console.warn(`⚠️ 找不到 section: ${sectionId}`);
        }
    });
    
    // 確保所有 sections 都有有效的 order（處理不在 newOrder 中的 sections）
    const maxOrder = newOrder.length;
    config.sections.forEach(section => {
        if (!newOrder.includes(section.id)) {
            section.order = maxOrder + 1;
        }
    });
    
    // 按 order 排序
    config.sections.sort((a, b) => {
        const orderA = a.order || 999;
        const orderB = b.order || 999;
        return orderA - orderB;
    });
    
    // 驗證並保存
    const validatedConfig = validateAndFixConfig(config);
    saveHomepageConfig(validatedConfig);
}

// 獲取已啟用的 Sections（按順序）
function getEnabledSections() {
    const config = getHomepageConfig();
    return config.sections
        .filter(s => s.enabled)
        .sort((a, b) => a.order - b.order);
}

// 重置為預設配置
function resetToDefaultConfig() {
    localStorage.removeItem('homepageConfig');
    if (window.logger) {
        window.logger.log('✅ 已重置為預設配置');
    } else {
        console.log('✅ 已重置為預設配置');
    }
    return getHomepageConfig();
}

// 應用配置到前台（動態顯示/隱藏 sections 並重新排序）
function applyConfigToFrontend() {
    const config = getHomepageConfig();
    console.log('📋 應用配置到前台:', config);
    
    // 按順序排序 sections
    const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);
    console.log('📋 排序後的 sections:', sortedSections.map(s => ({ id: s.id, order: s.order, enabled: s.enabled })));
    
    // 獲取 body 元素
    const body = document.body;
    if (!body) {
        console.error('❌ body 元素不存在');
        return;
    }
    
    // 收集所有 section 元素
    const sectionElements = [];
    sortedSections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
            // 如果是 products section 且所有系列都被隱藏，強制設置為禁用
            if (section.id === 'products' && section.content) {
                const allHidden = section.content.showToys === false && 
                                 section.content.showSnacks === false && 
                                 section.content.showSubscription === false;
                if (allHidden) {
                    section.enabled = false;
                    console.log('⚠️ Products section 所有系列都被隱藏，強制設置為禁用');
                }
            }
            
            sectionElements.push({ section, element });
            
            // 設置顯示/隱藏
            if (section.enabled) {
                element.style.display = '';
                element.style.visibility = '';
                element.classList.remove('hidden');
                element.removeAttribute('data-hidden');
                console.log(`✅ ${section.id} - 顯示`);
            } else {
                element.style.display = 'none';
                element.style.visibility = 'hidden';
                element.classList.add('hidden');
                element.setAttribute('data-hidden', 'true');
                console.log(`❌ ${section.id} - 隱藏`);
            }
        } else {
            // 優雅地處理不存在的 section（可能是導航連結但還沒有實現的區塊）
            // 只在開發模式下顯示警告
            if (section.id !== 'about') { // about 可能是未實現的區塊
                console.debug(`💡 Section "${section.id}" 在頁面中不存在（可能尚未實現）`);
            }
        }
    });
    
    // 找到第一個 section 的位置（nav 之後）
    const nav = document.querySelector('nav');
    let insertAfter = nav ? nav.nextSibling : body.firstChild;
    
    // 移除所有 sections 並按順序重新插入
    const fragment = document.createDocumentFragment();
    sectionElements.forEach(({ element }) => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        fragment.appendChild(element);
    });
    
    // 插入到正確位置
    if (insertAfter && insertAfter.parentNode) {
        insertAfter.parentNode.insertBefore(fragment, insertAfter.nextSibling);
    } else if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(fragment, nav.nextSibling);
    } else {
        body.appendChild(fragment);
    }
    
    console.log('✅ 首頁配置已應用，sections 順序已更新');
    
    // 應用產品系列區塊的內容
    applyProductsSectionContent();
}

// 應用產品系列區塊的內容到前台
function applyProductsSectionContent() {
    const config = getHomepageConfig();
    const productsSection = config.sections.find(s => s.id === 'products');
    
    if (!productsSection || !productsSection.enabled) {
        // 只在開發模式下顯示詳細訊息
        console.debug('💡 產品系列區塊未啟用或不存在');
        // 隱藏整個產品系列區塊
        const sectionElement = document.getElementById('products');
        if (sectionElement) {
            sectionElement.style.display = 'none';
        }
        return;
    }
    
    const content = productsSection.content || {};
    console.log('📋 產品系列配置內容:', content);
    
    // 更新標題和副標題
    const sectionElement = document.getElementById('products');
    if (!sectionElement) {
        console.warn('⚠️ 找不到產品系列區塊元素 (id="products")');
        return;
    }
    
    // 確保產品系列區塊是顯示的
    sectionElement.style.display = '';
    
    // 更新標題
    const titleElement = sectionElement.querySelector('h2');
    if (titleElement && content.title) {
        titleElement.textContent = content.title;
        console.log('✅ 標題已更新:', content.title);
    }
    
    // 更新副標題
    const subtitleElement = sectionElement.querySelector('p.text-xl');
    if (subtitleElement && content.subtitle) {
        subtitleElement.textContent = content.subtitle;
        console.log('✅ 副標題已更新:', content.subtitle);
    }
    
    // 更新區塊 ID（如果有設置，但要小心不要破壞現有結構）
    if (content.blockId && content.blockId !== 'products') {
        // 只在確實需要更改時才更改
        console.log('ℹ️ 區塊 ID 設置為:', content.blockId);
    }
    
    // 更新背景顏色
    if (content.bgColor) {
        sectionElement.style.backgroundColor = content.bgColor;
        console.log('✅ 背景顏色已更新:', content.bgColor);
    }
    
    // 應用產品系列顯示/隱藏設定
    // 獲取所有標籤按鈕和內容區塊
    const tabs = {
        toys: {
            tab: sectionElement.querySelector('button[data-tab="toys"]'),
            content: document.getElementById('tab-toys')
        },
        snacks: {
            tab: sectionElement.querySelector('button[data-tab="snacks"]'),
            content: document.getElementById('tab-snacks')
        },
        subscription: {
            tab: sectionElement.querySelector('button[data-tab="subscription"]'),
            content: document.getElementById('tab-subscription')
        }
    };
    
    console.log('📋 找到的標籤元素:', {
        toys: { tab: !!tabs.toys.tab, content: !!tabs.toys.content },
        snacks: { tab: !!tabs.snacks.tab, content: !!tabs.snacks.content },
        subscription: { tab: !!tabs.subscription.tab, content: !!tabs.subscription.content }
    });
    
    // 應用顯示/隱藏設定
    if (content.showToys === false) {
        console.log('❌ 隱藏益智玩具系列');
        if (tabs.toys.tab) {
            tabs.toys.tab.style.display = 'none';
            tabs.toys.tab.classList.add('hidden');
        }
        if (tabs.toys.content) {
            tabs.toys.content.style.display = 'none';
            tabs.toys.content.classList.add('hidden');
        }
    } else {
        console.log('✅ 顯示益智玩具系列');
        if (tabs.toys.tab) {
            tabs.toys.tab.style.display = '';
            tabs.toys.tab.classList.remove('hidden');
        }
        if (tabs.toys.content) {
            tabs.toys.content.style.display = '';
            tabs.toys.content.classList.remove('hidden');
        }
    }
    
    if (content.showSnacks === false) {
        console.log('❌ 隱藏手作零食系列');
        if (tabs.snacks.tab) {
            tabs.snacks.tab.style.display = 'none';
            tabs.snacks.tab.classList.add('hidden');
        }
        if (tabs.snacks.content) {
            tabs.snacks.content.style.display = 'none';
            tabs.snacks.content.classList.add('hidden');
        }
    } else {
        console.log('✅ 顯示手作零食系列');
        if (tabs.snacks.tab) {
            tabs.snacks.tab.style.display = '';
            tabs.snacks.tab.classList.remove('hidden');
        }
        if (tabs.snacks.content) {
            tabs.snacks.content.style.display = '';
            tabs.snacks.content.classList.remove('hidden');
        }
    }
    
    if (content.showSubscription === false) {
        console.log('❌ 隱藏訂閱系列');
        if (tabs.subscription.tab) {
            tabs.subscription.tab.style.display = 'none';
            tabs.subscription.tab.classList.add('hidden');
        }
        if (tabs.subscription.content) {
            tabs.subscription.content.style.display = 'none';
            tabs.subscription.content.classList.add('hidden');
        }
    } else {
        console.log('✅ 顯示訂閱系列');
        if (tabs.subscription.tab) {
            tabs.subscription.tab.style.display = '';
            tabs.subscription.tab.classList.remove('hidden');
        }
        if (tabs.subscription.content) {
            tabs.subscription.content.style.display = '';
            tabs.subscription.content.classList.remove('hidden');
        }
    }
    
    // 如果所有系列都被隱藏，隱藏整個產品區塊和標籤容器
    const allHidden = content.showToys === false && content.showSnacks === false && content.showSubscription === false;
    if (allHidden) {
        console.log('⚠️ 所有產品系列都被隱藏，隱藏整個產品區塊');
        
        // 更新配置，禁用整個 products section
        const config = getHomepageConfig();
        const productsSection = config.sections.find(s => s.id === 'products');
        if (productsSection) {
            productsSection.enabled = false;
            saveHomepageConfig(config);
            console.log('✅ 已將產品系列區塊設置為禁用狀態');
        }
        
        // 隱藏整個產品區塊
        sectionElement.style.display = 'none';
        sectionElement.classList.add('hidden');
        sectionElement.setAttribute('data-hidden', 'true');
        
        // 清空所有產品容器
        const toysContainer = document.getElementById('toysProductsContainer');
        const snacksContainer = document.getElementById('snacksProductsContainer');
        const subscriptionContainer = document.getElementById('subscriptionProductsContainer');
        if (toysContainer) {
            toysContainer.innerHTML = '';
            toysContainer.style.display = 'none';
        }
        if (snacksContainer) {
            snacksContainer.innerHTML = '';
            snacksContainer.style.display = 'none';
        }
        if (subscriptionContainer) {
            subscriptionContainer.innerHTML = '';
            subscriptionContainer.style.display = 'none';
        }
        
        // 隱藏標籤容器
        const tabsContainer = sectionElement.querySelector('.flex.flex-wrap.justify-center');
        if (tabsContainer) {
            tabsContainer.style.display = 'none';
            tabsContainer.classList.add('hidden');
        }
        
        // 隱藏標題區域
        const headerContainer = sectionElement.querySelector('.text-center.mb-16');
        if (headerContainer) {
            headerContainer.style.display = 'none';
            headerContainer.classList.add('hidden');
        }
        
        // 隱藏導航目錄中的產品系列連結
        const navLinks = document.querySelectorAll('a[href*="products"], a[href="#products"]');
        navLinks.forEach(link => {
            if (link.textContent.includes('產品系列') || link.getAttribute('href') === '#products') {
                const parent = link.closest('li, div, a');
                if (parent && parent !== link) {
                    parent.style.display = 'none';
                    parent.classList.add('hidden');
                } else {
                    link.style.display = 'none';
                    link.classList.add('hidden');
                }
            }
        });
        
        console.log('✅ 產品區塊已完全隱藏（包括標題和導航連結）');
        return;
    } else {
        // 確保產品區塊是顯示的
        sectionElement.style.display = '';
        sectionElement.classList.remove('hidden');
        sectionElement.removeAttribute('data-hidden');
        
        // 更新配置，啟用整個 products section
        const config = getHomepageConfig();
        const productsSection = config.sections.find(s => s.id === 'products');
        if (productsSection && !productsSection.enabled) {
            productsSection.enabled = true;
            saveHomepageConfig(config);
        }
        
        // 確保標籤容器是顯示的
        const tabsContainer = sectionElement.querySelector('.flex.flex-wrap.justify-center');
        if (tabsContainer) {
            tabsContainer.style.display = '';
            tabsContainer.classList.remove('hidden');
        }
        
        // 確保標題區域是顯示的
        const headerContainer = sectionElement.querySelector('.text-center.mb-16');
        if (headerContainer) {
            headerContainer.style.display = '';
            headerContainer.classList.remove('hidden');
        }
        
        // 顯示導航目錄中的產品系列連結
        const navLinks = document.querySelectorAll('a[href*="products"], a[href="#products"]');
        navLinks.forEach(link => {
            if (link.textContent.includes('產品系列') || link.getAttribute('href') === '#products') {
                const parent = link.closest('li, div, a');
                if (parent && parent !== link) {
                    parent.style.display = '';
                    parent.classList.remove('hidden');
                } else {
                    link.style.display = '';
                    link.classList.remove('hidden');
                }
            }
        });
    }
    
    // 如果當前活動的標籤被隱藏，自動切換到第一個可見的標籤
    const visibleTabs = Object.entries(tabs).filter(([key, value]) => {
        const showKey = `show${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const shouldShow = content[showKey] !== false;
        const isVisible = value.tab && value.tab.style.display !== 'none' && !value.tab.classList.contains('hidden');
        return shouldShow && isVisible;
    });
    
    console.log('📋 可見的標籤:', visibleTabs.map(([key]) => key));
    
    if (visibleTabs.length > 0) {
        const firstVisibleTab = visibleTabs[0][0];
        const firstTabButton = tabs[firstVisibleTab].tab;
        if (firstTabButton) {
            // 觸發點擊事件切換到第一個可見標籤
            setTimeout(() => {
                console.log('🔄 自動切換到第一個可見標籤:', firstVisibleTab);
                firstTabButton.click();
            }, 100);
        }
    }
    
    // 根據顯示模式渲染產品（只有在有選中產品時才渲染）
    if (content.products && Array.isArray(content.products) && content.products.length > 0) {
        console.log('📦 開始渲染選中的產品，數量:', content.products.length);
        renderProductsByConfig(content);
    } else {
        console.log('ℹ️ 沒有選中的產品，保持原有結構');
    }
    
    console.log('✅ 產品系列區塊內容已更新完成');
}

// 根據配置渲染產品
function renderProductsByConfig(config) {
    const { products, displayMode, displayCount, sortOrder, showPrice, showButton, buttonText, buttonLink } = config;
    
    if (!products || products.length === 0) {
        console.warn('⚠️ 沒有選中的產品');
        return;
    }
    
    // 過濾啟用的產品
    const enabledProducts = products.filter(p => p.enabled !== false);
    
    // 排序產品
    let sortedProducts = [...enabledProducts];
    if (sortOrder === 'newest') {
        // 按創建時間排序（如果有）
        sortedProducts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortOrder === 'popular') {
        // 按銷售量排序（如果有）
        sortedProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    } else if (sortOrder === 'price-asc') {
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'price-desc') {
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    // 'custom' 保持原順序
    
    // 限制顯示數量
    const productsToShow = sortedProducts.slice(0, displayCount || 3);
    
    // 根據顯示模式渲染
    if (displayMode === 'carousel') {
        renderProductsAsCarousel(productsToShow, showPrice, showButton, buttonText, buttonLink);
    } else if (displayMode === 'grid') {
        renderProductsAsGrid(productsToShow, showPrice, showButton, buttonText, buttonLink);
    } else if (displayMode === 'list') {
        renderProductsAsList(productsToShow, showPrice, showButton, buttonText, buttonLink);
    } else if (displayMode === 'card') {
        renderProductsAsCards(productsToShow, showPrice, showButton, buttonText, buttonLink);
    } else {
        // 預設使用 grid
        renderProductsAsGrid(productsToShow, showPrice, showButton, buttonText, buttonLink);
    }
}

// 渲染為網格
function renderProductsAsGrid(products, showPrice, showButton, buttonText, buttonLink) {
    const section = document.getElementById('products');
    if (!section) {
        console.warn('⚠️ 找不到產品系列區塊');
        return;
    }
    
    // 找到或創建產品容器（在現有結構之後添加）
    let container = section.querySelector('.products-grid-container');
    if (!container) {
        // 找到現有的產品內容區域，在其後添加新容器
        const existingContent = section.querySelector('.product-content');
        container = document.createElement('div');
        container.className = 'products-grid-container grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8';
        
        // 如果現有內容存在，在其後添加；否則添加到 section 末尾
        if (existingContent && existingContent.parentNode) {
            existingContent.parentNode.insertBefore(container, existingContent.nextSibling);
        } else {
            // 找到 container div，在其內部添加
            const mainContainer = section.querySelector('.container');
            if (mainContainer) {
                mainContainer.appendChild(container);
            } else {
                section.appendChild(container);
            }
        }
        console.log('✅ 已創建產品網格容器');
    }
    
    container.innerHTML = products.map(product => {
        const productId = String(product.id || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productName = String(product.name || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productImage = String(product.image || 'https://via.placeholder.com/300').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productCategory = String(product.category || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productPrice = (product.price || 0).toLocaleString();
        
        return `
        <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer" onclick="window.location.href='product-detail.html?id=${productId}'">
            <div class="relative">
                <img src="${productImage}" 
                     alt="${productName}"
                     class="w-full h-48 object-cover"
                     onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <div class="p-5">
                <div class="mb-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">${productCategory}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">${productName}</h3>
                ${showPrice !== false ? `
                    <div class="mb-4">
                        <span class="text-2xl font-bold text-red-600">NT$ ${productPrice}</span>
                    </div>
                ` : ''}
                <button onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${productId}'" 
                        class="w-full bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                    查看詳情
                </button>
            </div>
        </div>
        `;
    }).join('');
    
    // 添加「查看更多」按鈕
    if (showButton !== false && buttonText && buttonLink) {
        let buttonContainer = section.querySelector('.products-more-button');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'products-more-button text-center mt-8';
            section.appendChild(buttonContainer);
        }
        buttonContainer.innerHTML = `
            <a href="${buttonLink}" class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition">
                ${buttonText}
            </a>
        `;
    }
}

// 渲染為輪播（簡化版，使用 grid 實現）
function renderProductsAsCarousel(products, showPrice, showButton, buttonText, buttonLink) {
    // 暫時使用 grid 實現，未來可以改為真正的輪播
    renderProductsAsGrid(products, showPrice, showButton, buttonText, buttonLink);
}

// 渲染為列表
function renderProductsAsList(products, showPrice, showButton, buttonText, buttonLink) {
    const section = document.getElementById('products');
    if (!section) return;
    
    let container = section.querySelector('.products-list-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'products-list-container space-y-4 mt-8';
        section.appendChild(container);
    }
    
    container.innerHTML = products.map(product => {
        const productId = String(product.id || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productName = String(product.name || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productImage = String(product.image || 'https://via.placeholder.com/150').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productCategory = String(product.category || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const productPrice = (product.price || 0).toLocaleString();
        
        return `
        <div class="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-6 hover:shadow-lg transition-all cursor-pointer" onclick="window.location.href='product-detail.html?id=${productId}'">
            <img src="${productImage}" 
                 alt="${productName}"
                 class="w-32 h-32 object-cover rounded-lg"
                 onerror="this.src='https://via.placeholder.com/150'">
            <div class="flex-1">
                <div class="mb-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">${productCategory}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">${productName}</h3>
                ${showPrice !== false ? `
                    <div>
                        <span class="text-2xl font-bold text-red-600">NT$ ${productPrice}</span>
                    </div>
                ` : ''}
            </div>
            <button onclick="event.stopPropagation(); window.location.href='product-detail.html?id=${productId}'" 
                    class="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg hover:shadow-lg transition">
                查看詳情
            </button>
        </div>
        `;
    }).join('');
    
    if (showButton !== false && buttonText && buttonLink) {
        let buttonContainer = section.querySelector('.products-more-button');
        if (!buttonContainer) {
            buttonContainer = document.createElement('div');
            buttonContainer.className = 'products-more-button text-center mt-8';
            section.appendChild(buttonContainer);
        }
        buttonContainer.innerHTML = `
            <a href="${buttonLink}" class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition">
                ${buttonText}
            </a>
        `;
    }
}

// 渲染為卡片（類似 grid，但樣式不同）
function renderProductsAsCards(products, showPrice, showButton, buttonText, buttonLink) {
    renderProductsAsGrid(products, showPrice, showButton, buttonText, buttonLink);
}

// 發布變更（同步到前台）
function publishHomepageChanges() {
    const config = getHomepageConfig();
    
    // 保存到 localStorage（確保配置被保存）
    saveHomepageConfig(config);
    
    // 同時保存到 publishedHomepageConfig（用於發布狀態）
    localStorage.setItem('publishedHomepageConfig', JSON.stringify(config));
    
    // 觸發內容同步事件（如果 ContentSync 存在且有 saveContent 方法）
    if (window.ContentSync && typeof window.ContentSync.saveContent === 'function') {
        try {
        window.ContentSync.saveContent('homepage', config);
        } catch (e) {
            console.warn('⚠️ ContentSync.saveContent 失敗:', e);
        }
    }
    
    // 觸發自定義事件，通知同一個頁面內的更新
    if (typeof window !== 'undefined' && window.dispatchEvent) {
        try {
        window.dispatchEvent(new CustomEvent('homepageConfigUpdated', { detail: config }));
            console.log('✅ 已觸發 homepageConfigUpdated 事件（同頁面）');
        } catch (e) {
            console.warn('⚠️ 觸發事件失敗:', e);
        }
    }
    
    // 觸發 localStorage storage 事件（用於跨分頁同步）
    // 注意：storage 事件只有在不同分頁/視窗間才會觸發，同一個頁面不會觸發
    // 我們設置一個時間戳來觸發 storage 事件
    try {
        const timestamp = Date.now();
        localStorage.setItem('homepageConfigTimestamp', timestamp.toString());
        console.log('✅ 已設置 homepageConfigTimestamp（觸發跨分頁同步）');
    } catch (e) {
        console.warn('⚠️ 設置時間戳失敗:', e);
    }
    
    if (window.logger) {
        window.logger.log('✅ 首頁變更已發布');
    } else {
        console.log('✅ 首頁變更已發布');
        console.log('📋 配置內容:', config.sections.map(s => ({ id: s.id, order: s.order, enabled: s.enabled })));
    }
    return true;
}

// 預覽變更
function previewHomepageChanges() {
    const config = getHomepageConfig();
    // 在新視窗打開首頁並應用配置
    const previewWindow = window.open('index.html', '_blank');
    
    if (previewWindow) {
        previewWindow.addEventListener('DOMContentLoaded', () => {
            // 注入配置到預覽視窗
            previewWindow.localStorage.setItem('previewConfig', JSON.stringify(config));
        });
    }
}

// 導出配置
window.HomepageConfig = {
    DEFAULT_HOMEPAGE_CONFIG,
    getHomepageConfig,
    saveHomepageConfig,
    updateSectionConfig,
    toggleSection,
    reorderSections,
    getEnabledSections,
    resetToDefaultConfig,
    applyConfigToFrontend,
    applyProductsSectionContent,
    publishHomepageChanges,
    previewHomepageChanges
};

// 初始化
if (window.logger) {
    window.logger.log('✅ 首頁 Section 管理系統已載入');
} else {
    console.log('✅ 首頁 Section 管理系統已載入');
}

