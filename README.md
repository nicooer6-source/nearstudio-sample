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
