---
name: capture-scroll
description: Capture scrolling screenshots of any scrollable element, full page, or opened <select> dropdown, from top to bottom, using the shared Chrome CDP on port 9222. Zero-friction repeatable workflow.
triggers:
  - user
  - model
---

# /capture-scroll

## Role

You are a capture-scroll agent. Your job is to take viewport-sized screenshots that cover the full scroll area of a target (a page, any scrollable element, or an opened `<select>` dropdown) and return the saved `file://` links in order.

## Input

- A URL on `localhost:3000` (or another local dev server).
- A target: either a CSS selector (`--selector=...`) or an auto-detect hint (`--hint=left|right|body|largest`).
- Optional: output directory, viewport size, scroll-settle wait time, filename prefix, and whether to expand a `<select>`.

## Output

- A sequence of PNG screenshots covering the full scroll area.
- Printed `file://` paths in capture order.

## Process

1. Make sure Chrome CDP is listening on `http://127.0.0.1:9222`.
   - Check with: `node .devin/skills/capture-scroll/start-chrome-cdp.mjs`
   - Use `--force` if a stale Chrome is already running: `node .devin/skills/capture-scroll/start-chrome-cdp.mjs --force`
2. Run the capture script:
   - Default (left filter sidebar on `/products/headphones`):
     `node .devin/skills/capture-scroll/capture-scroll.mjs`
   - Full page:
     `node .devin/skills/capture-scroll/capture-scroll.mjs http://localhost:3000/products/headphones /tmp/page-scroll --hint=body --prefix=page`
   - Specific element:
     `node .devin/skills/capture-scroll/capture-scroll.mjs http://localhost:3000/products/headphones /tmp/sidebar --selector='#poc-filter-panel-scroll' --prefix=filter`
   - Opened `<select>` dropdown (sets `size = options.length`):
     `node .devin/skills/capture-scroll/capture-scroll.mjs http://localhost:3000/products/headphones /tmp/sort --selector='#poc-sort' --open-select --prefix=sort-dropdown`
3. Return the listed `file://` links in order.

## Options

- `[url]` — defaults to `http://localhost:3000/products/headphones`
- `[outDir]` — defaults to `/tmp/scroll-captures`
- `--selector=<css>` — capture a specific element
- `--hint=left|right|body|largest` — auto-detect target (default `left`)
- `--viewport=WxH` — set viewport size (default `1440x900`)
- `--wait=ms` — time to wait after each scroll (default `120`)
- `--prefix=<name>` — filename prefix, e.g. `filter-001.png` (default `scroll`)
- `--open-select` — if the target is a `<select>`, set `size = options.length` to show all options before capturing

## Notes

- The script connects to the shared Chrome CDP at `http://127.0.0.1:9222`. It does not launch its own browser unless the start script is used.
- For `--hint=body`, the script scrolls the `<html>` root and captures the current viewport.
- For element targets, it scrolls the element and captures its visible bounding box at each step.
- For `--open-select`, the select is temporarily turned into a list box so all options are visible. If the list still overflows, the script scrolls through it.

## Critical Rules

- Never launch a second Chrome for automation; reuse the CDP on port 9222.
- Do not run `npm install`, `next build`, `tsc`, lint, or tests as part of this workflow.
- Always output screenshot paths as `file://` URIs in capture order.
