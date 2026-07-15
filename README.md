# 买过

「买过」是一个移动端优先的私人购物记忆库，用于记录商品、使用体验与复购结论。

项目目前提供 Next.js App Router 工程骨架；产品规格位于 `docs/product/`。后续功能会以本地持久化为起点，并保持数据访问层可替换，以便迁移至 Supabase。

## 技术栈

- Next.js App Router、React、TypeScript
- Tailwind CSS
- ESLint、Vitest

## 本地启动

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 检查命令

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## 工程约定

- `src/app/`：路由和页面入口
- `src/features/`：业务功能（由前端阶段创建）
- `src/lib/`、`src/types/`：数据访问与类型（由数据阶段创建）
- `src/components/`：复用 UI（由 UI 阶段创建）
- `docs/product/`：已冻结的产品与验收规格

根目录 `AGENT.md` 是最高项目约定。`AGENTS.md` 要求在修改 Next.js 代码前，先阅读 `node_modules/next/dist/docs/` 中对应主题的文档。

## 当前限制

尚未实现商品数据、本地存储、设计系统和业务页面；这些内容将按共享工作区的串行流程接入。
