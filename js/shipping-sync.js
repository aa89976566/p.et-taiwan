/**
 * 物流同步系統 - 將後台物流設定同步到前端結帳頁面
 * Shipping Sync System - Synchronizes backend shipping settings to frontend checkout
 */

const ShippingSync = {
    /**
     * 從 localStorage 讀取物流設定
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('shippingSettings');
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (e) {
            console.error('載入物流設定時發生錯誤:', e);
            return this.getDefaultSettings();
        }
    },

    /**
     * 預設物流設定
     */
    getDefaultSettings() {
        return {
            hsinchuLogistics: {
                enabled: true,
                fee: 120,
                days: "3-5",
                name: "新竹物流"
            },
            sevenEleven: {
                enabled: true,
                fee: 60,
                days: "2-3"
            },
            familyMart: {
                enabled: true,
                fee: 60,
                days: "2-3"
            },
            freeShipping: {
                enabled: true,
                threshold: 1000
            }
        };
    },

    /**
     * 應用物流設定到結帳頁面
     */
    applyShippingSettings() {
        const settings = this.loadSettings();
        
        // 更新新竹物流設定
        this.updateHsinchuLogistics(settings.hsinchuLogistics);
        
        // 更新 7-11 超商取貨
        this.updateSevenEleven(settings.sevenEleven);
        
        // 更新全家超商取貨
        this.updateFamilyMart(settings.familyMart);
        
        // 更新免運門檻
        this.updateFreeShipping(settings.freeShipping);
        
        console.log('✅ 物流設定已同步到結帳頁面');
    },

    /**
     * 更新新竹物流選項
     */
    updateHsinchuLogistics(settings) {
        if (!settings) return;

        const hsinchuOption = document.querySelector('input[name="shippingMethod"][value="hsinchu_logistics"]');
        const hsinchuContainer = hsinchuOption?.closest('label');
        
        if (hsinchuContainer) {
            if (!settings.enabled) {
                hsinchuContainer.style.display = 'none';
                return;
            } else {
                hsinchuContainer.style.display = 'flex';
            }

            const feeElement = hsinchuContainer.querySelector('.text-red-600');
            if (feeElement && settings.fee !== undefined) {
                feeElement.textContent = `NT$ ${settings.fee}`;
            }

            const daysElement = hsinchuContainer.querySelector('.text-sm.text-gray-600');
            if (daysElement && settings.days) {
                daysElement.textContent = `新竹物流配送，${settings.days} 個工作天送達`;
            }
        }

        window.shippingFees = window.shippingFees || {};
        window.shippingFees.hsinchuLogistics = settings.fee || 120;
    },

    /**
     * 更新 7-11 超商取貨
     */
    updateSevenEleven(settings) {
        if (!settings) return;

        const sevenElevenOption = document.querySelector('input[name="shippingMethod"][value="711_store"]');
        const sevenElevenContainer = sevenElevenOption?.closest('label');
        
        if (sevenElevenContainer) {
            // 顯示/隱藏選項
            if (!settings.enabled) {
                sevenElevenContainer.style.display = 'none';
                return;
            } else {
                sevenElevenContainer.style.display = 'flex';
            }

            // 更新運費
            const feeElement = sevenElevenContainer.querySelector('.text-red-600');
            if (feeElement && settings.fee !== undefined) {
                feeElement.textContent = `NT$ ${settings.fee}`;
            }

            // 更新配送時間
            const daysElement = sevenElevenContainer.querySelector('.text-sm.text-gray-600');
            if (daysElement && settings.days) {
                daysElement.textContent = `送至 7-11 門市，${settings.days} 個工作天到店`;
            }
        }

        // 儲存到全域變數
        window.shippingFees = window.shippingFees || {};
        window.shippingFees.sevenEleven = settings.fee || 60;
    },

    /**
     * 更新全家超商取貨
     */
    updateFamilyMart(settings) {
        if (!settings) return;

        const familyMartOption = document.querySelector('input[name="shippingMethod"][value="family_store"]');
        const familyMartContainer = familyMartOption?.closest('label');
        
        if (familyMartContainer) {
            // 顯示/隱藏選項
            if (!settings.enabled) {
                familyMartContainer.style.display = 'none';
                return;
            } else {
                familyMartContainer.style.display = 'flex';
            }

            // 更新運費
            const feeElement = familyMartContainer.querySelector('.text-red-600');
            if (feeElement && settings.fee !== undefined) {
                feeElement.textContent = `NT$ ${settings.fee}`;
            }

            // 更新配送時間
            const daysElement = familyMartContainer.querySelector('.text-sm.text-gray-600');
            if (daysElement && settings.days) {
                daysElement.textContent = `送至全家門市，${settings.days} 個工作天到店`;
            }
        }

        // 儲存到全域變數
        window.shippingFees = window.shippingFees || {};
        window.shippingFees.familyMart = settings.fee || 60;
    },

    /**
     * 更新免運門檻
     */
    updateFreeShipping(settings) {
        if (!settings) return;

        window.freeShippingSettings = {
            enabled: settings.enabled || false,
            threshold: settings.threshold || 1000
        };

        // 顯示免運提示
        if (settings.enabled && settings.threshold) {
            this.showFreeShippingNotice(settings.threshold);
        }
    },

    /**
     * 顯示免運提示
     */
    showFreeShippingNotice(threshold) {
        const existingNotice = document.getElementById('freeShippingNotice');
        if (existingNotice) {
            existingNotice.remove();
        }

        const shippingSection = document.querySelector('.bg-white.rounded-2xl.shadow-md.p-6');
        if (shippingSection) {
            const notice = document.createElement('div');
            notice.id = 'freeShippingNotice';
            notice.className = 'bg-green-50 border border-green-200 rounded-lg p-4 mb-4';
            notice.innerHTML = `
                <div class="flex items-center space-x-2 text-green-700">
                    <i class="fas fa-gift"></i>
                    <span class="font-medium">滿 NT$ ${threshold.toLocaleString()} 免運費！</span>
                </div>
            `;
            shippingSection.insertBefore(notice, shippingSection.firstChild);
        }
    },

    /**
     * 計算運費
     */
    calculateShippingFee(method, subtotal) {
        const settings = this.loadSettings();
        
        // 檢查是否符合免運
        if (settings.freeShipping?.enabled && subtotal >= settings.freeShipping.threshold) {
            return 0;
        }

        // 根據配送方式返回運費
        switch (method) {
            case 'hsinchu_logistics':
                return settings.hsinchuLogistics?.fee || 120;
            case '711_store':
                return settings.sevenEleven?.fee || 60;
            case 'family_store':
                return settings.familyMart?.fee || 60;
            default:
                return 60; // 默認超商取貨運費
        }
    },

    /**
     * 初始化
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyShippingSettings();
            });
        } else {
            this.applyShippingSettings();
        }
    }
};

// 自動初始化
ShippingSync.init();

// 監聽 storage 事件
window.addEventListener('storage', (e) => {
    if (e.key === 'shippingSettings') {
        console.log('📢 偵測到物流設定更新，重新載入...');
        ShippingSync.applyShippingSettings();
    }
});

// 導出到全域
window.ShippingSync = ShippingSync;
