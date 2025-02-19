/**
 * JSON Visualizer - Timestamp Converter
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

function timestampToDate() {
    const input = document.getElementById('time-input').value.trim();
    const output = document.getElementById('time-output');
    
    try {
        // 处理毫秒和秒两种格式
        let timestamp = parseInt(input);
        if (isNaN(timestamp)) {
            output.textContent = '请输入有效的时间戳';
            return;
        }
        
        // 如果是毫秒时间戳（13位），直接使用
        // 如果是秒时间戳（10位），转换为毫秒
        if (timestamp.toString().length === 10) {
            timestamp *= 1000;
        }
        
        const date = new Date(timestamp);
        if (date.toString() === 'Invalid Date') {
            output.textContent = '无效的时间戳';
            return;
        }
        
        const result = {
            '格式化时间': date.toLocaleString('zh-CN', { 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }),
            'ISO格式': date.toISOString(),
            'UTC时间': date.toUTCString(),
            '本地时间': date.toString()
        };
        
        output.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        output.textContent = '转换出错: ' + error.message;
    }
}

function dateToTimestamp() {
    const input = document.getElementById('time-input').value.trim();
    const output = document.getElementById('time-output');
    
    try {
        const date = new Date(input);
        if (date.toString() === 'Invalid Date') {
            output.textContent = '请输入有效的日期字符串';
            return;
        }
        
        const result = {
            '毫秒时间戳': date.getTime(),
            '秒时间戳': Math.floor(date.getTime() / 1000)
        };
        
        output.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        output.textContent = '转换出错: ' + error.message;
    }
}

function getCurrentTimestamp() {
    const output = document.getElementById('time-output');
    const now = new Date();
    
    const result = {
        '当前时间': now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }),
        '毫秒时间戳': now.getTime(),
        '秒时间戳': Math.floor(now.getTime() / 1000),
        'ISO格式': now.toISOString(),
        'UTC时间': now.toUTCString()
    };
    
    output.textContent = JSON.stringify(result, null, 2);
}
