/**
 * JSON Visualizer - Base64 Encoder/Decoder
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

// 全局变量存储当前文件信息
let currentFile = null;
let decodedFileData = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initFileUpload();
});

// 切换标签页
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活当前标签
    document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// 文本Base64编码
function encodeBase64Text() {
    const input = document.getElementById('base64-input').value;
    if (!input.trim()) {
        document.getElementById('base64-output').textContent = '请输入要编码的文本';
        return;
    }
    
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('base64-output').textContent = encoded;
    } catch (error) {
        document.getElementById('base64-output').textContent = '编码失败: ' + error.message;
    }
}

// 文本Base64解码
function decodeBase64Text() {
    const input = document.getElementById('base64-input').value;
    if (!input.trim()) {
        document.getElementById('base64-output').textContent = '请输入要解码的Base64文本';
        return;
    }
    
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64-output').textContent = decoded;
    } catch (error) {
        document.getElementById('base64-output').textContent = '解码失败: 请检查Base64格式是否正确';
    }
}

// 清空输入
function clearInputs() {
    document.getElementById('base64-input').value = '';
    document.getElementById('base64-output').textContent = '';
}

// 初始化文件上传
function initFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    // 点击上传区域选择文件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    currentFile = file;
    
    // 显示文件信息
    showFileInfo(file);
    
    // 读取文件并编码
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.result.split(',')[1]; // 移除data:type;base64,前缀
        document.getElementById('file-base64-output').textContent = base64;
        
        // 如果是图片，显示预览
        if (file.type.startsWith('image/')) {
            showImagePreview(e.result);
        }
    };
    reader.readAsDataURL(file);
}

// 显示文件信息
function showFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');
    
    const sizeInKB = (file.size / 1024).toFixed(2);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    
    fileDetails.innerHTML = `
        <p><strong>文件名:</strong> ${file.name}</p>
        <p><strong>文件类型:</strong> ${file.type || '未知'}</p>
        <p><strong>文件大小:</strong> ${sizeInKB} KB (${sizeInMB} MB)</p>
        <p><strong>最后修改:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
    `;
    
    fileInfo.style.display = 'block';
}

// 显示图片预览
function showImagePreview(dataUrl) {
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    
    previewImage.src = dataUrl;
    imagePreview.style.display = 'block';
}

// 编码文件
function encodeFile() {
    if (!currentFile) {
        alert('请先选择一个文件');
        return;
    }
    
    // 文件已经在handleFile中编码了，这里只是确认操作
    const base64Output = document.getElementById('file-base64-output').textContent;
    if (base64Output) {
        alert('文件已成功编码为Base64格式');
    }
}

// 解码Base64文件
function decodeBase64File() {
    const input = document.getElementById('file-base64-input').value.trim();
    if (!input) {
        alert('请输入Base64编码的文件数据');
        return;
    }
    
    try {
        // 尝试解码Base64
        const binaryString = atob(input);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // 尝试检测文件类型
        const mimeType = detectMimeType(bytes);
        
        // 创建Blob
        const blob = new Blob([bytes], { type: mimeType });
        decodedFileData = {
            blob: blob,
            mimeType: mimeType,
            size: bytes.length
        };
        
        // 显示解码信息
        document.getElementById('file-base64-output').textContent = 
            `解码成功!\n文件类型: ${mimeType}\n文件大小: ${(bytes.length / 1024).toFixed(2)} KB`;
        
        // 如果是图片，显示预览
        if (mimeType.startsWith('image/')) {
            const dataUrl = `data:${mimeType};base64,${input}`;
            showImagePreview(dataUrl);
        }
        
        // 显示下载按钮
        document.getElementById('download-btn').style.display = 'inline-block';
        
    } catch (error) {
        document.getElementById('file-base64-output').textContent = '解码失败: 请检查Base64格式是否正确';
        document.getElementById('download-btn').style.display = 'none';
    }
}

// 检测MIME类型
function detectMimeType(bytes) {
    // 检查文件头来确定文件类型
    const header = Array.from(bytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // 常见文件类型的魔数
    const signatures = {
        '89504e47': 'image/png',
        'ffd8ffe0': 'image/jpeg',
        'ffd8ffe1': 'image/jpeg',
        'ffd8ffe2': 'image/jpeg',
        'ffd8ffe3': 'image/jpeg',
        'ffd8ffe8': 'image/jpeg',
        '47494638': 'image/gif',
        '25504446': 'application/pdf',
        '504b0304': 'application/zip',
        '504b0506': 'application/zip',
        '504b0708': 'application/zip',
        'd0cf11e0': 'application/msword',
        '7b5c7274': 'application/rtf'
    };
    
    return signatures[header] || 'application/octet-stream';
}

// 下载解码后的文件
function downloadDecodedFile() {
    if (!decodedFileData) {
        alert('没有可下载的文件');
        return;
    }
    
    // 创建下载链接
    const url = URL.createObjectURL(decodedFileData.blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 根据MIME类型设置文件扩展名
    const extension = getFileExtension(decodedFileData.mimeType);
    a.download = `decoded_file${extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 根据MIME类型获取文件扩展名
function getFileExtension(mimeType) {
    const extensions = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/gif': '.gif',
        'application/pdf': '.pdf',
        'application/zip': '.zip',
        'application/msword': '.doc',
        'application/rtf': '.rtf',
        'text/plain': '.txt'
    };
    
    return extensions[mimeType] || '.bin';
}

// 清空文件输入
function clearFileInputs() {
    document.getElementById('file-input').value = '';
    document.getElementById('file-base64-input').value = '';
    document.getElementById('file-base64-output').textContent = '';
    document.getElementById('file-info').style.display = 'none';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('download-btn').style.display = 'none';
    currentFile = null;
    decodedFileData = null;
}