document.addEventListener('DOMContentLoaded', function() {
    // 当输入框内容改变时，保存数据到sessionStorage
    document.getElementById('json-input').addEventListener('input', function() {
        sessionStorage.setItem('jsonInputData', this.value);
    });

    // 页面加载时，检查sessionStorage并恢复数据
    var savedData = sessionStorage.getItem('jsonInputData');
    if (savedData) {
        document.getElementById('json-input').value = savedData;

        // 尝试解析JSON数据并格式化输出
        try {
            var json = JSON.parse(savedData);
            var output = JSON.stringify(json, null, 4);
            document.getElementById('json-output').textContent = output;
        } catch (e) {
            // 如果解析失败，显示错误信息
            document.getElementById('json-output').textContent = 'Invalid JSON!';
        }
    }
});

