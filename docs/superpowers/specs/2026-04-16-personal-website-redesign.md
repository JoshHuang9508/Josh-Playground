# Personal Website Redesign — Design Spec

## Overview

Redesign Josh's personal website (Josh-Playground) from a terminal-centric experience into a full-featured personal site with modern GUI pages, while keeping the terminal console as a distinctive power-user tool. The site gains three new sections: **Projects**, **osu! Stats**, and **Blog**, tied together by a redesigned **Bento-style homepage**.

### Design Principles

- **Modern GUI + terminal accents**: Pages use contemporary web design (rounded cards, gradients, smooth transitions) with terminal flavor as seasoning — `~/path` headers, monospace data labels, the existing neon color palette (#00ffaa, #ff77b7, #ffa24c, #fff700, #00f3ff)
- **Independent coexistence**: GUI is fully functional on its own; the console is an optional power-user layer. No feature is terminal-only
- **Personality over polish**: This is a personal site, not a SaaS product. Favor character, playfulness, and creative details over conventional corporate UI patterns

---

## 1. Route Structure

| Route | Page | Description |
|---|---|---|
| `#/` | Home | Bento landing — identity + preview cards |
| `#/projects` | Projects | Full GitHub project grid |
| `#/osu` | osu! Stats | Profile dashboard with live API data |
| `#/blog` | Blog (list) | Timeline-style post listing |
| `#/blog/:slug` | Blog (article) | Single post, rendered from Markdown |
| `#/listentogether` | Listen Together | Existing — no changes |
| `#/ytdownloader` | YT Downloader | Existing — no changes |

**PATH_LIST update**: Root gains `projects/`, `osu/`, `blog/`. Blog gains sub-paths dynamically from post slugs.

**COMMAND_LIST updates per page**: Each new page registers its own commands via `useCommandHandler`.

---

## 2. Homepage — Two-Column Bento (`#/`)

### Layout

Two asymmetric columns with card-based content blocks:

```
┌─────────────────────────────────────────────┐
│  LEFT COLUMN            │  RIGHT COLUMN      │
│                         │                    │
│  ┌───────────────────┐  │  ┌──────────────┐  │
│  │   HERO CARD       │  │  │  PROJECTS    │  │
│  │   Avatar          │  │  │  Card 1      │  │
│  │   Whitedog        │  │  │  Card 2      │  │
│  │   @NTUST-CSIE     │  │  │  Card 3      │  │
│  │   Bio text        │  │  │  View All →  │  │
│  │   Social icons    │  │  └──────────────┘  │
│  └───────────────────┘  │                    │
│                         │  ┌──────────────┐  │
│  ┌───────────────────┐  │  │  OSU! STATS  │  │
│  │   LATEST POST     │  │  │  #12,345     │  │
│  │   Title           │  │  │  Global Rank │  │
│  │   Excerpt...      │  │  │  4,567pp     │  │
│  │   Read →          │  │  │  Details →   │  │
│  └───────────────────┘  │  └──────────────┘  │
└─────────────────────────────────────────────┘
```

### Hero Card

- Profile picture with subtle glow/shadow (keep existing spin animation when music is playing)
- Name "Whitedog" in bold, school "NTUST-CSIE" as a colored badge
- Bio lines (reuse existing `TEXT_CONTENT["/"].about`)
- Social icons row: clickable icon buttons for GitHub, YouTube, Twitter, Instagram, Twitch, Discord, osu! — replaces the current rotating single-social display with a persistent row. Each icon has a tooltip on hover and a subtle color tint matching the platform brand
- Typing effect on first load: the bio text types itself out character by character, like terminal output, then stays static. A small creative nod to the terminal heritage

### Projects Preview Card

- Section label: `PROJECTS` in #00ffaa monospace
- Shows 3 pinned/top repos as mini cards (repo name + language dot only, compact)
- "View All →" link navigates to `#/projects`
- Hover on a mini card shows the description in a tooltip or expands slightly

### osu! Stats Preview Card

- Section label: `OSU! STATS` in #ff77b7 monospace
- Shows: Global Rank (large number), PP, Accuracy as a compact stat row
- Small rank change indicator: ▲ 123 (green) or ▼ 45 (red) if API provides historical data
- "Details →" link navigates to `#/osu`

### Latest Post Preview Card

- Section label: `LATEST POST` in #ffa24c monospace
- Shows: title, first ~100 chars of excerpt, date
- "Read →" link navigates to `#/blog/:slug`
- If no posts exist yet, show a placeholder: "Coming soon... stay tuned" with a blinking cursor

### Creative Details

- **Card hover effect**: cards lift slightly (translateY -2px) with increased box-shadow, border gets a subtle glow matching the section accent color
- **Staggered entrance animation**: cards fade-in sequentially on page load (left column first, right column 200ms later), giving a "loading" feel
- **Background particles or grid**: subtle animated dot grid or floating particles behind the bento layout, very low opacity (~0.05), adds depth without distraction
- **"Last updated" footer**: a small monospace line at the bottom: `last deploy: 2026-04-16 • built with next.js + too much coffee`

### Terminal Commands (Home)

All existing commands preserved: `github`, `youtube`, `twitter`, `instagram`, `twitch`, `discord`, `email`, `osu`, `music`. No new ones needed.

---

## 3. Projects Page (`#/projects`)

### Layout — Color-Accent Grid

```
┌──────────────────────────────────────────┐
│  ~/projects                              │
│  My open-source work and side projects   │
│                                          │
│  ┌─ ────────────┐  ┌─ ────────────┐     │
│  │▌ Repo Name   │  │▌ Repo Name   │     │
│  │  Description │  │  Description │     │
│  │  ● Lang  ★ N │  │  ● Lang  ★ N │     │
│  └──────────────┘  └──────────────┘     │
│  ┌─ ────────────┐  ┌─ ────────────┐     │
│  │▌ Repo Name   │  │▌ Repo Name   │     │
│  │  Description │  │  Description │     │
│  │  ● Lang  ★ N │  │  ● Lang  ★ N │     │
│  └──────────────┘  └──────────────┘     │
│                    ...                   │
└──────────────────────────────────────────┘
```

### Card Design

- Dark card background (#16213e)
- Left border: 3px solid, color cycles through accent palette per card (#00ffaa → #ff77b7 → #ffa24c → #00f3ff → #fff700, repeating)
- Content: repo name (white, bold), description (gray), language with GitHub-style color dot, star count
- Click: opens GitHub repo in new tab
- Hover: card lifts, left border widens to 5px, faint glow

### Page Header

- Title in terminal style: `~/projects` in accent color
- Subtitle: brief description in gray

### Data Source

- Reuse existing `useGitHubRepos("JoshHuang9508")` hook
- Consider adding a pinned repos concept: a hardcoded array of repo names to show first/highlighted, with the rest following

### Terminal Commands (Projects)

- `open <repo-name>`: opens the matching repo in a new tab (fuzzy match on repo name)
- `list`: alias for displaying all repos in the console

---

## 4. osu! Stats Page (`#/osu`)

### Layout — Profile Dashboard

```
┌──────────────────────────────────────────┐
│  ~/osu                                   │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  [Avatar]  -Whitedog-            │    │
│  │            Taiwan • Joined 2020  │    │
│  │   #12,345    #456      4,567pp   │    │
│  │   Global     Country   PP        │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  98.5%   │ │  1,234   │ │   200h   │ │
│  │ Accuracy │ │  Plays   │ │   Time   │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │  Grade Distribution              │    │
│  │  ██████████████████████████████  │    │
│  │  SS:30  S:50  A:80  B:20        │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### Profile Banner

- osu! avatar image (from API), username, country flag emoji or icon, join date
- Three big numbers side by side: Global Rank, Country Rank, PP
- Gradient background on banner card (subtle, matching osu! pink theme)

### Stats Grid

- Three equal cards: Accuracy (with a circular or linear progress indicator), Play Count, Play Time (formatted as hours)
- Numbers animate counting up on page load (countUp effect)

### Grade Distribution

- Horizontal stacked bar: SS (#fff700), S (#ffa24c), A (#00ffaa), B (#00f3ff)
- Labels below with counts
- Consider adding a tooltip on hover showing exact percentages

### Creative Details

- **Rank trend sparkline**: if osu! API provides historical rank data, show a tiny sparkline graph next to the global rank showing recent trend
- **"Now playing" indicator**: if the user has a recent play, show the beatmap name with a small animated equalizer icon
- **Level progress bar**: show the current level and XP progress as a thin bar under the profile banner

### Data Source

- osu! API v2: `GET /users/{user_id}` for profile data
- Authentication: osu! API requires OAuth2 client credentials. Either:
  - (A) Proxy through your existing API server at `API_URL` — add an endpoint that caches and serves osu! stats
  - (B) Use client credentials grant on the frontend (less ideal, exposes client secret)
  - **Recommendation: (A)** — add a `/api/osu/:userId` endpoint to your backend that fetches, caches (5-min TTL), and returns the data
- Fallback: if API is unavailable, show last cached data or a "Stats temporarily unavailable" message

### Terminal Commands (osu!)

- `stats`: display a text summary of rank/pp/accuracy in the console
- `recent`: show most recent play in the console (if API supports it)

---

## 5. Blog System

### File Structure

```
/posts/
  2026-04-10-terminal-ui.md
  2026-03-22-first-semester.md
  2026-03-05-osu-journey.md
```

### Frontmatter Schema

```yaml
---
title: "Building a Terminal UI for My Website"
date: "2026-04-10"
tags: ["dev"]
excerpt: "How I built a draggable, resizable console component..."
color: "#ffa24c"       # optional, accent color for timeline dot. Defaults based on first tag
---

Markdown body here...
```

### Tag-to-Color Mapping

| Tag | Color | Meaning |
|---|---|---|
| `dev` | #00ffaa | Development / tech |
| `life` | #ff77b7 | Personal / reflections |
| `gaming` | #00f3ff | Games / osu! |
| `design` | #ffa24c | Design / UI/UX |

### Blog List Page (`#/blog`) — Timeline

```
┌──────────────────────────────────────────┐
│  ~/blog                                  │
│                                          │
│  2026-04-10                              │
│  ●──┌────────────────────────────────┐   │
│  │  │  Building a Terminal UI...     │   │
│  │  │  How I built a draggable...    │   │
│  │  │  [Dev] • 3 min read            │   │
│  │  └────────────────────────────────┘   │
│  │                                       │
│  │  2026-03-22                           │
│  ●──┌────────────────────────────────┐   │
│  │  │  My First Semester at NTUST    │   │
│  │  │  Reflections on studying CS... │   │
│  │  │  [Life] • 5 min read           │   │
│  │  └────────────────────────────────┘   │
│  │                                       │
│  ...                                     │
└──────────────────────────────────────────┘
```

- Vertical timeline line (thin, #333)
- Each post: colored dot (by tag), date label, card with title/excerpt/tag badge/read time
- Click card → navigate to `#/blog/:slug`
- Timeline dots pulse briefly on page load (staggered animation top to bottom)
- Posts sorted newest first
- Read time calculated from word count (~200 words/min for Chinese, ~250 for English)

### Blog Article Page (`#/blog/:slug`)

- Header: title (large), date, tag badges, estimated read time
- Body: rendered Markdown with good typography — max-width ~700px for readability, comfortable line-height (1.7), styled code blocks with syntax highlighting (use `highlight.js` or `prism.js` with a dark theme matching the site)
- Bottom navigation: "← Previous Post" / "Next Post →" links
- Back link: "← Back to ~/blog"

### Creative Details for Blog

- **Reading progress bar**: a thin accent-colored bar at the very top of the page that fills as the user scrolls through the article
- **"Terminal echo" on navigation**: when you click a blog post from the timeline, if the console is open, it briefly shows `> cd blog/terminal-ui` as if you navigated via terminal — a subtle nod to the terminal heritage, but purely cosmetic
- **Code blocks**: use the site's monospace font (Consolas), dark background matching console aesthetic, with a small "copy" button on hover

### Markdown Parsing

- `gray-matter`: parse frontmatter from .md files
- `react-markdown` with `remark-gfm` (GitHub Flavored Markdown) for rendering
- `rehype-highlight` or `rehype-prism` for syntax highlighting
- Post index: generate at build time or maintain a `posts/index.json` manifest that lists all posts with their metadata. Build-time generation with a simple script is preferred to avoid manually maintaining the index.

### Terminal Commands (Blog)

- `ls`: list all posts (title + date)
- `read <slug>`: navigate to the article (equivalent to clicking)

---

## 6. Shared Navigation (GUI)

Since pages now have full GUI, add a minimal navigation bar or breadcrumb so users can move between sections without the terminal:

- **Style**: not a traditional navbar. Instead, a floating pill/breadcrumb at the top-left of the content area showing the current path (e.g., `~ / projects`) with each segment clickable
- **Home icon**: clicking `~` always goes home
- **Subtle**: semi-transparent background, appears on scroll or always visible but unobtrusive
- **Mobile consideration**: on narrow viewports (< 1200px), this becomes the primary navigation since the console is hidden

---

## 7. Visual System

### Color Palette

| Usage | Color | Hex |
|---|---|---|
| Primary accent (green) | Terminal green | #00ffaa |
| Secondary accent (pink) | Signature pink | #ff77b7 |
| Tertiary accent (orange) | Warm orange | #ffa24c |
| Highlight (yellow) | Command yellow | #fff700 |
| Info (cyan) | Cool cyan | #00f3ff |
| Card background | Dark navy | #16213e |
| Page background | Deep dark | #1a1a2e |
| Deeper elements | Darker navy | #0f3460 |
| Text primary | White | #ffffff |
| Text secondary | Gray | #888888 |
| Text muted | Dim gray | #bababa |

### Typography

- **Body / UI**: `Consolas, "Noto Sans TC", sans-serif` (existing)
- **Headers on content pages**: same family but larger weight — keep the monospace character
- **Blog body text**: consider allowing a proportional font for long-form reading (`"Noto Sans TC", sans-serif`) with monospace reserved for code and data

### Shared Card Styles

All cards across the site share:
- Background: #16213e
- Border-radius: 8px
- Padding: 12-16px
- Hover: translateY(-2px), box-shadow increase, optional accent glow
- Transition: all 0.2s ease

### Animations

- **Page enter**: content fades in (0 → 1 opacity) over 0.5s with slight translateY (10px → 0), staggered per card
- **Number countUp**: stats numbers on osu! page count from 0 to target value over 1s
- **Timeline dots**: pulse animation (scale 1 → 1.3 → 1) staggered on blog page load
- **Typing effect**: hero bio on homepage types out on first visit

---

## 8. Technical Implementation Notes

### New Dependencies

| Package | Purpose |
|---|---|
| `gray-matter` | Parse markdown frontmatter |
| `react-markdown` | Render markdown to React |
| `remark-gfm` | GitHub Flavored Markdown support |
| `rehype-highlight` | Syntax highlighting for code blocks |

### New Files (estimated)

```
src/components/views/Projects/index.tsx
src/components/views/Projects/Projects.module.css
src/components/views/OsuStats/index.tsx
src/components/views/OsuStats/OsuStats.module.css
src/components/views/Blog/index.tsx
src/components/views/Blog/Blog.module.css
src/components/views/BlogPost/index.tsx
src/components/views/BlogPost/BlogPost.module.css
src/components/Navigation/index.tsx
src/components/Navigation/Navigation.module.css
src/lib/hooks/OsuStats.ts
src/lib/hooks/BlogPosts.ts
posts/                              (markdown files directory)
```

### Data Flow

- **GitHub repos**: existing `useGitHubRepos` hook → used by Home preview + Projects page
- **osu! stats**: new `useOsuStats` hook → fetches from `/api/osu/:userId` (or direct API) → used by Home preview + osu! page
- **Blog posts**: new `useBlogPosts` hook → fetches post index + individual posts → used by Home preview + Blog pages. Posts loaded from `/posts/` directory, index generated at build time or from a static manifest.

### Console Integration

- Each new view registers commands via `useCommandHandler` (existing pattern)
- `COMMAND_LIST` in constants.ts updated with new page commands
- `PATH_LIST` updated: root adds `projects/`, `osu/`, `blog/`; blog adds dynamic slugs

---

## 9. Scope & Priorities

**Phase 1** (core): Homepage redesign + Projects page + route updates + navigation
**Phase 2**: Blog system (markdown parsing, timeline list, article page)
**Phase 3**: osu! Stats (API integration, dashboard)

This ordering prioritizes what can be built and tested independently. The homepage can link to projects immediately, blog and osu! preview cards can show placeholders ("Coming soon") until their respective phases are complete.
