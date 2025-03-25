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
        this.initWorker();
        this.init();
        // 存储当前处理的JSON数据
        this.currentJsonData = null;
    }

    initWorker() {
        // 检查是否可以使用 Web Worker（本地文件系统中不能使用）
        try {
            if (window.location.protocol !== 'file:') {
                this.worker = new Worker('js/json-worker.js');
                this.worker.onmessage = (e) => {
                    if (e.data.error) {
                        this.showError(e.data.error);
                    } else {
                        this.renderJSON(e.data.result);
                    }
                };
                this.hasWorker = true;
                console.log('Web Worker initialized successfully');
            } else {
                this.hasWorker = false;
                console.log('Running in local file system, Web Worker disabled');
            }
        } catch (e) {
            this.hasWorker = false;
            console.error('Failed to initialize Web Worker:', e);
        }
    }

    init() {
        // 从会话存储中恢复数据
        const savedData = sessionStorage.getItem('jsonData');
        if (savedData) {
            this.input.value = savedData;
            this.formatJSON(savedData);
        }

        // 监听输入变化（使用节流）
        this.input.addEventListener('input', this.throttle(() => {
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

        // 添加折叠/展开功能和复制功能的事件委托
        this.output.addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-icon')) {
                this.toggleNode(e.target);
            } else if (e.target.classList.contains('copy-btn')) {
                this.copyToClipboard(e.target.dataset.value);
            }
        });

        // 页面加载完成后重新应用样式和渲染 JSON
        window.addEventListener('load', () => {
            if (this.input.value) {
                this.formatJSON(this.input.value);
            }
        });
    }

    applyStyles() {
        // 重新应用 JSON 格式化样式
        const elements = this.output.querySelectorAll('.string, .number, .boolean, .null, .key');
        elements.forEach(el => {
            el.className = el.className; // 这会重新触发样式应用
        });

        // 确保所有折叠/展开图标都有正确的样式
        const toggleIcons = this.output.querySelectorAll('.toggle-icon');
        toggleIcons.forEach(icon => {
            icon.textContent = icon.nextElementSibling.classList.contains('collapsed') ? '▶' : '▼';
        });
    }

    toggleNode(toggleIcon) {
        const content = toggleIcon.nextElementSibling;
        if (content.classList.contains('collapsed')) {
            this.expandNode(content, toggleIcon);
        } else {
            this.collapseNode(content, toggleIcon);
        }
    }

    expandNode(content, toggleIcon) {
        content.classList.remove('collapsed');
        toggleIcon.textContent = '▼';
        
        // 只展开当前级别，子级保持折叠状态
        const childToggleIcons = content.querySelectorAll(':scope > .collapsible > .toggle-icon');
        childToggleIcons.forEach(icon => {
            icon.textContent = '▶';
        });
        
        const childContents = content.querySelectorAll(':scope > .collapsible > .content');
        childContents.forEach(childContent => {
            childContent.classList.add('collapsed');
        });
    }

    collapseNode(content, toggleIcon) {
        content.classList.add('collapsed');
        toggleIcon.textContent = '▶';
    }

    throttle(func, wait) {
        let timeout = null;
        let previous = 0;
        return function(...args) {
            const now = Date.now();
            if (!previous) previous = now;
            const remaining = wait - (now - previous);
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
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
        if (this.hasWorker) {
            // 使用 Web Worker 处理 JSON
            this.worker.postMessage({ action: 'format', data: jsonStr });
        } else {
            // 在主线程中处理 JSON
            try {
                const json = JSON.parse(jsonStr);
                this.currentJsonData = json;
                const formattedHTML = this.renderJSONToHTML(json);
                this.output.innerHTML = formattedHTML;
                this.output.className = '';
                this.applyStyles();
            } catch (e) {
                this.showError(`Invalid JSON: ${e.message}`);
            }
        }
    }

    renderJSONToHTML(data, level = 0) {
        const indent = ' '.repeat(level * 2);
        const nextIndent = ' '.repeat((level + 1) * 2);

        if (data === null) return `<span class="null">null</span>`;

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
                    
                    // 不再限制元素数量，显示所有元素
                    const items = data.map((item, index) => {
                        return `\n${nextIndent}${this.renderJSONToHTML(item, level + 1)}`;
                    }).join(',');
                    
                    // 将完整数组转为JSON字符串用于复制
                    const fullArrayJson = JSON.stringify(data);
                    let result = `<span class="collapsible">[<span class="toggle-icon">▼</span><span class="content">${items}\n${indent}</span>]<span class="array-length">(${data.length})</span><span class="copy-btn" title="复制数组" data-value='${this.escapeHtml(fullArrayJson)}'>📋</span></span>`;
                    
                    return result;
                } else {
                    const entries = Object.entries(data);
                    if (entries.length === 0) return '{}';
                    
                    // 不再限制属性数量，显示所有属性
                    const items = entries.map(([key, value]) => {
                        return `\n${nextIndent}<span class="key">"${this.escapeHtml(key)}"</span>: ${this.renderJSONToHTML(value, level + 1)}`;
                    }).join(',');
                    
                    // 将完整对象转为JSON字符串用于复制
                    const fullObjectJson = JSON.stringify(data);
                    let result = `<span class="collapsible">{<span class="toggle-icon">▼</span><span class="content">${items}\n${indent}</span>}<span class="copy-btn" title="复制对象" data-value='${this.escapeHtml(fullObjectJson)}'>📋</span></span>`;
                    
                    return result;
                }
            default:
                return '';
        }
    }

    renderJSON(data) {
        if (typeof data === 'string') {
            this.output.innerHTML = data;
        } else {
            this.output.innerHTML = this.renderJSONToHTML(data);
            // 移除错误类，确保在从错误 JSON 修改为正确 JSON 时，错误提示的红色效果消失
            this.output.classList.remove('error');
        }
        this.applyStyles();
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    collapseAll() {
        // 保留第一级可见，折叠其他所有级别
        const topLevelCollapsibles = this.output.querySelectorAll(':scope > .collapsible');
        topLevelCollapsibles.forEach(collapsible => {
            const toggleIcon = collapsible.querySelector(':scope > .toggle-icon');
            const content = collapsible.querySelector(':scope > .content');
            
            // 保持第一级展开
            toggleIcon.textContent = '▼';
            content.classList.remove('collapsed');
            
            // 折叠第一级以下的所有内容
            const nestedCollapsibles = content.querySelectorAll('.collapsible');
            nestedCollapsibles.forEach(nested => {
                const nestedToggleIcon = nested.querySelector(':scope > .toggle-icon');
                const nestedContent = nested.querySelector(':scope > .content');
                nestedToggleIcon.textContent = '▶';
                nestedContent.classList.add('collapsed');
            });
        });
    }

    expandAll() {
        const allCollapsibles = this.output.querySelectorAll('.collapsible');
        allCollapsibles.forEach(collapsible => {
            const toggleIcon = collapsible.querySelector(':scope > .toggle-icon');
            const content = collapsible.querySelector(':scope > .content');
            toggleIcon.textContent = '▼';
            content.classList.remove('collapsed');
        });
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

    beautifyJSON() {
        try {
            const json = JSON.parse(this.input.value);
            this.input.value = JSON.stringify(json, null, 2);
            this.handleInput();
        } catch (e) {
            this.showError('Error beautifying JSON: ' + e.message);
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

    copyJSON() {
        if (!this.currentJsonData) {
            this.showError('没有可复制的 JSON 数据');
            return;
        }
        const jsonStr = JSON.stringify(this.currentJsonData, null, 2);
        this.copyToClipboard(jsonStr);
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            this.writeToClipboard(text);
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    writeToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showCopySuccess();
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            this.fallbackCopyToClipboard(text);
        });
    }

    fallbackCopyToClipboard(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showCopySuccess();
        } catch (e) {
            console.error('Failed to copy text: ', e);
            this.showError('复制失败，请手动复制');
        }
    }

    showCopySuccess() {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.textContent = '已复制到剪贴板';
        document.body.appendChild(toast);

        // 添加动画类
        setTimeout(() => toast.classList.add('show'), 10);

        // 3秒后移除提示
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    clearJSON() {
        this.input.value = '';
        this.output.innerHTML = '';
        sessionStorage.removeItem('jsonData');
        this.currentJsonData = null;
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
