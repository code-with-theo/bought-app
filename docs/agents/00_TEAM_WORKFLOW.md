# 「买过」多 Agent 协作总则

## 最高指导

所有 Agent 开始工作前必须阅读项目根目录 `AGENT.md`。

发生冲突时，优先级为：

1. 用户在当前对话中的新要求
2. `AGENT.md`
3. 本角色指令
4. 现有实现细节

不得自行改变产品定位、技术栈、核心数据结构或主要视觉方向。

## 推荐分工与分支

| 角色 | 分支 | 主要范围 |
|---|---|---|
| 产品与体验 | `agent/product-ux` | `docs/product/` |
| UI 与设计系统 | `agent/ui-system` | 全局样式、设计组件 |
| 前端功能 | `agent/frontend` | 页面、业务组件、交互 |
| 数据与存储 | `agent/data-storage` | 类型、Repository、本地存储 |
| QA 与测试 | `agent/qa` | 测试、缺陷报告 |
| 集成与审查 | `agent/integration` | 合并、修复、最终构建 |

## 文件所有权

建议主要负责人：

- `docs/product/`：产品 Agent
- `src/types/`、`src/lib/db/`、`src/lib/storage/`：数据 Agent
- `src/app/globals.css`、`src/components/ui/`、`src/components/design-system/`：UI Agent
- `src/app/`、`src/features/`：前端 Agent
- `tests/`、`e2e/`、`docs/qa/`：QA Agent
- 跨目录冲突与最终重构：集成 Agent

修改其他角色负责的文件时，必须说明原因，并保持最小改动。

## 两种工作方式

### 独立分支

每个 Agent 从最新主分支创建自己的分支，小步提交，完成后提供提交哈希和交接说明。

### 共享工作区

若多个对话共享同一目录，必须串行：

1. 产品
2. 数据
3. UI
4. 前端
5. QA
6. 集成

同一时间只能有一个 Agent 写代码。

## 统一交接格式

每个 Agent 完成后输出：

```markdown
## 完成内容
## 修改文件
## 验证结果
## 未解决问题
## 给下一个 Agent 的注意事项
## 分支与提交
```

## 禁止事项

- 忽略或覆盖 `AGENT.md`
- 更换技术栈
- 创建第二套数据层或设计系统
- 引入未使用依赖
- 使用大量 `any`
- 留下无法操作的假按钮
- 使用浏览器默认 `alert`
- 修改无关文件
- 未执行命令却声称测试通过
- 为未来扩展加入明显过度设计

## 合并前必跑

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

项目存在端到端测试时，再运行：

```bash
npm run test:e2e
```
