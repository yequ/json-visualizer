/**
 * JSON Visualizer
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

// JSON Visualizer main script
class JSONVisualizer {
    constructor() {
        this.input = document.getElementById('json-input');
        this.output = document.getElementById('json-output');
        this.init();
    }

    init() {
        // 从会话存储中恢复数据
        const savedData = sessionStorage.getItem('jsonData');
        if (savedData) {
            this.input.value = savedData;
            this.formatJSON(savedData);
        }

        // 监听输入变化（使用防抖）
        this.input.addEventListener('input', this.debounce(() => {
            const jsonStr = this.input.value.trim();
            // 保存到会话存储
            sessionStorage.setItem('jsonData', jsonStr);
            
            if (jsonStr) {
                this.formatJSON(jsonStr);
            } else {
                this.output.innerHTML = '';
            }
        }, 300));

        // 设置拖放功能
        this.setupDragAndDrop();

        // 添加折叠/展开功能的事件委托
        this.output.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-icon')) {
                const content = e.target.nextElementSibling;
                content.classList.toggle('collapsed');
                e.target.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    setupDragAndDrop() {
        const container = document.querySelector('.container');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        container.addEventListener('dragenter', () => container.classList.add('drag-over'));
        container.addEventListener('dragleave', () => container.classList.remove('drag-over'));
        container.addEventListener('drop', (e) => {
            container.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target.result;
                    this.input.value = content;
                    sessionStorage.setItem('jsonData', content);
                    this.formatJSON(content);
                };
                reader.readAsText(file);
            }
        });
    }

    formatJSON(jsonStr) {
        try {
            const json = JSON.parse(jsonStr);
            this.output.innerHTML = this.renderJSON(json);
            this.output.className = '';
        } catch (e) {
            this.output.innerHTML = `<div class="error">Invalid JSON: ${e.message}</div>`;
            this.output.className = '';
        }
    }

    renderJSON(data, level = 0) {
        const indent = ' '.repeat(level * 2);
        const nextIndent = ' '.repeat((level + 1) * 2);

        if (data === null) return '<span class="null">null</span>';

        switch (typeof data) {
            case 'boolean':
                return `<span class="boolean">${data}</span>`;
            case 'number':
                return `<span class="number">${data}</span>`;
            case 'string':
                return `<span class="string">"${this.escapeHtml(data)}"</span>`;
            case 'object':
                if (Array.isArray(data)) {
                    if (data.length === 0) return '[]';
                    const items = data.map(item => 
                        `\n${nextIndent}${this.renderJSON(item, level + 1)}`
                    ).join(',');
                    return `<span class="collapsible">[<span class="toggle-icon">▼</span><span class="content">${items}\n${indent}</span>]<span class="array-length">(${data.length})</span></span>`;
                } else {
                    const entries = Object.entries(data);
                    if (entries.length === 0) return '{}';
                    const items = entries.map(([key, value]) => 
                        `\n${nextIndent}<span class="key">"${this.escapeHtml(key)}"</span>: ${this.renderJSON(value, level + 1)}`
                    ).join(',');
                    return `<span class="collapsible">{<span class="toggle-icon">▼</span><span class="content">${items}\n${indent}</span>}</span>`;
                }
            default:
                return '';
        }
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    handleInput() {
        const input = this.input.value;
        sessionStorage.setItem('jsonInputData', input);
        this.formatJSON(input);
    }

    loadSavedData() {
        const savedData = sessionStorage.getItem('jsonInputData');
        if (savedData) {
            this.input.value = savedData;
            this.formatJSON(savedData);
        }
    }

    escapeJSON() {
        try {
            let text = this.input.value;
            // 处理换行符
            text = text.replace(/\n/g, '\\n');
            // 处理引号和反斜杠
            text = text.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
            this.input.value = text;
            this.handleInput();
        } catch (e) {
            this.showError('Error escaping JSON: ' + e.message);
        }
    }

    unescapeJSON() {
        try {
            let text = this.input.value;
            // 先处理反斜杠
            text = text.replace(/\\\\/g, '\\');
            // 再处理引号和换行符
            text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');
            this.input.value = text;
            this.handleInput();
        } catch (e) {
            this.showError('Error unescaping JSON: ' + e.message);
        }
    }

    compressJSON() {
        try {
            const json = JSON.parse(this.input.value);
            this.input.value = JSON.stringify(json);
            this.handleInput();
        } catch (e) {
            this.showError('Error compressing JSON: ' + e.message);
        }
    }

    showError(message) {
        this.output.innerHTML = `<span class="error">${message}</span>`;
        this.output.classList.add('error');
    }

    showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : 'success'}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

// 回到顶部按钮功能
const backToTopButton = document.querySelector('.back-to-top');

// 监听滚动事件
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// 点击回到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 初始化 JSON 可视化工具
const jsonVisualizer = new JSONVisualizer();
