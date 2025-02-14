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
            this.output.classList.remove('error');
        } catch (e) {
            this.output.innerHTML = `<div class="error">Invalid JSON: ${e.message}</div>`;
            this.output.classList.add('error');
        }
    }

    renderJSON(data, level = 0) {
        const indent = '  '.repeat(level);
        const nextIndent = '  '.repeat(level + 1);

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
                    const items = data.map(item => {
                        return `${nextIndent}${this.renderJSON(item, level + 1)}`;
                    });
                    const arrayLength = `<span class="array-length">(${data.length} items)</span>`;
                    if (data.length > 1) {
                        return `<div class="collapsible">${indent}<span class="toggle"><span class="toggle-icon">▼</span><span class="bracket">[</span>${arrayLength}</span><div class="content">\n${items.join(',\n')}\n${indent}</div><span class="bracket">]</span></div>`;
                    } else {
                        return `[${arrayLength}\n${items.join(',\n')}\n${indent}]`;
                    }
                } else {
                    const keys = Object.keys(data);
                    if (keys.length === 0) return '{}';

                    const properties = keys.map(key => {
                        return `${nextIndent}<span class="key">"${this.escapeHtml(key)}"</span>${this.renderJSON(data[key], level + 1)}`;
                    });

                    const content = properties.join(',\n');
                    const collapsible = level === 0 || keys.length > 1;

                    if (collapsible) {
                        return `<div class="collapsible">${indent}<span class="toggle"><span class="toggle-icon">▼</span><span class="bracket">{</span></span><div class="content">\n${content}\n${indent}</div><span class="bracket">}</span></div>`;
                    } else {
                        return `{\n${content}\n${indent}}`;
                    }
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
            const jsonString = this.input.value;
            this.input.value = JSON.stringify(jsonString).slice(1, -1);
            this.handleInput();
        } catch (e) {
            this.showError('Error escaping JSON: ' + e.message);
        }
    }

    unescapeJSON() {
        try {
            const jsonString = this.input.value;
            this.input.value = jsonString.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
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

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.jsonVisualizer = new JSONVisualizer();
    
    // 添加折叠/展开功能
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('toggle-icon')) {
            e.preventDefault();
            e.stopPropagation();
            
            const content = e.target.closest('.collapsible').querySelector('.content');
            content.classList.toggle('collapsed');
            
            if (content.classList.contains('collapsed')) {
                e.target.textContent = '▶';
            } else {
                e.target.textContent = '▼';
            }
        }
    });
});

// 导出公共方法
window.escapeJSON = () => window.jsonVisualizer.escapeJSON();
window.unescapeJSON = () => window.jsonVisualizer.unescapeJSON();
window.compressJSON = () => window.jsonVisualizer.compressJSON();
