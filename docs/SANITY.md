# Sanity 内容接入

前台保留 SvelteKit + Three.js，Studio 是独立 React 应用。不要把读取或写入 Token 放进 `PUBLIC_` / `SANITY_STUDIO_` 变量。

## 当前项目

已连接 `my-portfolio`：Project ID 为 `y6sc85uh`，dataset 为 `production`（公开）。本机连接配置位于被 Git 忽略的 `.env.local`，无需读取 Token。

当前使用 `SANITY_CONTENT_SCOPE=all`：作品、文章、首页简介、教育经历、研究方向、社交链接与站点设置均由 Sanity 管理。已有首页资料已复制为 12 份发布文档，页面保持原内容。

线上编辑入口为 [Sanity Studio](https://www.sanity.io/@odlQaPM4o/studio/h1u8i35avyns0x3wsf9rj5tt/default/structure)，也可直接打开 [monji.sanity.studio](https://monji.sanity.studio/structure)。新版部署沿用原应用 ID 和 `default` 工作区，保留 Post／Author／Category，新增整站编辑入口。原 6 篇文章、作者和标签未修改。

- 兼容现有 `post` 和新 `project` 两种结构；同 slug 时优先使用 `project`。
- 现有 `essay`、`literature`、`photograph`、`portfolio` 标签的 Post 归入「文学艺术」。原标签保留在线上；未来可用分卷中文名或分卷 slug 标签指定其他分卷。
- Post 简介取正文首段，缺少封面时取第一张正文图作为目录图。正文图按原比例显示一次；纯文字文章不显示空封面。
- 保留现有文章的强调、链接、列表、引文及图片。不用建站示例内容填充已配置的作品目录。
- Profile、Site Settings、Project、Focus Areas、Education、Philosophy、Social Links 已纳入同一 Studio。编辑后点击发布，前台下一次读取会使用发布内容。

## 连接项目

1. 在 [Sanity 管理控制台](https://www.sanity.io/manage) 选择项目，记录 Project ID 和 dataset。
2. 在项目根目录创建 `.env.local`（参照 `.env.example`），设置 `PUBLIC_SANITY_PROJECT_ID`、`PUBLIC_SANITY_DATASET`。公开 dataset 不需要读取 Token；私有 dataset 使用只读 `SANITY_API_READ_TOKEN`。
3. 在项目的 API / CORS origins 中添加 `http://localhost:3333`，如果使用 `http://127.0.0.1:3333` 也单独添加，允许 Studio 凭证。生产环境只添加真实 Studio 域名，不使用通配符。
4. 重启 `npm run dev`，运行 `npm run studio:dev`，打开终端打印的 Studio 地址并登录。
5. 编辑并发布需要更新的资料或文章。Post 和 Project 均可展示为作品；Project slug 使用小写英文、数字、连字符，例如 `first-study`。

## 内容与发布

- Profile 与 Site Settings 是单例，使用固定 ID `profile` / `siteSettings`。
- Project 支持标题、简介、年份、分类、顺序、封面、裁切焦点、外部链接与正文。
- 正文支持段落、标题、强调、斜体、安全链接、列表、引文和带替代文字的图片。旧 Post 的一级/四级标题在前台归入二/三级，保持页面标题层级。
- 正文图片按原始尺寸与编辑器裁切计算比例，预留版面；竖向作品不会强裁为横向封面。
- 分卷封面取该分卷第一件有封面的作品。没有封面或图版加载失败时显示文字，不发送空图片请求。
- 所有 CMS 读取在服务器端执行，使用 `published` perspective。新作品发布后可直接访问，无须改路由或重建前台；草稿不会出现在公开页面。
- 未配置项目时使用本地演示内容。配置后空集合保持为空；CMS 读取失败返回 503，**不会把演示作品冒充真实内容**。
- Studio 构建与前台构建独立。`npm run studio:build` 输出 `sanity/dist`；部署前台需要 SvelteKit 支持的服务器/Serverless 适配器，不能按纯静态目录部署。
- Studio 的依赖缓存单独存放于 `node_modules/.vite-studio`，可与前台同时启动。

## 部署与现有资料导入

`npm run studio:deploy` 使用官方 CLI，部署到现有 `monji` Studio（应用 ID `h1u8i35avyns0x3wsf9rj5tt`），同时发布内容结构。CLI 已登录时不需要额外创建或保存 Token。

`npm run sanity:site-plan` 只读核对首页资料的导入计划；`npm run sanity:site-import` 将已有首页资料复制到缺失的发布文档。此专用脚本限制目标为 `y6sc85uh/production`，不导入示例作品，不覆盖已有草稿或发布文档；已存在集合类型时保留云端集合。当前 12 份资料已经导入，通常无需重跑。

## 可选：导入现有演示内容

`npm run sanity:seed` 只预览计划，不联网、不写入。

确实需要演示草稿时，在 `.env.local` 临时设置有编辑权限的 `SANITY_API_WRITE_TOKEN`，执行 `npm run sanity:seed -- --apply`。命令仅创建不存在的草稿，不覆盖已有草稿/发布内容，也不自动发布。不导入外部生成的占位图片，请自行上传真实作品。导入后移除写入 Token，并在 Studio 核对内容后逐件发布。

## 关键验证

```sh
npm run build
cd sanity
../node_modules/.bin/sanity deploy --dry-run --no-build
```

真实连接只需核对后台资料编辑入口、首页资料，以及一篇真实文章/摄影图集的目录与详情读取。无需向线上写入测试文档。

2026-09-28：官方 CLI 确认新版 Studio 部署成功；前台构建、首页读取和公开资料数量核对通过（6 篇 Post、12 份首页资料）。后台首次画面检查发现中文根导航缺少 ID，已补齐稳定 ID 并重新部署成功；最终后台画面复查受浏览器连接超时影响，尚未完成。

代码测试使用隔离的模拟数据；当前项目的真实连通性另以公开 API 和本地文章页面读取验证，不向线上写入测试文档。

参考：[Sanity 环境变量](https://www.sanity.io/docs/studio/environment-variables)、[客户端查询与发布视图](https://www.sanity.io/docs/apis-and-sdks/js-client-querying)。
