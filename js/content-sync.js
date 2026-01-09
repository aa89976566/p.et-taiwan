/**
 * 內容同步系統 - 將編輯器修改同步到前端頁面
 * Content Sync System - Synchronizes editor changes to frontend pages
 */

const ContentSync = {
    /**
     * 從 localStorage 讀取所有內容設定
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem('websiteContent');
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (e) {
            console.error('載入設定時發生錯誤:', e);
            return this.getDefaultSettings();
        }
    },

    /**
     * 預設設定
     */
    getDefaultSettings() {
        return {
            hero: {
                title: "給毛孩最好的，從台灣夜市到健康餐桌",
                subtitle: "手作零食 × 循環經濟 × 智能訂閱",
                btnPrimaryText: "探索產品",
                btnPrimaryLink: "#products",
                btnPrimaryNewTab: false,
                btnSecondaryText: "開始測驗",
                btnSecondaryLink: "quiz.html",
                btnSecondaryNewTab: false,
                backgroundImage: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b"
            },
            footer: {
                companyName: "匠寵 JiangChong",
                address: "台灣 台北市信義區",
                phone: "0800-123-456",
                email: "service@jiangchong.com"
            }
        };
    },

    /**
     * 應用首頁橫幅設定
     */
    applyHeroSettings(settings) {
        if (!settings || !settings.hero) return;

        const hero = settings.hero;
        
        // 更新標題
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle && hero.title) {
            heroTitle.textContent = hero.title;
        }

        // 更新副標題
        const heroSubtitle = document.getElementById('heroSubtitle');
        if (heroSubtitle && hero.subtitle) {
            heroSubtitle.textContent = hero.subtitle;
        }

        // 更新主要按鈕
        const btnPrimary = document.getElementById('btnPrimary');
        if (btnPrimary) {
            if (hero.btnPrimaryText) {
                const btnText = btnPrimary.querySelector('span');
                if (btnText) btnText.textContent = hero.btnPrimaryText;
            }
            if (hero.btnPrimaryLink) {
                btnPrimary.setAttribute('href', hero.btnPrimaryLink);
            }
            if (hero.btnPrimaryNewTab) {
                btnPrimary.setAttribute('target', '_blank');
                btnPrimary.setAttribute('rel', 'noopener noreferrer');
            } else {
                btnPrimary.removeAttribute('target');
                btnPrimary.removeAttribute('rel');
            }
        }

        // 更新次要按鈕
        const btnSecondary = document.getElementById('btnSecondary');
        if (btnSecondary) {
            if (hero.btnSecondaryText) {
                const btnText = btnSecondary.querySelector('span');
                if (btnText) btnText.textContent = hero.btnSecondaryText;
            }
            if (hero.btnSecondaryLink) {
                btnSecondary.setAttribute('href', hero.btnSecondaryLink);
            }
            if (hero.btnSecondaryNewTab) {
                btnSecondary.setAttribute('target', '_blank');
                btnSecondary.setAttribute('rel', 'noopener noreferrer');
            } else {
                btnSecondary.removeAttribute('target');
                btnSecondary.removeAttribute('rel');
            }
        }

        // 更新背景圖片
        const heroSection = document.getElementById('hero');
        if (heroSection && hero.backgroundImage) {
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${hero.backgroundImage}')`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            heroSection.style.backgroundRepeat = 'no-repeat';
        }
    },

    /**
     * 應用頁尾設定
     */
    applyFooterSettings(settings) {
        if (!settings || !settings.footer) return;

        const footer = settings.footer;

        // 更新公司名稱
        const companyName = document.getElementById('footerCompanyName');
        if (companyName && footer.companyName) {
            companyName.textContent = footer.companyName;
        }

        // 更新地址
        const address = document.getElementById('footerAddress');
        if (address && footer.address) {
            address.textContent = footer.address;
        }

        // 更新電話
        const phone = document.getElementById('footerPhone');
        if (phone && footer.phone) {
            phone.textContent = footer.phone;
        }

        // 更新 Email
        const email = document.getElementById('footerEmail');
        if (email && footer.email) {
            email.textContent = footer.email;
        }
    },

    /**
     * 應用所有設定
     */
    applyAllSettings() {
        const settings = this.loadSettings();
        this.applyHeroSettings(settings);
        this.applyFooterSettings(settings);
        console.log('✅ 內容設定已同步到頁面');
    },

    /**
     * 初始化 - 在頁面載入時執行
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.applyAllSettings();
            });
        } else {
            this.applyAllSettings();
        }
    }
};

// 自動初始化
ContentSync.init();

// 監聽 storage 事件，當其他標籤頁修改內容時自動更新
window.addEventListener('storage', (e) => {
    if (e.key === 'websiteContent') {
        console.log('📢 偵測到內容更新，重新載入...');
        ContentSync.applyAllSettings();
    }
});

// 導出到全域
window.ContentSync = ContentSync;
