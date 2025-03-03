/**
 * JSON Worker
 * 处理 JSON 解析和格式化的 Web Worker
 */

self.onmessage = function(e) {
    const { action, data, performanceMode } = e.data;
    
    if (action === 'format') {
        try {
            // 解析 JSON 字符串
            const json = JSON.parse(data);
            
            // 处理 JSON 数据
            const result = processJSON(json, performanceMode);
            
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
 * @param {boolean} performanceMode 是否启用性能模式
 * @returns {Object} 处理后的数据
 */
function processJSON(json, performanceMode) {
    return processJSONNode(json, 0, performanceMode ? 1 : Infinity);
}

/**
 * 递归处理 JSON 节点
 * @param {*} node JSON 节点
 * @param {number} level 当前嵌套级别
 * @param {number} maxLevel 最大处理级别，超过此级别的节点将延迟处理
 * @returns {Object} 处理后的节点
 */
function processJSONNode(node, level, maxLevel) {
    if (node === null || typeof node !== 'object') {
        return node;
    }
    
    // 如果超过最大级别，返回占位符
    if (level >= maxLevel) {
        if (Array.isArray(node)) {
            return {
                type: 'lazy-array',
                length: node.length,
                preview: node.slice(0, 10),
                fullData: node
            };
        } else {
            const keys = Object.keys(node);
            return {
                type: 'lazy-object',
                length: keys.length,
                preview: Object.fromEntries(keys.slice(0, 10).map(key => [key, node[key]])),
                fullData: node
            };
        }
    }
    
    // 处理数组
    if (Array.isArray(node)) {
        // 如果是大型数组，只处理部分元素
        if (node.length > 100) {
            const processed = node.slice(0, 100).map(item => processJSONNode(item, level + 1, maxLevel));
            return {
                type: 'large-array',
                processed,
                length: node.length,
                hasMore: true,
                fullData: node
            };
        }
        
        return node.map(item => processJSONNode(item, level + 1, maxLevel));
    }
    
    // 处理对象
    const processed = {};
    const keys = Object.keys(node);
    
    // 如果是大型对象，只处理部分属性
    if (keys.length > 100) {
        keys.slice(0, 100).forEach(key => {
            processed[key] = processJSONNode(node[key], level + 1, maxLevel);
        });
        
        return {
            type: 'large-object',
            processed,
            length: keys.length,
            hasMore: true,
            fullData: node
        };
    }
    
    // 处理普通对象
    keys.forEach(key => {
        processed[key] = processJSONNode(node[key], level + 1, maxLevel);
    });
    
    return processed;
}
