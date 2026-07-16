# 买过

「买过」是一个移动端优先的私人购物记忆库，用于记录商品、使用体验与复购结论。

这是一个可本地使用的 MVP：首次打开会展示 7 条中文演示记录，用户可以继续添加、评价、检索和管理自己的购物记录。产品规格位于 `docs/product/`。

## 技术栈

- Next.js App Router、React、TypeScript
- Tailwind CSS 与项目内复用组件
- ESLint、Vitest
- IndexedDB（浏览器本地数据与图片存储）

## 功能

- 首页：演示数据、近期记录、值得复购和等待评价
- 新增与编辑：商品名称、分类、图片、品牌、价格和使用状态；图片会在浏览器中压缩后保存
- 商品详情：1–5 星评分、复购结论、快捷标签、编辑与二次确认删除
- 物品库：名称搜索、分类/评分/复购筛选、排序及网格/列表切换
- 复购页：仅展示标记为“会复购”的记录
- 我的：统计、JSON 数据导出、清除演示数据和二次确认的全部清空

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

## 数据与图片存储

所有记录与压缩后的图片均保存于当前浏览器的 IndexedDB，刷新页面后仍会保留。数据不会自动同步至其他设备或浏览器；清除浏览器站点数据也会清除记录。导出功能会生成含图片数据的 JSON 文件。

数据访问通过 `ProductRepository` 接口隔离。后续迁移 Supabase 时，可新增远程 Repository 实现并保留页面与组件的调用方式。

## 工程约定

- `src/app/`：路由和页面入口
- `src/features/`：业务功能（由前端阶段创建）
- `src/lib/`、`src/types/`：数据访问与类型（由数据阶段创建）
- `src/components/`：复用 UI（由 UI 阶段创建）
- `docs/product/`：已冻结的产品与验收规格

根目录 `AGENT.md` 是最高项目约定。`AGENTS.md` 要求在修改 Next.js 代码前，先阅读 `node_modules/next/dist/docs/` 中对应主题的文档。

## 当前限制

- 当前没有账号、云端同步或多人共享能力。
- 数据仅在当前浏览器保存；建议在清空站点数据或更换设备前先导出 JSON 备份。
- PWA 安装与离线缓存尚未配置。
- 暂未配置端到端测试；关键交互仍需在发布前进行浏览器回归。

## Android APK（Capacitor）

项目已配置 Capacitor Android，Web 资源通过 Next 静态导出同步到 `android/`。本地构建需要 JDK 17+ 和 Android SDK；随后执行：

```bash
npm run android:debug
```

成功后的 debug APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。首次构建会下载 Gradle 与 Android 依赖。APK 内的数据、图片和主题仍保存在该应用 WebView 的 IndexedDB/localStorage 沙箱中；卸载应用或清除应用数据会删除这些本地记录。
