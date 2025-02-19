/**
 * JSON Visualizer - URL Encoder/Decoder
 * 
 * @license MIT
 * @copyright Copyright (c) 2025 JSON Visualizer
 * @see https://github.com/yequ/json-visualizer
 */

function encodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        const encoded = encodeURIComponent(input);
        document.getElementById('url-output').textContent = encoded;
    } catch (error) {
        document.getElementById('url-output').textContent = '编码失败: ' + error.message;
    }
}

function decodeURL() {
    const input = document.getElementById('url-input').value;
    try {
        const decoded = decodeURIComponent(input);
        document.getElementById('url-output').textContent = decoded;
    } catch (error) {
        document.getElementById('url-output').textContent = '解码失败: ' + error.message;
    }
}
