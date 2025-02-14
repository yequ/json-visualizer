// 主题切换功能
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    setTheme(newTheme);
}

// 设置主题
function setTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
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

// 获取系统主题偏好
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 监听系统主题变化
function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // 只有当用户没有手动设置主题时，才跟随系统主题
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// 初始化主题
function initTheme() {
    // 优先使用用户设置的主题
    const savedTheme = localStorage.getItem('theme');
    // 如果用户没有设置主题，则使用系统主题
    const theme = savedTheme || getSystemTheme();
    setTheme(theme);
    watchSystemTheme();
}

// 页面加载时初始化主题
document.addEventListener('DOMContentLoaded', initTheme);
