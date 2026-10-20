# Aeterna Genesis Sand

组件来自 Aeterna 首页 Hero。组件保留原站的标题、说明、两个按钮、排版和点阵双手互动，按画廊规则省略顶部导航、Framer 标记、模板销售面板与浮动入口。

## 保真基线

- 原站：<https://aeterna.framer.ai/>
- GitHub 镜像：`nicooer6-source/aeterna-framer-ai`
- 粒子运行时：原站 2026 年 9 月的 `SharedSandRendererV3`
- 原始媒体：`Creation of Adam`，5407 × 2286
- 默认参数：60,000 粒子、0.055 粒径、1.2 鼠标范围、0.15 排斥、0.01 回弹、0.8 阻尼

GitHub 镜像中的首页布局和媒体作为内容基线；交互使用线上当前版本，包含固定 120Hz 物理步长、停帧恢复、零距离保护和 WebGL 资源释放修复。

## 画廊与调用

右侧参数会通过 `postMessage` 传入隔离运行环境。画廊生成的 Runner URL 和 `<nearstudio-component>` 调用方式都可直接复用这些参数。缩略图使用静态预览，不在列表页重复启动 WebGL。
