/**
 * JSON Visualizer - Theme Manager
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

// 主题切换功能
function initTheme() {
    // 从本地存储获取主题设置，默认为 light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // 更新主题
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// 设置主题
function setTheme(mode) {
    const html = document.documentElement;
    const effectiveTheme = mode === 'auto' ? getSystemTheme() : mode;
    
    html.setAttribute('data-theme', effectiveTheme);
    html.setAttribute('data-theme-mode', mode);
    localStorage.setItem('theme', mode);
    updateThemeIcon(effectiveTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        if (theme === 'dark') {
            // 太阳图标 - 简单均匀设计
            icon.innerHTML = `
                <circle cx="12" cy="12" r="3.5"/>
                <path d="
                    M12 4v2
                    M12 18v2
                    M4 12H6
                    M18 12h2
                    M6.34 6.34l1.42 1.42
                    M16.24 16.24l1.42 1.42
                    M6.34 17.66l1.42-1.42
                    M16.24 7.76l1.42-1.42
                " stroke-linecap="round"/>
            `;
        } else {
            // 月亮图标
            icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" stroke-width="1.5"/>`;
        }
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
