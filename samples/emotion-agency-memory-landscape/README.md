# Emotion Memory Landscape

组件使用经过原站核对的 [Emotion Agency](https://emotion-agency.com/) 首页静态运行镜像。它保留 Nuxt、Three.js、WebGL worker、模型、贴图、粒子、低多边形山体、草岸、水面反射、原站文案和鼠标/滚动交互；Sample 预览默认隐藏顶部导航并自动选择“Enter without audio”。

## 参数

- `autoEnter`：资源加载完成后自动进入首页主视觉。
- `audio`：自动进入时选择带声音入口。
- `showNavigation`：显示或隐藏原站顶部导航。

## 使用

在 Sample 详情页调整参数后，可复制 Runner URL、HTML 接口或 React iframe 代码。运行文件位于 Sample 自己的永久资源路径，不依赖会过期的临时镜像地址。

## 校验

- 欢迎页会在所有模型、纹理和 worker 加载完成后出现。
- 主视觉包含 10 个 WebGL canvas，持续动画正常。
- 点击、鼠标移动和滚动会改变粒子、相机及场景状态。
- 原站首屏文案排版保留；顶部导航可按参数启用。
