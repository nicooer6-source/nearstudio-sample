# Dorian Lods Fluid Glass

从 [dorianlods.com](https://dorianlods.com/) 首页原版 Vite + Vue + WebGL 运行时中提取的完整首屏组件。组件保留原站的流体字形、虹彩玻璃模型、鼠标速度场、镜头倾斜、滚动转场和作品列表悬停反馈；画廊缩略图使用真实运行画面，避免同时启动多份 WebGL。

## 参数

- `rotationSpeed`：首屏玻璃几何体旋转速度，原站完成入场后的默认值为 `0.6`。
- `fluidIOR` / `fluidRoughness`：字形流体的折射量与折射粗糙度。
- `fluidSaturation` / `fluidContrast`：流体合成颜色的饱和度与对比度。
- `chromaticAberration`：后期色散强度，原站入场完成值为 `0.15`。
- `bloom`：后期辉光混合，原站入场完成值为 `0.7`。
- `vignette`：画面边缘暗角。
- `warmColor` / `coolColor`：流体背景的暖、冷两层颜色。

## 运行方式

组件通过同源隔离 iframe 运行原版 WebGL 代码。Nearstudio Runner 使用 `nearstudio:dorian-config` 消息把画廊参数传给原场景配置；数值会限制在原源码范围内，颜色只接受六位十六进制值。作品列表链接在组件模式中保留排版和悬停反馈，但不会离开当前组件去打开案例详情。

原运行时来源：`nicooer6-source/dorianlods-com`，提交 `d15719b`。
