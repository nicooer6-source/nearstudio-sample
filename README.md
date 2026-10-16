# Nearstudio Sample

Nearstudio 的前端组件画廊，部署于 `https://nearstudio.art/sample/`。

## 统一运行环境

全部组件运行在 `src/runner/SampleRunner.tsx` 提供的共享 Runner 中。卡片、详情层和独立链接只传入组件 slug、状态与主题，不为每张卡片复制一套 Vite/React/iframe 环境。

新增组件只需要添加：

```text
samples/{slug}/
├── sample.json
├── README.md
└── src/
    └── index.tsx
```

画廊通过 `import.meta.glob` 自动发现清单、代码、说明和组件入口。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建前会校验每个组件的清单、状态和入口文件。

## 预览还原规则

- 组件预览必须保留原网页中与效果共同构成首屏的文字、按钮、内容卡片和排版层级，让动效处在真实使用场景中。
- 顶部全站导航、账户入口、页脚和与组件无关的长页面内容默认不放进组件预览。
- 缩略图、详情预览和独立 Runner 使用同一份组件结构；缩略图只允许做响应式缩放或隐藏次要说明，不能改成另一套展示。
- 若原网页的交互依赖鼠标、滚动或点击，预览必须保留对应的可操作区域和必要提示。
