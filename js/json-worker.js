/**
 * JSON Worker
 * 处理 JSON 解析和格式化的 Web Worker
 */

self.onmessage = function(e) {
    const { action, data } = e.data;

    if (action === 'format') {
        try {
            // 解析 JSON 字符串
            const json = JSON.parse(data);

            // 处理 JSON 数据
            const result = processJSON(json);

            // 发送处理结果回主线程
            self.postMessage({ result });
        } catch (error) {
            self.postMessage({ error: `Invalid JSON: ${error.message}` });
        }
    }
};

/**
 * 处理 JSON 数据
 * @param {*} json JSON 数据
 * @returns {Object} 处理后的数据
 */
function processJSON(json) {
    return processJSONNode(json, 0);
}

/**
 * 递归处理 JSON 节点
 * @param {*} node JSON 节点
 * @param {number} level 当前嵌套级别（仅用于跟踪）
 * @returns {Object} 处理后的节点
 */
function processJSONNode(node, level) {
    if (node === null || typeof node !== 'object') {
        return node;
    }

    // 处理数组
    if (Array.isArray(node)) {
        // 处理所有数组元素，不再限制数量
        return node.map(item => processJSONNode(item, level + 1));
    }

    // 处理对象
    const processed = {};
    const keys = Object.keys(node);

    // 处理所有对象属性，不再限制数量
    keys.forEach(key => {
        processed[key] = processJSONNode(node[key], level + 1);
    });

    return processed;
}
