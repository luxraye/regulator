# Addendum 12b: "Singularity" navigation and the living idea lifecycle

**Adds to Phase 12** (DESIGN-BRIEF-12). Same branch `feat/human-ux`, same rules:
- CEDA branding unchanged
- no invented hackathon facts
- CI green
- ceda_dev only
- no rollout until INBOX.md approves it

Copy this file into the repo as `docs/agent/DESIGN-BRIEF-12b.md` and cover it in `reports/12-human-ux.md`.

## The owner's vision

Compact the platform into an easy walkthrough **without losing any function**. Think Tony Stark at his holographic screen: everything within reach, nothing cumbersome, and it should feel like **tech brought to life**. Sections branch out from a central core ("singularity"), and opening any branch lets you branch further. Collapsible, expandable, spinning, scrolling and movable carousels, done stylishly, while **no user ever struggles to find a section**.

## 1. The Singularity hub (new signature component)

- **What it is:** an interactive radial map.
  - A glowing **core** in the centre: the CEDA sunrise mark plus "Instances".
  - **6 primary branches orbiting it:**
    - Compete (Instances, Open calls, Eligibility, Track)
    - Build (Instance Studio, Templates, Simulate)
    - Judge (Screening, Scoring, Consensus, Leaderboard)
    - Award (Decisions, Certificates, Funded)
    - Trust (Rules seal, Fair-play report, Activity record, Verify)
    - Help (Live chat, FAQ, Support, Status)
  - Each branch has an icon, a label and a one-line description on hover or focus.
- **Branching:**
  - Clicking a branch smoothly zooms into it. The branch becomes the new centre and its sub-sections fan out around it.
  - Clicking a sub-section shows a **preview card** (screenshot or live mini view + 2-line description + "Open" button), so users see where they're going before they go.
  - A **breadcrumb trail** at the top (Core › Judge › Consensus) and a "back to core" button make it impossible to get lost.
- **Motion:**
  - the orbit slowly rotates when idle
  - drag or swipe to spin it; mouse wheel or arrow keys rotate it
  - nodes pulse subtly when they have something new (e.g. "3 entries need scoring" for an evaluator)
  - connecting lines glow as you hover
  - everything respects `prefers-reduced-motion` (falls back to a static radial layout with fades)
- **Role-aware:** signed-in users see their own hub, with branches filtered to their role and live counts on the nodes. Public visitors see the public hub.
- **Where it lives:**
  1. **Home page**, as the "explore everything" section right after the hero. It replaces the long stack of sections.
  2. **A "⌘K / Explore" button** in the navbar opens the hub as a full-screen overlay from any page.
  3. **Dashboard home** for every role, as the landing view, with a toggle to switch to the classic card grid.
- **Never hard to find:**
  - the grouped navbar from Phase 12 stays as the conventional route
  - a **command palette** (Ctrl/⌘ K) searches every page and action by name
  - the hub is fully keyboard navigable (Tab/arrow keys, Enter to open, Esc to go back) and screen-reader labelled
  - on mobile it becomes a vertical "branch list" with swipeable carousels per branch
- **Tech:** SVG + Framer Motion (already in the stack via `motion`, or add `framer-motion`). Optionally add a light canvas/three.js glow or particle layer behind the core if performance allows. Home page Lighthouse Performance must stay ≥ 85 on mobile, so lazy-load anything heavy.

## 2. Living idea lifecycle: a closed sample timeline through every section

One demo idea (clearly labelled demo data) follows the **full closed loop**. A judge can watch it, or step through it, and see every section of the platform in order:
1. Eligibility check passed
2. Team formed
3. Application drafted (autosave)
4. Submission check (green, plus one amber item fixed)
5. Submitted, with the signed receipt
6. Screening
7. Blind scoring by 2 evaluators (conflict declared "none")
8. Disagreement flagged, then consensus reached
9. Shortlisted on the fair ranking
10. Clarification question and answer
11. Live pitch plus public vote
12. Award decision
13. Certificate issued, then verified on /verify
14. Appears in Funded
15. Alert subscriptions notified the team at each step
16. Every step written to the tamper-proof activity record, shown at the end with a "re-check the record ✓"

**How it's shown:**
- **"Follow an idea" page** (`/journey`, linked from the hero, the hub core and the judges' tour). A horizontal, **scroll-driven timeline**: as you scroll, a glowing line travels from stage to stage and each stage card flips or expands to show the real screen (screenshot or live embed) for that step.
  - Includes **auto-play** (about 60–90 seconds, pausable) and **step-by-step** controls.
  - Each stage has an **"Open this screen"** button that signs in as the right demo role and deep-links to that real page, with the demo idea preloaded.
- **Hub integration:** in the Singularity hub, a "Play the journey" control animates a dot travelling through the branches in lifecycle order, lighting each one up. It shows how the sections connect in one closed loop.
- **On every inner page:** a slim **lifecycle ribbon** at the top shows where this page sits in the loop (e.g. stage 7 of 16 highlighted), with prev/next arrows. Users always know where they are in the idea's journey.
- **Seed:** add or update one demo Entry in the ideas call or a partner Instance (not the real flagship hackathon) with complete data for all 16 steps, so every screen shows it. Label it "Demo journey".

## 3. Carousels and stylish collapsing (use with restraint)

- **Carousels:**
  - funded innovators (auto-scrolling, pause on hover)
  - sectors (draggable cards)
  - open Instances (snap-scroll)
  - testimonials or "how it's fair" cards (3D tilt on hover)

  All are draggable and swipeable, have visible arrows and dots, and are keyboard accessible.
- **Collapsibles:** animated accordions with a chevron; expanding a card "unfolds" smoothly. Dense dashboard tables sit behind "Show all" with a summary row visible.
- **HUD touches:**
  - thin glowing outlines on focus
  - subtle grid or scan-line texture on the hero and hub background
  - numbers that count up
  - status chips that pulse softly when live

  Keep it tasteful and in CEDA colours (orange/amber glow on dark brown). No neon blue.

## Acceptance (in addition to Phase 12)

- From the home page, a first-time visitor can reach **any** public section within 2 interactions via the hub, and via the navbar or command palette too
- Hub works with mouse, touch and keyboard, has breadcrumbs and "back to core", and a reduced-motion fallback
- `/journey` plays the full 16-step closed loop, and every step's "Open this screen" lands on the real page with the demo idea
- Lifecycle ribbon present on all inner pages for the demo idea
- No feature removed; all existing smoke tests pass, plus new ones for the hub (open branch, open sub-section, back to core), the command palette and `/journey`
- Home page mobile Lighthouse: Performance ≥ 85, Accessibility ≥ 95
