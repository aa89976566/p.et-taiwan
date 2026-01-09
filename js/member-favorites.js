/**
 * 匠寵 - 會員收藏功能
 * 處理商品收藏、優惠券、地址管理
 */

class MemberFavorites {
    constructor() {
        this.storageKey = 'jiangchong_favorites';
    }

    // 獲取所有收藏
    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (error) {
            console.error('讀取收藏失敗:', error);
            return [];
        }
    }

    // 檢查是否已收藏
    isFavorite(productId) {
        const favorites = this.getFavorites();
        return favorites.includes(productId);
    }

    // 切換收藏狀態
    toggleFavorite(productId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(productId);

        if (index > -1) {
            // 移除收藏
            favorites.splice(index, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            return false;
        } else {
            // 加入收藏
            favorites.push(productId);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            return true;
        }
    }

    // 加入收藏
    addFavorite(productId) {
        const favorites = this.getFavorites();
        if (!favorites.includes(productId)) {
            favorites.push(productId);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            return true;
        }
        return false;
    }

    // 移除收藏
    removeFavorite(productId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(productId);
        if (index > -1) {
            favorites.splice(index, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(favorites));
            return true;
        }
        return false;
    }

    // 獲取收藏數量
    getFavoriteCount() {
        return this.getFavorites().length;
    }
}

// 建立全局實例
window.MemberFavorites = new MemberFavorites();



