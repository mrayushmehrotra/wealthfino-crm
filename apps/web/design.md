# WealthFino CRM — Design System

> **⚠️ MANDATORY FOR ALL AI AGENTS:**
> This file defines the **single source of truth** for the entire WealthFino CRM visual design.
> Every component, page, and layout **MUST** use only the colors, typography, spacing, and patterns defined here.
> Do NOT invent new colors or deviate from this system under any circumstance.

---

## 1. Color Palette

The design is derived from the reference UI screenshot (`WhatsApp Image 2026-06-26 at 10.27.10 PM.jpeg`) in this directory.

### Primary Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-sidebar-bg` | `#0D1B2A` | `hsl(210, 50%, 11%)` | Sidebar / nav background (deep navy) |
| `--color-sidebar-active` | `#1A7A4A` | `hsl(150, 64%, 29%)` | Active nav item background (rich green) |
| `--color-sidebar-text` | `#B8C4CC` | `hsl(205, 18%, 76%)` | Inactive nav item text (muted slate) |
| `--color-sidebar-text-active` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Active nav item text (white) |
| `--color-sidebar-icon` | `#8A9BA8` | `hsl(205, 16%, 60%)` | Sidebar icon tint (cool grey) |
| `--color-brand-green` | `#22C55E` | `hsl(142, 71%, 45%)` | Brand green — links, CTAs, "View All" (emerald) |

### Background Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-bg-page` | `#F5F7FA` | `hsl(220, 20%, 97%)` | Main page / canvas background (off-white) |
| `--color-bg-card` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Cards, panels, stat boxes (pure white) |
| `--color-bg-input` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Search bar / input background |
| `--color-bg-topbar` | `#FFFFFF` | `hsl(0, 0%, 100%)` | Top navigation bar background |

### Text Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-text-primary` | `#1A202C` | `hsl(222, 27%, 14%)` | Headings, stat numbers, bold labels |
| `--color-text-secondary` | `#6B7280` | `hsl(220, 9%, 46%)` | Subheadings, descriptive text, card labels |
| `--color-text-muted` | `#9CA3AF` | `hsl(218, 11%, 65%)` | Placeholder text, timestamps |
| `--color-text-link` | `#22C55E` | `hsl(142, 71%, 45%)` | "View All" links, interactive text links |

### Border & Divider Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-border` | `#E5E7EB` | `hsl(220, 13%, 91%)` | Card borders, input borders, dividers |
| `--color-border-light` | `#F3F4F6` | `hsl(220, 14%, 96%)` | Subtle inner separators |

### Accent / Status Colors

| Token | Hex | HSL | Usage |
|---|---|---|---|
| `--color-accent-green` | `#22C55E` | `hsl(142, 71%, 45%)` | Present/active status, positive delta (`+2 this month`) |
| `--color-accent-green-bg` | `#DCFCE7` | `hsl(142, 76%, 92%)` | Green badge/pill background |
| `--color-accent-red` | `#EF4444` | `hsl(0, 84%, 60%)` | Absent/error status badge (`8.3%`) |
| `--color-accent-red-bg` | `#FEE2E2` | `hsl(0, 86%, 93%)` | Red badge/pill background |
| `--color-accent-orange` | `#F59E0B` | `hsl(38, 92%, 50%)` | On-leave / warning status (`16.6%`) |
| `--color-accent-orange-bg` | `#FEF3C7` | `hsl(43, 96%, 90%)` | Orange badge/pill background |
| `--color-accent-blue` | `#3B82F6` | `hsl(217, 91%, 60%)` | Blue action icons (Apply Leave, Calendar) |
| `--color-accent-blue-bg` | `#EFF6FF` | `hsl(214, 100%, 97%)` | Blue icon pill background |
| `--color-accent-purple` | `#8B5CF6` | `hsl(262, 83%, 58%)` | Purple action icons (Tasks) |
| `--color-accent-purple-bg` | `#F5F3FF` | `hsl(248, 100%, 96%)` | Purple icon pill background |

---

## 2. Typography

> **Rule:** Always use the Inter font family. Load it from Google Fonts.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

| Scale | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | `11px` | 500 | `16px` | Badge text, mini labels |
| `--text-sm` | `13px` | 400/500 | `20px` | Sidebar nav items, table data |
| `--text-base` | `14px` | 400 | `22px` | Body text, card labels |
| `--text-md` | `16px` | 600 | `24px` | Card section headers ("Quick Actions") |
| `--text-lg` | `18px` | 600 | `28px` | Widget titles ("Today's Tasks") |
| `--text-xl` | `22px` | 700 | `32px` | Page greetings |
| `--text-2xl` | `28px` | 800 | `36px` | Large stat numbers (`12`, `92%`) |

---

## 3. Spacing & Sizing

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Micro gaps (icon to text) |
| `--space-2` | `8px` | Compact padding (badge, tag) |
| `--space-3` | `12px` | Inner card padding |
| `--space-4` | `16px` | Default element spacing |
| `--space-5` | `20px` | Section gaps inside cards |
| `--space-6` | `24px` | Card padding, nav item padding |
| `--space-8` | `32px` | Between cards, section breaks |
| `--sidebar-width` | `248px` | Left sidebar fixed width |
| `--topbar-height` | `64px` | Top navigation bar height |

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Badges, tags, small buttons |
| `--radius-md` | `10px` | Cards, panels, stat boxes |
| `--radius-lg` | `14px` | Quick action tiles |
| `--radius-full` | `9999px` | Pill badges, avatar rings |

---

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card elevation |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.10)` | Card on hover |
| `--shadow-topbar` | `0 1px 0px rgba(0,0,0,0.06)` | Top bar bottom border shadow |

---

## 6. Component Patterns

### Sidebar
- Background: `--color-sidebar-bg` (`#0D1B2A`)
- Width: `248px`, full height, fixed position
- Logo area: white text/icon on dark bg, top-left
- Nav items: `14px` Inter 500, `--color-sidebar-text`
- Active nav item: `--color-sidebar-active` green background, rounded `--radius-md`, white text
- Bottom user row: avatar + name/role text, same dark bg

### Top Bar
- Background: `--color-bg-topbar` (white)
- Contains: search input (left), notification bell, chat icon, user avatar + name (right)
- Search input: rounded pill shape, `--color-border` border, placeholder `--color-text-muted`
- Bottom separator: `--shadow-topbar`

### Stat Cards
- Background: `--color-bg-card` (white)
- Border: `1px solid --color-border`
- Border-radius: `--radius-md`
- Shadow: `--shadow-card`
- Structure: icon (top-left) + badge (top-right) + label (uppercase, `--color-text-secondary`) + large number (`--color-text-primary`)
- Badge colors follow Accent color system above

### Quick Action Tiles
- Background: `--color-bg-card` (white)
- Border: `1px solid --color-border`
- Border-radius: `--radius-lg`
- Center-aligned icon (colored circle bg) + label below
- Icon backgrounds use respective accent bg tokens

### "View All" / Link Text
- Color: `--color-brand-green`
- Font weight: 600
- No underline by default; underline on hover

---

## 7. CSS Custom Properties — Full Reference

Copy this block into your global CSS file (e.g., `globals.css` or `styles/tokens.css`):

```css
:root {
  /* Sidebar */
  --color-sidebar-bg: #0D1B2A;
  --color-sidebar-active: #1A7A4A;
  --color-sidebar-text: #B8C4CC;
  --color-sidebar-text-active: #FFFFFF;
  --color-sidebar-icon: #8A9BA8;

  /* Brand */
  --color-brand-green: #22C55E;

  /* Backgrounds */
  --color-bg-page: #F5F7FA;
  --color-bg-card: #FFFFFF;
  --color-bg-input: #FFFFFF;
  --color-bg-topbar: #FFFFFF;

  /* Text */
  --color-text-primary: #1A202C;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;
  --color-text-link: #22C55E;

  /* Borders */
  --color-border: #E5E7EB;
  --color-border-light: #F3F4F6;

  /* Accents */
  --color-accent-green: #22C55E;
  --color-accent-green-bg: #DCFCE7;
  --color-accent-red: #EF4444;
  --color-accent-red-bg: #FEE2E2;
  --color-accent-orange: #F59E0B;
  --color-accent-orange-bg: #FEF3C7;
  --color-accent-blue: #3B82F6;
  --color-accent-blue-bg: #EFF6FF;
  --color-accent-purple: #8B5CF6;
  --color-accent-purple-bg: #F5F3FF;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 14px;
  --text-md: 16px;
  --text-lg: 18px;
  --text-xl: 22px;
  --text-2xl: 28px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --sidebar-width: 248px;
  --topbar-height: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.10);
  --shadow-topbar: 0 1px 0px rgba(0,0,0,0.06);
}
```

---

## 8. Tailwind Config Mapping (if using Tailwind)

If the project uses Tailwind CSS, extend `tailwind.config.ts` with:

```ts
theme: {
  extend: {
    colors: {
      sidebar: {
        DEFAULT: '#0D1B2A',
        active: '#1A7A4A',
        text: '#B8C4CC',
      },
      brand: {
        green: '#22C55E',
      },
      accent: {
        green: '#22C55E',
        'green-bg': '#DCFCE7',
        red: '#EF4444',
        'red-bg': '#FEE2E2',
        orange: '#F59E0B',
        'orange-bg': '#FEF3C7',
        blue: '#3B82F6',
        'blue-bg': '#EFF6FF',
        purple: '#8B5CF6',
        'purple-bg': '#F5F3FF',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## 9. Reference Screenshot

The original design reference is located at:
`apps/web/WhatsApp Image 2026-06-26 at 10.27.10 PM.jpeg`

All color decisions in this document were sampled directly from that screenshot.

---

> **For AI agents:** When building any new page, component, or feature in this project — start here. Every color you use **must** come from the tokens above. No hardcoded color values outside this system. No ad-hoc grays, blues, or greens not listed here.
