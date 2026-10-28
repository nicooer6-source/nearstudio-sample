# Noomo Showcase Crystal Space

组件使用经过原站核对的 [Noomo Showcase](https://showcase.noomoagency.com/) 首页运行镜像。它保留 Nuxt、Three.js、WebGL、3D 模型、视频贴图、漂浮晶体、项目文案、按钮，以及鼠标与滚动交互；Sample 预览默认隐藏顶部导航，并保留原站 `GET STARTED` 进入动作。

## 参数

- `audio`：允许原站声音；关闭时会静音页面中的音视频元素。
- `showNavigation`：显示或隐藏原站顶部导航。

## 使用

在 Sample 详情页调整参数后，可复制 Runner URL、HTML 接口或 React iframe 代码。运行文件位于 Sample 自己的永久资源路径，不依赖会过期的临时镜像地址。

## 校验

- 欢迎页保留原站 3D 晶体、说明文案与 `GET STARTED` 入口。
- 进入后出现完整 WebGL 场景、项目标题、介绍、标签和 `View Case Study` 按钮。
- 鼠标移动与滚动会改变晶体、相机、视频材质与当前项目。
- 顶部导航可按参数启用，默认不显示。
