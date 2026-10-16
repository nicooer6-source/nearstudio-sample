# DDARK Particle Portrait

DDARK 首页首屏的像素肖像互动组件。预览保留原网页中与动效共同构成首屏的肖像、橙色圆形、标题、介绍、Contact 和滚动提示；顶部导航与后续长页面内容不纳入组件。

## 体验

在左侧肖像区域移动鼠标。指针附近的像素会向外散开，随后通过弹性运动返回肖像轮廓。

## 实现

- Canvas 2D 从原肖像图像采样生成粒子
- 指针作用半径 120px
- 粒子使用速度阻尼与归位力持续更新
- 支持触摸交互与 `prefers-reduced-motion`
- 组件运行在 Nearstudio Sample 的共享 Runner 中

原站：<https://ddark.dev/>
