# Dynamic Blog Post Title & Tab Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix blog post HTML title (shows "Oops!" instead of post title) and add tab-completion for `read <slug>` in `/blog` and `open <slug>` in `/projects`.

**Architecture:** Extend `AppContextType` with `dynamicTitle`/`setDynamicTitle` and `availableArgs`/`setAvailableArgs`. Views push dynamic data into context; `_app.tsx` consumes `dynamicTitle` in `<Head>`; Console consumes `availableArgs` in `findAvailable`.

**Tech Stack:** Next.js (client-side only, `ssr: false`), React Context, TypeScript

> **Note:** This project has no test framework configured. Verification is done by running `yarn dev` and manually confirming behaviour in the browser.

---

## File Map

| File | Change |
|------|--------|
| `src/lib/hooks/CommandHandler.ts` | Add 4 fields to `AppContextType` |
| `src/pages/_app.tsx` | Add state, clear on hash change, update `<Head>`, expose via context |
| `src/components/views/BlogPost/index.tsx` | Set/clear `dynamicTitle` when post loads/unmounts |
| `src/components/views/Blog/index.tsx` | Set `availableArgs.read` when posts load |
| `src/components/views/Projects/index.tsx` | Set `availableArgs.open` on mount |
| `src/components/Console/index.tsx` | Use `availableArgs` in `findAvailable` |

---

## Task 1: Extend AppContextType

**Files:**
- Modify: `src/lib/hooks/CommandHandler.ts`

- [ ] **Step 1: Add the four new fields to `AppContextType`**

In `src/lib/hooks/CommandHandler.ts`, find the `AppContextType` definition (line ~18) and add the four new fields:

```ts
export type AppContextType = {
  availableCommands: Types.Command[];
  availablePaths: string[];
  setAvailableCommands: (cmds: Types.Command[]) => void;
  setAvailablePaths: (paths: string[]) => void;
  backgroundImageUrl: string;
  backgroundColor: string;
  setBackgroundImageUrl: (url: string) => void;
  setBackgroundColor: (color: string) => void;
  username: string;
  setUsername: (name: string) => void;
  currentHash: string;
  dynamicTitle: string | null;
  setDynamicTitle: (title: string | null) => void;
  availableArgs: Record<string, string[]>;
  setAvailableArgs: (args: Record<string, string[]>) => void;
};
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no new errors related to `AppContextType`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/hooks/CommandHandler.ts
git commit -m "feat: extend AppContextType with dynamicTitle and availableArgs"
```

---

## Task 2: Wire state and context in _app.tsx

**Files:**
- Modify: `src/pages/_app.tsx`

- [ ] **Step 1: Add state declarations**

In `src/pages/_app.tsx`, after the existing `useState` declarations (around line 38), add:

```ts
const [dynamicTitle, setDynamicTitle] = useState<string | null>(null);
const [availableArgs, setAvailableArgs] = useState<Record<string, string[]>>({});
```

- [ ] **Step 2: Clear dynamic state on hash change**

Find the `updateHash` function inside the hash `useEffect` (around line 47). Update it to also clear dynamic state on every navigation:

```ts
const updateHash = () => {
  const hash = window.location.hash.slice(1) || '/';
  setCurrentHash(hash);
  setDynamicTitle(null);
  setAvailableArgs({});
};
```

- [ ] **Step 3: Update `<Head>` to use dynamicTitle**

Find the `<title>` tag in `<Head>` (around line 127). Replace it:

```tsx
<title>{t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)}</title>
```

Also update `og:title` to match:

```tsx
<meta property="og:title" content={t('global.siteTitle', dynamicTitle ?? TEXT_CONTENT[currentHash]?.title ?? TEXT_CONTENT['*'].title)} />
```

- [ ] **Step 4: Expose new state via AppContext.Provider**

Find the `AppContext.Provider value={{...}}` block (around line 140). Add the four new fields:

```tsx
<AppContext.Provider
  value={{
    availableCommands,
    availablePaths,
    setAvailableCommands,
    setAvailablePaths,
    backgroundImageUrl,
    backgroundColor,
    setBackgroundImageUrl,
    setBackgroundColor,
    username,
    setUsername,
    currentHash,
    dynamicTitle,
    setDynamicTitle,
    availableArgs,
    setAvailableArgs,
  }}
>
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/_app.tsx
git commit -m "feat: wire dynamicTitle and availableArgs state in _app.tsx"
```

---

## Task 3: Set dynamic title in BlogPostView

**Files:**
- Modify: `src/components/views/BlogPost/index.tsx`

- [ ] **Step 1: Import useContext and AppContext**

At the top of `src/components/views/BlogPost/index.tsx`, add `useContext` to the React import and add the AppContext import:

```tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
```

```tsx
import { AppContext } from '@/lib/hooks/CommandHandler';
```

- [ ] **Step 2: Access context and add title effect**

Inside `BlogPostView`, after the existing hooks, add:

```tsx
const appContext = useContext(AppContext);

useEffect(() => {
  if (post) appContext?.setDynamicTitle(post.title);
  return () => {
    appContext?.setDynamicTitle(null);
  };
}, [post]);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual verification**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && yarn dev
```

1. Open `http://localhost:3000` in browser.
2. Navigate to a blog post (via `#/blog/<slug>`).
3. Confirm browser tab title reads `Whydog - <post title>`.
4. Navigate back to `#/blog` — confirm title reverts to `Whydog - Blog`.
5. Navigate to `#/` — confirm title reverts to `Whydog - Personal site`.

- [ ] **Step 5: Commit**

```bash
git add src/components/views/BlogPost/index.tsx
git commit -m "feat: set dynamic HTML title when blog post loads"
```

---

## Task 4: Add tab completion for blog slugs

**Files:**
- Modify: `src/components/views/Blog/index.tsx`

- [ ] **Step 1: Import useContext and AppContext**

At the top of `src/components/views/Blog/index.tsx`, add `useContext` to the React import and add AppContext:

```tsx
import React, { useContext, useEffect } from 'react';
```

```tsx
import { AppContext } from '@/lib/hooks/CommandHandler';
```

- [ ] **Step 2: Set availableArgs when posts load**

Inside `BlogView`, after the existing hooks, add:

```tsx
const appContext = useContext(AppContext);

useEffect(() => {
  if (posts.length > 0) {
    appContext?.setAvailableArgs({ read: posts.map((p) => p.slug) });
  }
}, [posts]);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/views/Blog/index.tsx
git commit -m "feat: expose blog slugs as availableArgs for tab completion"
```

---

## Task 5: Add tab completion for project slugs

**Files:**
- Modify: `src/components/views/Projects/index.tsx`

- [ ] **Step 1: Import useContext, useEffect, AppContext**

At the top of `src/components/views/Projects/index.tsx`, add `useContext` and `useEffect` to the React import and add AppContext:

```tsx
import React, { useContext, useEffect, useState } from 'react';
```

```tsx
import { AppContext } from '@/lib/hooks/CommandHandler';
```

- [ ] **Step 2: Set availableArgs on mount**

Inside `ProjectsView`, before the `return`, add:

```tsx
const appContext = useContext(AppContext);

useEffect(() => {
  appContext?.setAvailableArgs({ open: PROJECTS.map((p) => p.slug) });
}, []);
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/views/Projects/index.tsx
git commit -m "feat: expose project slugs as availableArgs for tab completion"
```

---

## Task 6: Wire availableArgs into Console findAvailable

**Files:**
- Modify: `src/components/Console/index.tsx`

- [ ] **Step 1: Destructure availableArgs from AppContext**

In `src/components/Console/index.tsx`, find the line that destructures from `useContext(AppContext)!` (around line 28):

```tsx
const { availableCommands, setAvailableCommands, setAvailablePaths, username, setUsername, currentHash } = useContext(AppContext)!;
```

Add `availableArgs` to the destructure:

```tsx
const { availableCommands, availableArgs, setAvailableCommands, setAvailablePaths, username, setUsername, currentHash } = useContext(AppContext)!;
```

- [ ] **Step 2: Update findAvailable to use availableArgs**

Find the `findAvailable` function (around line 103). In the `else if (command)` branch, add arg completions after the options check:

```ts
const findAvailable = (input: string, commands: Types.Command[]): string[] => {
  const parts = input.split(' ');
  const lastPart = parts[parts.length - 1];
  const command = parts.length <= 1 ? '' : commands.find((cmd) => cmd.name === parts[0]);
  let availables: string[] = [];

  if (input == '' || input == ' ') {
    return availables;
  }
  if (!command && !input.endsWith(' ') && commands.filter((_) => _.name.startsWith(parts[0])).length != 0) {
    availables.push(...commands.filter((cmd) => cmd.name.startsWith(lastPart) && cmd.name != lastPart).map((cmd) => cmd.name));
  } else if (command) {
    if (command.options) {
      availables.push(...command.options.filter((opt) => opt.startsWith(lastPart) && opt != lastPart));
    }
    const argCompletions = availableArgs[command.name] ?? [];
    availables.push(...argCompletions.filter((a) => a.startsWith(lastPart) && a !== lastPart));
  }
  availables.push(...findAvailablePath(lastPart));

  return availables;
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual verification**

```bash
cd /Users/huangchenhao/Documents/Josh-Playground && yarn dev
```

**Blog tab completion:**
1. Navigate to `#/blog`.
2. Open the console.
3. Type `read ` (with a space) then press Tab.
4. Confirm available blog slugs appear as suggestions (yellow hint above input).
5. Press Tab again to cycle through slugs.
6. Press Enter — confirm navigation to the blog post.

**Projects tab completion:**
1. Navigate to `#/projects`.
2. Open the console.
3. Type `open ` (with a space) then press Tab.
4. Confirm project slugs (`ricecall`, `depth-of-origin`, `josh-playground`) appear as suggestions.
5. Press Tab to select one and Enter — confirm GitHub opens.

- [ ] **Step 5: Commit**

```bash
git add src/components/Console/index.tsx
git commit -m "feat: use availableArgs for command argument tab completion in console"
```
