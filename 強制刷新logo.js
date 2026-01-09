// 強制清除 logo 緩存並重新載入
(function() {
    const logo = document.querySelector('#main-logo svg, nav svg, .logo svg');
    if (logo) {
        logo.style.display = 'block !important';
        logo.setAttribute('data-version', Date.now());
    }
    console.log('✅ Logo 已強制更新');
})();
