// Google Analytics 4
function initGA4() {
    const GA4_ID = 'G-RERKY6YDCD'; // 替换为你的 GA4 测量 ID
    
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', GA4_ID);
}

// Umami Analytics
function initUmami() {
    const UMAMI_WEBSITE_ID = 'XXXXXXXXXX'; // 替换为你的 Umami website ID
    const UMAMI_URL = 'https://analytics.umami.is/script.js'; // 如果你自己部署了 umami，需要修改这个 URL

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
    script.src = UMAMI_URL;
    document.head.appendChild(script);
}

// 初始化统计
initGA4(); // 已启用 Google Analytics
// initUmami(); // 取消注释以启用 Umami
