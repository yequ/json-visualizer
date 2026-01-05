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
                        this.hideDataStats();
                    } else {
                        this.renderJSON(e.data.result);
                        // 在Worker处理完成后计算统计信息
                        if (this.currentOriginalJson && this.currentJsonData) {
                            this.updateDataStats(this.currentOriginalJson, this.currentJsonData);
                        }
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
            // 保存原始JSON字符串用于统计计算
            this.currentOriginalJson = jsonStr;
            try {
                // 先解析JSON以保存解析后的数据
                this.currentJsonData = JSON.parse(jsonStr);
            } catch (e) {
                this.currentJsonData = null;
            }
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
                // 计算并显示数据大小统计
                this.updateDataStats(jsonStr, json);
            } catch (e) {
                this.showError(`Invalid JSON: ${e.message}`);
                this.hideDataStats();
            }
        }
    }

    // 计算字符串的字节大小
    getByteSize(str) {
        return new Blob([str]).size;
    }

    // 格式化文件大小显示
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 更新数据统计信息
    updateDataStats(originalJson, parsedJson) {
        const sizeIndicator = document.getElementById('size-indicator');

        // 计算原始数据大小
        const originalSize = this.getByteSize(originalJson);

        // 更新显示
        document.getElementById('original-size').textContent = this.formatFileSize(originalSize);

        // 显示大小指示器
        sizeIndicator.style.display = 'flex';
    }

    // 隐藏数据统计信息
    hideDataStats() {
        const sizeIndicator = document.getElementById('size-indicator');
        sizeIndicator.style.display = 'none';
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

    // 复制格式化后的JSON
    copyFormattedJSON() {
        if (!this.currentJsonData) {
            this.showToast('没有可复制的内容', 'error');
            return;
        }

        try {
            // 将JSON对象格式化为字符串（带缩进）
            const formattedJson = JSON.stringify(this.currentJsonData, null, 2);
            
            // 复制到剪贴板
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(formattedJson).then(() => {
                    this.showCopySuccess();
                }).catch(err => {
                    console.error('复制失败:', err);
                    this.fallbackCopy(formattedJson);
                });
            } else {
                this.fallbackCopy(formattedJson);
            }
        } catch (e) {
            this.showToast('复制失败', 'error');
            console.error('复制错误:', e);
        }
    }

    // 显示复制成功状态
    showCopySuccess() {
        const btn = document.querySelector('.copy-output-btn');
        const span = btn.querySelector('span');
        const originalText = span.textContent;
        
        btn.classList.add('copied');
        span.textContent = '已复制';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            span.textContent = originalText;
        }, 2000);
        
        this.showToast('已复制到剪贴板');
    }

    // 备用复制方法（使用 textarea）
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('备用复制方法失败:', err);
            this.showToast('复制失败', 'error');
        }
        
        document.body.removeChild(textarea);
    }

    // 显示提示消息
    showToast(message, type = 'success') {
        // 移除已存在的 toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 2000);
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

    convertToYAML() {
        try {
            if (typeof jsyaml === 'undefined') {
                this.showToast('YAML库未加载', true);
                return;
            }

            const inputValue = this.input.value.trim();
            if (!inputValue) {
                this.showToast('请输入内容', true);
                return;
            }

            // 尝试解析为 JSON
            let isJSON = false;
            try {
                JSON.parse(inputValue);
                isJSON = true;
            } catch (e) {
                // 不是有效的 JSON，可能是 YAML
            }

            if (isJSON) {
                // JSON 转 YAML
                const json = JSON.parse(inputValue);
                const yamlStr = jsyaml.dump(json, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true
                });
                this.input.value = yamlStr;
                // 显示 YAML 预览
                const yamlHTML = this.renderYAMLToHTML(yamlStr);
                this.output.innerHTML = yamlHTML;
                this.output.classList.remove('error');
                this.hideDataStats();
                // 保存到会话存储
                sessionStorage.setItem('jsonData', yamlStr);
                this.showToast('已转换为 YAML 格式');
            } else {
                // YAML 转 JSON
                try {
                    const jsonObj = jsyaml.load(inputValue);
                    const jsonStr = JSON.stringify(jsonObj, null, 2);
                    this.input.value = jsonStr;
                    // 保存到会话存储
                    sessionStorage.setItem('jsonData', jsonStr);
                    // 格式化显示 JSON
                    this.formatJSON(jsonStr);
                    this.showToast('已转换为 JSON 格式');
                } catch (yamlError) {
                    this.showError('转换失败: 输入内容既不是有效的 JSON 也不是有效的 YAML');
                }
            }
        } catch (e) {
            this.showError('转换失败: ' + e.message);
        }
    }

    renderYAMLToHTML(yamlStr) {
        const lines = yamlStr.split('\n');
        let html = '';

        lines.forEach(line => {
            if (!line.trim()) {
                html += '\n';
                return;
            }

            // 匹配键值对
            const keyValueMatch = line.match(/^(\s*)([^:]+):\s*(.*)$/);
            if (keyValueMatch) {
                const indent = keyValueMatch[1];
                const key = keyValueMatch[2];
                const value = keyValueMatch[3];

                if (value) {
                    // 有值的情况
                    html += `${indent}<span class="yaml-key">${this.escapeHtml(key)}</span>: ${this.highlightYAMLValue(value)}\n`;
                } else {
                    // 只有键的情况（对象或数组的开始）
                    html += `${indent}<span class="yaml-key">${this.escapeHtml(key)}</span>:\n`;
                }
            }
            // 匹配数组项
            else if (line.match(/^\s*-\s+/)) {
                const match = line.match(/^(\s*)-\s+(.*)$/);
                const indent = match[1];
                const value = match[2];
                html += `${indent}<span class="yaml-dash">-</span> ${this.highlightYAMLValue(value)}\n`;
            }
            // 匹配注释
            else if (line.match(/^\s*#/)) {
                html += `<span class="yaml-comment">${this.escapeHtml(line)}</span>\n`;
            }
            // 其他行
            else {
                html += `${this.escapeHtml(line)}\n`;
            }
        });

        return html;
    }

    highlightYAMLValue(value) {
        value = value.trim();

        // 字符串（带引号）
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            return `<span class="yaml-string">${this.escapeHtml(value)}</span>`;
        }

        // 布尔值
        if (value === 'true' || value === 'false') {
            return `<span class="yaml-boolean">${value}</span>`;
        }

        // null
        if (value === 'null' || value === '~') {
            return `<span class="yaml-null">${value}</span>`;
        }

        // 数字
        if (/^-?\d+\.?\d*$/.test(value)) {
            return `<span class="yaml-number">${value}</span>`;
        }

        // 默认为字符串
        return `<span class="yaml-string">${this.escapeHtml(value)}</span>`;
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

    copyToClipboard(text) {
        try {
            // 尝试解析JSON字符串，如果是有效的JSON，则格式化后复制
            const jsonObj = JSON.parse(text);
            const formattedJson = JSON.stringify(jsonObj, null, 2);
            navigator.clipboard.writeText(formattedJson)
                .then(() => {
                    this.showToast('复制成功！', false);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    this.showToast('复制失败，请重试', true);
                });
        } catch (e) {
            // 如果不是有效的JSON，直接复制文本
            navigator.clipboard.writeText(text)
                .then(() => {
                    this.showToast('复制成功！', false);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    this.showToast('复制失败，请重试', true);
                });
        }
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