# Coinswap Taker — Design Handoff

> Pass this to a fresh Claude chat so work can continue with the visual language, conventions, and constraints fully loaded.

---

## 1. Project Overview

**App.** Desktop wallet UI for **Coinswap Taker** — a privacy-focused Bitcoin wallet that performs Coinswaps over Tor. Single-user, local-node, mainnet-or-regtest. Desktop window framing (macOS traffic lights, Mainnet · v0.4.2 in the titlebar).

**Audience.** Bitcoin-native power users. They read txids, care about script types (Taproot / SegWit), watch confirmation counts, and want everything addressable in a glance. Visual language leans into terminal/CLI heritage — mono everywhere it matters, no decorative iconography.

**Key flows.**
1. First-time setup → `Coinswap Taker.html` (node + Tor checks).
2. Wallet creation → `Wallet Creation.html` (name, password, script type).
3. Day-to-day → `Dashboard.html` (balances + UTXOs + recent tx).
4. Deep views → `UTXOs.html`, `Transactions.html`.

**Current state of each file.**

| File | Status | Contents |
|---|---|---|
| `Design System.html` | **Done** | Reference page: tokens, palette, type ramp, radii, components, badges. Source of truth for naming. |
| `Coinswap Taker.html` | **Done** | Welcome / first-run screen. Two cards (node check, Tor proxy check). Header: `Let's get you connected.` with orange italic accent on `connected.` |
| `Wallet Creation.html` | **Done** | Step 02 form. Header: `Create your wallet.` Name + password + script-type radio. |
| `Dashboard.html` | **In progress** (most recent work) | Sidebar nav, titlebar, page head (`Wallet`, Lock + Refresh buttons), four balance cards, two-column lower grid (UTXOs + Recent Transactions). UTXO filter tabs and Recent Transactions filter + sort tabs are wired up. |
| `UTXOs.html`, `Transactions.html` | Stubs | Linked from "View all" footers — not built out yet. |
| `dashboard-shared.css` | Helper | Shared dashboard styles (used minimally — most of Dashboard's CSS is inline). |

---

## 2. Design System

### 2.1 Color palette

All tokens defined as CSS custom properties on `:root` in both `Design System.html` and `Dashboard.html`. Identical in both.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#08080a` | App background (outside the shell) |
| `--surface-1` | `#101014` | Shell / sidebar inner surface |
| `--surface-2` | `#16161a` | Cards (balance cards, list cards) |
| `--surface-3` | `#1c1c22` | Inset rows (utxo-row, tx-row, metric, filter-tabs container) |
| `--border` | `rgba(255,255,255,0.08)` | Default 1px border |
| `--border-strong` | `rgba(255,255,255,0.14)` | Hover border, ghost button border |
| `--text` | `#f5f5f7` | Primary text |
| `--text-2` | `#a7a7ad` | Secondary text, addresses |
| `--text-3` | `#6c6c72` | Tertiary text, mono eyebrow labels |
| `--orange` | `#E85002` | **Brand primary.** Active nav, primary button, hero accent, view-all links |
| `--orange-hover` | `#FF6A2A` | Button hover |
| `--orange-2` | `#FF541B` | Gradient stop in hero bar |
| `--orange-soft` | `#ff7a3d` | (declared in design system, not heavily used) |
| `--orange-deep` | `#b53800` | (declared in design system, not heavily used) |
| `--green` | `#2fbf71` | Success / incoming tx / "in" / confirmed full |
| `--red` | `#ff4d5a` | Outgoing tx / "out" |
| `--amber` | `#ffb547` | Warning / unconfirmed / contract pill |
| `--blue` | `#5b8def` | Swap accent, SegWit pill, "Swaps" balance card |
| `--purple` | `#a979ff` | Taproot pill |

Tinted backgrounds use the token at `rgba(...,0.10–0.14)`, borders at `rgba(...,0.25–0.3)` — see `.pill.*`, `.conf`, `.tx-arrow`, `.bcard.hero` for the recipe.

### 2.2 Typography

**Two families only.**
- `--f-sans`: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif` — UI body, headings.
- `--f-mono`: `ui-monospace, 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', monospace` — every address, txid, amount, eyebrow label, breadcrumb, meta line, balance value.

`font-feature-settings:"ss01","cv11"` is on at body level.

**Hierarchy (Dashboard scale).**

| Use | Size / weight / tracking |
|---|---|
| Page H1 (`Wallet`) | 34px / 700 / `-0.035em` |
| Hero balance value | 54px / 700 / `-0.035em`, mono |
| Section h2 (Design System) | 28px / 600 / `-0.025em` |
| Secondary balance value | 28px / 600 / `-0.025em`, mono |
| Card title (h3) | 15px / 600 / `-0.01em` |
| Body / nav link | 13px / 500 / `-0.005em` |
| Button | 12.5px / 600 |
| Button small | 11.5px / 600 |
| Filter tab | 11.5px / 500 |
| TX amount | 12.5px / 500, mono |
| UTXO amount | 13px / 500, mono |
| UTXO/TX id | 11.5px / 11px, mono, `--text-2` |
| Mono eyebrow label (uppercase) | 10.5px / `letter-spacing:0.1em` / uppercase |
| `count` next to titles | 10.5px, mono, `--text-3`, `0.08em`, uppercase |
| Time stamp | 9.5px, mono, `--text-3`, uppercase |
| Pill / conf badge | 9.5px, mono, `0.04–0.06em`, uppercase |
| `metric .l` (label) | 9.5px, mono, `0.1em`, uppercase |
| Hero italic accent | `font-style:italic; font-weight:600; color:var(--orange)` on `<span class="accent">` inside h1 |

### 2.3 Spacing & grid

No formal scale, but the values in use are: **4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 54, 62 px**. Treat these as the de-facto scale.

Layout:
- Shell: `width:min(1320px,100%)`, grid `68px 1fr` collapsed / `200px 1fr` expanded, 0.3s ease.
- Main padding: `62px 28px 28px` (top accounts for the 42px titlebar).
- Main vertical rhythm: `gap:18px` between page-head / balances / lower.
- Balances grid: `1.45fr 1fr 1fr 1fr`, `gap:12px`. Hero is the wider first cell. Collapses to 2 columns under 1100px.
- Lower grid: `1.55fr 1fr`, `gap:14px`. Stacks under 1100px.
- Cards: `card-head` padding `16px 18px`, `card-body` padding `14px 18px`, `card-foot` `12px 18px`.

### 2.4 Radii & shadow

| Token | Value | Where |
|---|---|---|
| `--r-sm` | 8px | Inputs |
| `--r-md` | 12px | Swatches |
| `--r-lg` | 20px | (declared, used sparingly) |
| `--r-xl` | 32px | (declared) |
| `--r-pill` | 999px | Buttons, filter tabs, eyebrow chips |

Ad-hoc radii in use: **24px** (shell), **18px** (balance card), **14px** (card, total-value), **10px** (metric, utxo-row, tx-row, nav), **9px** (tx-arrow, brand-mark), **6–7px** (pills, tooltips), **5px** (conf badge).

**Shadow.** Exactly one elevation: the shell.
`box-shadow: 0 1px 0 rgba(255,255,255,0.05) inset, 0 40px 120px -20px rgba(0,0,0,0.7);`
Cards have **no** drop shadow — they're delineated by `1px solid var(--border)` only. Brand glow uses `box-shadow:0 0 10px var(--orange)` on small dots/pips.

### 2.5 Interactive states

- **Buttons (`.btn`)**: default `background:var(--orange)`, hover `--orange-hover` + `translateY(-1px)`, no focus ring defined (add one if accessibility surfaces).
- **Ghost button (`.btn.ghost`)**: transparent + `border-strong`; hover `rgba(255,255,255,0.05)` + text → `--text`, no transform.
- **Nav links**: default `--text-2`; hover `rgba(255,255,255,0.04)` + text → `--text`; `.active` solid `--orange` bg with white text.
- **Filter tabs**: default transparent + `--text-2`; hover text → `--text`; `.active` solid `--orange` bg with white text.
- **Rows (utxo / tx)**: default `--surface-3` + `--border`; hover `#1f1f25` + `--border-strong`.
- **Cards (`.bcard`)**: hover only lifts border to `--border-strong`.
- **`.refresh-btn .ic`** rotates 60° on hover (0.4s).
- **Disabled**: no explicit treatment yet — TODO if a flow needs it.

---

## 3. Component Inventory

### 3.1 Header bar (titlebar)
`.titlebar` — absolute 42px tall strip across the shell top. Left: 3 macOS traffic lights (`#ff5f57`, `#febc2e`, `#28c840`). Center: app name in mono uppercase (`Coinswap · Taker`). Right: green dot pulse + `Mainnet · v0.4.2` in mono uppercase.

### 3.2 Sidebar nav
`.sidebar` — collapsible. 68px collapsed, 200px expanded (`.shell.expanded`). Toggle: `.collapsed-toggle` (hamburger) appears when collapsed; `.toggle-btn` (chevron-left) appears in the `.brand` row when expanded.

- `.brand` row: 30×30 orange-bg square mark with `C` in mono 700, then `Coinswap` (orange, mono, 15/600) + `Taker app` (mono 9.5px uppercase) — both fade in via `opacity` transitions on `.shell.expanded`.
- `.nav a`: icon (16px stroke 1.6 SVG) + label. Label has `opacity:0` collapsed, `1` expanded. Active state: solid orange bg, white text + icon. Tooltip on hover when collapsed via `data-tip` + `::after` pseudo.
- Nav items, in order: Wallet (active), Market, Send, Receive, Swap, Recovery, Log, Settings.
- `.sidebar-foot`: green pip + `Node OK` label (only the pip shows when collapsed).

### 3.3 Page head
`.page-head` — flex row, baseline. Left: `<h1>` plus a `.meta` mono uppercase strip (e.g. `Native SegWit · m/84'/0'/0' · Synced 4 min ago`). Right: `.btn.ghost.sm` "Lock" and `.btn` "Refresh" (refresh has rotating arrow icon).

### 3.4 Balance cards (`.bcard`)
Row of four. Hero takes `1.45fr`, the rest `1fr`.

- **Structure**: `<span class="accent-line">` (2px left edge strip, color matches modifier), `<div class="label">` (mono uppercase title), `<div class="val">` (mono numeric with `<small>` BTC suffix), `<div class="sub">` (sentence-case description).
- **Hero** (`.bcard.hero`): `padding:22px 24px`, orange gradient bg, orange-tinted border, value `54px / 700`, plus a `.share` row with `.pct`, a 3px `.bar` (orange gradient, 99% fill + glow), and `of total` label.
- **Color modifiers**: `.orange`, `.blue`, `.amber`, `.white`, `.green`, `.purple` — paint the `.val` text and the `.accent-line` only. Card bg stays `--surface-2`.
- **Current usage**: Hero `Balance` (orange, gradient bg) → `Swaps` (blue) → `Spendable` (white) → `Contracts` (amber).
- **No icons. No vertical side labels.** See §4.

### 3.5 Card shell (`.card`)
Used for UTXOs and Recent Transactions. Vertical stack: `.card-head` (title + optional filter row), `.card-body` (scrollable list), `.card-foot` (view-all link left + meta line right).

- `.card-head h3` 15/600. `.count` mono `0.08em` uppercase right after the title.
- `.card-foot .view-all` orange mono uppercase 11px with a thin underline (`rgba(232,80,2,0.4)`) that brightens on hover.
- `.scroll` is `flex:1; overflow-y:auto`, margin-bleeds `-18px` then re-pads so the scrollbar lives at the card edge. Custom thin (6px) scrollbar.

### 3.6 UTXO mini metrics
`.metrics` — 3-col grid above the UTXO filter tabs. Each `.metric` is `--surface-3` + `--border`, padded 11×12, with a mono uppercase 9.5 label and an 18px mono value. Modifiers `.green` and `.amber` colorize the value (used for Confirmed / Unconfirmed).

### 3.7 Filter tabs (`.filter-tabs`)
- Pill container: `padding:3px`, `--surface-3` bg, `--border`, `border-radius:999px`.
- Buttons: `padding:6px 13px`, 11.5/500. Optional `<span class="n">` for a count suffix (mono 10px, dimmed).
- `.active`: solid `--orange` bg, white text, count becomes `rgba(255,255,255,0.85)`.
- Used in two places on the dashboard: UTXOs (`#utxoTabs` — All / Regular / Contract / Swap / Spendable, each with count) and Recent Transactions (`#txTabs` — All / Received / Sent / Swaps, no counts; plus `#txSort` — Newest / Amount).

### 3.8 UTXO row (`.utxo-row`)
Grid `1.4fr 1fr 1.2fr` with `.utxo-head` mirror above. Columns:
1. `.col-txid` — `id` (mono 11.5, `--text-2`, ellipsis) + `amt` (mono 13/500, green).
2. `.col-pills` — vertical stack of 2 pills (script + type).
3. `.col-addr` — address (mono 11.5, `--text-2`) + `mempool-link` (orange mono uppercase 10 with external-arrow SVG).

Container has `#utxoList { max-height:222px; flex:0 0 auto }` to bound the list.

### 3.9 Recent transactions row (`.tx-row`)
Flex row. Left: 30×30 `.tx-arrow` square (rounded 9px) tinted green for `in`, red for `out`, with up/down arrow SVG. Middle: `.tx-mid` with id (mono 11) + `.meta-row` (conf badge, optional Swap badge). Right: `.tx-right` amount (colored green/red) + time (mono 9.5 uppercase).

### 3.10 Buttons (`.btn`)
Pill, 40px tall, 20px horizontal, mono-adjacent (sans actually) 12.5/600.
- Default (primary): solid orange, white text.
- `.ghost`: transparent, `--border-strong`, text `--text-2`.
- `.sm`: 30px tall, 14px horizontal, 11.5px.
- `.refresh-btn`: primary with rotating refresh-arrow icon on hover.

### 3.11 Badges & pills
| Class | Bg / border / text |
|---|---|
| `.pill.taproot` | purple-tinted, `--purple` text |
| `.pill.segwit` | blue-tinted, `--blue` text |
| `.pill.regular` | white 4% bg, `--text-2` |
| `.pill.contract` | amber-tinted, `--amber` text |
| `.pill.swap` | green-tinted, `--green` text |
| `.conf` | amber-tinted, `--amber` (partial conf) |
| `.conf.full` | green-tinted, `--green` (6/6) |
| Swap badge in tx row | blue-tinted inline style, sits next to `.conf` |

All are mono, uppercase, ~9.5px, `0.04–0.06em` tracking. 5–6px radius, 1px tinted border.

### 3.12 Total-value strip
`.total-value` — used in UTXOs view. Same gradient + border tint as hero card, 14px radius, label mono uppercase + value mono 28px orange.

### 3.13 Eyebrow chip
`.eyebrow` — pill with `pip` glowing orange dot + mono uppercase 10.5px label. Used as the section/step label on Coinswap Taker and Wallet Creation pages (`Welcome · First-time setup`, `Step 02 · Wallet`).

### 3.14 Modals
Not built yet. When needed: surface `--surface-2`, 18px radius, 1px `--border-strong`, no drop shadow (or reuse the shell shadow). Match `.card` chrome.

---

## 4. Design Decisions & Rationale

These are the explicit calls made in chat — preserve the reasoning.

1. **Hero balance card stays orange.**
   I briefly switched it to a white value to match Spendable; the user reverted. **Keep `bcard hero orange` with the orange gradient bg and orange value** — the hero is the only card with a tinted bg, that's how it reads as the hero.

2. **Spendable balance is white (`.bcard.white`).**
   `--text` value, white accent-line. Sits between the colored Swaps (blue) and Contracts (amber) cards as a deliberately neutral beat.

3. **Icons removed from the four balance cards.**
   Originally each `.label` had a trailing 14px stroke icon (wallet, swap, check, shield-check). Removed at user request because the labels (`Balance`, `Swaps`, `Spendable`, `Contracts`) are unambiguous on their own. The `.bcard .label .ic` CSS rule still exists but has no markup using it — fine to leave. **Do not put icons back on the balance cards.**

4. **Vertical side labels removed.**
   Originally each card had a `<span class="vlabel">` writing-mode vertical-rl strip along the left edge (`Wallet · Total`, `Swap · In`, `Available`, `Locked`). Removed at user request — felt like decoration, not information. The `.bcard` padding was tightened from `20px 20px 18px 36px` to `20px 20px 18px` and the hero from `22px 24px 22px 44px` to `22px 24px` accordingly. **Don't reintroduce vertical labels.**

5. **Accent line stays.**
   The 2px left-edge color stripe on `.bcard` (`.accent-line`) was kept — it's the surviving form of card identification after the icon and vlabel removals.

6. **Recent Transactions filter + sort tabs.**
   Added one filter tab group and one sort tab group in the card head:
   - Filter (`#txTabs`): **All** (default), Received (`dir==='in'`), Sent (`dir==='out'`), Swaps (`swap===true`).
   - Sort (`#txSort`): **Newest** (default, sorts ascending by `t` — the index field on each TX, low = newest), Amount (sorts descending by `Math.abs(parseFloat(amt))`).
   - State held in module-scoped `txFilter`, `txSort`. Both default to the first option. Changing either re-runs `renderTXs()`. Empty result renders a centered "No transactions match this filter" message.
   - `#txCount` updates with the filtered row count (e.g. `3 total`, or `1 tx` when count is 1).
   - The first TX in the dataset carries `swap:true` so the Swaps filter has at least one row.

7. **UTXO filter tabs (pre-existing pattern).**
   `#utxoTabs` has All / Regular / Contract / Swap / Spendable with `<span class="n">` count badges. Spendable = `type !== 'contract'`. Same active-state styling as the new TX tabs — reuse `.filter-tabs`.

8. **`grid-template-columns: 1.45fr 1fr 1fr 1fr` on balances.**
   Hero is wider so the 54px value never wraps. Don't drop below 1.4fr or the value clips on narrow viewports.

9. **No drop shadows on cards.**
   The shell carries the only elevation. Cards are flat surfaces separated by borders — keeps the whole UI calm.

10. **Page head uses 34px sans h1, not mono.**
    Mono is reserved for data-shaped things (addresses, amounts, txids, identifiers, statuses). Page titles are sans.

---

## 5. Conventions

### Use monospace for
- Addresses (`bcrt1q...`, `bcrt1p...`)
- Transaction ids and outpoints
- Bitcoin amounts and their `BTC` suffix (the `<small>`)
- Eyebrow labels / breadcrumbs / meta strips (uppercase, `0.08–0.12em`)
- Pill / badge / conf text
- Counts (`3 total`, `2 unspent`)
- Block height, version strings, network labels, "Last updated …" meta

### Use sans for
- Page titles, card titles, subtitles
- Button labels
- Filter tab labels (they're UI, not data)
- Body copy on welcome / setup pages

### Color coding
- **Orange** = brand / primary action / active state / hero accent. Used sparingly outside those slots.
- **Green** = incoming / confirmed / success / swap-type pill.
- **Red** = outgoing only. Not used for destructive UI yet — when adding destructive actions, prefer red text on `--surface-3` over a solid red bg.
- **Amber** = unconfirmed / contract / partial-conf.
- **Blue** = swap context, SegWit script.
- **Purple** = Taproot script. Don't repurpose it.

### Italic accent on H1 titles
On Coinswap Taker and Wallet Creation headers, the final emphasized word is wrapped in `<span class="accent">` — orange, italic, 600. **Don't italicize anything else.**

### Iconography
- **Allowed:** sidebar nav, tx-row direction arrows (up/down), refresh button, mempool-link external-arrow, view-all chevron, sidebar toggles, traffic lights.
- **Banned:** inside balance cards (no icons in `.label`), inside filter tabs, inside buttons except where listed above, inside pills/badges, anywhere as decorative filler.
- All icons are stroke SVG, `stroke-width:1.6–2`, round caps/joins, `currentColor`, 14–16px.

### Patterns to avoid
- Drop shadows on cards / rows / buttons / pills.
- Multi-stop decorative gradients (only the hero orange gradient and the hero progress bar use a gradient).
- Filler stats or "data slop" — every number must be referenced or actionable.
- Reintroducing icons or vlabels on balance cards (see §4).
- Mixing more than 2 colors on a single card.

---

## 6. Open Items

- **`UTXOs.html` and `Transactions.html`** — link targets only, not built. When designed, reuse `.card`, `.utxo-row` / `.tx-row`, `.filter-tabs`, and the page-head pattern. Expand the filter set with date range, amount range, and address search.
- **Modal/dialog component** — undefined. Define before the first Send / Receive flow.
- **Empty states** — Recent Tx and UTXO empty messages are inline placeholders. Promote to a real component (icon-free, mono caption, hint button) when more flows need them.
- **Focus rings** — no visible focus state on buttons / tabs / nav. Add `:focus-visible` outline in `--orange` before any keyboard-accessibility pass.
- **Disabled state** — undefined for buttons and tabs.
- **Toast / inline error patterns** — undefined.
- **Confirmation badge variants** — currently only `partial` (amber) and `full` (green). Add `pending` / `failed` if mempool reject states surface.
- **`Lock` button behavior** — visual only, no flow wired up.
- **Sidebar `Recovery`, `Log`, `Settings`** — nav-only stubs.

---

## 7. Project Instructions Blurb (paste into project memory)

> **Coinswap Taker — design conventions.** Desktop wallet UI for a privacy-focused Bitcoin Coinswap client. Dark theme on `#08080a`; surfaces `#101014` / `#16161a` / `#1c1c22`. Borders are `rgba(255,255,255,0.08)`, hover `0.14`. Brand primary `--orange #E85002` (hover `#FF6A2A`). Signal colors: green `#2fbf71` (in / confirmed / swap pill), red `#ff4d5a` (out only), amber `#ffb547` (unconfirmed / contract), blue `#5b8def` (swap context / SegWit), purple `#a979ff` (Taproot). Two fonts: SF Pro sans for UI, SF Mono for *all* data — addresses, txids, BTC amounts + suffix, eyebrows, counts, pills, timestamps, block heights. Page H1 is 34px sans / 700 / -0.035em. Hero balance value is 54px mono / 700. Pills and conf badges are 9.5px mono uppercase, tinted bg + 1px tinted border, 5–6px radius. Buttons are 999px pills, 40px (or 30px `.sm`). Cards have no drop shadow — only the shell does (`0 40px 120px -20px rgba(0,0,0,0.7)`). Filter tabs are pill-shaped, orange when active. Balance cards have **no icons and no vertical side labels** — just a 2px colored accent-line, an uppercase mono label, a mono value, and a sentence sub. Hero balance stays orange (gradient bg + orange value); the other three are blue / white / amber. Icons are allowed in sidebar nav, tx-row direction arrows, refresh / mempool / view-all chevrons — banned on balance cards, in filter tabs, in pills, and as decoration. No filler stats. Italic only on the final accent word inside a welcome H1.
