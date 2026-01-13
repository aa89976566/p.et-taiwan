/**
 * 會員地址管理 - 前端 JavaScript
 * 用於會員中心的地址管理功能
 */

class AddressManager {
    constructor() {
        this.addresses = [];
        this.currentEditingId = null;
    }

    /**
     * 初始化
     */
    async init() {
        await this.loadAddresses();
        this.setupEventListeners();
    }

    /**
     * 載入所有地址
     */
    async loadAddresses() {
        try {
            const response = await window.ApiClient.get('/addresses');
            
            if (response.success) {
                this.addresses = response.data.addresses;
                this.renderAddresses();
            } else {
                console.error('載入地址失敗:', response.message);
            }
        } catch (error) {
            console.error('載入地址錯誤:', error);
        }
    }

    /**
     * 渲染地址列表
     */
    renderAddresses() {
        const container = document.getElementById('addressList');
        if (!container) return;

        if (this.addresses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>尚未新增任何地址</p>
                    <button onclick="addressManager.showAddForm()" class="btn btn-primary">
                        新增地址
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.addresses.map(addr => `
            <div class="address-card ${addr.isDefault ? 'default' : ''}" data-id="${addr.id}">
                ${addr.isDefault ? '<span class="badge badge-primary">預設地址</span>' : ''}
                
                <div class="address-info">
                    <h4>${addr.recipientName}</h4>
                    <p class="phone">${addr.phone}</p>
                    <p class="address">
                        ${addr.postalCode ? addr.postalCode + ' ' : ''}
                        ${addr.city}${addr.district}${addr.address}
                    </p>
                </div>

                <div class="address-actions">
                    ${!addr.isDefault ? `
                        <button onclick="addressManager.setDefault('${addr.id}')" class="btn btn-sm">
                            設為預設
                        </button>
                    ` : ''}
                    <button onclick="addressManager.editAddress('${addr.id}')" class="btn btn-sm">
                        編輯
                    </button>
                    <button onclick="addressManager.deleteAddress('${addr.id}')" class="btn btn-sm btn-danger">
                        刪除
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * 顯示新增表單
     */
    showAddForm() {
        this.currentEditingId = null;
        this.showModal('新增地址', {});
    }

    /**
     * 編輯地址
     */
    editAddress(id) {
        const address = this.addresses.find(addr => addr.id === id);
        if (!address) return;

        this.currentEditingId = id;
        this.showModal('編輯地址', address);
    }

    /**
     * 顯示表單 Modal
     */
    showModal(title, data = {}) {
        const modal = document.getElementById('addressModal');
        const form = document.getElementById('addressForm');
        
        document.getElementById('modalTitle').textContent = title;
        
        // 填充表單數據
        form.recipientName.value = data.recipientName || '';
        form.phone.value = data.phone || '';
        form.city.value = data.city || '';
        form.district.value = data.district || '';
        form.address.value = data.address || '';
        form.postalCode.value = data.postalCode || '';
        form.isDefault.checked = data.isDefault || false;

        modal.style.display = 'block';
    }

    /**
     * 關閉 Modal
     */
    closeModal() {
        document.getElementById('addressModal').style.display = 'none';
        document.getElementById('addressForm').reset();
        this.currentEditingId = null;
    }

    /**
     * 儲存地址
     */
    async saveAddress(formData) {
        try {
            const data = {
                recipientName: formData.get('recipientName'),
                phone: formData.get('phone'),
                city: formData.get('city'),
                district: formData.get('district'),
                address: formData.get('address'),
                postalCode: formData.get('postalCode'),
                isDefault: formData.get('isDefault') === 'on'
            };

            let response;
            if (this.currentEditingId) {
                // 更新地址
                response = await window.ApiClient.put(`/addresses/${this.currentEditingId}`, data);
            } else {
                // 新增地址
                response = await window.ApiClient.post('/addresses', data);
            }

            if (response.success) {
                alert(response.message);
                this.closeModal();
                await this.loadAddresses();
            } else {
                alert(response.message || '操作失敗');
            }
        } catch (error) {
            console.error('儲存地址錯誤:', error);
            alert('操作失敗，請稍後再試');
        }
    }

    /**
     * 刪除地址
     */
    async deleteAddress(id) {
        if (!confirm('確定要刪除這個地址嗎？')) return;

        try {
            const response = await window.ApiClient.delete(`/addresses/${id}`);
            
            if (response.success) {
                alert('地址已刪除');
                await this.loadAddresses();
            } else {
                alert(response.message || '刪除失敗');
            }
        } catch (error) {
            console.error('刪除地址錯誤:', error);
            alert('刪除失敗，請稍後再試');
        }
    }

    /**
     * 設定預設地址
     */
    async setDefault(id) {
        try {
            const response = await window.ApiClient.put(`/addresses/${id}/set-default`);
            
            if (response.success) {
                await this.loadAddresses();
            } else {
                alert(response.message || '設定失敗');
            }
        } catch (error) {
            console.error('設定預設地址錯誤:', error);
            alert('設定失敗，請稍後再試');
        }
    }

    /**
     * 設定事件監聽器
     */
    setupEventListeners() {
        // 表單提交
        const form = document.getElementById('addressForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                this.saveAddress(formData);
            });
        }

        // Modal 關閉按鈕
        const closeBtn = document.querySelector('.modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // 點擊 Modal 外部關閉
        const modal = document.getElementById('addressModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
}

// 初始化地址管理器
const addressManager = new AddressManager();

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('addressList')) {
        addressManager.init();
    }
});
