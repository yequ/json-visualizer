# JSON Visualizer

一个简单易用的在线 JSON 可视化工具。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](#english) | [中文](#中文)

## English

A powerful, lightweight, and user-friendly JSON visualization tool that helps developers format, analyze, and manipulate JSON data with ease. Built with vanilla JavaScript and designed with a focus on performance and usability.

### ✨ Features

- **JSON Formatting & Validation**: Instantly format and validate JSON with syntax highlighting
- **Interactive Visualization**: Collapsible tree view for better navigation of complex JSON structures
- **Real-time Processing**: Live formatting as you type with efficient debouncing
- **Multiple Tools Included**:
  - 🔄 Timestamp Converter
  - 🔗 URL Encoder/Decoder
  - 🎨 Dark/Light Theme Toggle
- **File Operations**:
  - Drag & Drop JSON files
  - Copy formatted JSON
  - Download formatted JSON
- **Data Persistence**: Automatically saves your work using browser storage
- **Error Handling**: Clear error messages and validation feedback
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🚀 Quick Start

Simply visit [https://yequ.github.io/json-visualizer](https://yequ.github.io/json-visualizer) to start using JSON Visualizer online.

#### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yequ/json-visualizer.git
cd json-visualizer
```

2. Open index.html in your browser:
```bash
# If you have Python installed
python -m http.server 8000

# If you have Node.js installed
npx serve
```

3. Visit `http://localhost:8000` in your browser

### 💡 Usage

1. **Format JSON**:
   - Paste your JSON into the input area
   - The formatted result appears automatically
   - Click the collapse/expand icons to navigate nested structures

2. **Convert Timestamps**:
   - Navigate to the Time tool
   - Enter a timestamp or date string
   - Get various date format conversions

3. **Encode/Decode URLs**:
   - Navigate to the URL tool
   - Enter your URL or encoded string
   - Click encode/decode as needed

4. **Theme Switching**:
   - Click the theme toggle button in the header
   - Choose between light, dark, or system theme

### 🛠 Technical Stack

- Pure JavaScript (ES6+)
- HTML5
- CSS3 with CSS Variables for theming
- Local Storage API for data persistence

### 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- Thanks to all contributors who have helped make this tool better
- Special thanks to the open-source community for inspiration and support

### 📧 Contact

Ye Qu - [@yequ](https://github.com/yequ)

Project Link: [https://github.com/yequ/json-visualizer](https://github.com/yequ/json-visualizer)

## 中文

一个简单易用的在线 JSON 可视化工具。

## 在线体验
https://yequ.github.io/json-visualizer

## 功能特点

- 🎨 JSON 格式化与美化
- ✨ 语法高亮显示
- 🔍 JSON 语法校验
- 🔄 支持 JSON 转义和去除转义
- 📱 响应式设计，支持移动端
- 🌓 支持明暗主题切换
- 💾 自动保存编辑内容
- 🚀 纯前端实现，无需后端服务

## 附加工具

- URL 编解码工具
- 时间戳转换工具

## 使用说明

1. 访问 [在线工具](https://yequ.github.io/json-visualizer)
2. 在左侧文本框中输入或粘贴 JSON 数据
3. JSON 数据会自动格式化并在右侧显示
4. 使用顶部按钮可以进行 JSON 转义/去除转义操作
5. 点击右上角主题按钮可切换明暗主题

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/yequ/json-visualizer.git
```

2. 直接在浏览器中打开 `index.html` 即可运行

## 技术栈

- HTML5
- CSS3
- JavaScript (原生)

## 贡献

欢迎提交 Issue 或 Pull Request 来帮助改进这个项目。

## 许可证

MIT License