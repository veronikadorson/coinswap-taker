# Style Guide

_Started 2026-05-11 18:47 UTC_

---

## User

Take these as a inspiration, go through them once. don't start designing now

## User

Use this style when i say

## User

go through this

## Assistant

_[tool: read_file]_

Read it — got the full picture.

**Coinswap Taker** desktop wallet, dark theme, terminal/CLI heritage. Key things locked in my head:

- **Palette:** `#08080a` bg, `#101014/#16161a/#1c1c22` surfaces, `--orange #E85002` brand, signal colors green/red/amber/blue/purple with specific roles
- **Type:** SF Pro sans for UI, SF Mono for all data (addresses, txids, amounts + BTC suffix, eyebrows, pills, counts, timestamps). 34px sans H1, 54px mono hero value
- **Shell:** macOS traffic lights + mono titlebar, collapsible 68/200px sidebar, one elevation (shell only), cards are flat with borders
- **Balance cards:** no icons, no vlabels, just 2px accent-line + mono label + mono value + sentence sub. Hero stays orange-gradient
- **Pills/badges:** 9.5px mono uppercase, tinted bg + tinted border
- **Italic accent rule:** only the final word in a welcome H1
- **Banned:** card icons, filter-tab icons, drop shadows on cards, filler stats, decorative gradients

Ready when you tell me what to design.

## User

okay so now we'll make a market page. 

this is the current design. just have a look at values and structure. don't take this as an inspiration for design. keep the design as per handoff file. 

i'll send you a wireframe how to design it. till then don't design anything

## Assistant

_[tool: view_image]_

Got the structure and values from the current Market page:

- **Header:** "Coinswap Market" + subtitle "Live view of the current coinswap market" + Refresh button
- **Market Data strip:** `N makers available` pill
- **Fee Calculation block:** formula `Total Fee = Base Fee + (Swap Amount × % Fee Rate) + (Refund Locktime × Swap Amount × % Time Rate)` + locktime note `20×(n+1)` where n = maker index
- **Two stat cards:** Total Liquidity (BTC), Total Fidelity Locked (sats)
- **Tabbed maker table:** Good Makers / Bad Makers / Unresponsive, columns: Protocol · Tor Address · Base Fee · % Fee Rate · % Time Rate · Min Swap Size · Max Swap Size · Fidelity Bond
- **Empty state:** "No makers found" + Refresh

Standing by for the wireframe.

## User

now act as a senior UI designer and design it according to the design system given in the handoff file. ask me anything you want

## Assistant

_[tool: view_image]_

_[tool: snip]_

_[tool: questions_v2]_

Looking at the wireframe vs current design, there are a few decisions I want to lock in before designing:

## User

Questions answered:
- fee_calc_block: Remove entirely — Calculate action per row replaces it
- calculate_action: Opens a modal with inputs (swap amount, locktime position) and shows the resulting fee breakdown
- stats_set: Fidelity Locked · Total Liquidity · Active Makers (as wireframe)
- protocol_column: Drop it — wireframe is right
- tabs_meaning: Different columns per tab (tailored)
- table_extras: Per-row mempool-link / external arrow on Tor address, Pagination or 'load more', Sticky header on scroll
- page_meta: No meta strip
- italic_accent: No accent — plain 'Market' (matches Dashboard's 'Wallet')
- amount_units: All in BTC (consistent, but small fees become 0.00001…)
- variations: 1
- empty_state: Helpful: explain why (Tor circuit, sync state) + Refresh + 'Check connection'

## Assistant

_[tool: snip]_

_[tool: list_files]_

_[tool: update_todos]_

Got all the answers. Building now.

Plan:
- Single `Market.html`, follows handoff tokens/components exactly
- Shell + titlebar + collapsible sidebar (Market active)
- Page head: H1 "Market" (no accent, no meta) + Refresh button
- 3 stat cards (no hero): Fidelity Locked · Total Liquidity · Active Makers, each with colored accent-line
- Card with 3 tabs, tailored columns per tab, sticky header, load-more pagination
- Tor address cell with mempool-link external arrow
- "Calculate" per row → modal with swap amount + locktime position inputs, live fee breakdown
- Helpful empty state (Unresponsive tab demos it: reasons list + Refresh + Check connection)
- All amounts in BTC

_[tool: write_file]_

_[tool: copy_starter_component]_

_[tool: delete_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

_[tool: update_todos]_

_[tool: snip]_

Market page is built — `Market.html` with `market.css` and `market.js`. Three stat cards (Fidelity / Liquidity / Active Makers), tabbed maker table with tailored columns per tab, sticky header, Tor address with mempool external link, Calculate modal with live fee breakdown, and a helpful empty state demo'd on the Unresponsive tab.

## User

Remove BTC from all the values and % sign. and remove mempool btn

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Done — BTC and % symbols stripped from values, mempool button removed.

## User

Make values of base fee, Fee rate, time rate a little greyish so that it looks disable and non-editable

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Done.

## User

In the calculate popup add the formula of fee calculation as well

## Assistant

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

Added the formula in a tinted orange block above the breakdown.

## User

okay so now we'll make a Swap page. 

this is the current design. just have a look at values and structure. don't take this as an inspiration for design. keep the design as per handoff file. 

i'll send you a wireframe how to design it. till then don't design anything

## Assistant

_[tool: view_image]_

Got the structure. Noting key values from the current Swap page:

**Left column — Initiate Swap**
- Warning banner: "If swap with only one maker, the maker can deanonymize you. Recommended minimum hop = 2."
- UTXO selection toggle: Auto Select UTXOs / Manual Select UTXOs
- Amount to Swap input with Sats / BTC / USD unit toggle + Max button
- Sub-line: `= 0.00000000 BTC · $0.00 USD` and `Max swappable: 0 sats`
- Number of Hops: 3 / 4 / 5 / Custom (each shows "N makers")
- Helper text: "More hops = better privacy, higher fees"
- Inline alerts: "Enter a swap amount", "Loading wallet balances…"
- Available Makers count

**Right column — Swap Summary**
- Swappable Balance (large green value)
- Swap Amount · Makers · Top Maker Candidates · Hops · Estimated Time · Estimated Maker Fee
- Funding Txs · Avg Funding Tx Size · Network Fee (sat/vB) · Estimated Total Fee
- You Receive (highlighted)

Standing by for the wireframe.

## User

now act as a senior UI designer and design it according to the design system given in the handoff file. ask me anything you want.
here is the wireframe

## Assistant

_[tool: view_image]_

_[tool: questions_v2]_

## User

Questions answered:
- hop_options: show the warning just like where the wireframe does
- units: Sats + BTC toggle
- manual_panel: Checkbox list of UTXOs (id, amount, script type pill) with running total
- warning_treatment: Inline help under the hop count, no banner
- summary_fields: Swap amount, Number of hops, Makers, Top maker candidates (orange list of Tor addrs), Funding transactions count, Avg funding tx size, Estimated time (as the prominent chip at top), Total estimated fee (with maker + network breakdown sub-block), Network fee rate (sat/vB), You receive (highlighted at bottom), as per wireframe
- swappable_card: Separate card above Swap Summary (per wireframe)
- start_swap_loc: Bottom of the Initiate Swap card, full-width (per wireframe)
- max_button: Yes, but as an orange link below the input ('Use max swappable: X sats')
- page_title: 'Initiate Swap' (per wireframe)
- amount_validation: Disable Start Swap + hint in a small mono caption
- anything_else: Don't use too many colors. use it according to the handoff file

## Assistant

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: done]_

_[tool: fork_verifier_agent]_

_[tool: update_todos]_

Built `Swap.html` with `swap.css` + `swap.js`. Two-column layout matching the wireframe — left card has Amount (with Sats/BTC toggle and "Use max swappable" orange link), Auto/Manual UTXO selection with checkbox list + running total, 5 hop boxes (2/3/4/5/6+) with inline amber warning when 2 is picked, and a disabled Start Swap until the amount validates. Right column has the green Swappable Balance card and the Swap Summary with the prominent estimated-time pill, top maker candidates as orange tor addresses, a fee sub-block (maker + network with sat/vB), and the You Receive row highlighted at the bottom. All live-recomputes as you change inputs.

## User

add the warning before selecting the swaps "Warning: If swap with only one maker, the maker can deanonymize you. Recommended minimum hop = 2."

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Added the warning banner just above the hop selector — amber tint, mono caps "Warning" label, full message.

## User

Apply comment

## Assistant

_[tool: str_replace_edit]_

_[tool: done]_

## User

few changes for the market page:-
1. Remove "check connection" button
2. remove "Polled via tor" text
3. add checkboxes to all the rows of good markers so that people can select markers
4. on the bottom instead of "load more makers" button have "swap with selected makers" button.
5. On fidelity bond column put a arrow on beside every value.

can you do all this and ask me questions if you didn't understand anything

## Assistant

Quick clarification before I apply the changes:

**Fidelity Bond arrow** — what's its purpose? Options:
1. **Sort arrow** — clicking the column header sorts by fidelity bond (arrow shows direction ↑/↓)
2. **Trend indicator per row** — small ↑/↓ next to each value showing whether that maker's bond went up or down vs last poll
3. **External link** — click the arrow to view the bond UTXO on mempool (like the mempool link I removed earlier)
4. **Just a visual decoration** — a small ↗ glyph after each value with no action

The rest I'm clear on. Confirm #5 and I'll ship it.

## User

3. External link — click the arrow to view the bond UTXO on mempool

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: done]_

All five changes applied:
1. ✅ Check connection button removed
2. ✅ "Polled via Tor" removed
3. ✅ Checkboxes on good-maker rows — click anywhere in the row to toggle, selected rows get the orange tint
4. ✅ "Swap with selected makers" button at bottom (disabled until ≥1 selected; links to Swap.html)
5. ✅ External-link arrow next to every Fidelity Bond value (mempool target)

## User

Few more changes :-
1. Make 'Base Fee', 'Fee Rate', 'Time Rate' in white colour, and 'Min Swap', 'Max Swap', 'Fidelity Bond' grey. 

2.  Add Sort arrow to
Base Fee, Fee Rate, Time Rate, Min Swap, Max Swap, Fidelity Bond  — clicking the column header sorts the column. 

can you do all this and ask me questions if you didn't understand anything

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Both changes applied:
1. ✅ Base Fee / Fee Rate / Time Rate now white; Min Swap / Max Swap / Fidelity Bond now grey
2. ✅ Sort arrows on those 6 columns — click to sort asc, click again for desc. Active column turns orange with the direction arrow filled in. Selection state survives sort.

## User

Few changes for the swap screen:
1. remove the 'initate swap' label inside the section. as it is a repitition.
2. Add option to select makers as well beside 'select UTXO' option. you can make it as tabs.
3. Make 'Amount to Swap', 'Select UTXOs', 'Number of Hops' titles, and change there color to white to make it more visible 

tell me what you understood and any questions you have first

## Assistant

Here's what I understood — confirm or correct before I build:

**1. Remove "Initiate Swap" h3 inside the card.** Just removes the inner h3; the eyebrow "Step 01 · Configure" stays in the top-right of the card head. ✅ Clear.

**2. Maker selection as tabs.** I read this as: turn the current "Select UTXOs" block into a tabbed section with two tabs — **Select UTXOs** | **Select Makers** — each tab keeping its own Auto / Manual sub-toggle and content panel. Maker tab would show a checkbox list (like the Market page good-maker rows: tor + base/fee/time rate + select).
- Is that right? Or do you want **Makers** as a separate field below UTXOs (not tabbed)?
- For the Maker tab, should it pre-fill with whoever was selected on the Market page (via localStorage), or just show its own list?

**3. Bigger, whiter section titles** for Amount to Swap / Select UTXOs / Number of Hops. I'll switch them from 10.5px mono grey caps to 14px sans white (semibold, sentence case). Keep the same labels otherwise.
- Or do you want them mono uppercase but white? (Less hierarchy change, more matching the rest of the data-ink.)

Tell me the answers and I'll ship it.

## User

1. yes but remove Step 01 · Configure" in the top-right of the card head. 

2. yes i want makers tabbed. For the Maker tab, should it pre-fill with whoever was selected

## User

1. yes but remove Step 01 · Configure" in the top-right of the card head. 

2. yes i want makers tabbed. 
For the Maker tab, -pre-fill with whoever was selected

3. yes keep the vibe and hierarchy  going

## Assistant

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: done]_

All three changes shipped:

1. ✅ "Initiate Swap" h3 and "Step 01 · Configure" eyebrow removed from the card head
2. ✅ Picker tabs **Select UTXOs | Select Makers** above the panel. Each tab has its own Auto / Manual sub-toggle and content. Manual Makers shows a checkbox list with Tor address, fee rate, and fidelity bond. When you arrive from Market via "Swap with selected makers", Swap auto-opens the Makers tab in Manual mode with those makers pre-checked.
3. ✅ Section titles (Amount to Swap / Select UTXOs / Number of Hops) bumped to white, slightly larger mono caps — same vibe, more visible

## User

rest is good. number 2 is not what i imagined. let me give you a wireframe of what i had in mind. here you go. do you had clarity now? let me know

## Assistant

Got it. Comparing the wireframe to what I built:

- **Picker tabs** — look about right (large pill tabs, active pill filled). I'll keep them.
- **Auto / Manual sub-toggle** — that's the real change. You want it as **two text links separated by a slash**: `Auto select / manual select`, with the active one underlined — NOT the side-by-side button grid I built.
- **Panel below** — just one panel (not two stacked boxes for auto-note and manual-list). The same panel shows either the auto summary or the manual list, switched by the text links.

Did I get it right? Let me know and I'll swap in the text-link toggle and unify the panel.

## User

yes

## Assistant

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

Done — swapped the Auto/Manual button grid for the text-link toggle:

`Auto select / Manual select` — active link is white with an orange underline, separated by a faint slash. Below it sits the single panel (either the auto summary or the manual checkbox list).

## User

okay so now i want this page to look kinda different. so instead of keeping orange as a primary color, make blue color primary.

understood?

## Assistant

Yes — just the **Swap page** (Swap.html / swap.css / swap.js), nothing else. I'll swap every orange-primary usage on this page (the picker tabs active state, hop buttons active, Start Swap button, max link, ETA pill, sidebar "Swap" active state, etc.) over to blue, and the Swappable balance and "You receive" greens stay as-is.

Quick check before I do it:
1. Use the design system's blue token (`--blue #5b8def`) so it matches Dashboard's SegWit/Swaps usage — confirm?
2. Sidebar "Swap" active item — keep orange (since it's part of the cross-page nav system) or also turn blue on this page?

Tell me the answers and I'll swap it.

## User

yes. also make swappable balance blue. sidebar also change to blue

## Assistant

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: grep]_

_[tool: done]_

Swap page is now blue-primary. Brand mark, sidebar Swap active item, picker tabs, hop buttons active, Start Swap CTA, Sats/BTC toggle, max link, ETA pill, Auto/Manual underline, checked-row tint, and the Swappable Balance card (accent + value) all switched to `#5b8def`. The Node OK dot and "You receive" stay green; warning stays amber — per the handoff color roles.

## User

OKay now make a very nice amination for the swap taking place with 3 markers, after user clicks on start swap

## Assistant

_[tool: copy_starter_component]_

I'll build a separate `Swap-Progress.html` that the Start Swap button navigates to, using the animation starter. 16:9 stage, ~18s, full story arc — circuits establishing → funding → atomic-swap hops → destination receives.

_[tool: read_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built the swap-in-progress animation.

**What it does (18 seconds, looping):**
1. **0–3s · Initiating** — 5 nodes pop in left to right: Your wallet → M1 → M2 → M3 → Receiving
2. **3–6s · Establishing Tor circuits** — Curved blue Tor-routed arcs from You to each maker with traveling pulses; connectors fill in; status pills cycle dim → amber → green
3. **6–9.5s · Funding HTLC contracts** — 3 coin packets travel from You to each maker; HTLC lock badges appear on each
4. **9.5–14s · Routing atomic swap** — Coin packet hops down the chain (You → M1 → M2 → M3 → Dest), each maker flips to "Forwarded" with check
5. **14–18s · Finalizing** — Preimage propagates, success ripples burst from the Receiving node, "Swap complete" badge

**Chrome:** Coinswap brand top-left, Mainnet pip top-right, mono activity log in the middle-bottom with timestamped lines, and a 5-stat strip at the bottom (Amount · Hops · Fee · You receive · ETA countdown).

Start Swap on Swap.html now navigates to it. Verifier is checking it now.

## User

Verifier agent check completed

## Assistant

Verifier confirmed it's clean. The Swap in Progress animation is live at `SwapProgress.html`, and `Start Swap` on Swap.html routes there. Have a look and let me know what you'd like to adjust.

## User

Okay now we will create the success screen i'll give you reference don't design anything now. this is the curent page design. don't take inspiration from this just the layout

## Assistant

Got it — looked at the current success/report page. Noting the structure and key data fields:

**Top stats strip (5 cards):**
- Swap Amount: `0.00500000 BTC` / `500,000 sats`
- Duration: `0m 39s` / `39.8s total`
- On-Chain Artifacts: `2` — Transaction IDs extracted
- Swap Partners: `2` — Makers recorded
- Total Fee: `0.57%` / `2,858 sats`

**Transaction Artifacts** card (left, wider):
- Outgoing Contract (amber accent) + full txid
- Incoming Contract (green accent) + full txid
- Each row has copy + external-link icons

**Fee Details** card (right):
- Maker Fees: 2,550
- Mining Fees: 308
- Total: 2,858 / 0.00002858 BTC

**UTXO Summary** card (right, below Fee Details):
- Outgoing Regular/Swap UTXOs: 1
- Incoming Swap UTXOs: 1

**Swap Partners** card (bottom, full-width):
- Maker 1 + Maker 2 chips with Tor address, clickable for details

**Bottom action bar:**
- Export Report (ghost) + Back to Swaps (primary orange)

Also note the small "Report Summary" header at top mentioning Rendering Mode / Artifacts / Makers Recorded / Protocol Metadata: Taproot.

Standing by for your reference/wireframe of the new design.

## User

here is the wireframe of how i want the page to look like. follow this . ask what you don't understand

## Assistant

Got the wireframe. Before I build:

1. **Color primary** — keep blue (matching Swap.html / SwapProgress.html) or revert to orange brand for this page?

2. **Top stat strip** — wireframe drops the 5 cards (Swap Amount, Duration, On-Chain Artifacts, Swap Partners, Total Fee). They're folded into the Amount + Time inside Swap Summary instead. Confirm — drop all 5 cards, or keep some as supplementary stats elsewhere?

3. **Swap Partners section** — wireframe doesn't have it. Drop entirely, or surface in the Fee details card / as a small mono list at the bottom of Swap Summary?

4. **Fee details card content** — wireframe is empty. Should I include Maker Fees / Mining Fees / Total (like the current page), or different rows? Also: include Total %, Total in sats AND BTC, or just one unit?

5. **Amount units** — Amount big in BTC with sats sub-line, or sats big with BTC sub-line?

6. **Incoming/Outgoing contract rows** — wireframe shows empty input-looking boxes. Treat as read-only display rows with the full txid in mono + copy + mempool external-link icons (per design system)?

7. **"Swap Completed" header** — plain text per wireframe, or add a small green success badge / check icon next to it? Italic accent on a word? (Handoff says italic only on welcome H1s — confirming we follow that.)

8. **Auto-navigate from SwapProgress** — when the 18s animation finishes, should it auto-navigate to this success page, or stay looping until user clicks something? Currently it loops.

9. **"Back to Swap" button** — does it go to Swap.html (start a new swap) or Wallet/Dashboard? Also styling: blue primary (since this page is part of swap flow) or orange?

Tell me and I'll build.

## User

1. keep blue
2. yes follow the wireframe
3. small mono list works
4. yes include all that and in sats
5. all sats
6. yes
7. "Swap Completed" header - make it feel like a successful. you can decide for me
8.  make it a new page. after animation ends
9. blue

## Assistant

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: str_replace_edit]_

_[tool: fork_verifier_agent]_

Built **SwapSuccess.html**.

**Layout (per wireframe, blue primary):**
- H1 **"Swap Completed"** with green check ripple + "Settled" pip + session/block meta
- **Swap Summary card** (left, wider) — big sats amount with BTC sub-line and a blue Duration pill, then Transaction Artifacts (Incoming green / Outgoing amber, each with copy + mempool icons), then a mono Swap Partners list (3 makers, truncated Tor with View link). Export report ghost button in the footer.
- **Fee details card** (right) — Maker fees · Mining fees · Total (blue, with sats + BTC sub), and a "0.058% of swap amount" strip below.
- **Back to Swap** primary blue button below Fee details.

**Flow wiring:** SwapProgress.html now auto-navigates to SwapSuccess.html after 18.5s (animation no longer loops, and starts from t=0 every visit). Back to Swap clears the maker handoff and returns to Swap.html.

Verifier is checking.

## User

Verifier agent check completed

## Assistant

Verifier confirmed clean. The full swap flow is now wired end-to-end: **Swap.html** → click Start Swap → **SwapProgress.html** (18s animation) → auto-navigates to **SwapSuccess.html** → Back to Swap returns. Have a look at SwapSuccess.html and let me know what to adjust.

## User

Analyze the design and extract a complete, implementation-ready design system. Be specific and use exact values from the design; where something isn't shown explicitly, infer a sensible value that fits the visual language and flag it as "[inferred]".

Cover each section:

1. **Color palette** — primary, secondary, accents (with hex), neutral scale (bg, surface, border, text), semantic colors (success/warning/error/info), and any gradients or opacity patterns.

2. **Typography** — font families with fallbacks, full type scale (size, line-height, weight, letter-spacing), heading hierarchy H1–H6, body styles, and special treatments (labels, captions, code).

3. **Spacing & layout** — base unit and spacing scale, container widths, breakpoints, grid (columns/gutters), and common padding/margin patterns.

4. **Borders & radii** — radius scale (none → full) and border widths/styles.

5. **Elevation** — shadow scale from subtle to prominent, with use cases.

6. **Components** — for each component you can identify (buttons, inputs, cards, nav, modals, etc.): anatomy, variants, sizes, and all states (default, hover, focus, active, disabled).

7. **Iconography** — style (line/filled), stroke weight, size scale, color rules.

8. **Motion** — transition durations, easing curves, and interaction behaviors.

9. **Tokens** — output the system as:
   - CSS custom properties
   - A W3C DTCG-compatible JSON token file
   - A Tailwind config snippet

10. **Guidelines** — do's and don'ts inferred from the design, plus accessibility notes (contrast ratios, focus indicators).

Structure the output with clear headings so I can drop sections directly into documentation.

## Assistant

_[tool: write_file]_

## Assistant

_[tool: write_file]_

_[tool: show_to_user]_

Wrote it to **`Design-System.md`** — open in your tab now.

Sections cover:
1. **Color palette** — orange (wallet) + blue (swap) brand primaries, neutral 5-step scale, semantic green/red/amber/blue/purple with their tint-bg/border recipe, single gradient inventory
2. **Typography** — SF Pro / SF Mono pair, full type scale from `--hero 54px` down to `--pill 9.5px`, heading hierarchy, italic-accent rule
3. **Spacing & layout** — de-facto 4–62px scale, shell geometry, all grid templates, 4 breakpoints
4. **Borders & radii** — full radius scale + ad-hoc radii in use
5. **Elevation** — one shell shadow + glow patterns; cards stay flat
6. **Components** — anatomy and all states for 20+ components (buttons, sidebar, cards, balance cards, filter tabs, picker tabs, auto/manual links, pills, eyebrow, inputs, checkbox rows, status pills, modal, contract row, icon button, hop button, warning banner, ETA pill, activity log)
7. **Iconography** — stroke 1.6/2/3, size scale, allowed vs banned placements
8. **Motion** — durations, easing library, interaction patterns
9. **Tokens** — CSS custom properties, W3C DTCG JSON, Tailwind config — all three formats ready to drop in. Includes the `[data-flow="swap"]` remap that swaps the primary from orange to blue.
10. **Guidelines** — do/don't list with WCAG contrast table and concrete a11y action items (focus rings, disabled states, hit targets, aria-live for activity log)

Inferred values (hover blue, surface-4, glow tokens, breakpoints, easing cubic-béziers, durations) are flagged inline with `[inferred]`.

## User

<system-info comment="Only acknowledge these if relevant">
User is viewing file: Design-System.md
</system-info>

<pasted_text name="Pasted text (29 lines)">
Analyze the attached design and produce a complete developer handoff document. Goal: a developer should be able to implement this without needing to ask follow-up questions about intent.

Cover each section:

1. **Overview** — what this screen/component does, primary user flows, and where it fits in the broader app.

2. **Layout structure** — break the design into a component tree (parent → children). Note which sections are reusable vs one-off.

3. **Per-component specs** — for each component:
   - Exact dimensions, padding, margin, gap
   - Typography, color, border, radius, shadow tokens (reference the design system, don't hardcode)
   - All states: default, hover, focus, active, disabled, loading, error, empty
   - Variants and props (with TypeScript-style type signatures)

4. **Responsive behavior** — how the layout adapts at mobile (<640px), tablet (640–1024px), and desktop (>1024px). Note what reflows, hides, stacks, or resizes.

5. **Interactions & motion** — every interactive element: trigger, behavior, transition duration, easing. Include keyboard interactions (Tab order, Enter, Esc, arrow keys).

6. **Content & data** — what data each component needs, expected shape (JSON schema or TS interface), loading states, error states, empty states, and content limits (max characters, truncation rules).

7. **Accessibility** — semantic HTML structure, ARIA roles/labels, focus management, contrast verification, keyboard navigation, screen reader announcements.

8. **Assets** — list every icon, image, and illustration needed, with recommended format (SVG, PNG @2x/@3x) and naming.

9. **Edge cases** — long text, missing data, slow networks, permission errors, zero/one/many states.

10. **Implementation notes** — suggested file/folder structure, recommended libraries (if any), and anything tricky a dev should know upfront (z-index conflicts, scroll behavior, focus traps, etc.).

Format the output as a markdown document with clear headings, code blocks for type signatures, and tables where they help (e.g., breakpoints, states). Reference design tokens by name rather than hardcoding values.
</pasted_text>

## Assistant

Before I write it — which screen(s) is the handoff for?

The prompt says "the attached design" but nothing's attached. Best guesses, in order:

1. **Full Swap flow** — Swap.html → SwapProgress.html → SwapSuccess.html (the most recent work)
2. **SwapSuccess.html only** — the screen you're closest to having just finished
3. **The whole product** — Dashboard, Market, Welcome, Wallet Creation, plus the Swap flow

Tell me which and I'll produce the handoff. The doc will reference the tokens in `Design-System.md` rather than hardcoding values.

