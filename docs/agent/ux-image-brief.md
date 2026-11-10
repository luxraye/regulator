# UX polish + image refresh brief (strategy lead → Antigravity)

**Goal (owner's words):** "I want them to open it and be like *wow*, and be eager to go through all the sections." The judging panel is **not** all developers. Sophistication we have to *explain* loses us marks; depth that is **self-explanatory** wins. Beautiful = easy to convey. Every section should teach a first-time visitor **without a guide**.

Branch: cut a fresh branch from `main` for this (e.g. `feat/ux-polish`), open a PR, do not touch production. This is a visual/UX pass — no schema or engine changes. Keep all existing features working; this is about **presentation and progressive disclosure**, not removing capability.

---

## Principle: show the benefit, hide the machinery (progressive disclosure)

Across every dense/technical page, lead with one plain-language sentence of *what it does and why it matters*, and tuck the technical depth behind disclosure:

1. **Collapsible sections (accordions)** for technical detail. The page opens showing the summary; "How it works", "Technical details", "Rules & checks" expand on click. Default-collapsed on anything an applicant doesn't need to act on.
2. **Info affordances** — a small `(i)` button in the corner of technical elements (stat tiles, the rules fingerprint, the Faithfulness Report, scorecards). Tap/hover → a one-sentence plain-language tooltip. Examples:
   - *rulesHash / "Verify these rules"* → "A tamper-proof seal. It proves the rules an entry was judged under were never secretly changed."
   - *Faithfulness Report* → "A sealed receipt that proves the entry wasn't altered after the deadline."
   - *Blind scoring* → "Judges score without seeing who applied, so scores stay fair."
   - *Hash-chained audit* → "Every action is locked to the one before it, so nothing can be edited in secret."
3. **Plain-language pass on user-facing copy.** Keep the technical names, but make the *primary* label human. "Tamper-proof seal" first, "rulesHash" as the small secondary caption. Do this on the public pages, the innovator flow, and dashboard headers — not inside code/API docs.
4. **Teach in place:** captions under charts, example/empty-state hints ("No entries yet — submitted ideas appear here once screening starts"), and a one-line "what this page is for" under each dashboard title.

---

## Fix 1 — Public top navbar (clumsy, too many free-floating tabs)

File: `src/components/layout/public-header.tsx`. Today it renders **8 free-floating text links** (Calls, How it works, Eligibility, Track, Funded, Community, About, Judges). Group them into **3 dropdown "cards"** plus the sign-in button, so the bar reads as structured, not scattered. Each dropdown is a compact panel where every item has an icon + a one-line description (this is where the "learn without guidance" starts, right in the menu).

Proposed grouping (keep all destinations, just nested):

- **Apply** ▾ → Open calls (`/calls`) · Check eligibility (`/eligibility`) · Track an entry (`/track`)
- **Discover** ▾ → How it works (`/#how-it-works`) · Funded projects (`/funded`) · Community forum (`/community`)
- **About** ▾ → About the portal (`/about`) · For judges (`/judges`) · FAQ (`/faq`)
- Standalone on the right: **Search**, language toggle (EN/TN), and the **Sign in / My dashboard** button (primary).

Each dropdown item example: `[icon] Check eligibility — See in 30 seconds if your team qualifies`. Keep the top utility strip (CEDA name, language, `*161#`). On mobile, render the same three groups as collapsible accordion sections in the existing drawer. Make the dropdowns keyboard-accessible and close on outside-click/escape.

---

## Fix 2 — Hero image → lab interior, and a stronger "wow" landing

- Replace the hero `public/images/hero-innovation.jpg` (currently "young developers at laptops") with a **modern innovation/science lab interior** — bright, clean, ideally with people working. Landscape, high-res, used at `fill`/`object-cover`.
- Update the credit line in `src/components/home/hero.tsx` (lines ~45–52): the current "Photo: Deo photographer, CC BY-SA 4.0" credit is for the old Wikimedia image — **remove it** once replaced, since the new sources (below) are license-free with no attribution required.
- Also update the social/OG image references to `hero-innovation.jpg` in `src/app/layout.tsx` (lines ~33, ~45) — re-export/optimise so the share card looks right.
- Hero copy: one bold, human headline + one plain sub-line (benefit, not feature) + two clear CTAs ("Apply now" / "See how it works"). Keep it uncluttered — whitespace is part of "wow".

---

## Fix 3 — Image refresh across the site

All candidates below are from **Pexels** and **Unsplash**, whose licenses allow free commercial use **with no attribution required** (fits the "no paid services / safe for judging" rule). Download the best-fitting shot from each page, crop to the aspect the slot uses, convert to optimised `.webp` (keep the existing filename so references don't change, except the hero which stays `.jpg` or switch all refs to `.webp` consistently), and target < ~250 KB each. Prefer bright, modern, **people-present**, Botswana/African-context shots where offered.

| Slot (file) | Used for | New theme | Candidate pages |
|---|---|---|---|
| `images/hero-innovation.jpg` | Landing hero + OG | **Lab interior / innovation lab** | pexels.com/search/lab%20interior/ · pexels.com/photo/equipment-inside-a-laboratory-9574569/ · pexels.com/photo/a-laboratory-with-a-bench-a-table-and-a-sink-18471461/ · unsplash.com/s/photos/innovation-lab · unsplash.com/s/photos/laboratory-technology |
| `images/hero.jpg` | Call/Instance banner fallback | Clean innovation/workspace | unsplash.com/photos/six-colleagues-collaborating-around-a-conference-table-with-laptops-RdEFWm0N84o |
| `photos/team-laptop.webp` | Homepage section | Diverse team collaborating / celebrating | unsplash.com/photos/a-diverse-group-of-colleagues-celebrating-success-in-an-office-Kxo17w7BurY |
| `photos/farmer-field.webp` | Sector A — Agriculture | African farmer + crops/tech | pexels.com/photo/african-farmer-inspecting-crops-in-field-34411687/ · pexels.com/search/digital%20farming/ |
| `photos/engineer.webp` | Sector B — Digital & Technology | African tech team on laptops | unsplash.com/photos/african-american-businessman-using-laptop-while-working-in-the-office-8pqD7FjHu5o |
| `photos/maker-sewing.webp` | Sector C — Manufacturing & Mining Services | Welding / fabrication workshop | pexels.com/photo/industrial-welder-working-in-a-workshop-31349534/ · pexels.com/photo/welder-at-work-17406672/ |
| `photos/elephants.webp` | Sector D — Tourism & Creative | Creative maker/artisan (fresher than safari cliché) — or keep a tasteful tourism shot | pexels.com/photo/a-man-using-a-loom-17649771/ · pexels.com/photo/nigerian-basket-weaver-in-outdoor-market-33337889/ |
| `photos/solar-rural.webp` | Sector E — Green Energy & Water | Solar farm (Kalahari-appropriate) | unsplash.com/photos/a-large-field-of-solar-panels-in-the-desert-E4XEBPEkgUs · pexels.com/photo/a-solar-farm-at-the-desert-6996421/ |
| `photos/founder-macbook.webp` | Sector F — Health, Education & Social | African healthcare / community health | pexels.com/photo/crop-nurse-in-mask-and-gloves-with-papers-6098054/ · pexels.com/photo/doctor-showing-diagnosis-to-black-woman-patient-in-hallway-of-clinic-6303645/ |
| `photos/okavango.webp` | About page banner | Keep (Botswana identity) — only swap if a more human shot fits | — |

Also review the unused files (`city-aerial`, `delta-aerial`, `founder-laptop`, `grain-hands`) and either wire the good ones into a section or drop them. Add an award/celebration image to the **Funded showcase** and **award** moments (the Unsplash celebration shot above) — those are natural "wow" beats.

---

## Fix 4 — "Wow" polish pass (first pass, we'll iterate)

- Consistent visual hierarchy and generous whitespace; one confident accent colour (CEDA orange per brand memo); no cursive/script fonts.
- Each public section opens with a benefit headline + supporting line, then the detail.
- Tasteful micro-interactions (hover lift on cards, smooth accordion expand, subtle section reveals) — nothing heavy.
- The **judges' tour** (`/judges`) should feel like a guided story of the applicant journey, with the "wow" integrity features (seal, receipt, audit) shown with their plain-language `(i)` explanations.
- Keep the "Demo data: fictional teams" banners from Phase 9/10.

Do a first pass, push the PR, and I'll review screenshots and send refinements. Prioritise Fix 1 (navbar) and Fix 2 (hero) first — they're the strongest first-impression wins.
