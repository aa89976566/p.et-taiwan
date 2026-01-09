// ========================================
// 匠寵 Landing Page 動畫邏輯
// 使用 GSAP ScrollTrigger 創建滾動觸發動畫
// ========================================

// 等待頁面載入完成
window.addEventListener('DOMContentLoaded', () => {
  // 確保 GSAP 已載入
  if (typeof gsap === 'undefined') {
    console.error('❌ GSAP 未載入！請檢查 CDN 連結');
    return;
  }

  // 註冊 ScrollTrigger 插件
  gsap.registerPlugin(ScrollTrigger);

  console.log('✅ GSAP 和 ScrollTrigger 已載入');

  // ========================================
  // 階段 1：初始狀態（夜晚）
  // ========================================

  // 設置初始狀態
  gsap.set('#night', { opacity: 1 });
  gsap.set('#moon', { opacity: 1, y: 0 });
  gsap.set('#sun', { opacity: 0, y: 0 });
  gsap.set('#catZzz', { opacity: 1 });
  gsap.set('#dogZzz', { opacity: 1 });
  gsap.set('#owner', { x: 200, opacity: 0 });
  gsap.set('#door', { rotationY: 0 });
  gsap.set('#doorLight', { opacity: 0 });
  gsap.set('#ball', { opacity: 0, x: '50%', y: '20%' });
  gsap.set('#catYawn', { opacity: 0 });
  gsap.set('#dogYawn', { opacity: 0 });
  gsap.set('#slapMark', { opacity: 0 });

  // ========================================
  // 動畫時間軸設置
  // ========================================

  // 創建主要時間軸
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#scrollTrack',
      start: 'top top',
      end: () => `+=${window.innerHeight * 10}`, // 提供足夠的滾動距離
      scrub: 1, // 滾動與動畫同步
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // 可以在開發時查看滾動進度
        // console.log('滾動進度:', self.progress.toFixed(2));
      }
    }
  });

  // ========================================
  // 階段 2：黎明（太陽升起，月亮落下）
  // ========================================

  mainTimeline
    .to('#night', {
      opacity: 0,
      duration: 2,
      ease: 'power2.inOut'
    }, 0)
    .to('#moon', {
      opacity: 0,
      y: -100,
      duration: 2,
      ease: 'power2.in'
    }, 0)
    .to('#sun', {
      opacity: 1,
      y: -50,
      duration: 2,
      ease: 'power2.out'
    }, 0);

  // ========================================
  // 階段 3：寵物醒來（停止打呼，開始打哈欠）
  // ========================================

  mainTimeline
    .to('#catZzz', {
      opacity: 0,
      duration: 0.5
    }, 1)
    .to('#dogZzz', {
      opacity: 0,
      duration: 0.5
    }, 1)
    .to('#catYawn', {
      opacity: 1,
      duration: 0.3,
      y: -20,
      ease: 'back.out(1.7)'
    }, 1.2)
    .to('#catYawn', {
      opacity: 0,
      duration: 0.5
    }, 1.7)
    .to('#dogYawn', {
      opacity: 1,
      duration: 0.3,
      y: -20,
      ease: 'back.out(1.7)'
    }, 1.5)
    .to('#dogYawn', {
      opacity: 0,
      duration: 0.5
    }, 2);

  // ========================================
  // 階段 4：主人回家（門打開，光線進來）
  // ========================================

  mainTimeline
    .to('#door', {
      rotationY: -90,
      duration: 1,
      ease: 'power2.inOut',
      transformOrigin: 'left center'
    }, 2)
    .to('#doorLight', {
      opacity: 0.8,
      duration: 0.5,
      ease: 'power2.out'
    }, 2)
    .to('#owner', {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out'
    }, 2.5);

  // ========================================
  // 階段 5：主人拿出球（袋子動畫）
  // ========================================

  mainTimeline
    .to('#bag', {
      rotation: 30,
      duration: 0.3,
      ease: 'power2.out'
    }, 3.5)
    .to('#bag', {
      rotation: 0,
      duration: 0.3,
      ease: 'power2.in'
    }, 3.8);

  // ========================================
  // 階段 6：球從上方掉落
  // ========================================

  mainTimeline
    .to('#ball', {
      opacity: 1,
      x: '50%',
      y: '35%',
      duration: 0.8,
      ease: 'bounce.out'
    }, 4)
    .to('#ball', {
      y: '45%',
      duration: 0.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    }, 4.8);

  // ========================================
  // 階段 7：狗看到球（興奮動畫）
  // ========================================

  mainTimeline
    .to('#dog', {
      y: -20,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 2
    }, 5.2)
    .to('#dog .petBody', {
      scaleY: 1.2,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 2
    }, 5.2);

  // ========================================
  // 階段 8：狗衝向球（移動動畫）
  // ========================================

  mainTimeline
    .to('#dog', {
      x: '+=150',
      duration: 0.8,
      ease: 'power2.out'
    }, 5.5)
    .to('#ball', {
      x: '+=150',
      duration: 0.8,
      ease: 'power2.out'
    }, 5.5);

  // ========================================
  // 階段 9：貓被驚醒（被打到）
  // ========================================

  mainTimeline
    .to('#cat', {
      x: '+=30',
      rotation: 15,
      duration: 0.2,
      ease: 'power2.out'
    }, 6)
    .to('#slapMark', {
      opacity: 1,
      scale: 1.5,
      duration: 0.2,
      ease: 'back.out(1.7)'
    }, 6)
    .to('#slapMark', {
      opacity: 0,
      scale: 1,
      duration: 0.5
    }, 6.2)
    .to('#cat', {
      x: '+=0',
      rotation: 0,
      duration: 0.3,
      ease: 'power2.inOut'
    }, 6.3);

  // ========================================
  // 階段 10：貓也加入（追逐球）
  // ========================================

  mainTimeline
    .to('#cat', {
      x: '+=180',
      duration: 1,
      ease: 'power2.out'
    }, 6.5)
    .to('#ball', {
      x: '+=80',
      y: '+=30',
      rotation: 360,
      duration: 1,
      ease: 'power2.inOut'
    }, 6.5);

  // ========================================
  // 階段 11：球彈跳（持續動畫）
  // ========================================

  mainTimeline
    .to('#ball', {
      y: '+=20',
      duration: 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 3
    }, 7.5);

  // ========================================
  // 階段 12：寵物一起玩（快樂動畫）
  // ========================================

  mainTimeline
    .to(['#dog', '#cat'], {
      y: -15,
      duration: 0.3,
      ease: 'power2.out',
      stagger: 0.1,
      yoyo: true,
      repeat: 2
    }, 8)
    .to(['#dog .petBody', '#cat .petBody'], {
      scaleY: 1.15,
      duration: 0.3,
      ease: 'power2.out',
      stagger: 0.1,
      yoyo: true,
      repeat: 2
    }, 8);

  // ========================================
  // 階段 13：主人看著寵物（滿意微笑）
  // ========================================

  mainTimeline
    .to('#owner', {
      y: -5,
      duration: 0.5,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    }, 9);

  // ========================================
  // 階段 14：淡出場景（準備進入下一區塊）
  // ========================================

  mainTimeline
    .to('#stage', {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut'
    }, 10);

  // ========================================
  // 額外動畫：持續的打呼動畫（初始階段）
  // ========================================

  // 貓打呼
  gsap.to('#catZzz', {
    y: -10,
    duration: 1.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });

  // 狗打呼
  gsap.to('#dogZzz', {
    y: -15,
    duration: 1.8,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });

  // ========================================
  // 響應式調整
  // ========================================

  function adjustForMobile() {
    if (window.innerWidth <= 768) {
      // 移動端調整動畫位置
      gsap.set('#owner', { x: 50 });
      gsap.set('#dog', { x: '35%' });
      gsap.set('#cat', { x: '10%' });
    }
  }

  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
    adjustForMobile();
  });
  
  adjustForMobile();

  // ========================================
  // 完成提示
  // ========================================

  console.log('🎬 匠寵 Landing Page 動畫已載入！');
  console.log('📜 使用 ScrollTrigger 控制動畫時間軸');
  console.log('🎨 品牌色系：Primary #FF6B6B, Secondary #4ECDC4, Accent #FFD93D');
  console.log('💡 開始向下滾動以觸發動畫！');
});
