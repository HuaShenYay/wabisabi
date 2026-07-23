```
---
$schema: "https://design.md/schema/v1.json"
tokens:
  color:
    paper: "#e8e5de"
    paper-warm: "#e3ded4"
    paper-deep: "#ddd9d0"
    ink: "#262320"
    ink-soft: "#3d3a35"
    clay: "#9e6b55"
    clay-light: "rgba(158, 107, 85, 0.12)"
    sand: "#c9c0b3"
    stone: "#8a8379"
    fog: "#b5afa4"
  typography:
    font-family-body: "'Neue Haas Grotesk Display', -apple-system, sans-serif"
    font-family-display: "'Orelo Semi Wide', -apple-system, sans-serif"
  spacing:
    grid-margin: "1.25rem"
    header-height: "5rem"
    spacer-height: "3.5rem"
  motion:
    easing-viscous: "cubic-bezier(0.16, 1, 0.3, 1)"
    duration-reveal: "1100ms"
---

# Neo Wabi-Sabi Design System Spec (v2.0)

> **Status:** Active · **Scope:** UI/UX & Design System (`wabisabi`)  
> **Source of truth:** Maps 1:1 to [src/app.css](../src/app.css) and [src/lib/components/](../src/lib/components/).  
> **Dials:** `DESIGN_VARIANCE 8 / MOTION_INTENSITY 4 / VISUAL_DENSITY 3`

---

## Part I — Aesthetic Philosophy & Material Metaphor

### 1. The Seven Principles (Re-grounded in Computational Medium)

Wabi-sabi (侘寂) finds beauty in what is transient, imperfect, and incomplete. In a digital medium, Neo Wabi-Sabi rejects sterile machine perfection and cold glassmorphism, introducing **tactile friction, controlled entropy, and occupied silence**.

| Principle | Meaning | Digital & Code Manifestation |
|---|---|---|
| **Kanso 簡素** | Simplicity / Elimination | Content grouped into semantic clusters. Max 1 eyebrow per 3 sections. High signal-to-noise ratio. |
| **Fukinsei 不均斉** | Dynamic Asymmetry | Session-seeded `--tilt-*` section rotations, asymmetric hero grid offsets, non-centered typography. |
| **Shibui 渋味** | Subdued Depth | Single muted accent (`--clay`), no saturated colors. Materials reward quiet, prolonged viewing. |
| **Shizen 自然** | Procedural Naturalness | 3-layer `noise.svg` procedural grain, dynamic paper gradients, organic ink-line dividers. |
| **Yūgen 幽玄** | Subtle Profundity | Out-of-fog scroll reveal (`opacity 0.12 + blur 3px`), subtle page edge vignette, letterpress deboss. |
| **Datsuzoku 脱俗** | Break Convention | Breathing ring cursor, ASCII kintsugi accents, chrono-light color temperature drift. |
| **Seijaku 静寂** | Tranquil Stillness | Over-damped motion settling, generous rhythm, locked warm light theme (no flash/toggle). |

### 2. The Three Governing Material Metaphors

Every UI element must strictly belong to one of these three material manifestations:
+------------------------------------------------------------------------+
| AGED PAPER                                                             |
| (2D Surface: Warm background, 3-layer noise, vignette, warm ink text)  |
+------------------------------------------------------------------------+
| CHRONO DUSK LIGHT                                                      |
| (Lighting & Colors: Time-aware color temperature, low contrast shadows)|
+------------------------------------------------------------------------+
| STILL WATER                                                            |
| (Motion & Fluidity: Viscous over-damped physics, ink-bleed reveals)    |
+------------------------------------------------------------------------+
1. **Aged Paper (2D Surface):** Never pure `#ffffff`. Carries tactile fiber noise, edge vignette, and light ink press depth.
2. **Chrono Dusk Light (Lighting):** Low-angle, warm, subtractive at edges. Shadows are tinted to `--ink`. Sky/Background never blows out to bright white.
3. **Still Water / Ink (Motion):** High viscosity. Movements slow down smoothly and settle into stillness. No spring bounces or jittery loops.

---

## Part II — Design Tokens & Dynamic Spectrum

All tokens live in `:root` in [src/app.css](../src/app.css).

### 3. Color Tokens & Chrono-Light Spectrum

#### 3.1 Base Palette
| Token | Base Value | Role |
|---|---|---|
| `--paper` | `#e8e5de` | Primary canvas background |
| `--paper-warm` | `#e3ded4` | Mid-gradient stop |
| `--paper-deep` | `#ddd9d0` | Deep gradient stop / Card background |
| `--ink` | `#262320` | Primary text, warm near-black |
| `--ink-soft` | `#3d3a35` | Secondary text |
| `--clay` | `#9e6b55` | **The Single Accent**: link hover, text selection |
| `--clay-light` | `rgba(158, 107, 85, 0.12)` | Interactive surface tint |
| `--sand` | `#c9c0b3` | Divider gradient center |
| `--stone` | `#8a8379` | Muted metadata |
| `--fog` | `#b5afa4` | Category labels / subtle tags |
| `--shadow` | `rgba(38, 35, 32, 0.08)` | Ink-tinted soft shadow |

#### 3.2 Chrono-Light Shift (逢魔时刻色温演变)
To reflect real-world time impermanence (*Mujō*), CSS variables dynamically drift based on user local time:

* **Dawn (06:00 – 11:00):** Morning Haze → `--paper: #ece9e2; --clay: #a47560;`
* **Dusk (17:00 – 20:00 - Standard):** Terracotta Warmth → `--paper: #e8e5de; --clay: #9e6b55;`
* **Nightfall (21:00 – 05:00):** Slate & Dried Rose → `--paper: #dedad0; --clay: #8f5d49;`

*Color Constraints:* Exactly **ONE** accent (`--clay`). No pure black (`#000000`) or white (`#ffffff`). Dark mode toggle is explicitly forbidden.

### 4. Typography & Digital Deboss

| Token | Value | Usage |
|---|---|---|
| `--font-family--body` | `"Neue Haas Grotesk Display", -apple-system, sans-serif` | Body text, UI labels, lists |
| `--font-family--display` | `"Orelo Semi Wide", -apple-system, sans-serif` | Hero, marquee, large headlines |

* **Line Height:** Body tight editorial `1.2`; Paragraph prose `1.5 – 1.75`.
* **Digital Deboss Class (`.deboss-text`):**  
  `text-shadow: 0 1px 0.5px rgba(232, 229, 222, 0.6), 0 -0.5px 0.5px rgba(38, 35, 32, 0.15);`  
  Gives key display headlines a subtle letterpress indent into paper.

### 5. Spacing, Grid & Generative Session Entropy

* **Grid:** 8-column CSS Grid (`repeat(8, minmax(0, 1fr))`), gap `0.5rem`.
* **Rhythm Spacers:** `--spacer-height: 3.5rem;`
* **Generative Entropy (`--tilt-*`):**  
  To prevent hardcoded static deception, section tilts dynamically seed within a bounded random range on load:
  * `--tilt-1`: `-0.28deg` (range: `-0.35deg` ~ `-0.15deg`)
  * `--tilt-2`: `0.19deg` (range: `0.10deg` ~ `0.30deg`)
  * Inner `.grid` counter-rotates by exact negative value to preserve strict text readability.

---

## Part III — Texture & Digital Kintsugi

### 6. 3-Layer Procedural Paper (`noise.svg`)

Applied via `body::before` at 384px tile, `opacity 0.48`, `mix-blend-mode: multiply`:
1. **Grain Layer:** `fractalNoise` (baseFrequency 0.85, 4 octaves) — Fine film texture.
2. **Fibers Layer:** `turbulence` (baseFrequency 0.018/0.12, 2 octaves) — Organic paper fibers.
3. **Mottle Layer:** `fractalNoise` (baseFrequency 0.006, 3 octaves) — Ink mottling.

### 7. Digital Kintsugi & Organic Dividers (`.ink-divider`)

Horizontal section dividers avoid synthetic 1px border lines:
```html
<div class="ink-divider" aria-hidden="true">
  <span class="kintsugi-glyph">◦ :: / :: ◦</span>
</div>
```

- **CSS Styling:** Background gradient `transparent → --sand → --stone → --sand → transparent`, `opacity 0.25`.
- **Kintsugi Glyph:** Center-embedded ASCII glyphs serve as "golden seams" bridging content sections.

## Part IV — Component Specs & APIs

```
+-------------------------------------------------------------------+
| Header.svelte (Transparent, absolute overlay, right-aligned)      |
+-------------------------------------------------------------------+
| Hero.svelte (Asymmetric Grid / 3D Dusk WabiScene)                 |
+-------------------------------------------------------------------+
| Marquee.svelte (Scroll-driven fluid name marquee)                 |
+-------------------------------------------------------------------+
| AboutSection.svelte (use:reveal · Intro -> InkDivider -> Clusters)|
+-------------------------------------------------------------------+
| LinksSection.svelte (use:reveal · Social link directory)          |
+-------------------------------------------------------------------+
| Footer.svelte (Edge-to-edge flush alignment)                      |
+-------------------------------------------------------------------+
| CustomCursor.svelte (Breathing ring lerp 0.12 + dot focus)        |
+-------------------------------------------------------------------+
```

### 8. Component Inventory

| Component        | Path                                     | Role & Special Rules                                         |
| ---------------- | ---------------------------------------- | ------------------------------------------------------------ |
| **Header**       | `src/lib/components/Header.svelte`       | Absolute top, transparent background. Nav links (`About`, `Project`). No solid background bar. |
| **Hero**         | `src/lib/components/Hero.svelte`         | Asymmetric 6-line text identity grid or `WabiScene` hero. Non-centered compositions only. |
| **Marquee**      | `src/lib/components/Marquee.svelte`      | Passive scroll-driven marquee via `rAF`.                     |
| **AboutSection** | `src/lib/components/AboutSection.svelte` | Intro paragraph + 3 client clusters + awards. Attached to `use:reveal`. |
| **LinksSection** | `src/lib/components/LinksSection.svelte` | Social directory with `--clay` hover state. Attached to `use:reveal`. |
| **CustomCursor** | `src/lib/components/CustomCursor.svelte` | Lerp 0.12 breathing ring (`--size: 44px`).                   |
| **Footer**       | `src/lib/components/Footer.svelte`       | Flush-left copyright, flush-right legal notice.              |

### 9. Action Specs: `use:reveal` (`reveal.js`)

- **Hidden State (`.reveal-hidden`):**

  `opacity: 0.12; transform: translateY(18px); filter: blur(3px);`

- **Visible State (`.reveal-visible`):**

  `opacity: 1; transform: translateY(0); filter: blur(0);`

- **Viscous Easing:** `transition: all 1100ms cubic-bezier(0.16, 1, 0.3, 1);`

## Part V — Motion & Engineering Red Lines

### 10. Motion Rules

- **Viscous Over-Damped Physics:** Transitions must use `cubic-bezier(0.16, 1, 0.3, 1)` to mimic ink settling into paper.
- **Banned Motion Patterns:**
  - ❌ `window.addEventListener('scroll', ...)` without `requestAnimationFrame` batching.
  - ❌ Animating layout properties (`top`, `left`, `width`, `height`). Use `transform` and `opacity` only.
  - ❌ Infinite looping/bouncing animations without explicit user interaction.
  - ❌ Reactive state stores driving continuous 60fps style updates.

### 11. Accessibility & Reduced Motion

Under `@media (prefers-reduced-motion: reduce)`:

- All `use:reveal` elements show immediately at `opacity: 1; transform: none; filter: none;`.
- Transitions collapse to `0.01ms`.
- Custom cursor reverts to standard OS pointer.

## Part VI — Do / Don't & Pre-Flight Checklist

### Do

- ✅ Use `--clay` as the single accent across all UI components.
- ✅ Separate distinct content blocks with `.ink-divider`.
- ✅ Tint all shadows to warm near-black `--ink`.
- ✅ Maintain non-centered asymmetric grid layouts (*Fukinsei*).
- ✅ Apply letterpress deboss (`.deboss-text`) to key display typography.

### Don't

- ❌ Don't add a second accent color or dark mode toggle.
- ❌ Don't use pure black (`#000000`) or pure white (`#ffffff`).
- ❌ Don't use em-dash (`—`); use clean hyphens (`-`).
- ❌ Don't use serif fonts or centered headline blocks.
- ❌ Don't exceed 1 eyebrow label per 3 content sections.
- ❌ Don't use `h-screen`; use `min-h-[100dvh]` or `--viewport-height`.

### Pre-Flight Checklist

- [ ] Zero em-dash (`—`) present in user-facing copy.
- [ ] Exactly ONE accent (`--clay`) used across all interactive states.
- [ ] All new scroll sections attached to `use:reveal`.
- [ ] Shadows explicitly tinted with `--shadow` (`rgba(38, 35, 32, ...)`).
- [ ] `prefers-reduced-motion` verified for all motion components.
- [ ] Mobile responsive layout collapses client clusters to 1 col (`<900px`).
- [ ] No layout trashing or unbatched scroll listeners in console.
