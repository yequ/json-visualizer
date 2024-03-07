// js/script.js


document.getElementById('json-input').addEventListener('input', function() {
    var input = this.value;
    try {
        var input = document.getElementById('json-input');
        var json = JSON.parse(input.value);
        var output = JSON.stringify(json, null, 4);
        document.getElementById('json-output').textContent = output;
    } catch (e) {
        document.getElementById('json-output').textContent = 'Invalid JSON!';
    }
});

function escapeJSON() {
    var input = document.getElementById('json-input');
    var jsonString = input.value;
    // 使用JSON.stringify来处理转义
    input.value = JSON.stringify(jsonString).slice(1, -1);
}

function unescapeJSON() {
    try {
        var input = document.getElementById('json-input');
        var jsonString = input.value;
        // 将完全转义的数据转换回原始字符串
        input.value = jsonString.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        viewJSON();
    } catch (e) {
        document.getElementById('json-output').textContent = 'Invalid JSON!';
    }
}

function compressJSON() {
    try {
        var input = document.getElementById('json-input');
        var json = JSON.parse(input.value);
        input.value = JSON.stringify(json);
    } catch (e) {
        document.getElementById('json-output').textContent = 'Invalid JSON!';
    }
}

function viewJSON() {
    try {
        var input = document.getElementById('json-input');
        var json = JSON.parse(input.value);
        var output = JSON.stringify(json, null, 4);
        document.getElementById('json-output').textContent = output;
    } catch (e) {
        document.getElementById('json-output').textContent = 'Invalid JSON!';
    }
}
