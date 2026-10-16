# API Lens — In-Browser API Playground & JSON Explorer 🔍⚡

> **Portfolio Project #1** — A high-performance, developer-first in-browser API testing client and interactive JSON explorer. Hit any REST API, inspect timing & size, traverse recursive JSON trees, run queries, and persist history with zero installation.

---

## 🚀 Live Demo & Quick Links
- **Local Dev Server:** `http://localhost:3000`
- **Deploy Target:** Vercel (One-Click Next.js App Router Deploy)
- **Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand

---

## ✨ Features

### 1. 🛠️ Robust Request Builder
- **HTTP Methods:** Full support for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- **Dynamic Query Parameters:** Key-value table that auto-syncs bi-directionally with the URL search parameters.
- **Header Manager:** Dynamic header rows with autocomplete suggestions for common HTTP headers (`Authorization`, `Content-Type`, `Accept`, etc.).
- **Smart Body Editor:**
  - Real-time **JSON Syntax Validator** (detects parse errors with exact line and column numbers).
  - One-click **Beautify / Prettify** (2-space indent) & **Minify**.
- **Auth Helper:** Bearer Token and Basic Auth (auto-encodes credentials to Base64 and injects `Authorization` header).
- **Keyboard Shortcuts:** Trigger requests anywhere via `⌘ + Enter` (Mac) or `Ctrl + Enter` (Windows/Linux).

### 2. ⚡ In-Depth Response Inspection
- **Performance Metrics:** Real-time roundtrip latency calculation (`performance.now()` in ms) and payload size in bytes/KB.
- **Status Badges:** Color-coded HTTP status codes (2xx Success, 3xx Redirect, 4xx Client Error, 5xx Server Error).
- **Tabbed Views:**
  - **Interactive Tree View:** Custom recursive JSON tree with depth guides and collapsible nodes.
  - **Raw JSON:** Formatted text view with copy button and file download.
  - **Headers Inspector:** Tabular view of all incoming HTTP response headers.

### 3. 🌲 Custom Recursive JSON Tree Viewer
- Built without bulky 3rd-party dependencies to maximize rendering speed and control.
- **Hover Micro-actions:** One-click **"Copy Path"** (e.g., `products[0].dimensions.width`) and **"Copy Value"**.
- **Collapsible Nodes:** Collapses deep objects and arrays with clear count indicators (`{ 4 keys }`, `[ 12 items ]`).
- **Data Type Badges:** Type badges for `str`, `num`, `bool`, `null`, `Array`, `Object`.
- **Expand / Collapse All:** Instantly expand or collapse the entire tree.

### 4. 🔎 Live Search & JSONPath Querying
- Filter responses using dot notation or JSONPath syntax:
  - `$.posts[0].title`
  - `products.0.price`
  - `items[*].id`
- Real-time search highlighting across keys and values with match counters.

### 5. 🛡️ Intelligent CORS & Next.js Server Proxy
- Browsers inherently block third-party APIs that lack CORS headers.
- **Smart Detection:** Automatically categorizes `TypeError: Failed to fetch` as CORS restrictions and presents a 1-click **"Retry with Server Proxy"** button.
- **Built-in `/api/proxy`:** Next.js App Router server endpoint routes requests server-side without browser origin limitations.

### 6. 💾 Local Persistence (Zustand + LocalStorage)
- **Request History:** Automatically persists the last 50 requests with timestamps, HTTP methods, status codes, and execution timings.
- **Favorites & Starred:** Star important requests for quick retrieval.
- **Import / Export:** Export history as JSON or import backup sessions.
- **Saved Collections:** Organize endpoints into custom collections (e.g., "E-Commerce APIs", "Auth Tests").

### 7. 🎭 In-Browser API Mock Server & Endpoint Engine
- **Custom Mock Route Creator:** Define mock endpoints with custom HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), paths (e.g., `/users`, `/auth/login`, `/cart/checkout`), and response payloads.
- **Configurable Status Codes:** Simulate success (`200 OK`, `201 Created`) or failure states (`400 Bad Request`, `404 Not Found`, `500 Server Error`).
- **Simulated Latency & Delay:** Emulate network latency (`0ms`, `300ms`, `800ms`, `1500ms`, `3000ms`) to test frontend loading spinners and skeletons.
- **Live Shareable Endpoints:** Exposes real Next.js API routes (`/api/mock/[path]`) that can be consumed by external frontend or mobile applications.
- **1-Click Testing:** Instant "Test in Playground" execution with bi-directional syncing.

### 8. 🎨 Developer-First Aesthetic & Theming
- Sleek dark mode tuned for high contrast and readability.
- Seamless Dark / Light theme toggle.

---

## 🎯 Sample APIs for Live Testing
Pre-configured in the top **Presets** dropdown for instant testing:
1. `GET https://jsonplaceholder.typicode.com/posts/1` — Standard REST resource
2. `GET https://dummyjson.com/products?limit=8` — E-commerce data with nested images & categories
3. `GET https://api.github.com/users/octocat` — Nested GitHub user profile
4. `GET https://pokeapi.co/api/v2/pokemon/ditto` — Deeply nested Pokémon tree (abilities, stats, moves)
5. `POST https://jsonplaceholder.typicode.com/posts` — Mutation test with JSON payload
6. `GET https://httpbin.org/headers` — Request header reflection
7. `GET /api/mock/users` — Live Mock Server endpoint with simulated 300ms latency

---

## 🏗️ Architecture & Project Structure

```
json-playground/
├── app/
│   ├── api/
│   │   ├── mock/
│   │   │   ├── [...slug]/route.ts  # Catch-all dynamic mock server with latency & status codes
│   │   │   └── sync/route.ts       # Client-to-server mock state synchronization
│   │   └── proxy/
│   │       └── route.ts            # Server-side proxy bypassing browser CORS
│   ├── globals.css                 # Design tokens, custom scrollbars, Tailwind v4
│   ├── layout.tsx                  # Root layout, Geist font, meta tags
│   └── page.tsx                    # Responsive two-panel playground layout
├── components/
│   ├── Navbar.tsx                  # Top branding, preset picker, mock server, theme
│   ├── RequestPanel.tsx            # HTTP method, URL, params, headers, body editor
│   ├── ResponsePanel.tsx           # Status, latency, size, search, and view tabs
│   ├── JsonTreeViewer.tsx          # Recursive collapsible tree with path-copy & highlighting
│   ├── MockServerModal.tsx         # Full-featured API mocking modal and endpoint builder
│   ├── HistoryDrawer.tsx           # LocalStorage request history with import/export
│   └── CollectionsModal.tsx        # Custom collections and saved request templates
├── lib/
│   ├── sendRequest.ts              # URL builder, headers resolver, mock interceptor, fetch wrapper
│   └── jsonQuery.ts                # JSONPath evaluator, text highlighter, export utilities
├── store/
│   └── useStore.ts                 # Zustand global store with localStorage persistence
└── types/
    └── index.ts                    # Strongly-typed HTTP interfaces and models
```

---

## 💡 Engineering & Interview Talking Points

- **Dual-Layer API Mocking Engine:** Rather than only mocking responses in client memory, API Lens implements both a client-side interceptor (for zero-latency playground inspection) and a server-side catch-all App Router handler (`/api/mock/[...slug]`) with `setTimeout` delay emulation and CORS headers. Any external application can hit these live endpoints during frontend development.
- **Custom Request Wrapper & Error Categorization:** Rather than a raw `fetch()`, requests pass through an orchestration layer that measures high-resolution timing (`performance.now()`), calculates payload sizes via Blob lengths, and differentiates between Network/CORS errors, HTTP error statuses, and JSON parse failures.
- **Overcoming CORS via Next.js Proxy:** Direct browser requests to strict APIs fail due to CORS. Rather than failing silently, the client detects CORS patterns and allows switching to a server-side Next.js route handler (`/api/proxy`), ensuring any API can be explored.
- **Building a Recursive JSON Tree from Scratch:** Instead of relying on third-party packages, we engineered a performant recursive React component with collapsible branches, breadcrumb path computation, and search term highlight markers.
- **Bi-directional Query Param Syncing:** Modifying query params in the table updates the URL search query, and vice-versa, adhering to standard URL standards.
- **State Management & Persistence:** Built with Zustand and `localStorage` persistence, ensuring history, custom collections, and mock endpoints remain preserved across refreshes.

---

## 🛠️ Getting Started Locally

```bash
# 1. Install dependencies
bun install
# or
npm install

# 2. Run the development server
bun run dev
# or
npm run dev

# 3. Open in browser
open http://localhost:3000
```
