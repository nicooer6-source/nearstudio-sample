# Ink Flow Cursor

Shaders.com 首页鼠标流体动效的独立组件。组件使用官方 MIT 开源 `shaders` 包中的 `SolidColor`、`Stone` 和 `InkFlow` 组合。

## 体验

在预览区域内移动鼠标。蓝紫色流体会沿指针轨迹生成，并逐渐扩散消失。

## 运行方式

该组件不包含自己的 Vite、React 或 iframe 环境。它通过 Nearstudio Sample 的共享 Runner 加载：

`/sample/runner/?component=shaders-ink-flow-cursor`

以后新增的组件也只提供 `sample.json`、入口组件和说明文件，由同一个 Runner 负责状态、主题、视口、重置与错误边界。
