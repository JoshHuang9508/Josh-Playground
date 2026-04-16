# Design: Dynamic Blog Post Title & Tab Completion for Slugs

**Date:** 2026-04-16

---

## Problem Statement

Two UX issues in the current terminal-style personal website:

1. **Blog post HTML title** — navigating to `/blog/:slug` produces a broken title (`Whydog - Oops!`) because `TEXT_CONTENT` has no entry for dynamic hash paths.
2. **Tab completion for slugs** — typing `read <Tab>` in `/blog` or `open <Tab>` in `/projects` produces no suggestions, since autocomplete only covers command names, flags, and static paths.

---

## Feature 1: Dynamic HTML Title for Blog Posts

### Goal
When a blog post is open, the browser tab title should read `Whydog - <post title>`.

### Architecture

**`AppContextType` (in `src/lib/hooks/CommandHandler.ts`)**

Add two fields:
```ts
dynamicTitle: string | null;
setDynamicTitle: (title: string | null) => void;
```

**`_app.tsx`**

- Add `const [dynamicTitle, setDynamicTitle] = useState<string | null>(null)`.
- In the `hashchange` effect, call `setDynamicTitle(null)` on every hash change to prevent stale titles when navigating away from a blog post.
- Update `<Head>` title resolution:
  ```tsx
  <title>{t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)}</title>
  ```
- Expose `dynamicTitle` and `setDynamicTitle` via `AppContext.Provider`.

**`BlogPostView` (in `src/components/views/BlogPost/index.tsx`)**

- Access `AppContext` via `useContext`.
- After post loads, call `appContext.setDynamicTitle(post.title)`.
- On unmount (cleanup), call `appContext.setDynamicTitle(null)`.
```ts
useEffect(() => {
  if (post) appContext.setDynamicTitle(post.title);
  return () => appContext.setDynamicTitle(null);
}, [post]);
```

### Data Flow
```
post loads → BlogPostView sets dynamicTitle via context
           → _app.tsx <Head> renders "Whydog - <post title>"
hash changes → _app.tsx clears dynamicTitle to null
             → <Head> falls back to TEXT_CONTENT lookup
```

---

## Feature 2: Tab Completion for Command Arguments (Slugs)

### Goal
- In `/blog`, typing `read <Tab>` cycles through available post slugs.
- In `/projects`, typing `open <Tab>` cycles through available project slugs.

### Architecture

**`AppContextType`**

Add two fields:
```ts
availableArgs: Record<string, string[]>;
setAvailableArgs: (args: Record<string, string[]>) => void;
```

**`_app.tsx`**

- Add `const [availableArgs, setAvailableArgs] = useState<Record<string, string[]>>({})`.
- Expose both via `AppContext.Provider`.
- Reset `availableArgs` to `{}` on hash change (prevent stale completions after navigation).

**`BlogView` (in `src/components/views/Blog/index.tsx`)**

```ts
const appContext = useContext(AppContext);
useEffect(() => {
  if (posts.length > 0) {
    appContext?.setAvailableArgs({ read: posts.map(p => p.slug) });
  }
}, [posts]);
```

**`ProjectsView` (in `src/components/views/Projects/index.tsx`)**

```ts
const appContext = useContext(AppContext);
useEffect(() => {
  appContext?.setAvailableArgs({ open: PROJECTS.map(p => p.slug) });
}, []);
```

**Console `findAvailable` (in `src/components/Console/index.tsx`)**

Access `availableArgs` from `AppContext`. In the `else if (command)` branch, add:
```ts
const argCompletions = availableArgs[command.name] ?? [];
availables.push(...argCompletions.filter(a => a.startsWith(lastPart) && a !== lastPart));
```

### Data Flow
```
BlogView mounts → posts load → setAvailableArgs({ read: [...slugs] })
User types "read my-po" + Tab
  → findAvailable sees command = 'read'
  → checks availableArgs['read'] → filters by prefix "my-po"
  → suggests matching slugs
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/hooks/CommandHandler.ts` | Add `dynamicTitle`, `setDynamicTitle`, `availableArgs`, `setAvailableArgs` to `AppContextType` |
| `src/pages/_app.tsx` | Add state for both; pass via context; update `<Head>`; clear on hash change |
| `src/components/views/BlogPost/index.tsx` | Set/clear `dynamicTitle` on post load/unmount |
| `src/components/views/Blog/index.tsx` | Set `availableArgs.read` when posts load |
| `src/components/views/Projects/index.tsx` | Set `availableArgs.open` on mount |
| `src/components/Console/index.tsx` | Use `availableArgs` in `findAvailable` |

---

## Non-Goals
- SSR/SEO title generation (site is fully client-side, `ssr: false`)
- `og:title` dynamic update for blog posts
- Autocomplete for commands other than `read` and `open`
