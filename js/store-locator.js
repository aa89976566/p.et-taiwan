/**
 * 超商門市定位系統
 * 使用 Google Maps API 和超商門市查詢服務
 */

class StoreLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.selectedStore = null;
        this.currentStoreType = null;
        this.userLocation = null;
        this.googleMapsLoaded = false;
    }

    /**
     * 載入 Google Maps API
     */
    loadGoogleMaps(callback) {
        if (window.google && window.google.maps) {
            this.googleMapsLoaded = true;
            if (callback) callback();
            return;
        }

        // Google Maps API Key
        const apiKey = 'AIzaSyCrqnAEkX30_gZz-ooxQpZgfCXVAi-U8Hg';
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=zh-TW&region=TW`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.googleMapsLoaded = true;
            if (callback) callback();
        };
        document.head.appendChild(script);
    }

    /**
     * 初始化地圖
     */
    initMap(containerId, center = { lat: 25.0330, lng: 121.5654 }) {
        if (!this.googleMapsLoaded) {
            this.loadGoogleMaps(() => this.initMap(containerId, center));
            return;
        }

        this.map = new google.maps.Map(document.getElementById(containerId), {
            center: center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        // 獲取用戶位置
        this.getUserLocation();
    }

    /**
     * 獲取用戶當前位置
     */
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    if (this.map) {
                        this.map.setCenter(this.userLocation);
                        this.map.setZoom(15);
                    }
                    this.searchNearbyStores();
                },
                (error) => {
                    console.warn('無法獲取位置:', error);
                    // 使用預設位置（台北車站）
                    this.userLocation = { lat: 25.0479, lng: 121.5170 };
                    this.searchNearbyStores();
                }
            );
        } else {
            this.userLocation = { lat: 25.0479, lng: 121.5170 };
            this.searchNearbyStores();
        }
    }

    /**
     * 根據地址搜尋門市
     */
    async searchStoresByAddressInput(address) {
        console.log('🔍 根據地址搜尋門市:', address);
        
        if (!address || address.trim() === '') {
            // 如果地址為空，使用附近搜尋
            this.searchNearbyStores(this.currentStoreType || '711');
            return;
        }
        
        // 顯示載入中
        const container = document.getElementById('storeList');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                    <p>正在搜尋「${address}」附近的門市...</p>
                </div>
            `;
        }
        
        // 使用 Google Geocoding API 將地址轉換為座標
        if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: address + ', 台灣' }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const location = results[0].geometry.location;
                    this.userLocation = {
                        lat: location.lat(),
                        lng: location.lng()
                    };
                    
                    // 更新地圖中心
                    if (this.map) {
                        this.map.setCenter(this.userLocation);
                        this.map.setZoom(15);
                    }
                    
                    // 搜尋附近門市
                    this.searchNearbyStores(this.currentStoreType || '711');
                } else {
                    console.error('❌ 地址解析失敗:', status);
                    // 使用 Text Search 直接搜尋
                    this.searchStoresByText(address);
                }
            });
        } else {
            // 如果 Google Maps 未載入，使用文字搜尋
            this.searchStoresByText(address);
        }
    }
    
    /**
     * 使用文字搜尋門市
     */
    async searchStoresByText(searchText) {
        console.log('🔍 使用文字搜尋門市:', searchText);
        
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.warn('⚠️ Google Places API 未載入，使用備用方法');
            this.searchStoresByAddress(this.currentStoreType || '711');
            return;
        }
        
        this.currentStoreType = this.currentStoreType || '711';
        this.clearMarkers();
        
        const service = new google.maps.places.PlacesService(this.map || document.createElement('div'));
        
        // 構建搜尋關鍵字
        const storeKeywords = this.currentStoreType === '711' 
            ? ['7-ELEVEN', '7-11', '統一超商']
            : ['全家便利商店', 'FamilyMart', '全家'];
        
        let searchCount = 0;
        let allResults = [];
        
        const performTextSearch = (keyword) => {
            const request = {
                query: `${keyword} ${searchText}`,
                fields: ['name', 'geometry', 'formatted_address', 'place_id', 'rating', 'user_ratings_total']
            };
            
            service.textSearch(request, (results, status) => {
                console.log(`🔍 文字搜尋結果 (${keyword}):`, status, results?.length || 0);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    // 過濾出正確的超商
                    const filtered = results.filter(place => {
                        const name = place.name.toLowerCase();
                        if (this.currentStoreType === '711') {
                            return name.includes('7-eleven') || name.includes('7-11') || name.includes('統一超商');
                        } else {
                            return name.includes('全家') || name.includes('familymart');
                        }
                    });
                    allResults = allResults.concat(filtered);
                }
                
                searchCount++;
                if (searchCount >= storeKeywords.length) {
                    // 移除重複的門市
                    const uniqueResults = this.removeDuplicateStores(allResults);
                    if (uniqueResults.length > 0) {
                        // 計算距離
                        if (this.userLocation) {
                            uniqueResults.forEach(place => {
                                if (place.geometry && place.geometry.location) {
                                    place.distance = this.calculateDistance(
                                        this.userLocation,
                                        { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
                                    );
                                }
                            });
                            uniqueResults.sort((a, b) => (a.distance || 999) - (b.distance || 999));
                        }
                        this.displayStores(uniqueResults, this.currentStoreType);
                    } else {
                        console.warn('⚠️ 未找到門市，使用備用方法');
                        this.searchStoresByAddress(this.currentStoreType);
                    }
                }
            });
        };
        
        // 執行所有搜尋
        storeKeywords.forEach(keyword => performTextSearch(keyword));
    }

    /**
     * 搜尋附近的超商門市
     */
    async searchNearbyStores(storeType = '711') {
        console.log('🔍 開始搜尋超商門市:', storeType);
        
        if (!this.userLocation) {
            console.warn('⚠️ 用戶位置未設定，使用預設位置');
            this.userLocation = { lat: 25.0479, lng: 121.5170 };
        }
        
        if (!this.map) {
            console.error('❌ 地圖未初始化');
            // 嘗試初始化地圖
            const mapContainer = document.getElementById('storeMap');
            if (mapContainer) {
                this.initMap('storeMap', this.userLocation);
                setTimeout(() => this.searchNearbyStores(storeType), 1000);
            } else {
                this.searchStoresByAddress(storeType);
            }
            return;
        }

        this.currentStoreType = storeType;
        this.clearMarkers();

        // 顯示載入中
        const container = document.getElementById('storeList');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                    <p>正在搜尋附近門市...</p>
                </div>
            `;
        }

        // 檢查 Google Maps API 是否載入
        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error('❌ Google Maps Places API 未載入');
            this.searchStoresByAddress(storeType);
            return;
        }

        // 使用 Google Places API 搜尋超商
        try {
            const service = new google.maps.places.PlacesService(this.map);
            
            // 改進搜尋關鍵字
            const keywords = storeType === '711' 
                ? ['7-ELEVEN', '7-11', '統一超商']
                : ['全家便利商店', 'FamilyMart', '全家'];
            
            // 嘗試多個搜尋請求
            let searchCount = 0;
            let allResults = [];
            
            const performSearch = (keyword) => {
                const request = {
                    location: this.userLocation,
                    radius: 5000, // 5 公里範圍
                    type: 'store',
                    keyword: keyword
                };

                service.nearbySearch(request, (results, status) => {
                    console.log(`🔍 搜尋結果 (${keyword}):`, status, results?.length || 0);
                    
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        // 過濾出正確的超商
                        const filtered = results.filter(place => {
                            const name = place.name.toLowerCase();
                            if (storeType === '711') {
                                return name.includes('7-eleven') || name.includes('7-11') || name.includes('統一超商');
                            } else {
                                return name.includes('全家') || name.includes('familymart');
                            }
                        });
                        allResults = allResults.concat(filtered);
                    }
                    
                    searchCount++;
                    if (searchCount >= keywords.length) {
                        // 移除重複的門市
                        const uniqueResults = this.removeDuplicateStores(allResults);
                        if (uniqueResults.length > 0) {
                            this.displayStores(uniqueResults, storeType);
                        } else {
                            console.warn('⚠️ 未找到門市，使用備用方法');
                            this.searchStoresByAddress(storeType);
                        }
                    }
                });
            };
            
            // 執行所有搜尋
            keywords.forEach(keyword => performSearch(keyword));
            
        } catch (error) {
            console.error('❌ 搜尋門市時發生錯誤:', error);
            this.searchStoresByAddress(storeType);
        }
    }
    
    /**
     * 移除重複的門市
     */
    removeDuplicateStores(stores) {
        const seen = new Set();
        return stores.filter(store => {
            const key = `${store.place_id || store.name}_${store.geometry?.location?.lat()}_${store.geometry?.location?.lng()}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * 顯示門市列表
     */
    displayStores(places, storeType) {
        const storeList = [];
        
        places.forEach((place, index) => {
            if (!place.geometry || !place.geometry.location) return;

            const marker = new google.maps.Marker({
                map: this.map,
                position: place.geometry.location,
                title: place.name,
                icon: {
                    url: storeType === '711' 
                        ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
                        : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

            // 資訊視窗
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px; min-width: 200px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${place.name}</h3>
                        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${place.vicinity || place.formatted_address || ''}</p>
                        <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                            ${place.rating ? `⭐ ${place.rating}` : ''}
                            ${place.user_ratings_total ? `(${place.user_ratings_total} 評價)` : ''}
                        </p>
                        <button onclick="window.StoreLocator.selectStore(${index})" 
                                style="background: #E63946; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                            選擇此門市
                        </button>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.markers.push(marker);

            // 計算距離
            const distance = this.calculateDistance(
                this.userLocation,
                { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }
            );

            // 生成門市代碼（優先使用 place_id，如果沒有則使用名稱和座標生成唯一代碼）
            let storeCode = place.place_id;
            if (!storeCode) {
                // 如果沒有 place_id，使用名稱和座標生成唯一代碼
                const nameHash = place.name.replace(/\s+/g, '').substring(0, 6);
                const lat = place.geometry.location.lat().toFixed(4);
                const lng = place.geometry.location.lng().toFixed(4);
                storeCode = `${nameHash}_${lat}_${lng}`;
            }
            
            storeList.push({
                index: index,
                name: place.name,
                address: place.vicinity || place.formatted_address || '',
                distance: distance,
                location: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                },
                rating: place.rating || 0,
                placeId: storeCode // 確保門市代碼存在
            });
        });

        // 按距離排序
        storeList.sort((a, b) => a.distance - b.distance);

        // 更新門市列表顯示
        this.updateStoreList(storeList, storeType);
    }

    /**
     * 更新門市列表顯示
     */
    updateStoreList(stores, storeType) {
        const container = document.getElementById('storeList');
        if (!container) return;

        if (stores.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-store text-4xl mb-3"></i>
                    <p>附近沒有找到 ${storeType === '711' ? '7-11' : '全家'} 門市</p>
                    <p class="text-sm mt-2">請嘗試搜尋其他地址</p>
                </div>
            `;
            return;
        }

        container.innerHTML = stores.map(store => `
            <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition cursor-pointer mb-3" 
                 onclick="window.StoreLocator.selectStoreFromList(${store.index})">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800 mb-1">${store.name}</p>
                        <p class="text-sm text-gray-600 mb-1">
                            <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>${store.address}
                        </p>
                        <div class="flex items-center space-x-4 mt-2">
                            <span class="text-xs text-gray-500">
                                <i class="fas fa-walking mr-1"></i>${(store.distance || 0).toFixed(1)} 公里
                            </span>
                            ${store.rating > 0 ? `
                                <span class="text-xs text-yellow-500">
                                    <i class="fas fa-star mr-1"></i>${store.rating}
                                </span>
                            ` : ''}
                            ${store.placeId ? `
                                <span class="text-xs text-gray-400">
                                    <i class="fas fa-barcode mr-1"></i>代碼: ${store.placeId.substring(0, 12)}${store.placeId.length > 12 ? '...' : ''}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm ml-3">
                        選擇
                    </button>
                </div>
            </div>
        `).join('');

        // 儲存門市列表供選擇使用
        this.storeList = stores;
    }

    /**
     * 選擇門市
     */
    selectStore(index) {
        if (!this.storeList || !this.storeList[index]) {
            console.error('❌ 找不到門市，index:', index, 'storeList:', this.storeList);
            return;
        }

        const store = this.storeList[index];
        
        // 確保門市代碼存在
        let storeCode = store.placeId || store.code;
        if (!storeCode) {
            // 如果都沒有，生成一個唯一代碼
            const nameHash = (store.name || '').replace(/\s+/g, '').substring(0, 6);
            const lat = (store.location?.lat || 0).toFixed(4);
            const lng = (store.location?.lng || 0).toFixed(4);
            storeCode = `${nameHash}_${lat}_${lng}`;
        }
        
        this.selectedStore = {
            code: storeCode,
            name: store.name || '未命名門市',
            address: store.address || '地址未提供',
            location: store.location || { lat: 0, lng: 0 }
        };

        console.log('✅ 選擇門市:', this.selectedStore);

        // 更新顯示
        this.updateSelectedStore();
        
        // 關閉 Modal
        this.closeStoreModal();
    }

    /**
     * 從列表選擇門市
     */
    selectStoreFromList(index) {
        this.selectStore(index);
    }

    /**
     * 更新已選擇的門市顯示
     */
    updateSelectedStore() {
        if (!this.selectedStore || !this.currentStoreType) {
            console.warn('⚠️ 無法更新門市顯示：selectedStore 或 currentStoreType 為空');
            return;
        }

        const type = this.currentStoreType;
        const storeId = type === '711' ? '711' : 'family';

        console.log('📝 更新門市顯示:', type, this.selectedStore);

        if (type === '711') {
            const codeEl = document.getElementById('store711Code');
            const nameEl = document.getElementById('store711Name');
            const addressEl = document.getElementById('store711Address');
            const containerEl = document.getElementById('selected711Store');
            
            if (codeEl) codeEl.textContent = this.selectedStore.code || '未提供';
            if (nameEl) nameEl.textContent = this.selectedStore.name || '未命名門市';
            if (addressEl) addressEl.textContent = this.selectedStore.address || '地址未提供';
            if (containerEl) containerEl.classList.remove('hidden');
            
            console.log('✅ 7-11 門市資訊已更新:', {
                code: this.selectedStore.code,
                name: this.selectedStore.name,
                address: this.selectedStore.address
            });
        } else {
            const codeEl = document.getElementById('storeFamilyCode');
            const nameEl = document.getElementById('storeFamilyName');
            const addressEl = document.getElementById('storeFamilyAddress');
            const containerEl = document.getElementById('selectedFamilyStore');
            
            if (codeEl) codeEl.textContent = this.selectedStore.code || '未提供';
            if (nameEl) nameEl.textContent = this.selectedStore.name || '未命名門市';
            if (addressEl) addressEl.textContent = this.selectedStore.address || '地址未提供';
            if (containerEl) containerEl.classList.remove('hidden');
            
            console.log('✅ 全家門市資訊已更新:', {
                code: this.selectedStore.code,
                name: this.selectedStore.name,
                address: this.selectedStore.address
            });
        }

        // 更新全域變數供結帳使用
        if (!window.selectedStores) window.selectedStores = {};
        window.selectedStores[storeId] = this.selectedStore;
        
        console.log('✅ 全域變數已更新:', window.selectedStores);
    }

    /**
     * 清除所有標記
     */
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
    }

    /**
     * 計算兩點間距離（公里）
     */
    calculateDistance(pos1, pos2) {
        const R = 6371; // 地球半徑（公里）
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * 開啟門市選擇 Modal
     */
    openStoreModal(storeType) {
        console.log('StoreLocator.openStoreModal 被調用:', storeType);
        this.currentStoreType = storeType;
        const modal = document.getElementById('storeModal');
        const mapContainer = document.getElementById('storeMap');
        
        if (!modal) {
            console.error('找不到 storeModal 元素');
            alert('門市選擇功能載入中，請稍後再試');
            return;
        }
        
        if (!mapContainer) {
            console.error('找不到 storeMap 元素');
        }
        
        // 顯示 Modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // 顯示載入中
        const storeList = document.getElementById('storeList');
        if (storeList) {
            storeList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                    <p>正在載入地圖...</p>
                </div>
            `;
        }
        
        // 初始化地圖
        if (!this.map && mapContainer) {
            console.log('🗺️ 初始化地圖...');
            this.loadGoogleMaps(() => {
                console.log('✅ Google Maps API 已載入');
                // 確保地圖容器可見
                setTimeout(() => {
                    this.initMap('storeMap');
                    // 搜尋附近門市
                    setTimeout(() => {
                        this.searchNearbyStores(storeType);
                    }, 1500);
                }, 500);
            });
        } else if (this.map) {
            // 如果地圖已初始化，直接搜尋
            console.log('✅ 地圖已初始化，開始搜尋門市');
            setTimeout(() => {
                this.searchNearbyStores(storeType);
            }, 300);
        } else {
            // 如果地圖容器不存在，只顯示列表（使用備用方法）
            console.warn('⚠️ 地圖容器不存在，使用備用方法');
            this.searchStoresByAddress(storeType);
        }
    }

    /**
     * 關閉門市選擇 Modal
     */
    closeStoreModal() {
        const modal = document.getElementById('storeModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    /**
     * 備用方法：根據地址搜尋門市（如果 Google Places API 不可用）
     */
    searchStoresByAddress(storeType) {
        console.log('📋 使用備用方法搜尋門市:', storeType);
        
        // 全台主要城市的門市資料（擴展版）
        const defaultStores = {
            '711': [
                // 台北市
                { name: '7-ELEVEN 信義威秀門市', address: '台北市信義區松壽路18號', code: '001234', location: { lat: 25.0360, lng: 121.5680 }, distance: 0.5, rating: 4.5 },
                { name: '7-ELEVEN 台北車站門市', address: '台北市中正區北平西路3號', code: '002345', location: { lat: 25.0479, lng: 121.5170 }, distance: 0.8, rating: 4.3 },
                { name: '7-ELEVEN 西門町門市', address: '台北市萬華區西寧南路50號', code: '003456', location: { lat: 25.0420, lng: 121.5070 }, distance: 1.2, rating: 4.2 },
                { name: '7-ELEVEN 板橋車站門市', address: '新北市板橋區縣民大道二段7號', code: '004567', location: { lat: 25.0140, lng: 121.4640 }, distance: 1.5, rating: 4.4 },
                { name: '7-ELEVEN 新店門市', address: '新北市新店區北新路三段65號', code: '005678', location: { lat: 24.9680, lng: 121.5400 }, distance: 2.0, rating: 4.3 },
                // 桃園市
                { name: '7-ELEVEN 桃園車站門市', address: '桃園市桃園區中正路1號', code: '006789', location: { lat: 24.9890, lng: 121.3010 }, distance: 2.5, rating: 4.2 },
                { name: '7-ELEVEN 中壢門市', address: '桃園市中壢區中正路100號', code: '007890', location: { lat: 24.9560, lng: 121.2250 }, distance: 3.0, rating: 4.3 },
                // 新竹市
                { name: '7-ELEVEN 新竹車站門市', address: '新竹市東區中華路二段445號', code: '008901', location: { lat: 24.8010, lng: 120.9710 }, distance: 3.5, rating: 4.4 },
                // 台中市
                { name: '7-ELEVEN 台中車站門市', address: '台中市中區台灣大道一段1號', code: '009012', location: { lat: 24.1370, lng: 120.6850 }, distance: 4.0, rating: 4.5 },
                { name: '7-ELEVEN 逢甲門市', address: '台中市西屯區文華路100號', code: '010123', location: { lat: 24.1790, lng: 120.6440 }, distance: 4.5, rating: 4.4 },
                // 台南市
                { name: '7-ELEVEN 台南車站門市', address: '台南市東區北門路二段4號', code: '011234', location: { lat: 22.9970, lng: 120.2130 }, distance: 5.0, rating: 4.3 },
                // 高雄市
                { name: '7-ELEVEN 高雄車站門市', address: '高雄市三民區建國二路318號', code: '012345', location: { lat: 22.6390, lng: 120.3020 }, distance: 5.5, rating: 4.4 },
                { name: '7-ELEVEN 夢時代門市', address: '高雄市前鎮區中華五路789號', code: '013456', location: { lat: 22.5950, lng: 120.3070 }, distance: 6.0, rating: 4.5 }
            ],
            'family': [
                // 台北市
                { name: '全家便利商店 中山旗艦店', address: '台北市中山區中山北路二段100號', code: 'FML001', location: { lat: 25.0520, lng: 121.5200 }, distance: 0.6, rating: 4.4 },
                { name: '全家便利商店 大安店', address: '台北市大安區復興南路一段200號', code: 'FML002', location: { lat: 25.0330, lng: 121.5430 }, distance: 0.9, rating: 4.3 },
                { name: '全家便利商店 信義店', address: '台北市信義區信義路五段1號', code: 'FML003', location: { lat: 25.0360, lng: 121.5680 }, distance: 1.1, rating: 4.5 },
                { name: '全家便利商店 板橋店', address: '新北市板橋區文化路一段188號', code: 'FML004', location: { lat: 25.0140, lng: 121.4640 }, distance: 1.4, rating: 4.3 },
                { name: '全家便利商店 新店店', address: '新北市新店區北新路三段65號', code: 'FML005', location: { lat: 24.9680, lng: 121.5400 }, distance: 1.9, rating: 4.2 },
                // 桃園市
                { name: '全家便利商店 桃園店', address: '桃園市桃園區中正路1號', code: 'FML006', location: { lat: 24.9890, lng: 121.3010 }, distance: 2.4, rating: 4.3 },
                { name: '全家便利商店 中壢店', address: '桃園市中壢區中正路100號', code: 'FML007', location: { lat: 24.9560, lng: 121.2250 }, distance: 2.9, rating: 4.2 },
                // 新竹市
                { name: '全家便利商店 新竹店', address: '新竹市東區中華路二段445號', code: 'FML008', location: { lat: 24.8010, lng: 120.9710 }, distance: 3.4, rating: 4.4 },
                // 台中市
                { name: '全家便利商店 台中店', address: '台中市中區台灣大道一段1號', code: 'FML009', location: { lat: 24.1370, lng: 120.6850 }, distance: 3.9, rating: 4.5 },
                { name: '全家便利商店 逢甲店', address: '台中市西屯區文華路100號', code: 'FML010', location: { lat: 24.1790, lng: 120.6440 }, distance: 4.4, rating: 4.4 },
                // 台南市
                { name: '全家便利商店 台南店', address: '台南市東區北門路二段4號', code: 'FML011', location: { lat: 22.9970, lng: 120.2130 }, distance: 4.9, rating: 4.3 },
                // 高雄市
                { name: '全家便利商店 高雄店', address: '高雄市三民區建國二路318號', code: 'FML012', location: { lat: 22.6390, lng: 120.3020 }, distance: 5.4, rating: 4.4 },
                { name: '全家便利商店 夢時代店', address: '高雄市前鎮區中華五路789號', code: 'FML013', location: { lat: 22.5950, lng: 120.3070 }, distance: 5.9, rating: 4.5 }
            ]
        };
        
        // 如果有搜尋關鍵字，過濾門市
        const searchText = document.getElementById('storeSearch')?.value?.toLowerCase() || '';
        let stores = defaultStores[storeType] || [];
        
        if (searchText) {
            stores = stores.filter(store => 
                store.name.toLowerCase().includes(searchText) || 
                store.address.toLowerCase().includes(searchText)
            );
        }
        
        // 計算距離（基於用戶位置）
        if (this.userLocation) {
            stores.forEach(store => {
                store.distance = this.calculateDistance(this.userLocation, store.location);
            });
            stores.sort((a, b) => a.distance - b.distance);
        }
        
        // 在地圖上顯示標記
        if (this.map) {
            stores.forEach((store, index) => {
                const marker = new google.maps.Marker({
                    map: this.map,
                    position: store.location,
                    title: store.name,
                    icon: {
                        url: storeType === '711' 
                            ? 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
                            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
                
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px; min-width: 200px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${store.name}</h3>
                            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${store.address}</p>
                            <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                                <i class="fas fa-walking"></i> ${store.distance.toFixed(1)} 公里
                            </p>
                            <button onclick="window.StoreLocator.selectStoreFromList(${index})" 
                                    style="background: #E63946; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; width: 100%;">
                                選擇此門市
                            </button>
                        </div>
                    `
                });
                
                marker.addListener('click', () => {
                    infoWindow.open(this.map, marker);
                });
                
                this.markers.push(marker);
            });
        }
        
        // 轉換為標準格式並顯示
        const formattedStores = stores.map((store, index) => ({
            index: index,
            name: store.name,
            address: store.address,
            distance: store.distance,
            location: store.location,
            rating: store.rating || 0,
            placeId: store.code
        }));
        
        this.storeList = formattedStores;
        this.updateStoreList(formattedStores, storeType);
        
        console.log('✅ 備用方法找到', formattedStores.length, '間門市');
    }
}

// 初始化
window.StoreLocator = new StoreLocator();

