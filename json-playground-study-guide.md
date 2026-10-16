# JSON Playground — Reverse Engineering Study Guide

> Tumne Gemini se project banwaya. Ab isse **padhkar samajhna** hai — kyunki interview me AI nahi, tumhari samajh test hogi. Ye guide har important concept ko todti hai: **kahan hai (file) → kya ho raha hai → kya seekhna hai → interview me kya poochenge.**
>
> Padhne ka order wahi rakho jo neeche hai — yahi "bahar se andar" wala tareeka hai.

---

## Reading order (isi order me chalna)

1. `package.json` → `types/index.ts` → `app/globals.css` → `app/layout.tsx` → `app/page.tsx`
2. `store/useStore.ts` (dil yahin hai — request state, mock endpoints, theme, collections)
3. `lib/sendRequest.ts` → `app/api/proxy/route.ts` (CORS proxy)
4. `app/api/mock/[...slug]/route.ts` → `components/MockServerModal.tsx` (In-Browser Mock Server)
5. `lib/jsonQuery.ts` → `components/JsonTreeViewer.tsx` (Recursion & JSONPath evaluator)
6. Baaki UI components (`RequestPanel`, `ResponsePanel`, `Navbar`, drawers) — ye bade hain par concept kam, UI zyada.

---

## Concept 1 — TypeScript types = app ka skeleton
**Kahan:** `types/index.ts`

**Kya ho raha hai:**
- `HttpMethod` ek **union type** hai (`'GET' | 'POST' | ...`) — sirf yahi values allowed.
- `interface RequestConfig`, `ResponseData`, `HistoryItem` — poore app ka data shape yahin define hai.
- `ResponseData.errorCategory?: 'cors' | 'network' | 'http' | 'parse' | 'timeout'` — dekho error bhi typed hai.
- `?` ka matlab optional field, `Record<string, string>` ka matlab "key-value object jisme dono string".

**Kya seekhna hai:**
- `type` vs `interface` ka farak (kab kaun sa).
- Union types, optional properties (`?`), `Record<K, V>`.
- Ye samajhna: types padhke hi pata chal jaata hai app me data kaisa behta hai. **Yahin se hamesha shuru karo.**

**Interview angle:** "Tumne types kyun pehle define kiye?" → "Taaki data ka contract clear ho, aur poora app usi shape pe bharosa kare — bugs compile-time pe pakde jaayein."

---

## Concept 2 — Next.js App Router: layout, page, "use client"
**Kahan:** `app/layout.tsx`, `app/page.tsx`

**Kya ho raha hai:**
- `layout.tsx` = sabke around wrapper (html/body, fonts, metadata). **Server component** hai (koi `"use client"` nahi).
- `page.tsx` = `/` route. Upar `"use client"` likha hai — kyunki isme `useState`/`useEffect`/store use ho raha hai.
- `metadata` export SEO ke liye — title, description, keywords.
- Fonts `next/font/google` se load ho rahe (`Geist`, `Geist_Mono`) — CSS variables ban rahe.

**Kya seekhna hai:**
- **Server Components vs Client Components** — ye Next.js ka sabse important modern concept hai. Default sab server pe render hota hai; `"use client"` lagao tab browser pe interactivity aati hai.
- Kyun `page.tsx` client hai par `layout.tsx` server? (Interactivity vs static shell.)
- `useEffect` ka use: theme class `<html>` pe lagana, aur global keyboard shortcut (`Cmd/Ctrl+Enter`) — dekho **cleanup function** bhi hai (`removeEventListener`). Ye memory leak rokta hai.

**Interview angle:** "Server aur client component me kya farak hai, aur tumne kaunsa kahan use kiya?" — ye 2026 me frontend interview ka favourite sawaal hai.

---

## Concept 3 — Global state with Zustand (sabse important)
**Kahan:** `store/useStore.ts`

**Kya ho raha hai:**
- `create<PlaygroundState>()(...)` — ek single store jisme **poora app state** hai: request fields, response, history, collections, theme.
- `set` se state badalti hai, `get()` se current state padhte ho.
- Actions (functions) bhi store ke andar hain — `sendRequest`, `addHeader`, `loadPreset`, etc. State aur uski logic ek jagah.
- Dekho `updateHeader`/`updateQueryParam` me ek smart trick: jab aakhri empty row me type karo, **automatically ek nayi empty row add ho jaati hai** (Postman jaisa feel).

**Kya seekhna hai:**
- Zustand kaise kaam karta hai vs Redux (bahut kam boilerplate).
- **Immutability** — dekho har jagah `...state`, `.map()`, `.filter()` use hua hai, kabhi direct mutate nahi. Kyun? React ko change detect karne ke liye naya reference chahiye.
- Kab global state chahiye aur kab local `useState` kaafi hai — ye tum bata sako.

**Interview angle:** "State global kyun banaya, Context se kaam nahi chalta tha?" → history/collections/theme bahut saari jagah chahiye the, prop-drilling se bachne ke liye store.

---

## Concept 4 — localStorage persistence + Hydration (ADVANCED — yahan ruko)
**Kahan:** `store/useStore.ts` ke neeche `persist({...})` block, aur `app/layout.tsx` ka `suppressHydrationWarning`

**Kya ho raha hai:**
- `persist` middleware store ko **localStorage me save** karta hai (`name: "json-playground-storage"`).
- `partialize` — dekho sirf `history, collections, theme, useProxy` save ho rahe, poora state nahi. Kyun? Active request/response har baar fresh chahiye, save karne layak nahi.
- `isHydrated` flag + `onRehydrateStorage` — ye **hydration problem** solve karta hai.

**Hydration kya hai (zaroor samjho):**
Next.js pehle server pe HTML banata hai (jahan localStorage hota hi nahi), phir browser me React usko "hydrate" karta hai. Agar server ne theme `dark` bheji par localStorage me `light` tha → **mismatch** → React warning/error deta hai. Isliye:
- `suppressHydrationWarning` lagaya `<html>` pe.
- `isHydrated` false rakha jab tak localStorage load na ho — taaki UI tab tak persisted data pe depend na kare.

**Kya seekhna hai:**
- SSR me hydration mismatch kyun hota hai aur kaise handle karte hain. **Ye interview me bahut poocha jaata hai** aur log yahin atakte hain.
- `partialize` ka concept — sab kuch persist mat karo, sirf jo chahiye.

**Interview angle:** "localStorage SSR ke saath use karte waqt kya dikkat aati hai?" → hydration mismatch → tumne kaise solve kiya. Agar tum ye confidently bol diye, interviewer impress ho jayega.

---

## Concept 5 — fetch wrapper + error categorization
**Kahan:** `lib/sendRequest.ts`

**Kya ho raha hai:**
- `executeRequest()` — central function jo request bhejta hai.
- **Timing:** `performance.now()` request se pehle aur baad me → `timeMs` nikalta hai.
- **Error ko category me baantna:** `TypeError` + `"Failed to fetch"` → ye CORS/network hai (status 0). Baaki cases alag. Ye wahi "errors categorize karo" wala point hai tumhare README ka.
- `buildUrlWithParams` — `URL` object use karke query params safely add karta hai, aur agar URL abhi valid nahi to manual fallback.
- `resolveHeaders` — custom headers + auth headers (Bearer/Basic) + default `Content-Type` jodta hai. `btoa()` se Basic auth encode hota hai.

**Kya seekhna hai:**
- `async/await` + `try/catch` se robust error handling.
- `fetch` CORS error pe kya return karta hai (status 0, `TypeError`) — ye asli gyaan hai.
- Browser kyun kuch APIs ko block karta hai (CORS) — agla concept.

**Interview angle:** "Tumne network error aur CORS error me farak kaise kiya?" → `TypeError` + message check. Ye depth dikhata hai.

---

## Concept 6 — CORS aur Server Proxy (tumhara best talking point)
**Kahan:** `app/api/proxy/route.ts`

**Kya ho raha hai:**
- Ye ek **Next.js API route** hai — server pe chalta hai, browser pe nahi. `export async function POST(req)`.
- Browser se direct API call CORS se block ho sakti hai. Isliye: browser → **tumhara apna server** (`/api/proxy`) → target API. Server pe CORS lagta hi nahi (CORS sirf browser ka rule hai).
- `AbortController` + `setTimeout(30000)` — agar API 30 second me response na de to request **abort** ho jaati hai (timeout handling).
- Server restricted headers (`host`, `content-length`) hata deta hai.

**Kya seekhna hai:**
- **CORS kya hai, kyun hota hai** — same-origin policy, preflight requests. (Ye zaroor padho, bahut important hai.)
- Proxy pattern kyun CORS bypass karta hai — kyunki server-to-server calls pe browser ka CORS rule lagta hi nahi.
- `AbortController` se request cancel/timeout karna — ek underrated skill.

**Interview angle:** Ye tumhara **showcase** hai. "Maine CORS problem ko server-side proxy se solve kiya, aur 30s timeout ke liye AbortController use kiya." Isko ache se bol pao to bada plus.

---

## Concept 7 — Recursion: khud ko render karta component
**Kahan:** `components/JsonTreeViewer.tsx`

**Kya ho raha hai:**
- `TreeNode` component **apne aap ko call karta hai** (line ~247, `<TreeNode ... />` ke andar). Ye recursion hai.
- Har node check karta hai: primitive hai (string/number/bool/null) ya container (object/array)?
  - Primitive → value dikha do.
  - Container → header dikhao + **har child ke liye dobara `TreeNode`** render karo, `depth + 1` ke saath.
- `depth` prop se indentation badhti hai (`paddingLeft: depth * 18`).
- `path` build hota hai neeche jaate-jaate: `$`, `$.posts`, `$.posts[0]`, `$.posts[0].title` — isi se "copy path" kaam karta hai.
- `depth < 2` → pehle 2 level khule rahte hain by default (performance + UX).
- Search match pe node **auto-expand** hota hai (`useEffect`).

**Kya seekhna hai:**
- **Recursion in React** — nested/tree data (comments, folders, JSON) render karne ka classic tareeka. Ye ek interview favourite problem hai.
- Base case vs recursive case (primitive = base, container = recurse).
- `path` kaise accumulate hota hai har level pe.
- Controlled expand/collapse state per node (`useState` har node me).

**Interview angle:** "Nested JSON ko render kaise kiya?" → recursion, base case, depth-based indentation. Agar whiteboard pe tumse "comment tree render karo" poocha jaye, ye wahi concept hai.

---

## Concept 8 — Recursive search & JSONPath evaluator
**Kahan:** `lib/jsonQuery.ts`

**Kya ho raha hai:**
- `evaluateJsonPath(data, query)` — `$.posts[0].title` jaisi query ko parse karke value nikalta hai. Bracket notation ko dot me normalize karta hai, `*` wildcard handle karta hai (array pe `.map`).
- `countMatches` — **recursive traversal** jo poore JSON me search term ko keys aur values dono me dhoondhta hai.
- `validateJson` — invalid JSON pe **line/column number** nikalta hai error message se (regex se position parse karke).
- `formatJson`/`minifyJson` — `JSON.stringify` with/without indent.
- `copyToClipboard` — modern `navigator.clipboard` + purana `execCommand` fallback.
- `downloadJsonFile` — `Blob` + `URL.createObjectURL` se browser download trigger (bina server ke).

**Kya seekhna hai:**
- Recursive tree traversal (ye Concept 7 se juda hai).
- String parsing / regex ka practical use.
- Browser APIs: Clipboard API, Blob, `URL.createObjectURL` — client-side file download kaise hota hai.

**Interview angle:** "Client-side file download bina backend ke kaise kiya?" → Blob + object URL. Chhoti cheez par log nahi jaante.

---

## Concept 9 — Controlled components & dynamic rows
**Kahan:** `components/RequestPanel.tsx`, `ResponsePanel.tsx` (bade files, par concept simple)

**Kya ho raha hai:**
- Saare inputs **controlled** hain — value store se aati hai, `onChange` store update karta hai. React me data ka single source of truth.
- Headers/query params ki rows dynamically add/remove hoti hain (store actions se).
- Response panel me tabs (tree/raw/headers/preview) — conditional rendering.

**Kya seekhna hai:**
- Controlled vs uncontrolled components.
- List rendering with stable `key` (dekho har `.map` me `key={...}`) — React ko efficient update ke liye zaroori.

**Interview angle:** "Controlled component kya hai?" — basic par zaroori. Aur "list me `key` kyun chahiye?"

---

## Concept 10 — Next.js Dynamic Catch-All API Routes & In-Browser Mock Server (SUPER COOL FEATURE)
**Kahan:** `app/api/mock/[...slug]/route.ts`, `components/MockServerModal.tsx`, `store/useStore.ts`

**Kya ho raha hai:**
- **Dynamic Catch-All Route (`[...slug]`):** Next.js App Router me folder ka naam `[...slug]` hone ka matlab hai ye kisi bhi nested path ko catch kar lega. Jaise:
  - `/api/mock/users` → `slug = ["users"]`
  - `/api/mock/cart/checkout` → `slug = ["cart", "checkout"]`
  - `/api/mock/auth/v1/token` → `slug = ["auth", "v1", "token"]`
- **Method Dispatch:** Single route file ke andar `GET`, `POST`, `PUT`, `PATCH`, `DELETE` sabhi HTTP handlers exported hain jo ek common `handleMockRequest` function ko call karte hain.
- **Next.js 15+ Async Params:** Next.js ke naye version me `params` ek Promise hota hai (`const { slug } = await params;`), isko direct synchronous access karne se runtime warning aati hai.
- **Simulated Latency:** Real-world networks me API instant nahi aati. Isliye `await new Promise((resolve) => setTimeout(resolve, mock.delayMs));` lagaya hai. Isse frontend ke loader/spinners aur timeout handling test ho sakti hai.
- **Dynamic Status Codes:** Frontend developer custom errors test kar sake (200, 201, 400, 401, 404, 500) — server `new NextResponse(body, { status: mock.statusCode })` return karta hai.
- **Cross-Request Mock Synchronization:** Browser client aur server-side runtime ke beech mock configuration synchronize hoti hai (`/api/mock/sync`).

**Kya seekhna hai:**
- Next.js dynamic routing: `[slug]` (single param) vs `[...slug]` (catch-all) vs `[[...slug]]` (optional catch-all).
- Mocking ka real-life use-case: jab backend team ne API abhi deploy nahi ki, par frontend team ko UI aur error-states pehle hi test karni hain.
- `NextResponse` me custom status codes, headers aur body bhejna.

**Interview angle:** "Agar backend API ready na ho to frontend development kaise karte ho?" → "Humne Next.js App Router ke `[...slug]` catch-all API route ka use karke ek in-app Mock Server banaya, jisme method, route, custom status code aur artificial latency delay configure karke realistic error/success scenarios test kiye."

---

## Concept 11 — Tailwind CSS v4 Theme Architecture, `@custom-variant` & Specificity
**Kahan:** `app/globals.css`, `app/page.tsx`, `app/layout.tsx`, `components/Navbar.tsx`

**Kya ho raha hai:**
- **Tailwind v4 CSS-First Approach:** Tailwind CSS v4 me `tailwind.config.js` file nahi hoti. Saari configuration seedhe `app/globals.css` me CSS directives se hoti hai.
- **`@custom-variant` Directive:** By default Tailwind v4 dark mode ke liye OS preference (`@media (prefers-color-scheme: dark)`) sunta hai. Manual Sun/Moon button se switch karne ke liye humne class-based selector define kiya:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
  Is line ka matlab hai: agar kisi ancestor element (jaise `<html>`) par `.dark` class lagi ho, to uske andar ke sabhi elements par `dark:...` utility classes activate ho jayein!
- **CSS Specificity Trap:** Agar aap kisi container par plain `bg-zinc-950` laga dete ho bina `dark:` prefix ke, to chahe `<html>` se `.dark` class hat bhi jaye, background dark hi rahega! Solution: hamesha dual classes use karo:
  ```tsx
  className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800"
  ```
- **Root Element Sync:** `app/page.tsx` me `useEffect` Zustand store ke `theme` state ko sunta hai aur `document.documentElement.classList.add/remove("dark")` karta hai.
- **Smooth Transition:** `app/globals.css` me `body` par `transition: background-color 0.2s ease, color 0.2s ease` lagayi hai jisse theme instantly jhatke se switch hone ki jagah buttery-smooth fade hoti hai.

**Kya seekhna hai:**
- Tailwind v3 (`darkMode: 'class'`) vs Tailwind v4 (`@custom-variant dark`).
- CSS cascade aur specificity — hardcoded utilities vs theme-aware variants.
- Dark mode state sync: Zustand → localStorage persist → DOM classList manipulation.

**Interview angle:** "Tailwind CSS v4 me dark mode toggle kaise implement kiya aur purane versions se kya alag hai?" → Tailwind v4 me JS config ki jagah CSS-first `@custom-variant dark` use hota hai, aur SSR hydration mismatch se bachne ke liye `suppressHydrationWarning` ke saath DOM sync kiya jata hai.

---

## Ek flow end-to-end trace karo (sabse tezi se samajhne ka tareeka)

### Flow 1: "Jab user Send dabata hai tab kya hota hai?"
1. `page.tsx` — `Cmd+Enter` ya RequestPanel ka Send button → `sendRequest()` (store se).
2. `store/useStore.ts` → `sendRequest` action → `isLoading: true` → `executeRequest(config)` call.
3. `lib/sendRequest.ts` → `executeRequest` → proxy on hai to `/api/proxy`, warna direct `fetch`. Timing + error handling.
4. (proxy case) `app/api/proxy/route.ts` → server pe target API hit → response wapas.
5. Wapas store me → `response` set → `history` me add (last 50).
6. `ResponsePanel.tsx` re-render → `JsonTreeViewer` ko `response.data` deta hai.
7. `JsonTreeViewer.tsx` → recursion se tree render.

### Flow 2: "Jab user Mock Endpoint banata aur test karta hai tab kya hota hai?"
1. Top bar me "Mock Server" button click → `MockServerModal.tsx` open hota hai.
2. User form bharta hai (Method: `POST`, Path: `cart/checkout`, Status: `500`, Latency: `1200ms`, Body: JSON).
3. "Create Mock Route" dabane par `addMock()` action store me mock add karta hai (localStorage me save).
4. List me "Test" button dabane par address bar me automatically URL set hoti hai: `http://localhost:3000/api/mock/cart/checkout`.
5. "Send" dabate hi request `app/api/mock/[...slug]/route.ts` ke `POST` handler ko jati hai.
6. Server path (`slug = ["cart", "checkout"]`) match karta hai, `1200ms` wait karta hai, aur status code `500` return karta hai.
7. Right panel me turant Amber/Rose color ka Client/Server Error badge, 1200ms latency aur JSON response render ho jata hai.

Ye 2 flows samajh gaye to **90% app ka flow** clear hai!

---

## Priority order (agar time kam hai)

Zaroor samjho (interview me pakka aayega):
1. Server vs Client components (Concept 2)
2. In-Browser Mock Server & `[...slug]` Catch-All Routes (Concept 10)
3. Hydration + persist (Concept 4)
4. CORS + Server Proxy (Concept 6)
5. Recursion / tree rendering (Concept 7)
6. Tailwind v4 Dark/Light Theme Architecture (Concept 11)

Accha-to-know:
7. Error categorization (Concept 5)
8. Zustand immutability (Concept 3)
9. Blob download / clipboard (Concept 8)
10. Controlled inputs & dynamic list rendering (Concept 9)

---

## Padhne ka tareeka (passive mat padho)

- Ek file kholo, upar diya "kya seekhna hai" saamne rakho.
- **Code me comment likho apne shabdon me** — "ye line kya kar rahi hai". Jo samajh na aaye, usko AI se poocho: *"ye line line-by-line samjhao"* — par pehle khud try karo.
- Ek chhoti cheez **todo (break karo)**: jaise `partialize` se `theme` hata do, dekho kya hota hai. Phir wapas lagao. Todkar-jodkar hi asli samajh aati hai.
- Har concept ke "interview angle" ka jawab **bolkar** practice karo, jaise interviewer saamne hai.

Jab ye sab ho jaye, tum bina atke 5 min me pura project samjha paoge — aur tabhi ye project "AI ne banaya" se "maine banaya aur samajhta hoon" ban jayega.

