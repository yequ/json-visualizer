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
        // 自动模式图标（循环箭头）
        icon.innerHTML = `<path d="M12 3a9 9 0 1 0 9 9h-1a8 8 0 1 1-8-8V3zm0 18a9 9 0 1 1-9-9h1a8 8 0 1 0 8 8v1z" fill="currentColor" stroke="none"/>`;
    } else if (effectiveTheme === 'dark') {
        // 暗色模式图标（月亮）
        icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="currentColor" stroke="none"/>`;
    } else {
        // 亮色模式图标（太阳）
        icon.innerHTML = `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 3l0 1m0 16l0 1m9 -9l-1 0m-16 0l-1 0m15.5 -6.5l-0.7 0.7m-12.1 12.1l-0.7 0.7m12.1 -12.1l0.7 0.7m-12.1 12.1l0.7 0.7" fill="currentColor" stroke="none"/>`;
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
    const savedMode = localStorage.getItem('theme') || 'auto';
    setTheme(savedMode);
    watchSystemTheme();
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
