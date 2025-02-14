// 主题切换功能
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 更新图标
    updateThemeIcon(newTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle svg');
    if (theme === 'dark') {
        icon.innerHTML = `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    } else {
        icon.innerHTML = `<path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0M12 3l0 1m0 16l0 1m9 -9l-1 0m-16 0l-1 0m15.5 -6.5l-0.7 0.7m-12.1 12.1l-0.7 0.7m12.1 -12.1l0.7 0.7m-12.1 12.1l0.7 0.7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>`;
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
