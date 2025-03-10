/**
 * 随机密码生成器
 * 支持自定义密码长度、字符类型，生成安全可靠的随机密码
 */

// 字符集
const charSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// 相似字符
const similarChars = 'iIlL1oO0';

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 设置默认值
    document.getElementById('password-length').value = 11;
    document.getElementById('include-uppercase').checked = true;
    document.getElementById('include-lowercase').checked = true;
    document.getElementById('include-numbers').checked = true;
    document.getElementById('include-symbols').checked = true;
    document.getElementById('exclude-similar').checked = false;
    
    // 自动生成一个初始密码
    generatePassword();
});

/**
 * 生成随机密码
 */
function generatePassword() {
    // 获取用户选项
    const length = parseInt(document.getElementById('password-length').value);
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    const excludeSimilar = document.getElementById('exclude-similar').checked;
    
    // 验证至少选择了一种字符类型
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        alert('请至少选择一种字符类型');
        document.getElementById('include-lowercase').checked = true;
        return;
    }
    
    // 验证密码长度
    if (length < 4 || length > 64) {
        alert('密码长度必须在4到64之间');
        document.getElementById('password-length').value = 11;
        return;
    }
    
    // 构建字符集
    let charset = '';
    if (includeUppercase) charset += charSets.uppercase;
    if (includeLowercase) charset += charSets.lowercase;
    if (includeNumbers) charset += charSets.numbers;
    if (includeSymbols) charset += charSets.symbols;
    
    // 排除相似字符
    if (excludeSimilar) {
        for (let i = 0; i < similarChars.length; i++) {
            charset = charset.replace(similarChars[i], '');
        }
    }
    
    // 生成密码
    let password = '';
    let hasRequiredChars = false;
    
    // 确保密码包含所有选定的字符类型
    while (!hasRequiredChars) {
        password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        
        // 验证密码是否包含所有选定的字符类型
        hasRequiredChars = true;
        if (includeUppercase && !/[A-Z]/.test(password)) hasRequiredChars = false;
        if (includeLowercase && !/[a-z]/.test(password)) hasRequiredChars = false;
        if (includeNumbers && !/[0-9]/.test(password)) hasRequiredChars = false;
        if (includeSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) hasRequiredChars = false;
    }
    
    // 显示密码
    document.getElementById('password-output').value = password;
    
    // 计算并显示密码强度
    calculatePasswordStrength(password);
}

/**
 * 计算密码强度
 * @param {string} password - 要计算强度的密码
 */
function calculatePasswordStrength(password) {
    // 基础分数 - 密码长度
    let score = Math.min(password.length * 4, 40);
    
    // 字符类型多样性
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    
    const charTypesCount = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length;
    
    // 加分: 字符类型多样性
    score += charTypesCount * 10;
    
    // 减分: 连续重复字符
    const repeats = password.match(/(.)\1+/g);
    if (repeats) {
        score -= repeats.join('').length * 2;
    }
    
    // 最终分数范围: 0-100
    score = Math.max(0, Math.min(100, score));
    
    // 更新UI
    const strengthBar = document.getElementById('strength-bar');
    const strengthText = document.getElementById('strength-text');
    
    // 设置强度条宽度
    strengthBar.style.width = score + '%';
    
    // 设置强度条颜色和文本
    if (score < 30) {
        strengthBar.style.backgroundColor = '#ff4d4d'; // 红色
        strengthText.textContent = '弱';
    } else if (score < 60) {
        strengthBar.style.backgroundColor = '#ffaa00'; // 橙色
        strengthText.textContent = '中';
    } else if (score < 80) {
        strengthBar.style.backgroundColor = '#2db92d'; // 绿色
        strengthText.textContent = '强';
    } else {
        strengthBar.style.backgroundColor = '#00b300'; // 深绿色
        strengthText.textContent = '非常强';
    }
}

/**
 * 复制密码到剪贴板
 */
function copyPassword() {
    const passwordOutput = document.getElementById('password-output');
    passwordOutput.select();
    document.execCommand('copy');
    
    // 显示复制成功提示
    const button = document.querySelector('button:nth-child(2)');
    const originalText = button.textContent;
    button.textContent = '已复制!';
    
    // 2秒后恢复按钮文本
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}
