# Design brief: make it human, simple and "wow" (Phase 12)

**From:** the strategy lead, on the owner's instructions. **To:** Antigravity. **Branch:** create `feat/human-ux` from `main`, open a draft PR into `main` after the first commit, and push after every meaningful step. Report in `docs/agent/reports/12-human-ux.md`, with before/after screenshots of the home page, the navbar (desktop and mobile), `/instances/ceda-hackathon-2026`, the Instance Studio and one dashboard. **Do not roll out to App Hosting until INBOX.md approves it.** Keep CEDA branding (colours, fonts, logo) exactly as it is now. **Never invent facts about the real hackathon.** Keep CI green.

## Why

The platform already has every feature the judges need. The problem is that it *feels like too much* and reads like it was written for developers. The panel is not all developers. We win on the human element: a judge should open the site, think "wow", and want to explore every section *without anyone explaining it*. To the owner, beautiful means easy to understand. If we have to explain a sophisticated feature, it isn't helping us.

## Design principles (apply everywhere)

1. **5-second test.** On every page, a first-time visitor knows within 5 seconds what the page is for and what to do next. Each page starts with a one-line plain purpose and one main action.
2. **Plain language.** Short sentences, everyday words, about a 12-year-old's reading level. Lead with what it does for the person, not how it works. Technical detail is allowed, but only behind a toggle (see 4).
3. **Progressive disclosure.** Show the summary first and let people open the detail:
   - collapsible sections ("Show details", "How is this calculated?")
   - tabs instead of long stacked sections
   - "Basic / Advanced" mode where a screen has many controls
4. **Info buttons.** Every non-obvious element (stat cards, charts, badges, scores, the rules seal, check results, status chips, form sections) gets a small **ⓘ button in its bottom-right corner**. On hover or tap it opens a popover with:
   - one plain sentence explaining it
   - an optional "For technical judges" line (hash algorithm, formula, etc.)
   - optionally a "Learn more" link

   Make it one reusable `<InfoTip>` component. It must be keyboard accessible and work on touch.
5. **"For technical judges" toggles.** Wherever we show cryptography, hashes, formulas, API details or JSON, keep the human version visible. Put the technical version in a collapsed panel labelled "For technical judges", so developers can dig in and everyone else isn't overwhelmed.
6. **Less, but better.** Cut repetition, merge overlapping sections, and never show the same photo twice on a page. More white space, fewer borders, larger key numbers, consistent card sizes.
7. **Delight, gently.** Smooth scroll-reveal, hover lift on cards, animated number counters, a slow zoom on the hero photo. All motion respects `prefers-reduced-motion`.

## Word swaps (public pages and dashboards)

Add a test that fails if any of the left-hand phrases appear on public pages outside a "For technical judges" panel.

| Instead of | Say |
|---|---|
| Programmable competition engine | Run any competition your way |
| Cryptographic rules fingerprint / rulesHash | Rules seal: proof the rules haven't changed (show the short code only inside the info popover) |
| Mathematically sealed, cryptographic verification | Locked, checkable rules |
| Deterministic / reproducible leaderboard | Fair ranking anyone can re-check |
| Hash-chained audit log | Tamper-proof activity record |
| Pre-flight guards / security guards | Submission check |
| Faithfulness report | Fair-play report |
| Compiler / definition / schema | Competition setup |
| Blueprint | Template |
| Entry | Application (keep "Entry" in code) |
| Instances | Keep the name **Instances**, always with a plain subtitle the first time it appears on a page: "Instances: CEDA's competitions, each with locked, checkable rules" |
| Magic bytes / zip-slip / OSV | Only inside "For technical judges" |

## Navbar: group it into cards

The top bar has 8 free-floating links, which feels clumsy. Replace them with:
- **Logo** (left)
- **Four grouped menu cards.** Each is a rounded pill or card with a subtle background and a dropdown panel. Each dropdown item has an icon, a title and a one-line description.
  - **Compete:** Instances (all competitions), Open calls, Am I eligible?, Track my application
  - **Showcase:** Funded innovators, Community
  - **Learn:** How it works, About, Help & FAQ, Support
  - **Partners:** Partner spaces (BDIH, BTC) and "Run a competition with CEDA"
- **Right side:** a highlighted **"Judges' tour"** chip, the search icon and **Sign in**
- **Top strip:** keep Setswana and "No data? Dial *161#"
- **Mobile:** a full-screen sheet with the same four groups as collapsible cards
- **Dashboards:** apply the same grouping to the role sidebars, with at most 5 groups, collapsible, and an ⓘ on each group explaining what is in it

## Home page: shorter, clearer, more striking

Target **6–7 sections, about half the current length** (currently ~6,400px and 11 sections).

1. **Hero:** full-bleed photo of a **lab interior** (`hero-lab.webp`, below) with a dark-to-transparent gradient for legibility and a slow zoom.
   - Plain headline, for example *"Your idea. CEDA's backing. A fair shot."*
   - Subline: *"Enter CEDA competitions online, see exactly how you'll be judged, and follow your application at every step."*
   - Primary button: **See open competitions**. Secondary: **Am I eligible? (30 seconds)**. Text link: **Take the 3-minute judges' tour →**.
   - Below the hero, 3–4 animated stat counters, each with an ⓘ.
2. **How it works in 3 steps:** Check → Apply → Track. Three big illustrated cards, each with a collapsible "What happens here".
3. **Featured Instance:** the CEDA Innovation Management Portal Hackathon 2026.
   - A visual timeline bar with a "we are here" marker
   - Prize total, a "Rules seal ✓" badge with an ⓘ, and one button
   - Plain-language description only
4. **"See how a competition is built" (the wow moment).** A small animated, clickable 4-step visual of the Instance Studio:
   1. Pick a template
   2. Set dates and who can enter
   3. Choose how it's judged
   4. Publish, and the rules get sealed

   It explains Instances without a wall of text. Add a link to the full Studio in the judges' tour.
5. **Who it's for:** one tabbed section replacing both "One portal, four roles" and "Judged on the idea, not on who you know". Tabs: Innovators · Evaluators · CEDA team · Partners. Each tab has a photo, three plain bullets and an ⓘ on the fairness features (blind scoring, conflict declaration, signed receipt).
6. **Sectors and recently funded:** a photo mosaic of sectors (no duplicate photos) and a funded-innovators carousel.
7. **Closing call to action band** over the Okavango aerial photo, with "Apply from your phone" folded in as a compact strip, not its own section.

## Inner pages

- **Every page:** a one-line purpose under the title, plus a collapsible "What can I do here?" with 2–4 bullets.
- **Instance public page:** timeline first, then a "What you need to submit" checklist, then "How you'll be judged" (rubric as a simple bar chart with an ⓘ per criterion). Put the rules seal and technical details in "For technical judges".
- **Instance Studio:**
  - **Basic mode by default**, with 4 steps: Basics · Dates · Who can enter · How it's judged
  - **Advanced mode** reveals the rest (security checks, fair-play rules, privacy, channels) and the JSON view
  - every field gets helper text and an ⓘ
- **Instance Console and all dashboards:** summary cards first, each with an ⓘ; detailed tables collapsed below them; charts with plain titles ("How many applied each day") and an ⓘ.
- **Submission check (pre-flight):** a friendly checklist with green, amber and red items, each with a one-line fix. Technical details collapsed.
- **Judges' tour:** make it the most polished page. A numbered, clickable path through the key screens with a progress indicator and one-click role sign-in at each step.

## Images: replace and de-duplicate

Download from Unsplash (free licence, no attribution required, but credit anyway):
- hero at `w=2400&q=80`, cards at `w=1200&q=75`
- convert to WebP into `public/photos/`
- give every image meaningful `alt` text
- record each source URL in `public/photos/CREDITS.md`
- delete unused images (e.g. the 976 KB `public/images/hero.jpg` if unused)
- serve with `next/image` and proper `sizes`

Base URL: `https://images.unsplash.com/<id>?w=...&q=...&fm=jpg`

| New file | Unsplash image id | Use |
|---|---|---|
| `hero-lab.webp` | `photo-1705579608671-f28c09a35cde` | **Home hero**: young woman working in an electronics innovation lab (wide interior) |
| `lab-drone.webp` | `photo-1705579608049-a251d1ba0405` | Same lab, building a drone: "How it works" or Instances page header |
| `soldering.webp` | `photo-1705579605300-1756934968e7` | Close-up soldering: Digital & Technology sector / hardware |
| `young-makers.webp` | `photo-1653566031536-4d1b6a9da15e` | Girls building a robot: Community / youth |
| `team-coding.webp` | `photo-1528901166007-3784c7dd3653` | Team coding together: "Innovators" tab / Digital sector |
| `founders-meeting.webp` | `photo-1655720357872-ce227e4164ba` | Three women founders meeting: Partners tab / About |
| `evaluator.webp` | `photo-1573496527892-904f897eb744` | Woman at a whiteboard: "Evaluators" tab |
| `innovator-portrait.webp` | `photo-1756588534346-e8899364757b` | Smiling young woman on campus: Innovator / "Am I eligible?" |
| `tailor.webp` | `photo-1687422808289-e721259c9eb4` | Tailor at a sewing machine: Manufacturing sector (replaces `maker-sewing`) |
| `basket-weaver.webp` | `photo-1688240817677-d28b8e232dd4` | Basket weaving: Creative & crafts sector |
| `founder-portrait.webp` | `photo-1614023342667-6f060e9d1e04` | Young man in a dark shirt: funded founder / CEDA team tab |
| `okavango-aerial.webp` | `photo-1531208853003-c1ec1b8a81d7` | Okavango Delta aerial: closing call to action background |
| `gaborone-aerial.webp` | `photo-1591005383946-16532ba69aee` | Gaborone city aerial: About / partners |
| `mokoro.webp` | `photo-1759252973843-957dc1b5e0e5` | Mokoro poling: Tourism sector |
| `chobe-elephants.webp` | `photo-1759215290881-cc6a8ccbb37e` | Elephants by the river: Tourism / environment (replaces the duplicate elephants) |

Keep the existing `farmer-field`, `grain-hands` and `solar-rural` for Agriculture and Energy, but each photo may appear **only once per page**. Every image needs an `alt`.

## Acceptance checklist

- Navbar has at most 4 grouped menus plus the Judges' tour chip, works on desktop, mobile and keyboard, and has no free-floating link rows
- Home page has 6–7 sections, is about half its previous height, uses the new lab hero, and repeats no photo
- An `<InfoTip>` ⓘ sits on every stat card, chart, badge, score and status chip on public pages and dashboards
- Jargon words only appear inside "For technical judges" panels (enforced by a test)
- Instance Studio opens in Basic mode with 4 steps
- Lighthouse on the home page (mobile): Performance ≥ 85, Accessibility ≥ 95; images ≤ 300 KB each (hero ≤ 450 KB)
- `prefers-reduced-motion` respected
- All existing smoke tests pass; add smoke tests for the new navbar menus and the InfoTip
- CEDA branding unchanged, no invented hackathon facts, no rollout until INBOX.md approves it
