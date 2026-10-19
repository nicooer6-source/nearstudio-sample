# Wild Craft Pixel Field

归档自 [Wild — Craft, Engineered](https://craft.wild.as/) 首页首屏，源项目来自用户 GitHub 仓库 `nicooer6-source/craft-wild-as-mirror`。

组件保留原页面首屏的左右文字排版、Wild 标识、像素网格和彩色场；画廊预览省略全站导航。Canvas 根据容器尺寸重绘，鼠标移动会在像素场中产生高光轨迹，点击会触发扩散波。右侧面板可调整像素尺寸、笔刷、密度、速度、轨迹长度和五组颜色，参数可通过分享 URL 或 JSON 导出。

## 交互

- 移动鼠标：点亮并搅动附近像素。
- 点击或按住后松开：产生向外扩散的像素波。
- 缩略图模式：沿用同一组件与参数，只收紧排版，确保缩略图和实际预览一致。

## 来源说明

视觉结构、文案与交互依据 `craft-wild-as-mirror/index.html` 中的 `hero-kv` Canvas 实现整理为 React 组件；没有用静态截图代替效果。
