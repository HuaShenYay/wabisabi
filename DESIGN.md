# DESIGN.md — 新侘寂主义(Neo-Wabisabi)视觉设计系统

> 版本 v1.0 · 最后更新 2026-07-30
> 适用范围:本网站全部页面的 CSS 样式、组件、布局、动效均须遵循本文档,不得脱离统一 Design Token 单独定义颜色/间距/圆角。
>
> 摘要：该网站的主题为新侘寂主义(Neo-Wabisabi)即在侘寂美学的基础上假如一些极简主义的清爽,最终使得侘寂的意境更加深厚,但网站整体的设计风格仍旧偏向传统的侘寂风格,即你要做到如下设计: 1、简素(Kanso)——去除杂乱; 不均齐(Fukinsei)——打破对称,使用非均匀布局; 涩味(Shibui)——含蓄、不张扬的美; 自然(Shizen)——采用真实物理的超级粗野的纹理感,真实感,不规则的形态布局; 幽玄(Yūgen)——通过留白和层次创造深度与神秘感; 脱俗(Datsuzoku)——摆脱常规模板的束缚; 静寂(Seijaku)——通过负空间营造宁静的氛围。 侘寂与极简主义的区别: 极简主义源自西方,追求机器般的精确、功能性和永恒的完美;而侘寂强调本质特征,赞美手工感、自然形态以及随时间流逝而产生的磨损与瑕疵。 技术层面的落地: 在 UI/UX 设计中,可通过 CSS Grid 实现 60/40 或 70/30 的非对称布局,采用大地色等自然色调,引入纸张或亚麻等细微纹理,并选用具有人文气息而非几何感的字体。

---

## 目录

1. 设计定位与哲学
2. 与极简主义的区别
3. 七大设计原则 → 技术落地映射表
4. 色彩系统(Design Tokens)
5. 字体系统
6. 布局系统:非对称栅格
7. 纹理与质感(Materiality)
8. 间距与留白系统
9. 圆角、阴影、瑕疵美学细节
10. 动效与过渡
11. 组件设计规范
12. 无障碍与性能
13. 亲生物设计与 SEO 的关联
14. 反模式清单(禁止事项)
15. 实施检查清单
16. 附录:完整 CSS Token 表

---

## 1. 设计定位与哲学

本站视觉语言定义为 **新侘寂主义(Neo-Wabisabi)**:以侘寂(わびさび)美学为骨架,借极简主义的"克制"手法去除多余噪音,但**不倒向极简主义的机器式精确**。最终呈现应是——粗粝、留白、微妙、不完美,却因此显得更真实、更有呼吸感。

**判断标准**:如果一个页面看起来像 Squarespace 模板 / SaaS 官网 / Notion 页面,说明做错了。它应该更像一张用了很多年、边缘微卷的手工纸。

---

## 2. 与极简主义的区别

| 维度 | 极简主义(Minimalism) | 新侘寂主义(Neo-Wabisabi) |
|---|---|---|
| 起源 | 西方现代主义、工业设计 | 日本侘寂美学 + 克制手法 |
| 核心追求 | 机器般的精确、功能性、永恒完美 | 本质特征、手工感、自然形态 |
| 对瑕疵的态度 | 消除一切"误差",追求零瑕疵 | 接纳并突出磨损、不规则、岁月痕迹(金缮精神) |
| 布局逻辑 | 严格网格、对称、等分栏 | 非对称分栏,比例随区块变化 |
| 色彩 | 高对比黑白 / 纯色块 / 品牌色 | 大地色系、低饱和、带纹理的中间调 |
| 情感基调 | 冷静、中性、无个性 | 静谧、含蓄、有时间感与诗意 |
| 常见反例 | 玻璃拟态、霓虹渐变、Bento Grid 滥用 | (见第 14 节反模式清单) |

**关键提醒**:Bento Grid(便当盒网格)是近两年很流行的"看起来不对称"的布局趋势,但其本质仍是统一圆角、统一间距的规则网格,属于极简主义的变体,**不等同于不均齐(Fukinsei)**,使用时需谨慎,不可作为"侘寂式非对称"的替代品。

---

## 3. 七大设计原则 → 技术落地映射表

| 原则 | 罗马字 | 核心含义 | 技术落地要点 |
|---|---|---|---|
| 简素 | Kanso 簡素 | 去除多余装饰,只留必要元素 | 单页语义色 ≤ 5 个;组件默认无阴影/无渐变,仅在需要制造层次时才用阴影 |
| 不均齐 | Fukinsei 不均齐 | 打破对称,拒绝机械式对齐 | Grid 非对称分栏(62/38、70/30 等),**比例逐区块变化**,避免居中对齐的 Hero 区 |
| 涩味 | Shibui 渋味 | 含蓄克制,不靠视觉刺激取胜 | 低饱和色板;hover 只做颜色/透明度微调,不做 scale 放大或发光效果 |
| 自然 | Shizen 自然 | 真实材质感、不规则形态 | SVG 噪点纹理叠加;border-radius 四角不等值;装饰性卡片微旋转 ±0.3°~0.8° |
| 幽玄 | Yūgen 幽玄 | 留白与层次营造深度、神秘感 | 内容随滚动缓慢显影;下一区块的色块/纹理在视口边缘"借景"式露出一角 |
| 脱俗 | Datsuzoku 脱俗 | 摆脱模板化布局惯性 | 导航 / CTA / Footer 拒绝行业默认位置与形态;每页至少一处"打破预期"的结构安排 |
| 静寂 | Seijaku 静寂 | 负空间营造宁静氛围 | 区块间距 ≥ `--space-7`;无自动播放媒体;动效时长 ≥ 360ms 且使用缓出曲线 |

---

## 4. 色彩系统(Design Tokens)

### 4.1 原始色板(Primitive Tokens)

大地色系,所有颜色均带暖调偏移,**禁止使用纯黑 `#000` / 纯白 `#fff` / 高饱和品牌色**。

```css
:root {
  /* 纸 — 背景基调 */
  --raw-paper:        #F3EFE6;  /* 宣纸,主背景 */
  --raw-paper-alt:     #EBE4D6;  /* 皮纸,区块交替背景 */
  --raw-paper-deep:    #DDD3BF;  /* 陶胎,深色分区背景 */

  /* 墨 — 文字 */
  --raw-ink:           #2A2924;  /* 墨色,正文主色(非纯黑) */
  --raw-ink-soft:      #55524A;  /* 淡墨,次要文字 */
  --raw-ink-faint:     #8C8777;  /* 远山,仅限大字号/装饰性文字,禁止用于正文 */

  /* 土 — 强调色 */
  --raw-clay:          #A97C5A;  /* 陶土,主强调色 / 链接 */
  --raw-clay-deep:     #86593C;  /* 焙陶,hover / active */
  --raw-moss:          #6C7458;  /* 苔痕,次强调色 */
  --raw-slate:         #6D7B7A;  /* 青灰,信息/辅助 */
  --raw-rust:          #9C5642;  /* 锈红,强调/警示(仍是大地色,非警示红) */
  --raw-kintsugi:      #B08A4E;  /* 金缮,仅用于分割线/特殊 CTA,克制使用 */
}
```

### 4.2 语义色(Semantic Tokens)

组件层禁止直接引用 `--raw-*`,一律通过语义 token:

```css
:root {
  --color-bg:            var(--raw-paper);
  --color-bg-alt:         var(--raw-paper-alt);
  --color-bg-deep:        var(--raw-paper-deep);

  --color-text:           var(--raw-ink);
  --color-text-muted:     var(--raw-ink-soft);
  --color-text-faint:     var(--raw-ink-faint);   /* 仅大字号/装饰 */

  --color-link:           var(--raw-clay);
  --color-link-hover:     var(--raw-clay-deep);

  --color-accent:         var(--raw-moss);
  --color-info:           var(--raw-slate);
  --color-emphasis:       var(--raw-rust);
  --color-special:        var(--raw-kintsugi);   /* 每页使用不超过 1~2 处 */

  --color-border:         rgba(42, 41, 36, 0.14);
  --color-divider:        rgba(42, 41, 36, 0.08);
}
```

### 4.3 使用规则

- 每个页面/组件最多使用 **5 个语义色**(简素原则)。
- `--color-text-faint` 不得用于正文段落,只能用于超大标题、水印式装饰文字。
- `--color-special`(金缮金)全站每屏最多出现一次,用于"修复/转折"的语义节点(例如章节分割线、关键 CTA),用多了就失去意义。
- 深色模式非本设计系统首要目标;如需实现,应整体调换为"夜纸+烛墨"色调,而非简单反色。

---

## 5. 字体系统

### 5.1 字体栈

拒绝几何无衬线体(如 Helvetica / Arial 式的机械精确感),优先选择带手写感、人文气息的衬线体。

```css
:root {
  --font-heading: "LXGW WenKai", "霞鹜文楷", "Source Han Serif SC",
                  "Noto Serif SC", serif;
  --font-body:    "Source Han Serif SC", "Noto Serif SC",
                  "Songti SC", serif;
  --font-latin:   "Cormorant Garamond", "EB Garamond", Georgia, serif;

  /* 极少量使用:导航标签、时间戳、按钮文字、表单标签 */
  --font-ui:      "PingFang SC", "Noto Sans SC", sans-serif;
}
```

> 性能提醒:霞鹜文楷等中文衬线字体文件体积较大(完整字库可达数 MB),务必做**子集化(subsetting)**或使用 `font-display: swap`,否则会拖慢 LCP,反而违背第 13 节的 SEO 目标。建议正文长文本用系统衬线兜底(`--font-body`),标题/关键字句才加载定制字体(`--font-heading`)。

### 5.2 字号(Fluid Type Scale)

```css
:root {
  --text-xs:  clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem);
  --text-sm:  clamp(0.875rem, 0.83rem + 0.2vw, 0.9375rem);
  --text-base:clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);
  --text-lg:  clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);
  --text-xl:  clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
  --text-2xl: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
  --text-3xl: clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem);
}
```

### 5.3 行高与字距

```css
:root {
  --leading-tight: 1.35;  /* 标题 */
  --leading-base:  1.85;  /* 中文正文,刻意放宽以制造留白感 */
  --leading-loose: 2.1;   /* 引文 / 诗句 */

  --tracking-heading: 0.04em; /* 标题微加宽,近似"刻字"质感 */
  --tracking-base:    0.01em;
}
```

---

## 6. 布局系统:非对称栅格

### 6.1 基础非对称分栏

```css
.section-asymmetric {
  display: grid;
  grid-template-columns: 62fr 38fr;
  gap: clamp(24px, 4vw, 64px);
  align-items: start;
}

/* 不同区块使用不同比例,避免"非对称"本身沦为新的机械规则 */
.section-asymmetric--reverse   { grid-template-columns: 34fr 66fr; }
.section-asymmetric--extreme   { grid-template-columns: 78fr 22fr; }

@media (max-width: 768px) {
  .section-asymmetric,
  .section-asymmetric--reverse,
  .section-asymmetric--extreme {
    grid-template-columns: 1fr;
  }
}
```

**规则**:同一站点内不要让所有区块都用同一个比例(比如永远 60/40),那样"不对称"会变成新的对称模板。建议按内容权重手动决定比例,允许出现 55/45、70/30、22/78 等不同组合。

### 6.2 错位与溢出

制造"手工排布"感,允许元素轻微跨越网格边界:

```css
.figure--offset {
  grid-column: 1 / -1;
  transform: translateX(clamp(-40px, -4vw, -12px));
  margin-block: var(--space-6) calc(var(--space-6) * -0.4);
}
```

### 6.3 脱俗(Datsuzoku)结构提示

- 导航不必固定在顶部水平居中;可尝试侧边、角落锚定、或随内容滚动淡出。
- Hero 区拒绝"居中标题 + 居中按钮"的通用模板;文字块靠一侧,大面积留白留在另一侧。
- Footer 不必是通栏深色块;可以是一段渐隐的留白 + 极简文字。

---

## 7. 纹理与质感(Materiality)

真实感来自**细微、程序化生成的噪点纹理**,而非大尺寸摄影素材(会拖慢加载,违背第 13 节 SEO 要求)。

### 7.1 SVG 噪点纹理(推荐,轻量)

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="paper-grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9"
                   numOctaves="2" stitchTiles="stitch" result="noise"/>
    <feColorMatrix in="noise" type="matrix"
      values="0 0 0 0 0.165  0 0 0 0 0.161  0 0 0 0 0.141  0 0 0 0.05 0"/>
  </filter>
</svg>
```

```css
.texture-paper {
  position: relative;
}
.texture-paper::before {
  content: "";
  position: absolute;
  inset: 0;
  filter: url(#paper-grain);
  mix-blend-mode: multiply;
  opacity: 0.5;
  pointer-events: none;
}
```

### 7.2 亚麻纹理(用于卡片/分区背景)

用极小体积的平铺 WebP(< 20KB)代替大图,`background-blend-mode` 与底色叠加,保持每个分区色调略有差异,避免"纯色块"的塑料感。

```css
.texture-linen {
  background-color: var(--color-bg-alt);
  background-image: url("/assets/tex/linen-tile.webp");
  background-blend-mode: multiply;
  background-size: 220px;
}
```

### 7.3 边缘处理

避免所有容器都是"完美矩形",用 `clip-path` 制造撕纸边缘,仅用于装饰性分割区块,不用于正文容器(会影响可读性/可访问性)。

```css
.torn-edge-bottom {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 96%,
    92% 100%, 78% 95%, 63% 100%,
    47% 94%, 31% 100%, 15% 96%, 0% 100%
  );
}
```

---

## 8. 间距与留白系统

刻意不用常规的 8pt 网格(那是极简/Material Design 的机械式节奏),改用近似斐波那契数列的有机间距刻度,更贴近自然生长节奏:

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 13px;
  --space-4: 21px;
  --space-5: 34px;
  --space-6: 55px;
  --space-7: 89px;
  --space-8: 144px;
  --space-9: 233px;
}
```

**静寂(Seijaku)规则**:区块之间(section 之间)的垂直间距不得小于 `--space-7`(89px);移动端可降级到 `--space-6`,但不得低于此值,否则页面会显得拥挤,破坏宁静感。

---

## 9. 圆角、阴影、瑕疵美学细节

### 9.1 非均值圆角

杜绝四角统一的 `border-radius: 8px`,改为四角不等值,制造手工修边的感觉:

```css
:root {
  --radius-sharp:   2px 6px 2px 6px;
  --radius-soft:    3px 14px 4px 12px;
  --radius-organic: 255px 15px 225px 15px / 15px 225px 15px 255px; /* 仅限装饰性图片/色块 */
}
```

### 9.2 阴影

阴影应像"纸叠在纸上",柔和、大范围扩散,不用生硬的 Material 式硬阴影:

```css
:root {
  --shadow-paper:  0 2px 12px rgba(42, 41, 36, 0.06);
  --shadow-lifted: 0 8px 32px rgba(42, 41, 36, 0.10),
                    0 2px 6px rgba(42, 41, 36, 0.06);
}
```

### 9.3 金缮式"瑕疵"处理

侘寂的核心不是把瑕疵藏起来,而是让它成为焦点。用金色细线作为"修补痕迹",出现在内容转折处(如章节分割线、跨区块拼接处):

```css
.kintsugi-seam {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent, var(--raw-kintsugi) 40%,
    var(--raw-kintsugi) 60%, transparent
  );
  margin-block: var(--space-6);
  opacity: 0.7;
}
```

### 9.4 装饰性微旋转

**仅用于图片/图标等装饰元素,禁止应用于文字容器**(会损害可读性与可访问性):

```css
.polaroid--tilt-1 { transform: rotate(-0.6deg); }
.polaroid--tilt-2 { transform: rotate(0.4deg); }
.polaroid--tilt-3 { transform: rotate(-0.3deg); }
```

---

## 10. 动效与过渡

### 10.1 缓动曲线与时长

拒绝弹性/回弹曲线(过于俏皮,违背涩味 Shibui 的克制),使用类似墨水在纸上晕开的缓慢衰减曲线:

```css
:root {
  --ease-organic: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-settle:  cubic-bezier(0.34, 0.01, 0.16, 1);

  --duration-fast: 180ms;
  --duration-base: 360ms;
  --duration-slow: 620ms;
}
```

### 10.2 交互反馈原则

- Hover:仅做颜色/透明度过渡,**禁止** `scale()` 放大、发光(glow)、跳动。
- 滚动显影:元素进入视口时用 `opacity` + 小幅度 `translateY(12px)` 缓慢淡入(600ms 起),模拟"逐渐显影"而非"弹出"。
- 尊重 `prefers-reduced-motion`,必须提供无动效降级版本。

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. 组件设计规范

| 组件 | 侘寂式处理 | 明确禁止 |
|---|---|---|
| 按钮 | 文字型或细边框按钮,hover 时颜色缓慢加深/下划线缓慢展开 | 渐变填充、发光、圆润 pill 形状、scale 弹跳 |
| 卡片 | 尺寸不完全统一(瀑布流/masonry 倾向),装饰性卡片可微旋转 | 统一网格中完全等大等距的卡片阵列 + 统一投影 |
| 表单输入框 | 下划线式输入框,label 置于上方并留出充足间距 | 蓝色发光 focus ring、圆角药丸型输入框 |
| 导航 | 可垂直/角落锚定,字间距放宽,hover 缓慢变色 | 固定顶部纯白通栏 + 居中 Logo 的通用模板 |
| CTA 按钮 | 每页最多 1 个"金缮"高亮 CTA,其余为文字链接级别 | 多个高饱和度、高对比度的抢眼按钮堆叠 |
| 分割线 | 用留白本身分割,或用 `.kintsugi-seam` | 实线 `<hr>` 默认样式、粗黑分割条 |

---

## 12. 无障碍与性能

侘寂的"含蓄"不能以牺牲可用性为代价,以下为硬性底线:

- **对比度**:正文文字(`--color-text` on `--color-bg`)须达到 WCAG AA(≥ 4.5:1);`--color-text-faint` 对比度较低,**仅限大字号或装饰性文字**,发布前须用工具(如 WebAIM Contrast Checker)实测验证,不可凭肉眼判断。
- **焦点状态**:即使视觉上克制,键盘 focus 状态也必须清晰可辨(可用 `--raw-clay-deep` 的 2px 描边,而非直接隐藏 outline)。
- **动效**:遵守 `prefers-reduced-motion`(见 10.2)。
- **字体加载**:中文定制字体需子集化,并设置 `font-display: swap`,避免阻塞渲染。
- **纹理资源**:优先使用 SVG/CSS 生成的噪点纹理,避免大体积 JPG 纹理图,保护 LCP/CLS 指标。
- **图片**:统一使用 WebP/AVIF,并对首屏以下图片启用 `loading="lazy"`。

---

## 13. 亲生物设计与 SEO 的关联

侘寂式的自然纹理、非对称留白、克制色彩,符合"亲生物假说"(Biophilia Hypothesis)——人在潜意识中对自然形态、有机纹理的焦虑感更低,这会带来更长的停留时长、更低的跳出率。这些是搜索引擎判断内容质量的重要行为信号,间接影响排名。

但这一优势**依赖性能不被拖累**,否则会被 Core Web Vitals(同样是排名因子)反噬。实践中需要平衡:

1. 用程序化生成的轻量纹理(SVG/CSS)代替大尺寸摄影素材;
2. 语义化 HTML 结构、合理的标题层级仍是 SEO 的地基,视觉风格不能替代它;
3. 动效与滚动显影效果需设置合理阈值,避免造成布局抖动(CLS);
4. 中文字体子集化(见第 5.1 节)直接影响 LCP,是本设计系统里性能与美学冲突最大的一处,需重点验证。

---

## 14. 反模式清单(禁止事项)

发现以下任意一项,视为违反本设计系统:

- [ ] 玻璃拟态(Glassmorphism)/ 新拟物(Neumorphism)
- [ ] 渐变网格背景(Gradient Mesh)、霓虹发光效果
- [ ] 纯黑 `#000000` / 纯白 `#ffffff`
- [ ] 高饱和度品牌色大面积使用
- [ ] 所有卡片统一圆角、统一投影、统一间距的规整网格(包括滥用 Bento Grid)
- [ ] 居中对齐的 Hero(大标题 + 居中按钮 + 居中副标题)
- [ ] 按钮 hover 时 scale 放大或弹跳
- [ ] 自动播放的视频/音频
- [ ] 库存感强烈的"精修摆拍"图片风格
- [ ] emoji 大量用于正式内容排版

---

## 15. 实施检查清单

上线前逐条核对,对应第 3 节七大原则:

- [ ] **简素**:本页语义色是否 ≤ 5 个?是否有无功能性的装饰元素?
- [ ] **不均齐**:本页分栏比例是否与相邻页面/区块不同?是否有完全居中对称的区域?
- [ ] **涩味**:是否存在高饱和度色块或抢眼的动效?
- [ ] **自然**:是否使用了噪点/纹理?圆角是否四角不等值?
- [ ] **幽玄**:是否有留白与层次制造的"深度感"?下一区块是否有"借景"式露出?
- [ ] **脱俗**:导航/Hero/Footer 是否明显模仿了某个通用模板?
- [ ] **静寂**:区块间距是否 ≥ `--space-7`?是否有不必要的自动播放/弹窗?
- [ ] 对比度、focus 状态、`prefers-reduced-motion` 是否已验证?
- [ ] 纹理/字体资源是否已做轻量化处理?

---

## 16. 附录:完整 CSS Token 表

将以下代码块作为全站 `:root` 变量的单一来源(Single Source of Truth),所有组件样式只允许引用这些 token,不允许硬编码颜色/间距数值。

```css
:root {
  /* ===== 原始色板 ===== */
  --raw-paper: #F3EFE6;
  --raw-paper-alt: #EBE4D6;
  --raw-paper-deep: #DDD3BF;
  --raw-ink: #2A2924;
  --raw-ink-soft: #55524A;
  --raw-ink-faint: #8C8777;
  --raw-clay: #A97C5A;
  --raw-clay-deep: #86593C;
  --raw-moss: #6C7458;
  --raw-slate: #6D7B7A;
  --raw-rust: #9C5642;
  --raw-kintsugi: #B08A4E;

  /* ===== 语义色 ===== */
  --color-bg: var(--raw-paper);
  --color-bg-alt: var(--raw-paper-alt);
  --color-bg-deep: var(--raw-paper-deep);
  --color-text: var(--raw-ink);
  --color-text-muted: var(--raw-ink-soft);
  --color-text-faint: var(--raw-ink-faint);
  --color-link: var(--raw-clay);
  --color-link-hover: var(--raw-clay-deep);
  --color-accent: var(--raw-moss);
  --color-info: var(--raw-slate);
  --color-emphasis: var(--raw-rust);
  --color-special: var(--raw-kintsugi);
  --color-border: rgba(42, 41, 36, 0.14);
  --color-divider: rgba(42, 41, 36, 0.08);

  /* ===== 字体 ===== */
  --font-heading: "LXGW WenKai", "霞鹜文楷", "Source Han Serif SC", "Noto Serif SC", serif;
  --font-body: "Source Han Serif SC", "Noto Serif SC", "Songti SC", serif;
  --font-latin: "Cormorant Garamond", "EB Garamond", Georgia, serif;
  --font-ui: "PingFang SC", "Noto Sans SC", sans-serif;

  --text-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem);
  --text-sm: clamp(0.875rem, 0.83rem + 0.2vw, 0.9375rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.0625rem);
  --text-lg: clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem);
  --text-xl: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
  --text-2xl: clamp(1.75rem, 1.4rem + 1.6vw, 2.5rem);
  --text-3xl: clamp(2.25rem, 1.7rem + 2.4vw, 3.5rem);

  --leading-tight: 1.35;
  --leading-base: 1.85;
  --leading-loose: 2.1;
  --tracking-heading: 0.04em;
  --tracking-base: 0.01em;

  /* ===== 间距(斐波那契式) ===== */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 13px;
  --space-4: 21px;
  --space-5: 34px;
  --space-6: 55px;
  --space-7: 89px;
  --space-8: 144px;
  --space-9: 233px;

  /* ===== 圆角 ===== */
  --radius-sharp: 2px 6px 2px 6px;
  --radius-soft: 3px 14px 4px 12px;
  --radius-organic: 255px 15px 225px 15px / 15px 225px 15px 255px;

  /* ===== 阴影 ===== */
  --shadow-paper: 0 2px 12px rgba(42, 41, 36, 0.06);
  --shadow-lifted: 0 8px 32px rgba(42, 41, 36, 0.10), 0 2px 6px rgba(42, 41, 36, 0.06);

  /* ===== 动效 ===== */
  --ease-organic: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-settle: cubic-bezier(0.34, 0.01, 0.16, 1);
  --duration-fast: 180ms;
  --duration-base: 360ms;
  --duration-slow: 620ms;
}
```
