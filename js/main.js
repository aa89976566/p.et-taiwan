// Main JavaScript for 匠寵 Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
    mobileMenuLinks?.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Product Tabs
const productTabs = document.querySelectorAll('.product-tab');
const productContents = document.querySelectorAll('.product-content');

productTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Remove active class from all tabs
        productTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Hide all content
        productContents.forEach(content => {
            content.classList.add('hidden');
        });
        
        // Show target content
        const targetContent = document.getElementById(`tab-${targetTab}`);
        if (targetContent) {
            targetContent.classList.remove('hidden');
        }
    });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Shopping Cart (Simple Implementation)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('已加入購物車！', 'success');
    updateCartBadge();
}

function updateCartBadge() {
    const cartButtons = document.querySelectorAll('.cart-button');
    cartButtons.forEach(btn => {
        const badge = btn.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = cart.length;
        } else if (cart.length > 0) {
            const newBadge = document.createElement('span');
            newBadge.className = 'cart-badge';
            newBadge.textContent = cart.length;
            btn.style.position = 'relative';
            btn.appendChild(newBadge);
        }
    });
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add to Cart Buttons
document.querySelectorAll('button:not([data-no-cart])').forEach(button => {
    if (button.textContent.includes('加入購物車')) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.bg-white');
            const productName = card.querySelector('h4')?.textContent || '產品';
            const productPrice = card.querySelector('.text-primary, .text-secondary, [style*="color"]')?.textContent || 'NT$ 0';
            
            addToCart({
                name: productName,
                price: productPrice,
                quantity: 1
            });
        });
    }
});

// Crowdfunding Progress Animation
const progressBars = document.querySelectorAll('[style*="width:"]');
progressBars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0%';
    
    setTimeout(() => {
        bar.style.transition = 'width 2s ease-out';
        bar.style.width = targetWidth;
    }, 500);
});

// Countdown Timer (Example for Crowdfunding)
function startCountdown(endDate) {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        if (distance < 0) {
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const countdownElements = document.querySelectorAll('.countdown');
        countdownElements.forEach(countdown => {
            countdown.innerHTML = `
                <div class="countdown-item">
                    <div class="countdown-value">${days}</div>
                    <div class="countdown-label">天</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${hours}</div>
                    <div class="countdown-label">時</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${minutes}</div>
                    <div class="countdown-label">分</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${seconds}</div>
                    <div class="countdown-label">秒</div>
                </div>
            `;
        });
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Start countdown (45 days from now)
const crowdfundingEndDate = new Date().getTime() + (45 * 24 * 60 * 60 * 1000);
// startCountdown(crowdfundingEndDate);

// Image Lazy Loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('skeleton');
                    observer.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Scroll Reveal Animation
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^09\d{8}$/;
    return re.test(phone);
}

// Newsletter Subscription
const newsletterForms = document.querySelectorAll('.newsletter-form');
newsletterForms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (validateEmail(email)) {
            // Here you would send the email to your backend
            showToast('感謝訂閱！我們會將最新消息發送到您的信箱。', 'success');
            emailInput.value = '';
        } else {
            showToast('請輸入有效的電子郵件地址', 'error');
        }
    });
});

// FAQ Accordion
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
        const content = this.nextElementSibling;
        const icon = this.querySelector('i');
        
        // Toggle current accordion
        content.classList.toggle('show');
        
        // Rotate icon
        if (content.classList.contains('show')) {
            icon.style.transform = 'rotate(180deg)';
        } else {
            icon.style.transform = 'rotate(0deg)';
        }
    });
});

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Testimonials Slider (Simple Implementation)
let currentTestimonial = 0;
const testimonials = document.querySelectorAll('.testimonial-item');

function showTestimonial(index) {
    testimonials.forEach((testimonial, i) => {
        if (i === index) {
            testimonial.style.display = 'block';
        } else {
            testimonial.style.display = 'none';
        }
    });
}

function nextTestimonial() {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
}

function prevTestimonial() {
    currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
    showTestimonial(currentTestimonial);
}

// Auto-rotate testimonials every 5 seconds
if (testimonials.length > 0) {
    setInterval(nextTestimonial, 5000);
}

// Product Filter
function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (category === 'all' || product.dataset.category === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Price Range Slider
const priceSliders = document.querySelectorAll('.price-slider');
priceSliders.forEach(slider => {
    slider.addEventListener('input', function() {
        const output = document.getElementById(this.dataset.output);
        if (output) {
            output.textContent = `NT$ ${this.value}`;
        }
    });
});

// Quantity Counter
document.querySelectorAll('.quantity-minus').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.nextElementSibling;
        const currentValue = parseInt(input.value);
        if (currentValue > 1) {
            input.value = currentValue - 1;
        }
    });
});

document.querySelectorAll('.quantity-plus').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const currentValue = parseInt(input.value);
        const maxValue = parseInt(input.max) || 99;
        if (currentValue < maxValue) {
            input.value = currentValue + 1;
        }
    });
});

// Share Buttons
function shareOnFacebook(url, title) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
}

function shareOnLine(url, title) {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('連結已複製到剪貼簿！', 'success');
    }).catch(() => {
        showToast('複製失敗，請手動複製', 'error');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartBadge();
    revealOnScroll();
    
    // Add animation classes to elements
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        el.classList.add('reveal');
    });
    
    logger.log('匠寵網站已載入完成！');
});

// User Dropdown Toggle
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
};

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.classList.add('hidden');
    }
});

// Login/Register Modal Functions
window.openLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        showLoginForm();
    }
};

window.closeLoginModal = function() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
    }
};

window.showLoginForm = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
};

window.showRegisterForm = function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
};

// Error Handling
window.addEventListener('error', function(e) {
    console.error('發生錯誤:', e.error);
});

// Service Worker Registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(err => console.log('SW registration failed'));
    });
}

// Export functions for use in other scripts
window.JiangChong = {
    addToCart,
    showToast,
    openModal,
    closeModal,
    filterProducts,
    shareOnFacebook,
    shareOnLine,
    copyToClipboard
};
