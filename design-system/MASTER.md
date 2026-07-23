# Neo Wabi-Sabi Design System - MASTER

> Source of truth for the 宋子杰 portfolio. All tokens, components, and rules
> below map 1:1 to code in [src/app.css](../src/app.css) and
> [src/lib/components/](../src/lib/components/).

**Design Read:** Solo creative portfolio for hiring managers and collaborators,
with a Neo Wabi-Sabi aesthetic language, leaning toward native CSS + organic
asymmetry + warm material texture.

**Dials:** `DESIGN_VARIANCE 8 / MOTION_INTENSITY 5 / VISUAL_DENSITY 3`

---

## 1. Design Philosophy - Seven Principles

| Principle | Meaning | Code manifestation |
|---|---|---|
| **Kanso 简素** | Remove clutter, keep only what speaks | Client list grouped into 3 semantic clusters, not 16 flat rows |
| **Fukinsei 不均齐** | Asymmetry, imperfect balance | Hero grid offset columns, `--tilt-*` rotation on sections |
| **Shibui 涩美** | Subdued, understated beauty | Clay / sand / stone muted palette, no saturated accents |
| **Shizen 自然** | Natural texture, not artificial | 3-layer noise.svg (grain + fibers + mottle), warm paper gradient |
| **Yūgen 幽玄** | Depth, suggestion over revelation | IntersectionObserver reveal action, hero z-index layering, intro mask-image |
| **Datsuzoku 脱俗** | Break convention, surprise | Custom cursor, organic ink-divider replacing hairlines |
| **Seijaku 静寂** | Tranquility through silence | Generous section spacing, locked warm light theme |

**Core belief:** Wabi-Sabi is not minimalism. Minimalism seeks flawless machine
perfection; Wabi-Sabi seeks warm, imperfect, real beauty. Every decision below
serves warmth and imperfection, not sterility.

---

## 2. Design Tokens

All tokens live in `:root` inside [src/app.css](../src/app.css) lines 93-134.

### 2.1 Color Palette

| Token | Value | Role |
|---|---|---|
| `--paper` | `#e8e5de` | Primary background, warm paper |
| `--paper-warm` | `#e3ded4` | Mid-tone background gradient stop |
| `--paper-deep` | `#ddd9d0` | Deep background gradient stop |
| `--ink` | `#262320` | Primary text, warm near-black |
| `--ink-soft` | `#3d3a35` | Secondary text, client list items |
| `--clay` | `#9e6b55` | Single accent color, selection highlight |
| `--clay-light` | `rgba(158, 107, 85, 0.12)` | Accent surface tint |
| `--sand` | `#c9c0b3` | Divider gradient, subtle UI |
| `--stone` | `#8a8379` | Muted metadata |
| `--fog` | `#b5afa4` | Cluster labels, least prominent text |
| `--shadow` | `rgba(38, 35, 32, 0.08)` | Default shadow tint |
| `--shadow-deep` | `rgba(38, 35, 32, 0.14)` | Elevated shadow tint |

**Color rules:**
- ONE accent: `--clay`. Used on selection, links, and nothing else.
- No pure black (`#000`) or pure white (`#fff`). Use `--ink` and `--paper`.
- Theme is locked to warm light mode. No dark mode.
- All shadows are tinted to `--ink`, never neutral black.

**Legacy aliases** (do not use in new code):
`--color--light-gray` → `--paper`, `--color--dark-gray` → `--ink`,
`--color--orange` → `--clay`.

### 2.2 Typography

| Token | Value | Usage |
|---|---|---|
| `--font-family--body` | `"Neue Haas Grotesk Display", -apple-system, sans-serif` | Body text, UI, labels |
| `--font-family--display` | `"Orelo Semi Wide", -apple-system, sans-serif` | Hero, marquee, display headlines |

**Font files** (in `/static/fonts/`):
- `NHaasGroteskDSStd-45Lt.woff` - weight 300
- `NHaasGroteskDSStd-55Rg.woff` - weight 400
- `Orelo-SemiWide.woff2` - weight 400

**Type rules:**
- Display font for hero and marquee only. Body font everywhere else.
- `font-display: block` on all `@font-face` to prevent FOIT flicker.
- Body line-height: `1.2` (tight, editorial). Section paragraph: `1.5`-`1.75`.
- Cluster labels: `0.7rem`, `letter-spacing: 0.14em`, `text-transform: uppercase`.

### 2.3 Spacing & Layout

| Token | Value | Role |
|---|---|---|
| `--grid-margin` | `1.25rem` | Page horizontal padding |
| `--header-height` | `5rem` | Navigation bar height |
| `--spacer-height` | `3.5rem` | Base vertical rhythm unit |
| `--viewport-height` | `100vh` | Hero section height |

**Grid system:**
- 8-column CSS Grid (`repeat(8, minmax(0, 1fr))`), `column-gap: 0.5rem`.
- Hero uses asymmetric column starts (1, 2, 3, 4, 5) for Fukinsei.
- Client cluster: 1 col mobile → 2 col `>=900px` → 3 col `>=1200px`.

### 2.4 Organic Imperfection (Fukinsei)

| Token | Value | Applied to |
|---|---|---|
| `--tilt-1` | `-0.28deg` | `.grid-section:nth-of-type(1)` |
| `--tilt-2` | `0.19deg` | `.grid-section:nth-of-type(2)` |
| `--tilt-3` | `-0.12deg` | `.grid-section:nth-of-type(3)` |
| `--tilt-4` | `0.22deg` | `.grid-section:nth-of-type(4)` |

Inner `.grid` counter-rotates to keep text readable while section tilts.

### 2.5 Yūgen Depth (scroll reveal)

| Token | Value | Role |
|---|---|---|
| `--yugen-dim` | `0.12` | Initial opacity when hidden |
| `--yugen-blur` | `3px` | Initial blur when hidden |
| `--yugen-lift` | `18px` | Initial Y offset when hidden |

**Reveal states** (driven by [reveal.js](../src/lib/actions/reveal.js)):
- `.reveal-hidden`: opacity 0.12, translateY 18px, blur 3px
- `.reveal-visible`: opacity 1, translateY 0, blur 0
- Transition: `1.1s cubic-bezier(0.22, 1, 0.36, 1)` on all three properties

### 2.6 Motion

| Token | Value | Role |
|---|---|---|
| (in CustomCursor) `--size` | `44px` | Cursor ring diameter |
| (in CustomCursor) `--radius` | `3px` | Cursor ring corner radius |

**Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for all reveal transitions.
**Marquee:** scroll-driven via `requestAnimationFrame` + passive scroll listener.

---

## 3. Texture & Material Assets

### 3.1 noise.svg - 3-layer paper texture

File: [static/noise.svg](../static/noise.svg)

| Layer | Filter | Effect |
|---|---|---|
| 1. Grain | `fractalNoise` baseFrequency 0.85, 4 octaves | Fine film grain |
| 2. Fibers | `turbulence` baseFrequency 0.018/0.12, 2 octaves | Paper fiber strands |
| 3. Mottle | `fractalNoise` baseFrequency 0.006, 3 octaves | Ink mottling patches |

Applied via `body::before` at `384px` tile, `opacity 0.48`, `mix-blend-mode: multiply`.

### 3.2 Vignette layer

`body::after` adds radial vignette `rgba(38, 35, 32, 0.07)` at edges, drawing eye inward (Yūgen).

### 3.3 Page background

[app.css `.page-background`](../src/app.css): 3 radial gradients + linear gradient
(168deg paper → paper-warm → paper-deep).

---

## 4. Component Inventory

| Component | Path | Role |
|---|---|---|
| `Header.svelte` | [src/lib/components/Header.svelte](../src/lib/components/Header.svelte) | Top nav, name + About/Projects |
| `Hero.svelte` | [src/lib/components/Hero.svelte](../src/lib/components/Hero.svelte) | Identity grid, asymmetric columns |
| `Marquee.svelte` | [src/lib/components/Marquee.svelte](../src/lib/components/Marquee.svelte) | Scroll-driven name marquee |
| `AboutSection.svelte` | [src/lib/components/AboutSection.svelte](../src/lib/components/AboutSection.svelte) | Intro + clients + awards + speaking |
| `LinksSection.svelte` | [src/lib/components/LinksSection.svelte](../src/lib/components/LinksSection.svelte) | Social links list |
| `CustomCursor.svelte` | [src/lib/components/CustomCursor.svelte](../src/lib/components/CustomCursor.svelte) | Breathing ring + dot cursor |
| `Footer.svelte` | [src/lib/components/Footer.svelte](../src/lib/components/Footer.svelte) | Copyright year + link to legal page |

### 4.1 Component APIs

**Header** - no props. Static nav with name + 2 links.

**Hero** - no props. 6-line identity grid with asymmetric column starts.
Uses `.hero-grid` (CSS Grid), `.hero-line` per line.

**Marquee** - no props. `onMount` binds scroll listener, updates `transform: translate3d()`.
Has desktop and mobile variants.

**AboutSection** - no props. Uses `use:reveal` action.
Structure: intro paragraph (mask-image fade) → ink-divider → 3 client clusters → ink-divider → awards → speaking.

**LinksSection** - no props. Uses `use:reveal` action.
6 links: Email, Twitter/X, Instagram, GitHub, Itch.io, Are.na.

**CustomCursor** - no props. `onMount` mousemove listener + `requestAnimationFrame` loop.
Ring follows with 0.12 lerp, dot follows instantly.

### 4.2 Actions

| Action | Path | Usage |
|---|---|---|
| `reveal` | [src/lib/actions/reveal.js](../src/lib/actions/reveal.js) | `use:reveal` on AboutSection, LinksSection |

Options: `{ threshold: 0.15, rootMargin: '0px 0px -8% 0px', once: true }`.
Honors `prefers-reduced-motion` (skips animation, shows content instantly).

---

## 5. Layout Rules

### 5.1 Section structure

Every content section uses `.grid.grid-section`:
- CSS Grid 8 columns
- `::before` adds 2.5rem gradient hairline at top-left (organic section marker)
- `nth-of-type` applies `--tilt-*` rotation
- Consecutive sections get `margin-top: 0.8 × --spacer-height`

### 5.2 Ink divider

`.ink-divider` - horizontal line between sections:
- Empty element, `grid-column: 1 / -1`
- `::before` renders gradient `transparent → --sand → --stone → --sand → transparent`
- `opacity: 0.25`, inset 15% from both edges
- `margin: 0.4 × --spacer-height 0`

### 5.3 Hero grid

6 lines, each in its own grid cell with offset `grid-column-start`:
```
Line 1 (col 4)  | Line 2 (col 2) | Line 3 (col 1)
Line 4 (col 4)  | Line 5 (col 5) | Line 6 (col 3)
```
z-index layering (1-5) with opacity 0.82-1.0 creates depth (Yūgen).

### 5.4 Client cluster

`.client-cluster-grid` - 3 semantic groups:
1. Art & Exhibition (6 items)
2. Games & Interactive (4 items)
3. Brand & Education (6 items)

Responsive: 1 col → 2 col (≥900px) → 3 col (≥1200px).
Each cluster: `--fog` uppercase label + `--ink-soft` item list.

---

## 6. Interaction & Motion Rules

### 6.1 Allowed motion patterns

- **IntersectionObserver reveal** - for scroll-in content (Yūgen)
- **requestAnimationFrame + passive scroll** - for marquee position only
- **CSS transitions on transform/opacity/filter** - for reveal states
- **Custom cursor** - lerp 0.12 ring, instant dot

### 6.2 Banned patterns (from design-taste-frontend skill)

- `window.addEventListener('scroll', ...)` without rAF batching - banned
- `useState` for continuous values (mouse position, scroll progress) - banned
- Animate `top/left/width/height` - banned, use `transform` and `opacity` only
- Infinite loops without `prefers-reduced-motion` fallback - banned

### 6.3 Reduced motion

All motion collapses to static under `@media (prefers-reduced-motion: reduce)`:
- `.reveal-hidden` becomes fully visible
- Hero spans reset to `translateY(0)`, `blur(0)`, `opacity: 1`
- All transitions set to `0.01ms`

---

## 7. Do / Don't

### Do
- Add `use:reveal` to any new scroll-in section
- Use `--clay` as the single accent for any new interactive element
- Add `.ink-divider` between distinct content blocks
- Keep hero text to 4-6 short lines in the asymmetric grid
- Tint all shadows to `--ink`, never use neutral black

### Don't
- Don't add new accent colors. One accent (`--clay`) per the whole page.
- Don't use em-dash (`—`) anywhere. Use regular hyphen (`-`).
- Don't use pure black (`#000`) or pure white (`#fff`).
- Don't add a dark mode. Theme is locked to warm paper light.
- Don't use serif fonts. Display is Orelo (semi-wide), body is Neue Haas.
- Don't create centered hero layouts. Use asymmetric grid (Fukinsei).
- Don't add 3+ consecutive image+text split sections.
- Don't use eyebrows above every section. Max 1 eyebrow per 3 sections.
- Don't use `h-screen` for hero. Use `min-h-[100dvh]` or `--viewport-height`.

---

## 8. Pre-Flight Checklist

Before declaring any change done, verify:

- [ ] Zero em-dash (`—`) anywhere visible to user
- [ ] One accent color (`--clay`) used consistently across all sections
- [ ] All new scroll-in sections have `use:reveal`
- [ ] `prefers-reduced-motion` honored for any motion added
- [ ] No pure black / pure white
- [ ] Mobile layout explicit (client-cluster collapses to 1 col `< 900px`)
- [ ] No `window.addEventListener('scroll')` without rAF batching
- [ ] IntersectionObserver used for reveals, not scroll listeners
- [ ] Shadows tinted to `--ink`
- [ ] Theme locked to warm light mode

---

## 9. File Map

```
portfolio-sveltekit/
├── src/
│   ├── app.css                          # All tokens + global styles
│   ├── app.d.ts                        # Error + PageData type defs
│   ├── app.html                        # Manifest, theme-color, favicon
│   ├── hooks.server.js                 # Error handling + ops logging
│   ├── lib/
│   │   ├── actions/
│   │   │   └── reveal.js               # Yūgen scroll reveal
│   │   ├── components/
│   │   │   ├── Header.svelte
│   │   │   ├── Hero.svelte
│   │   │   ├── Marquee.svelte
│   │   │   ├── AboutSection.svelte
│   │   │   ├── LinksSection.svelte
│   │   │   ├── CustomCursor.svelte
│   │   │   └── Footer.svelte           # Copyright + legal link
│   │   ├── domain/                     # DDD: domain entities
│   │   │   ├── index.ts               # Re-exports
│   │   │   ├── profile.ts             # Profile entity
│   │   │   ├── social.ts              # SocialLink entity
│   │   │   └── portfolio.ts            # Client/Award/Speaking entities
│   │   ├── config/                     # DDD: infrastructure config
│   │   │   └── site.ts                # Site URL, SEO, keywords
│   │   ├── services/                   # DDD: application services
│   │   │   └── seo.ts                 # SEO meta + JSON-LD generation
│   │   └── index.js
│   └── routes/
│       ├── +layout.svelte              # SEO meta + cursor + JSON-LD
│       ├── +layout.ts                 # Prerender config
│       ├── +page.svelte               # Component composition + Footer
│       ├── +error.svelte               # 404 / 500 Wabi-Sabi error page
│       ├── copyright/
│       │   ├── +page.svelte            # Copyright + terms + credits
│       │   └── +page.ts               # Prerender config
│       └── sitemap.xml/
│           └── +server.js              # Sitemap endpoint
├── static/
│   ├── noise.svg                       # 3-layer paper texture
│   ├── robots.txt                      # Crawl rules + sitemap ref
│   ├── manifest.json                   # PWA manifest
│   └── fonts/                          # Neue Haas + Orelo
└── design-system/
    └── MASTER.md                       # This file
```

---

## 10. Architecture - DDD Layered Structure

The codebase follows a lightweight Domain-Driven Design layering:

| Layer | Path | Responsibility |
|---|---|---|
| **Domain** | `src/lib/domain/` | Pure data entities: Profile, SocialLink, ClientCluster, Award, SpeakingEngagement. No framework deps. |
| **Infrastructure** | `src/lib/config/` | Site-level configuration: URL, SEO keywords, page registry for sitemap. |
| **Application** | `src/lib/services/` | Services that orchestrate domain into artifacts: SEO meta generation, JSON-LD structured data. |
| **Presentation** | `src/lib/components/` + `src/routes/` | Svelte components and route pages that consume domain + services. |

**Data flow:** Domain entities -> Services generate SEO/structured data -> Layout injects into `<svelte:head>` -> Components render domain data as UI.

---

## 11. SEO & Auxiliary Pages

### 11.1 Structured Data (JSON-LD)

Two schema.org objects injected in [+layout.svelte](../src/routes/+layout.svelte):
- **Person** - name, jobTitle, bio, email, location, knowsAbout, sameAs (social links)
- **WebSite** - site name, URL, description, inLanguage, author

### 11.2 Open Graph + Twitter Card

Full OG and Twitter Card meta tags in layout. OG image path: `/og-image.png` (placeholder, replace with actual 1200x630 image).

### 11.3 Sitemap

Dynamic endpoint at `/sitemap.xml` ([+server.js](../src/routes/sitemap.xml/+server.js)). Reads page registry from [site config](../src/lib/config/site.ts). Prerendered at build time.

### 11.4 Robots

[robots.txt](../static/robots.txt) allows all crawlers, disallows `/copyright`, references sitemap.

### 11.5 Error Pages

[+error.svelte](../src/routes/+error.svelte) - Wabi-Sabi styled 404/500 page with poetic reflections per status code. Uses `--clay` accent, ink-divider, display font.

### 11.6 Copyright Page

[/copyright](../src/routes/copyright/+page.svelte) - Legal notice with sections: copyright, terms of use, credits (tech + fonts), contact. `noindex, follow` for SEO.

### 11.7 Operations Troubleshooting

[hooks.server.js](../src/hooks.server.js) - `handleError` logs structured error context (status, code, path, method, timestamp, stack) for debugging. Returns sanitized messages to client.
