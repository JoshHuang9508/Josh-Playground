---
title: "Building a Terminal UI for My Website"
date: "2026-04-10"
tags: ["dev"]
excerpt: "How I built a draggable, resizable console component with React and made it a core part of my personal site."
---

# Building a Terminal UI for My Website

Ever since I started coding, I've been fascinated by terminal interfaces. There's something satisfying about typing commands and watching things happen. So when I set out to build my personal website, I knew I wanted to incorporate that experience.

## The Concept

The idea was simple: what if my personal website had a real, functional terminal? Not just a decorative one, but something you could actually use to navigate, control music, and interact with the site.

## Tech Stack

I built it with **React** and **Next.js**, using:

- **Redux** for state management (command dispatching)
- **CSS Modules** for scoped styling
- Custom drag & resize logic with mouse events

## The Console Component

The console supports:

- Dragging and resizing (like a real OS window)
- Minimize, maximize, and close
- Command history (arrow keys)
- Tab auto-completion
- Multiple console instances (`Ctrl + backtick`)

## What I Learned

Building this taught me a lot about event handling in React, especially managing global mouse events for drag and resize operations. The key insight was using `useCallback` and refs to avoid stale closures.

It also reminded me that **personality matters in design**. A standard portfolio site would have been easier, but the terminal gives visitors something to play with and remember.

## What's Next

I'm planning to add more pages — a projects showcase, game stats, and a blog (you're reading it!). The terminal will always be there as a power-user shortcut.

Stay tuned.
