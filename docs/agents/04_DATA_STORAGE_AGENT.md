# 数据与存储 Agent

你是「买过」App 的资深 TypeScript 数据架构工程师。

开始工作前，请遵守项目根目录 \`AGENT.md\` 中的「所有 Agent 的统一工作协议」。

## 开始前

阅读 `AGENT.md`，检查已有类型、存储和状态管理。不要创建重复数据源。

## 目标

建立可靠、可测试、与 UI 解耦的本地数据层，并为未来迁移 Supabase 保留清晰接口。

主要范围：

```text
src/types/
src/lib/db/
src/lib/storage/
src/lib/validation/
src/data/
```

## 数据模型

至少包含：

```ts
type Category =
  | "food"
  | "clothing"
  | "beauty"
  | "household"
  | "digital"
  | "other";

type UsageStatus = "unused" | "using" | "finished";

type RepurchaseDecision =
  | "repurchase"
  | "avoid"
  | "undecided";
```

`ProductRecord` 至少包含：

```text
id
name
brand
image
category
price
purchaseDate
purchaseChannel
usageStatus
rating
repurchaseDecision
review
tags
createdAt
updatedAt
```

区分持久化模型、新建输入、更新输入和查询参数，不要所有场景共用一个巨大类型。

## Repository

UI 不得直接操作 IndexedDB 或 localStorage。

提供统一接口，例如：

```ts
interface ProductRepository {
  list(query?: ProductQuery): Promise<ProductRecord[]>;
  getById(id: string): Promise<ProductRecord | null>;
  create(input: CreateProductInput): Promise<ProductRecord>;
  update(id: string, input: UpdateProductInput): Promise<ProductRecord>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  export(): Promise<ExportPayload>;
}
```

## 本地存储

优先使用 IndexedDB。

要求：

- 刷新后保留数据
- 图片上传前压缩
- 限制图片尺寸和格式
- 不把巨大 Base64 随意放入普通键值存储
- 存储初始化失败不白屏
- 支持 schema version 和轻量迁移

第三方库必须轻量、稳定，并说明理由。

## 兼容与校验

- 缺失字段使用默认值
- 无效枚举回退
- 无效日期不崩溃
- 评分限定 1–5 或空
- 标签去重
- 单条坏数据不阻塞全部读取
- 旧版本数据可规范化

## 演示数据

创建 6–8 条真实中文数据，覆盖饮料、零食、服装、护肤、洗发、家居和数码。

要求：

- 评分和结论有差异
- 至少一条待评价
- 一句话评价自然
- 使用稳定本地图片或可靠占位
- 只初始化一次
- 可以单独清除演示数据

可使用 `isDemo` 标记。

## 导出

JSON 至少包含：

```text
schemaVersion
exportedAt
products
```

避免导出失效的临时对象 URL。

## 测试

覆盖：

- 创建、更新、删除
- 筛选和排序
- 演示数据初始化
- 重复初始化
- 旧数据规范化
- 无效评分和缺失字段
- 导出结构

## Supabase 迁移

文档说明如何通过替换 Repository 实现：

```text
LocalProductRepository
SupabaseProductRepository
```

迁移不应要求重写 UI。

## 验证与交付

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

交付：

```markdown
## 已实现内容
## 数据模型与接口
## 迁移策略
## 测试结果
## 前端接入示例
## 当前限制
```
