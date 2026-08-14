# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static, no-build vanilla-JS web app: an online JSON visualizer (https://json.red) plus a set of standalone dev tools — URL encode/decode, timestamp conversion, password generator, Base64 codec, gzip/deflate/LZ-String compression, and a cron expression generator. Deployed via GitHub Pages with custom domain `json.red` (see `CNAME`; DNS is managed in Aliyun cloud DNS, `json.red` → CNAME → `yequ.github.io`; `www.json.red` has no DNS record). There is no package.json, bundler, linter, or test suite. UI text is Chinese; README is bilingual.

## Running locally

- No build step. Serve the repo root over HTTP, e.g. `python3 -m http.server 8000`, then open http://localhost:8000/.
- Opening `index.html` directly via `file://` works but disables the JSON Web Worker (worker scripts can't load from file URLs) — the code falls back to main-thread parsing. Use an HTTP server to exercise the worker path.

## Architecture

- **Multi-page static site**: `index.html` is the main JSON formatter; `pages/*.html` are the six tool pages. Each page duplicates the same header/nav/footer markup, with its own `active` nav link. Adding or removing a tool means editing the nav in every page plus `sitemap.xml`.
- **One shared stylesheet**: `css/main.css` for everything, using CSS custom properties defined in `:root` and overridden under `[data-theme="dark"]`.
- **No modules** — every script is loaded as a plain `<script>` tag and exposes globals; buttons wire to them via inline `onclick=` attributes. Per-page script order: `js/theme.js` → the page's tool script → `js/analytics.js`.
- **Main app (`js/json-formatter.js`)**: defines the `JSONVisualizer` class, instantiated as global `const jsonVisualizer`. Input is throttled (300ms), parsed, and rendered as a collapsible HTML tree (`renderJSONToHTML`) into `#json-output`, which sits inside a virtual-scroll viewport. `js/json-worker.js` parses JSON off the main thread; parse errors are returned over the worker message channel and rendered as an error state.
- **Collapse/expand is DOM state, not a data model**: `.collapsible > .toggle-icon + .content` spans with a `collapsed` class; `expandAll`/`collapseAll`/`toggleNode` manipulate classes and the ▶/▼ glyphs directly.
- **Session persistence**: input is saved to sessionStorage, but two keys are in play — `jsonData` (set by `js/json-formatter.js`) and `jsonInputData` (set by `js/storage.js`, which is loaded on index.html and overlaps with the formatter's own persistence). If you touch persistence, reconcile both.
- **Theming (`js/theme.js`)**: cycles light → dark → auto, stores the mode in localStorage under `theme`, sets `data-theme`/`data-theme-mode` attributes on `<html>`, and re-applies on `prefers-color-scheme` change in auto mode.
- **External libraries are CDN-only**: js-yaml loaded on index.html for JSON⇄YAML conversion (code guards with `typeof jsyaml === 'undefined'`); LZ-String is injected dynamically by `js/compress-tool.js`; gzip/deflate use native `CompressionStream`/`DecompressionStream` browser APIs. Network-free local testing works except for those features.
- **Analytics (`js/analytics.js`)**: injects GA4 with a hardcoded measurement ID; Umami is present but commented out.
- Site plumbing files: `CNAME` (custom domain), `sitemap.xml`, `robots.txt`, `data/example.json` (sample JSON), `favicon.ico`.

## Conventions

- Vanilla ES6: classes for complex tools (`JSONVisualizer`, `CompressTool`), plain global functions for simple ones; `DOMContentLoaded` init for page scripts.
- Comments are Chinese in most files (some English headers); match the surrounding style.
- No automated tests — verify changes manually in a browser, including a `file://` smoke check since the worker/fallback paths differ.
