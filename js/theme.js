// 主题切换功能
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    
    if (currentTheme === 'auto') {
        // 如果当前是自动模式，切换到明确的模式
        setTheme(getSystemTheme() === 'dark' ? 'light' : 'dark');
    } else {
        // 如果当前是明确的模式，切换到自动模式
        setTheme('auto');
    }
}

// 设置主题
function setTheme(theme) {
    const html = document.documentElement;
    const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
    
    html.setAttribute('data-theme', effectiveTheme);
    html.setAttribute('data-theme-mode', theme); // 存储实际的主题模式（auto/light/dark）
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme, effectiveTheme);
}

// 更新主题图标
function updateThemeIcon(mode, effectiveTheme) {
    const icon = document.querySelector('.theme-toggle svg');
    if (mode === 'auto') {
        // 自动模式图标
        icon.innerHTML = `<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6.5v1.5m0-10V7.5m5 5h1.5m-11 0H6m8.5-3.5l1-1m-9 9l1-1m7 0l1 1m-9-9l1 1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    } else if (effectiveTheme === 'dark') {
        // 暗色模式图标
        icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    } else {
        // 亮色模式图标
        icon.innerHTML = `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 3l0 1m0 16l0 1m9 -9l-1 0m-16 0l-1 0m15.5 -6.5l-0.7 0.7m-12.1 12.1l-0.7 0.7m12.1 -12.1l0.7 0.7m-12.1 12.1l0.7 0.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    }
}

// 获取系统主题偏好
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 监听系统主题变化
function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        const currentMode = localStorage.getItem('theme') || 'auto';
        if (currentMode === 'auto') {
            setTheme('auto');
        }
    });
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    setTheme(savedTheme);
    watchSystemTheme();
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
