/**
 * 7-11 超商門市選擇器
 * 專用於訂閱頁面的門市選擇功能
 */

class StoreSelector {
    constructor() {
        this.stores = [];
        this.filteredStores = [];
        this.selectedStore = null;
        this.selectedStoreDisplay = null;
        this.storeListContainer = null;
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        // 等待 DOM 載入完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadStores());
        } else {
            this.loadStores();
        }
    }

    /**
     * 載入門市資料
     */
    async loadStores() {
        try {
            // 嘗試從 JSON 檔案載入
            const response = await fetch('data/711-stores.json');
            if (response.ok) {
                this.stores = await response.json();
            } else {
                // 如果載入失敗，使用預設資料
                console.warn('無法載入門市資料，使用預設資料');
                this.stores = this.getDefaultStores();
            }
        } catch (error) {
            console.error('載入門市資料失敗:', error);
            // 使用預設資料
            this.stores = this.getDefaultStores();
        }

        this.filteredStores = [...this.stores];
        this.setupUI();
        this.renderStores();
    }

    /**
     * 取得預設門市資料（如果 JSON 檔案載入失敗）
     */
    getDefaultStores() {
        return [
            { code: '175566', name: '敦北店', address: '台北市松山區敦化北路122號1樓', city: '台北市', district: '松山區', phone: '02-2712-3408' },
            { code: '175568', name: '松仁店', address: '台北市信義區松仁路123號1樓', city: '台北市', district: '信義區', phone: '02-2722-3488' },
            { code: '175569', name: '信義店', address: '台北市信義區信義路五段7號B1', city: '台北市', district: '信義區', phone: '02-2723-4567' },
            { code: '175570', name: '南京店', address: '台北市松山區南京東路三段303號1樓', city: '台北市', district: '松山區', phone: '02-2718-5678' },
            { code: '175571', name: '復興店', address: '台北市大安區復興南路一段137號1樓', city: '台北市', district: '大安區', phone: '02-2771-2345' }
        ];
    }

    /**
     * 設置 UI 元素
     */
    setupUI() {
        // 取得容器
        this.storeListContainer = document.getElementById('store-list');
        this.selectedStoreDisplay = document.getElementById('selected-store-display');

        // 設置搜尋功能
        const searchInput = document.getElementById('store-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // 設置縣市篩選
        const citySelect = document.getElementById('store-city');
        if (citySelect) {
            this.setupCityFilter(citySelect);
            citySelect.addEventListener('change', () => this.handleFilterChange());
        }

        // 設置區域篩選
        const districtSelect = document.getElementById('store-district');
        if (districtSelect) {
            districtSelect.addEventListener('change', () => this.handleFilterChange());
        }
    }

    /**
     * 設置縣市篩選選項
     */
    setupCityFilter(citySelect) {
        // 取得所有縣市
        const cities = [...new Set(this.stores.map(store => store.city))].sort();
        
        // 清空現有選項（保留「全部縣市」）
        while (citySelect.children.length > 1) {
            citySelect.removeChild(citySelect.lastChild);
        }

        // 添加縣市選項
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }

    /**
     * 處理篩選變更
     */
    handleFilterChange() {
        const citySelect = document.getElementById('store-city');
        const districtSelect = document.getElementById('store-district');
        const searchInput = document.getElementById('store-search');

        const selectedCity = citySelect?.value || 'all';
        const selectedDistrict = districtSelect?.value || 'all';
        const searchTerm = searchInput?.value || '';

        this.filterStores(selectedCity, selectedDistrict, searchTerm);
    }

    /**
     * 處理搜尋
     */
    handleSearch(searchTerm) {
        const citySelect = document.getElementById('store-city');
        const districtSelect = document.getElementById('store-district');

        const selectedCity = citySelect?.value || 'all';
        const selectedDistrict = districtSelect?.value || 'all';

        this.filterStores(selectedCity, selectedDistrict, searchTerm);
    }

    /**
     * 篩選門市
     */
    filterStores(city, district, searchTerm) {
        this.filteredStores = this.stores.filter(store => {
            // 縣市篩選
            if (city !== 'all' && store.city !== city) {
                return false;
            }

            // 區域篩選（需要先更新區域選項）
            if (district !== 'all' && store.district !== district) {
                return false;
            }

            // 搜尋關鍵字
            if (searchTerm) {
                const keyword = searchTerm.toLowerCase();
                const searchableText = `${store.name} ${store.address} ${store.city} ${store.district}`.toLowerCase();
                if (!searchableText.includes(keyword)) {
                    return false;
                }
            }

            return true;
        });

        // 更新區域選項（根據選中的縣市）
        this.updateDistrictOptions(city);

        // 重新渲染
        this.renderStores();
    }

    /**
     * 更新區域選項
     */
    updateDistrictOptions(city) {
        const districtSelect = document.getElementById('store-district');
        if (!districtSelect) return;

        // 清空現有選項（保留「全部鄉鎮區」）
        while (districtSelect.children.length > 1) {
            districtSelect.removeChild(districtSelect.lastChild);
        }

        // 根據選中的縣市取得區域
        let districts = [];
        if (city === 'all') {
            districts = [...new Set(this.stores.map(store => store.district))];
        } else {
            districts = [...new Set(this.stores.filter(store => store.city === city).map(store => store.district))];
        }

        districts.sort().forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }

    /**
     * 渲染門市列表
     */
    renderStores() {
        if (!this.storeListContainer) return;

        if (this.filteredStores.length === 0) {
            this.storeListContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <p>找不到符合條件的門市</p>
                    <p style="font-size: 14px; margin-top: 10px;">請調整搜尋條件或篩選器</p>
                </div>
            `;
            return;
        }

        this.storeListContainer.innerHTML = this.filteredStores.map(store => `
            <div class="store-item" data-store-code="${store.code}" onclick="window.storeSelector.selectStore('${store.code}')">
                <div class="store-item-header">
                    <h4 class="store-name">${store.name}</h4>
                    <span class="store-code">${store.code}</span>
                </div>
                <div class="store-item-body">
                    <p class="store-address">${store.address}</p>
                    <p class="store-contact">電話：${store.phone || 'N/A'}</p>
                </div>
            </div>
        `).join('');

        // 移除 loading 類別
        this.storeListContainer.classList.remove('loading-stores');
    }

    /**
     * 選擇門市
     */
    selectStore(storeCode) {
        const store = this.stores.find(s => s.code === storeCode);
        if (!store) {
            console.error('找不到門市:', storeCode);
            return;
        }

        this.selectedStore = store;

        // 更新已選擇門市顯示
        if (this.selectedStoreDisplay) {
            this.selectedStoreDisplay.innerHTML = `
                <div class="selected-store-card">
                    <div class="selected-store-header">
                        <span class="selected-store-badge">已選擇</span>
                        <button class="change-store-btn" onclick="window.storeSelector.clearSelection()">更改</button>
                    </div>
                    <div class="selected-store-body">
                        <h4 class="selected-store-name">${store.name}</h4>
                        <p class="selected-store-code">門市代碼：${store.code}</p>
                        <p class="selected-store-address">${store.address}</p>
                        <p class="selected-store-phone">電話：${store.phone || 'N/A'}</p>
                    </div>
                </div>
            `;
        }

        // 高亮選中的門市
        document.querySelectorAll('.store-item').forEach(item => {
            if (item.dataset.storeCode === storeCode) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    /**
     * 清除選擇
     */
    clearSelection() {
        this.selectedStore = null;
        if (this.selectedStoreDisplay) {
            this.selectedStoreDisplay.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #999; background: #F9F9F9; border-radius: 8px;">
                    <p>請選擇取貨門市</p>
                </div>
            `;
        }

        // 移除所有選中狀態
        document.querySelectorAll('.store-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    /**
     * 取得已選擇的門市
     */
    getSelectedStore() {
        return this.selectedStore;
    }
}

// 自動初始化（當腳本載入時）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 如果容器存在，才初始化
        if (document.getElementById('store-selector-container')) {
            window.storeSelector = new StoreSelector();
        }
    });
} else {
    // 如果容器存在，立即初始化
    if (document.getElementById('store-selector-container')) {
        window.storeSelector = new StoreSelector();
    }
}

