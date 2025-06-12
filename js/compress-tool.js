/**
 * 数据压缩解压工具
 * 支持多种压缩算法：Gzip、Deflate、LZ-String
 */

class CompressTool {
    constructor() {
        this.inputData = document.getElementById('input-data');
        this.outputData = document.getElementById('output-data');
        this.algorithmSelect = document.getElementById('algorithm');
        this.fileInput = document.getElementById('file-input');

        this.init();
        this.loadLZString();
    }

    init() {
        // 监听输入变化
        this.inputData.addEventListener('input', () => {
            this.updateInputSize();
        });

        // 文件上传处理
        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadFile(file);
            }
        });

        // 拖拽上传
        this.setupDragAndDrop();

        // 初始化大小显示
        this.updateInputSize();
        this.updateOutputSize();
    }

    // 动态加载 LZ-String 库
    async loadLZString() {
        if (typeof LZString === 'undefined') {
            try {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js';
                script.onload = () => {
                    console.log('LZ-String library loaded successfully');
                };
                script.onerror = () => {
                    console.warn('Failed to load LZ-String library, LZ-String compression will not be available');
                };
                document.head.appendChild(script);
            } catch (error) {
                console.warn('Error loading LZ-String library:', error);
            }
        }
    }

    setupDragAndDrop() {
        const container = document.querySelector('.container');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        container.addEventListener('dragenter', () => {
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            if (!container.contains(e.relatedTarget)) {
                container.classList.remove('drag-over');
            }
        });

        container.addEventListener('drop', (e) => {
            container.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadFile(files[0]);
            }
        });
    }

    async loadFile(file) {
        try {
            const text = await this.readFileAsText(file);
            this.inputData.value = text;
            this.updateInputSize();
            this.showToast(`文件 "${file.name}" 加载成功`);
        } catch (error) {
            this.showToast(`文件加载失败: ${error.message}`, true);
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    }

    // 压缩数据
    async compressData() {
        const inputText = this.inputData.value;
        if (!inputText.trim()) {
            this.showToast('请输入要压缩的数据', true);
            return;
        }

        const algorithm = this.algorithmSelect.value;

        try {
            let compressedData;

            switch (algorithm) {
                case 'gzip':
                    compressedData = await this.compressWithGzip(inputText);
                    break;
                case 'deflate':
                    compressedData = await this.compressWithDeflate(inputText);
                    break;
                case 'lz-string':
                    compressedData = this.compressWithLZString(inputText);
                    break;
                default:
                    throw new Error('不支持的压缩算法');
            }

            this.outputData.value = compressedData;
            this.updateOutputSize();
            this.updateCompressionStats(inputText, compressedData);
            this.showToast('压缩完成');

        } catch (error) {
            this.showToast(`压缩失败: ${error.message}`, true);
            console.error('Compression error:', error);
        }
    }

    // 解压数据
    async decompressData() {
        const inputText = this.inputData.value;
        if (!inputText.trim()) {
            this.showToast('请输入要解压的数据', true);
            return;
        }

        const algorithm = this.algorithmSelect.value;

        try {
            let decompressedData;

            switch (algorithm) {
                case 'gzip':
                    decompressedData = await this.decompressWithGzip(inputText);
                    break;
                case 'deflate':
                    decompressedData = await this.decompressWithDeflate(inputText);
                    break;
                case 'lz-string':
                    decompressedData = this.decompressWithLZString(inputText);
                    break;
                default:
                    throw new Error('不支持的解压算法');
            }

            this.outputData.value = decompressedData;
            this.updateOutputSize();
            this.hideCompressionStats();
            this.showToast('解压完成');

        } catch (error) {
            this.showToast(`解压失败: ${error.message}`, true);
            console.error('Decompression error:', error);
        }
    }

    // Gzip 压缩
    async compressWithGzip(text) {
        if (!window.CompressionStream) {
            throw new Error('浏览器不支持 CompressionStream API，请使用较新版本的浏览器或选择 LZ-String 算法');
        }

        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        // 写入数据
        writer.write(new TextEncoder().encode(text));
        writer.close();

        // 读取压缩结果
        const chunks = [];
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(value);
            }
        }

        // 合并所有块并转换为 Base64
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            compressed.set(chunk, offset);
            offset += chunk.length;
        }

        return this.arrayBufferToBase64(compressed);
    }

    // Gzip 解压
    async decompressWithGzip(base64Data) {
        if (!window.DecompressionStream) {
            throw new Error('浏览器不支持 DecompressionStream API');
        }

        try {
            const compressedData = this.base64ToArrayBuffer(base64Data);
            const stream = new DecompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();

            // 写入压缩数据
            writer.write(compressedData);
            writer.close();

            // 读取解压结果
            const chunks = [];
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    chunks.push(value);
                }
            }

            // 合并所有块并转换为字符串
            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                decompressed.set(chunk, offset);
                offset += chunk.length;
            }

            return new TextDecoder().decode(decompressed);
        } catch (error) {
            throw new Error('无效的 Gzip 数据格式');
        }
    }

    // Deflate 压缩
    async compressWithDeflate(text) {
        if (!window.CompressionStream) {
            throw new Error('浏览器不支持 CompressionStream API，请使用较新版本的浏览器或选择 LZ-String 算法');
        }

        const stream = new CompressionStream('deflate');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(new TextEncoder().encode(text));
        writer.close();

        const chunks = [];
        let done = false;

        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(value);
            }
        }

        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            compressed.set(chunk, offset);
            offset += chunk.length;
        }

        return this.arrayBufferToBase64(compressed);
    }

    // Deflate 解压
    async decompressWithDeflate(base64Data) {
        if (!window.DecompressionStream) {
            throw new Error('浏览器不支持 DecompressionStream API');
        }

        try {
            const compressedData = this.base64ToArrayBuffer(base64Data);
            const stream = new DecompressionStream('deflate');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();

            writer.write(compressedData);
            writer.close();

            const chunks = [];
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    chunks.push(value);
                }
            }

            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                decompressed.set(chunk, offset);
                offset += chunk.length;
            }

            return new TextDecoder().decode(decompressed);
        } catch (error) {
            throw new Error('无效的 Deflate 数据格式');
        }
    }

    // LZ-String 压缩
    compressWithLZString(text) {
        if (typeof LZString === 'undefined') {
            throw new Error('LZ-String 库未加载');
        }
        return LZString.compressToBase64(text);
    }

    // LZ-String 解压
    decompressWithLZString(compressedData) {
        if (typeof LZString === 'undefined') {
            throw new Error('LZ-String 库未加载');
        }

        const result = LZString.decompressFromBase64(compressedData);
        if (result === null) {
            throw new Error('无效的 LZ-String 数据格式');
        }
        return result;
    }

    // 工具函数：ArrayBuffer 转 Base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // 工具函数：Base64 转 ArrayBuffer
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // 更新输入大小显示
    updateInputSize() {
        const size = this.getByteSize(this.inputData.value);
        document.getElementById('input-size').textContent = this.formatFileSize(size);
    }

    // 更新输出大小显示
    updateOutputSize() {
        const size = this.getByteSize(this.outputData.value);
        document.getElementById('output-size').textContent = this.formatFileSize(size);
    }

    // 更新压缩统计信息
    updateCompressionStats(originalData, compressedData) {
        const originalSize = this.getByteSize(originalData);
        const compressedSize = this.getByteSize(compressedData);
        const ratio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100) : 0;
        const saved = originalSize - compressedSize;

        document.getElementById('stat-original').textContent = this.formatFileSize(originalSize);
        document.getElementById('stat-compressed').textContent = this.formatFileSize(compressedSize);
        document.getElementById('stat-ratio').textContent = ratio.toFixed(1) + '%';
        document.getElementById('stat-saved').textContent = this.formatFileSize(saved);

        // 显示压缩比在输出区域
        const compressionRatio = document.getElementById('compression-ratio');
        if (ratio > 0) {
            compressionRatio.textContent = `压缩率: ${ratio.toFixed(1)}%`;
            compressionRatio.style.color = '#28a745';
        } else {
            compressionRatio.textContent = '数据已膨胀';
            compressionRatio.style.color = '#dc3545';
        }

        document.getElementById('stats-panel').style.display = 'block';
    }

    // 隐藏压缩统计信息
    hideCompressionStats() {
        document.getElementById('stats-panel').style.display = 'none';
        document.getElementById('compression-ratio').textContent = '';
    }

    // 计算字符串字节大小
    getByteSize(str) {
        return new Blob([str]).size;
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 字节';
        const k = 1024;
        const sizes = ['字节', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示提示消息
    showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : 'success'}`;
        toast.textContent = message;

        // 添加样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '14px',
            zIndex: '10000',
            backgroundColor: isError ? '#dc3545' : '#28a745',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        });

        document.body.appendChild(toast);

        // 3秒后自动移除
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// 全局函数
function compressData() {
    compressTool.compressData();
}

function decompressData() {
    compressTool.decompressData();
}

function clearAll() {
    compressTool.inputData.value = '';
    compressTool.outputData.value = '';
    compressTool.updateInputSize();
    compressTool.updateOutputSize();
    compressTool.hideCompressionStats();
}

function swapContent() {
    const inputValue = compressTool.inputData.value;
    const outputValue = compressTool.outputData.value;

    compressTool.inputData.value = outputValue;
    compressTool.outputData.value = inputValue;

    compressTool.updateInputSize();
    compressTool.updateOutputSize();
    compressTool.hideCompressionStats();
}

function copyResult() {
    const outputText = compressTool.outputData.value;
    if (!outputText) {
        compressTool.showToast('没有可复制的内容', true);
        return;
    }

    navigator.clipboard.writeText(outputText)
        .then(() => {
            compressTool.showToast('复制成功');
        })
        .catch(() => {
            compressTool.showToast('复制失败', true);
        });
}

function downloadResult() {
    const outputText = compressTool.outputData.value;
    if (!outputText) {
        compressTool.showToast('没有可下载的内容', true);
        return;
    }

    const algorithm = compressTool.algorithmSelect.value;
    const filename = `compressed_data_${algorithm}_${new Date().getTime()}.txt`;

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    compressTool.showToast('下载已开始');
}

// 回到顶部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 监听滚动事件显示/隐藏回到顶部按钮
window.addEventListener('scroll', () => {
    const backToTopButton = document.querySelector('.back-to-top');
    if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// 初始化压缩工具
const compressTool = new CompressTool();
