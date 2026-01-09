/**
 * 匠寵 - 用户认证系统
 * 处理用户登录、注册和会员状态管理
 */

class UserAuth {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEYS.USER || 'jiangchong_user';
        this.currentUser = this.loadUser();
    }

    // 从 localStorage 加载用户
    loadUser() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('加载用户数据失败:', error);
            return null;
        }
    }

    // 保存用户到 localStorage
    saveUser(user) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(user));
            this.currentUser = user;
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    }

    // 用户登录
    async login(email, password) {
        // 優先使用後端 API
        if (window.ApiClient) {
            try {
                const response = await window.ApiClient.login(email, password);
                if (response.success && response.data) {
                    const userSession = {
                        id: response.data.user.id,
                        name: response.data.user.name,
                        email: response.data.user.email,
                        phone: response.data.user.phone,
                        memberLevel: response.data.user.memberLevel || 'normal',
                        avatar: response.data.user.avatar,
                        loginAt: Date.now(),
                        token: response.data.token
                    };
                    this.saveUser(userSession);
                    this.updateUI();
                    return userSession;
                }
            } catch (error) {
                console.warn('後端 API 登入失敗，嘗試本地登入:', error.message);
                // 如果後端不可用，回退到本地登入
            }
        }

        // 回退到本地登入（當後端不可用時）
        if (!window.DataStore) {
            throw new Error('数据系统未初始化');
        }

        const users = window.DataStore.getAll('users');
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new Error('用户不存在');
        }

        if (user.password !== password) {
            throw new Error('密码错误');
        }

        window.DataStore.update('users', user.id, {
            lastLoginAt: Date.now()
        });

        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            memberLevel: user.memberLevel,
            avatar: user.avatar,
            loginAt: Date.now()
        };

        this.saveUser(userSession);
        this.updateUI();
        
        return userSession;
    }

    // 用户注册
    async register(userData) {
        // 验证邮箱格式
        if (!this.validateEmail(userData.email)) {
            throw new Error('邮箱格式不正确');
        }

        // 验证手机号格式
        if (userData.phone && !this.validatePhone(userData.phone)) {
            throw new Error('手机号格式不正确');
        }

        // 優先使用後端 API
        if (window.ApiClient) {
            try {
                const response = await window.ApiClient.register(userData);
                if (response.success && response.data) {
                    const userSession = {
                        id: response.data.user.id,
                        name: response.data.user.name,
                        email: response.data.user.email,
                        phone: response.data.user.phone,
                        memberLevel: response.data.user.memberLevel || 'normal',
                        avatar: response.data.user.avatar,
                        loginAt: Date.now(),
                        token: response.data.token
                    };
                    this.saveUser(userSession);
                    this.updateUI();
                    return userSession;
                }
            } catch (error) {
                console.warn('後端 API 註冊失敗，嘗試本地註冊:', error.message);
                // 如果後端不可用，回退到本地註冊
            }
        }

        // 回退到本地註冊（當後端不可用時）
        if (!window.DataStore) {
            throw new Error('数据系统未初始化');
        }

        const users = window.DataStore.getAll('users');
        if (users.some(u => u.email === userData.email)) {
            throw new Error('邮箱已被注册');
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            avatar: 'https://i.pravatar.cc/100?img=' + Math.floor(Math.random() * 70),
            memberLevel: 'normal',
            totalSpent: 0,
            orderCount: 0,
            quizCompletedCount: 0,
            subscriptionCount: 0,
            registeredAt: Date.now(),
            lastLoginAt: Date.now()
        };

        const saved = window.DataStore.create('users', newUser);
        
        const userSession = {
            id: saved.id,
            name: saved.name,
            email: saved.email,
            phone: saved.phone,
            memberLevel: saved.memberLevel,
            avatar: saved.avatar,
            loginAt: Date.now()
        };

        this.saveUser(userSession);
        this.updateUI();
        
        return userSession;
    }

    // 用户登出
    logout() {
        // 如果使用後端 API，清除 token
        if (window.ApiClient && this.currentUser?.token) {
            window.ApiClient.logout();
        }
        
        localStorage.removeItem(this.storageKey);
        this.currentUser = null;
        this.updateUI();
        
        // 重新加载页面
        if (window.location.pathname.includes('admin')) {
            window.location.href = 'index.html';
        } else {
            window.location.reload();
        }
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否登录
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // 更新 UI
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');

        if (!loginBtn || !registerBtn || !userMenu) return;

        if (this.isLoggedIn()) {
            // 显示用户菜单
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            userMenu.classList.remove('hidden');
            
            if (userName) {
                userName.textContent = this.currentUser.name || '会员';
            }
        } else {
            // 显示登录/注册按钮
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            userMenu.classList.add('hidden');
        }
        
        // 重新載入 Hero 內容（確保顯示後台設定的內容）
        if (this.isLoggedIn() && typeof window !== 'undefined') {
            setTimeout(() => {
                // 如果在首頁，重新載入 Hero 內容
                if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
                    if (typeof loadHeroContent === 'function') {
                        loadHeroContent();
                    }
                    // 同時應用首頁配置
                    if (window.HomepageConfig) {
                        window.HomepageConfig.applyConfigToFrontend();
                    }
                }
            }, 100);
        }
    }

    // 验证邮箱
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 验证手机号
    validatePhone(phone) {
        const re = /^09\d{8}$/;
        return re.test(phone);
    }
}

// 初始化用户认证系统
window.UserAuth = new UserAuth();

// 页面加载完成后更新 UI
document.addEventListener('DOMContentLoaded', function() {
    if (window.UserAuth) {
        window.UserAuth.updateUI();
    }
});

// 导出全局函数供 HTML 调用
window.handleLogin = async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    try {
        await window.UserAuth.login(email, password);
        showToast('登录成功！', 'success');
        closeModal('loginModal');
        
        // 重新載入 Hero 內容（確保顯示後台設定的內容）
        setTimeout(() => {
            if (typeof loadHeroContent === 'function') {
                loadHeroContent();
            }
            // 同時應用首頁配置
            if (window.HomepageConfig) {
                window.HomepageConfig.applyConfigToFrontend();
            }
        }, 100);
    } catch (error) {
        showToast(error.message, 'error');
    }
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!name || !email || !password || !confirmPassword) {
        showToast('请填写完整信息', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return;
    }
    
    try {
        await window.UserAuth.register({ name, email, phone, password });
        showToast('注册成功！', 'success');
        closeModal('registerModal');
        
        // 重新載入 Hero 內容（確保顯示後台設定的內容）
        setTimeout(() => {
            if (typeof loadHeroContent === 'function') {
                loadHeroContent();
            }
            // 同時應用首頁配置
            if (window.HomepageConfig) {
                window.HomepageConfig.applyConfigToFrontend();
            }
        }, 100);
    } catch (error) {
        showToast(error.message, 'error');
    }
};

window.handleLogout = function() {
    if (confirm('确定要登出吗？')) {
        window.UserAuth.logout();
    }
};
