# 用户素材接入 · 2026-10-30

## 当前图层

用户在本对话提供四张图片，原始文件完整保存在 `sources/2026-10-30/`。下载目录的文件未改动。主图只转换文件格式，不重新绘制；前景使用内置 image_gen 去除画入 JPG 的棋盘格，并保留输出 PNG 的 alpha。旧版五张素材和提示词保存在 `versions/2026-10-16/`。

| 用户文件 | 保留的原始文件 | 当前原稿 | 页面用途 |
| --- | --- | --- | --- |
| Unknown.jpeg | sources/2026-10-30/pine-day.jpeg | pine-day.png | 桌面首页远景与中景；暮色原稿 |
| Gemini_Generated_Image_prlvfpprlvfpprlv.jpeg | sources/2026-10-30/pine-day-mobile.jpeg | pine-day-mobile.png | 手机首页与暮色；分类卷首静态图 |
| Gemini_Generated_Image_qb0eu7qb0eu7qb0e.jpeg | sources/2026-10-30/pine-trunk-checkerboard.jpeg | pine-trunk.png | 近景树干，真实透明 PNG |
| Gemini_Generated_Image_mt6r68mt6r68mt6r.jpg | sources/2026-10-30/pine-bough-checkerboard.jpg | pine-bough.png | 有限微风枝梢，真实透明 PNG |

`npm run assets:pine` 将原稿按桌面、手机尺寸编码为 AVIF/WebP。暮色文件由同一张白天原稿编码，页面使用固定镜像与透明度叠在夜墨底色上；未额外生成一张风格不同的夜景。照片在页面中略微放大，将原有外部相纸框裁出视口，保留内部旧相纸的纹理。纹理、遮罩、明暗均不逐帧计算。

验证中发现快速浏览器返回可在原导航提交前改变地址，使页面停留在 Project。布局现在等待被中断的导航完成或取消，仅在地址与页面仍不一致时使用替换历史的导航恢复；`npm run test:navigation` 连续复现五次并验证页面、场景及历史记录数量。正常横移转场继续由原逻辑负责。

## 验证记录

- `npm run check`：0 错误、0 警告；生产构建通过。
- 本地样例内容上的浏览器检查：场景 22 项、阅读与响应式 43 项、目录及转场 60 项，合计 125 项通过；快速返回回归另连续通过 5 次。
- AVIF 首屏背景合计：桌面 137,479 字节，手机 64,010 字节；包括主图、透明树干和枝梢，共用的主图只计一次。
- 同机无头 Chromium 1234 滚动采样：桌面 p95 帧间隔 50.1 → 34.1ms，手机模拟视口 17.4 → 16.8ms；根节点滚动样式写入均为 0。样本会受浏览器与本机负载影响，不作为真实手机帧率保证。
- 实际 CMS 首页单独确认返回 200，桌面及手机图片成功显示；样例检查未改动 CMS 配置。

## 前景处理提示词

使用内置 image_gen，`transparent_background: true`。以下是实际传入的完整提示词。生成会重建局部细节，原始枝形与材质尽量保留；未经处理的源文件同时保留。

### 枝梢 · background-extraction

Use case: background-extraction. Edit target: the attached wide pine branch image. Remove ONLY the grey checkerboard background, which is baked into the JPG, and replace all background including holes between twigs and needles with genuine alpha transparency. Preserve the existing exact asymmetric branch silhouette, needle locations, sparse aged ink-like detail, dark brown bark and black markings as faithfully as possible. Keep the landscape 3:2 framing: thick branch enters from the right edge near the upper third and reaches down to the left. Preserve all fine needles with clean translucent edge antialiasing. This is an extraction for a website parallax foreground, not a redesign. No grey checker squares anywhere, no background color, no paper, no drop shadow, no fog, no frame, no text. Output a PNG with actual alpha transparency.

### 树干 · background-extraction

Use case: background-extraction. Edit target: the attached portrait old pine trunk image. Remove ONLY the grey checkerboard background, which is baked into the JPEG, and replace all background including holes between the upper branches and pine needles with genuine alpha transparency. Preserve the exact existing trunk shape, coarse cracked dark brown bark, black fissures and knots, the thin branches spreading left in the upper half and their sparse pine needles. Preserve the portrait 2:3 composition: massive trunk is cropped at top, right and bottom, occupying the right portion; the left and lower-left empty space must be fully transparent. Extraction only, not a redesign or new tree. Keep detailed natural edge antialiasing. No checker squares, solid background, shadow, fog, ground, paper, border or text. Output a PNG with actual alpha transparency.
