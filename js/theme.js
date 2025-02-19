/**
 * JSON Visualizer - Theme Manager
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

// 主题切换功能
function toggleTheme() {
    const html = document.documentElement;
    const currentMode = html.getAttribute('data-theme-mode') || 'light';
    
    // 在三种模式之间循环切换：light -> dark -> auto -> light
    let newMode;
    switch (currentMode) {
        case 'light': newMode = 'dark'; break;
        case 'dark': newMode = 'auto'; break;
        default: newMode = 'light'; break;
    }
    
    setTheme(newMode);
}

// 设置主题
function setTheme(mode) {
    const html = document.documentElement;
    const effectiveTheme = mode === 'auto' ? getSystemTheme() : mode;
    
    html.setAttribute('data-theme', effectiveTheme);
    html.setAttribute('data-theme-mode', mode);
    localStorage.setItem('theme', mode);
    updateThemeIcon(mode, effectiveTheme);
}

// 更新主题图标
function updateThemeIcon(mode, effectiveTheme) {
    const icon = document.querySelector('.theme-toggle svg');
    if (!icon) return;
    
    if (mode === 'auto') {
        // 自动模式图标（双箭头循环）
        icon.innerHTML = `<path d="M8 3a5 5 0 0 0-5 5v1h1v-1a4 4 0 0 1 4-4h1V3H8zm8 0h-1v1h1a4 4 0 0 1 4 4v1h1v-1a5 5 0 0 0-5-5zm-8 18h1v-1H8a4 4 0 0 1-4-4v-1H3v1a5 5 0 0 0 5 5zm8 0a5 5 0 0 0 5-5v-1h-1v1a4 4 0 0 1-4 4h-1v1h1z" stroke="currentColor" stroke-width="1.5"/>`;
    } else if (effectiveTheme === 'dark') {
        // 暗色模式图标（月亮）
        icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    } else {
        // 亮色模式图标（太阳）
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
    mediaQuery.addEventListener('change', () => {
        const currentMode = localStorage.getItem('theme') || 'light';
        if (currentMode === 'auto') {
            setTheme('auto'); // 重新应用自动主题
        }
    });
}

// 初始化主题
function initTheme() {
    const savedMode = localStorage.getItem('theme') || 'light';
    setTheme(savedMode);
    watchSystemTheme();
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
