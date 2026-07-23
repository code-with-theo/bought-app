# Cloudflare 账户与跨设备同步（第一阶段）

## 架构

- 静态 Next/Capacitor 前端继续离线使用 IndexedDB；登录后的同步由独立的 `bought-api` Worker 提供。
- D1 `bought` 保存用户、不可逆的会话令牌摘要和每位用户的商品 JSON；每次商品访问均以 `user_id` 限制。
- 私有 R2 `bought-images` 保存压缩后的图片。没有公开 bucket URL；只有已认证的 `GET /v1/images/:productId` 能读取所属图片。
- 密码采用每用户随机盐 + PBKDF2-SHA-256（600,000 次）。会话是 256-bit 随机值，D1 只保存 SHA-256 摘要，24 小时后到期；浏览器使用 `HttpOnly; Secure; SameSite=Lax` Cookie。

## API 契约（给前端）

JSON 写入请求使用 `Content-Type: application/json` 和 `credentials: "include"`。请求基址为构建时 `NEXT_PUBLIC_API_BASE_URL`。

| 方法与路径 | 说明 |
| --- | --- |
| `POST /v1/auth/register` | `{ email, password }` 注册；密码至少 12 位；成功后写入 HttpOnly 会话 Cookie。 |
| `POST /v1/auth/login` | `{ email, password }` 登录并刷新 24 小时会话。 |
| `POST /v1/auth/logout` | 销毁当前会话并清除 Cookie。 |
| `GET /v1/me` | 返回当前用户和会话到期时间；未登录返回 401。 |
| `GET /v1/products` | 仅返回当前用户的商品；图片地址受认证保护。 |
| `POST /v1/products` | `{ product: ProductRecord }` 新建同步记录；压缩图片 data URL 最大 1 MB。 |
| `DELETE /v1/products/:id` | 只删除当前用户的记录及其 R2 图片。 |
| `GET /v1/images/:productId` | 只读取当前用户的私有图片。 |

本阶段的同步边界是新增、读取、删除；编辑合并、离线冲突处理、批量迁移既有 IndexedDB 和账户 UI 由下一前端阶段接入。

## Cloudflare 配置

1. 在 Dashboard 创建 D1 数据库 `bought` 和 R2 bucket `bought-images`，不要开启 bucket 的公开 URL。
2. 将 D1 UUID 替换 `worker/wrangler.jsonc` 的全零 `database_id` 占位值（该 ID 不是密钥），确认 bucket 名称一致。
3. Dashboard → `bought-api` Worker → Settings → Variables and Secrets，创建普通变量：
   - `ALLOWED_ORIGINS=https://bought-app.catzen.workers.dev,capacitor://localhost`（生产官网和 Android 的精确来源，无尾随 `/`；以逗号分隔）
4. 本地开发时将 `worker/.dev.vars.example` 复制成 `worker/.dev.vars`，不要提交。
5. 执行：

   ```powershell
   npm run api:db:migrate:remote
   npm run api:deploy
   ```

6. 前端构建环境添加公开变量 `NEXT_PUBLIC_API_BASE_URL=https://bought-api.<account-subdomain>.workers.dev`，然后重新构建静态站点。

## 明确的后续项

- 邮箱验证、密码找回/重置、改密、MFA 和设备会话管理尚未实现。
- Android 登录 UI 需要使用 Capacitor 的平台安全存储保存会话，或调整为受限的 Bearer-token 登录流程；当前浏览器实现优先使用 HttpOnly Cookie。
- 登录 UI 接入后增加登录频率限制（Cloudflare Rate Limiting 或 KV）、审计日志和监控告警。
- 首次同步需让用户选择是否上传现有本地数据；冲突策略建议根据 `updatedAt` 并向用户展示冲突。
