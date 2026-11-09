# Directive: make Instances CEDA's challenge engine

**From:** the strategy lead (Claude). **To:** Antigravity. **Repo:** `luxraye/regulator`.
**Target:** at least 90% ready by **Wednesday 11 Nov 2026, 23:00 CAT**. The owner is unavailable for exams from Thursday 12 Nov.

You are the builder. Work through the phases in order, keep going without waiting for replies, and report as described below. Where something is ambiguous, pick the option that scores best against the judging sheet in section 2, write your choice in your report, and continue. Stop only if you would break the live site or lose data.

---

## 1. Context

- The app is the CEDA Innovation Portal, built with Next.js 14 (App Router), Prisma 5 and Postgres (Neon, `aws-us-east-1`), Auth.js v5 and Tailwind.
- It is live on Firebase App Hosting at https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app (project `neon-bw-3x0x`, backend `ceda-portal`).
- App Hosting does **not** auto-deploy. Run a rollout after merging to `main`.
- Use Yarn 1 (`npx yarn@1.22.22 ...`). If PowerShell blocks scripts, run the commands in `cmd.exe` or use `npm.cmd` / `npx.cmd`.
- The demo password for every account is `CedaDemo2026!`. One-click demo logins must keep working, and public pages must stay open with no login.
- Today the Prisma model `Instance` means **one idea**, and `Template` means **one call**. This directive changes that (Phase 2).
- The owner's original engine is `github.com/luxraye/instances`. Port ideas and code from it freely:
  - `src/lib/schema-engine` (Ajv JSON Schema validation, file slots)
  - `MatrixDimension`/`MatrixDimensionValue` (custom classification matrix)
  - versioned templates
  - `instance-service.ts` lifecycle
  - `/api/v1` with hashed `ApiKey`s
  - `Tenant` isolation
- Event facts (from the official SkillsRanker page):
  - registration: 9–12 Nov 2026
  - briefing: 13 Nov 15:00
  - build window: 13 Nov 08:00 to 23 Nov 17:00 CAT
  - clarification meetings: 16 and 20 Nov
  - judging and Top 5 shortlist: 25–30 Nov
  - Top 5 in-person pitch and prize-giving: 3 Dec at CEDA Head Office, Gaborone; the public vote counts for 10%
  - prizes: P40k, P25k, P15k, P10k and P5k
  - teams of 1–5; citizen youth companies (ages 18–35, more than 50% youth shareholding)
  - submission: a technical proposal of at most 10 pages, a live URL, a walkthrough video, source code, a user manual, a README; 150MB maximum

## 2. Official judging sheet (100 points). Build to this

| Area | Points | Items |
|---|---|---|
| General | 15 | **CEDA layout, colours and fonts (2)** · browser-based (2) · **self-registration with email or phone validation (2)** · **login by password, OTP (SMS/email) or biometrics (2)** · **create, change and recover passwords (2)** · **cloud-hosted, stating provider, data region and storage costs (2)** · available 24/7 (3) |
| Functionality | 20 | **Admin can upload, edit and delete content: application form and required documents (3)** · **multi-level collaborative evaluation, customisable scoring and adjudication (3)** · feedback and iteration (3) · **live chat with CEDA consultants: multi-agent, 09:00–16:00 on working days only, "agent not available" messages, chat analytics report (2)** · **support details for fixing hosting faults, with turnaround time (2)** · **FAQs plus contacts for each regulatory authority (2)** · reporting dashboards for participation, evaluation outcomes and timelines (3) · **free alert subscriptions for submission updates (2)** |
| UX/Design | 15 | intuitive (5) · clear navigation, labels, icons and links (5) · attractive (5) |
| Technical | 25 | role-based access (5) · response time (5) · audit trail (5) · cyber security and data privacy (5) · cross-browser and cross-device (2.5) · scalable and flexible (2.5) |
| Innovation | 10 | features beyond the spec. **This is where Instances wins** |
| Presentation | 15 | demo · technical proposal · pitch. The strategy lead handles these, but the app must demo cleanly |

Bold items are missing or weak today. Every one of them must be covered by the end.

## 3. The concept

**Every competition CEDA (or a partner) runs is an Instance**: a programmable, versioned, sealed definition that the platform enforces from registration to award. Call it "Instances" everywhere in the UI. Never call it "Challenges".

There are three levels:
- **Blueprint**: a reusable, versioned Instance definition, such as "11-day hackathon" or "Ideas call".
- **Instance**: one live run of a blueprint version, with its own dates, people, sealed rules and a public page.
- **Entry**: one team's or founder's submission inside an Instance. Today's "ideas" become Entries.

An Instance definition is JSON (validated by a zod or Ajv schema) with these sections:
1. **meta**: name, organiser (CEDA or a partner), description, prizes, banner.
2. **timeline**: ordered stages from a library: registration, eligibility check, briefing, build window, submission, screening, scoring round (repeatable), shortlist, clarification meeting, live pitch, public vote, award. Each stage has a start, an end, who acts, and an entry gate. Deadlines are enforced server-side: no extra time.
3. **eligibility**: rules in a small JSON rule language (for example `{ "field": "age", "op": "between", "value": [18, 35] }`, `all`/`any`/`not`). Cover age, citizenship, youth shareholding above 50%, required documents and affiliation declaration.
4. **team**: minimum and maximum size, and required member fields.
5. **forms**: JSON Schema forms per stage (registration, submission, compliance declaration), with file slots giving allowed types, max size and required flag. Every question is required unless it is marked "N/A allowed".
6. **guards**: pre-emptive security checks (Phase 5).
7. **faithfulness**: rules such as "every question answered or marked N/A", "no edits after the deadline", "affiliations declared", "consents recorded".
8. **rubric**: weighted criteria and sub-criteria that must total 100, evaluators per entry, a blind on/off switch, a disagreement threshold, a consensus step on/off switch, and an optional public-vote weight.
9. **workflow**: screening, then blind scoring with conflict declaration, consensus, shortlist, panel and award. Compose it from the stage library.
10. **privacy**: Data Protection Act 2024 consent text, retention period and purpose.
11. **channels**: alert types, FAQ entries, support contacts, live-chat hours and agents, and observer (committee) access.

## 4. How to report (important)

- Work on branch **`feat/instances-engine`**, created from `main`. Open a **draft pull request into `main` straight away** and push after every meaningful step. CI must stay green.
- After each phase, add `docs/agent/reports/NN-phase-name.md` covering what you did, what you chose and why, what's left, risks, and screenshots if you can. Also update the one-page `docs/agent/STATUS.md` (phase, % done, blockers, questions for the strategy lead). Commit and push them.
- Before each phase, run `git pull` and read **`docs/agent/INBOX.md`**. The strategy lead puts new instructions or corrections there. Follow the newest entries first, and note in your next report which entries you handled.
- Before every report, run `npx tsc --noEmit`, `yarn lint` and `yarn build`. Run the Playwright smoke tests where possible.

---

## Phases

### Phase 1: CEDA branding (quick win, about 2 hours)
- The owner now wants **CEDA branding**, not the blue. The closed branch `claude/ceda-branding` (PR #3) already did this on an older base, using Poppins, the sunrise logo, orange `#d94914`, the sunrise bands red `#a02010`, orange `#f06020`, amber `#f8a018` and yellow `#f8c808`, brown ink `#3a2a24`/`#604038`, zinc neutrals, and the tagline "Finance · Develop · Sustain".
- Port its tokens, logo and fonts onto the current `main`. Don't merge the old branch wholesale.
- Put every brand value in **one theme file** (CSS variables plus Tailwind tokens), so CEDA can swap layout, colours and fonts later.
- No cursive or script fonts.
- **Done when:** every public and dashboard page uses the new theme, contrast passes WCAG AA, and nothing blue is left by accident.

### Phase 2: Data model (about half a day)
- Rename the current Prisma `Instance` (idea) to **`Entry`**. Turn `Template` (call) into a per-Instance **track/form** owned by an Instance.
- Add:
  - **`Partner`**: the organiser space, ported from `Tenant` in luxraye/instances, with name, slug, logo, colours and status
  - **`Blueprint`**: key, version, definition JSON, status (draft or published), published at
  - **`Instance`**: partnerId, blueprintId + version, definition snapshot JSON, `rulesHash` (SHA-256 of the canonical definition), status (draft, published, live, closed or archived), timeline dates, public slug
  - **`InstanceRole`**: userId, instanceId, role. This scopes ORGANISER, EVALUATOR, ADJUDICATOR, OBSERVER (committee, internal or external), CONSULTANT (chat agent) and MENTOR per Instance. Keep the global `Role` enum for platform level, and add `PARTNER_ADMIN`.
  - **`Team`** and `TeamMember`
  - **`CheckResult`**: entryId, check key, status (pass, warn or fail), detail, evidence hash
  - **`InstanceVersion`**: change log with reason and diff
  - custom **`MatrixDimension`/`MatrixDimensionValue`**, replacing the hard-coded `Scale` × `DataType` enums
- Migrate existing data: all current calls and ideas move into one Instance, "CEDA Youth Innovation Ideas Call 2026", so nothing working is lost.
- Use Prisma migrations from now on (`prisma migrate`), not `db push`.
- **Done when:** the app builds, all five existing demo roles still work end to end, and the seed is updated.

### Phase 3: Definition schema, rules engine and compiler (about half a day)
- Write the zod (or Ajv) schema for the 11 sections, plus a validator that returns friendly errors with a path for each.
- Build a deterministic rules engine for eligibility, team and faithfulness rules, with unit tests.
- Write a "compiler" that turns a published definition into stages, forms, rubric and gates, which the existing screening, scoring, panel and award screens read from instead of hard-coded logic.
- Seal on publish: canonicalise the JSON, hash it to get `rulesHash`, freeze the snapshot, and write an audit record.
- Changing a live Instance creates a new `InstanceVersion` with a required reason and notifies every participant.
- **Done when:** unit tests cover the validator, rules and compiler, and changing a published Instance is impossible without a version bump.

### Phase 4: Instance Studio and Instance Console (about 1 day). This is the headline
- Make **Instances** the first item in the nav for CEDA staff and partner admins.
- **Instance Studio** (`/dashboard/instances/new` and `/[id]/edit`):
  - a guided step-by-step builder for the 11 sections (stage timeline drag-reorder, form builder, rubric editor with a running total that must equal 100, rule builder)
  - a **JSON code view** that stays in sync with the builder
  - live validation
  - "Start from blueprint" and "Clone Instance"
- **Simulate (dry run):** run sample teams and entries through eligibility, guards, faithfulness and scoring. Show pass/warn/fail with plain-language explanations before publishing.
- **Publish** seals the Instance and shows the rules fingerprint.
- **Instance Console** (`/dashboard/instances/[id]`), one oversight page per Instance:
  - current phase and countdown
  - registrations, eligible and ineligible counts
  - check failures
  - reviewer progress and overdue scores
  - judge-variance flags
  - consensus status
  - chat load
  - the audit trail filtered to this Instance
  - a version history
- **Public Instances section** (`/instances` and `/instances/[slug]`):
  - live and past Instances, each with its stage timeline, rules (human-readable plus the fingerprint), prizes, FAQ and leaderboard (after results)
  - a "Verify these rules" link that recomputes the hash
- Home page: hero message along the lines of "Every CEDA challenge, programmable and verifiable", with the flagship Instance featured.
- **Done when:** a staff user can create, simulate, publish and monitor a new Instance end to end without touching code.

### Phase 5: Pre-emptive security and compliance checks, plus participant pre-flight (about half a day)
Guards run on upload and on submit, and the results are stored as `CheckResult`s:
- **Files:** real type by magic bytes against the allowed list; size caps; archive inspection (zip bomb ratio, zip-slip paths, nested archive depth); SHA-256 duplicate detection across entries; PDF page count against limits (for example a 10-page proposal).
- **Malware, secrets and dependencies:** use an adapter interface with a working stub that flags EICAR and obvious patterns. Add a real ClamAV adapter when `CLAMAV_HOST` is set. Run secret scanning on uploaded source (regexes for keys and tokens) and an OSV dependency check on `package.json`/`requirements.txt` when it can reach the network.
- **Links:** the live URL must answer over HTTPS with a valid certificate and no redirect to a different domain. The repo link must be reachable.
- **Compliance and faithfulness:** eligibility rules; every question answered or N/A; affiliations declared; consents recorded.

**Participant pre-flight:** before final submit, the team sees the same checklist and can fix problems before the deadline. Hard fails block submission. Warnings go to screeners.

A sealed **Faithfulness Report** (the check results plus their hashes) is bound into the signed submission receipt and is verifiable on `/verify`.

### Phase 6: Faithfulness and integration (about half a day)
- Hash-chain the `AuditLog`: each row stores `prevHash` and `hash`. The integrity page verifies the whole chain and shows exactly where a break is.
- Results can be reproduced: the leaderboard recomputes from stored scores and the rubric, and shows its own fingerprint.
- **API v1** (port from luxraye/instances), using hashed per-Partner API keys:
  - list, create and clone Instances
  - list Entries and read their status
  - outbound **webhooks** on stage change and decision, HMAC-signed
- Publish an OpenAPI spec at `/api/v1/openapi.json` with a simple docs page.

### Phase 7: Partner spaces (about half a day)
- A Partner has its own branded space (logo and colours, defaulting to CEDA) and runs its own Instances. Its admins see and manage only their Partner's Instances, users, keys and audit. CEDA super admin sees everything.
- Seed **Botswana Digital Innovation Hub (BDIH)** and **BTC Innovation** as partners. Each gets one Instance and a demo `PARTNER_ADMIN` login.

### Phase 8: Close the scoring gaps (about 1 day)
1. **Accounts:**
   - self-registration with **email verification** (link) and **phone verification** (SMS OTP)
   - **OTP sign-in** by email or SMS as an alternative to a password
   - **forgot password** (reset link) and **change password** in the profile
   - Use a provider adapter: Resend or SMTP for email, and a pluggable SMS provider. When no provider is configured, deliver into a visible **demo inbox** at `/demo-inbox` so judges can complete every flow without real email or SMS.
   - Optional TOTP for staff.
2. **Live chat with CEDA consultants:**
   - per-Instance and global chat with several consultant agents and a queue
   - hours are 09:00–16:00 CAT on working days only, configurable, with Botswana public holidays
   - outside hours or when no agent is online, show an "agent not available" message and offer to leave a message or email
   - a consultant console
   - a **chat analytics report** (volume, first response time, resolution, busiest hours, per agent)
   - Use polling or SSE. No paid service.
   - Seed a `consultant@demo.ceda.bw` login.
3. **Free alert subscriptions:** subscribe by email, SMS or in-app to an Instance (new stage or deadline reminders) or to your Entry (status changes). Manage subscriptions in the profile, with one-click unsubscribe.
4. **Support and help:**
   - a `/support` page listing hosting-fault reporting, support hours and turnaround times by severity (for example P1 outage 2h response / 8h fix, P2 24h, P3 3 working days), with a fault report form that creates a ticket
   - `/faq` (global plus per Instance)
   - a **regulatory authorities contacts** directory: CIPA, BURS, NBFIRA, BOCRA, Competition and Consumer Authority, Information and Data Protection Commission, Botswana Bureau of Standards, LEA, with websites and phone numbers. Verify each one and mark any you couldn't verify.
5. **Hosting statement** at `/status`:
   - provider (Google Cloud Firebase App Hosting, region `us-east4`), database (Neon Postgres, AWS `us-east-1`), backups, and estimated monthly hosting and storage cost in BWP and USD
   - live health from `/api/health`
   - an uptime history (store a ping per request or use a cron route)
6. **Admin content manager:** admins can upload, edit and delete the application form (per-Instance form builder) and required documents (templates and guides that applicants download), plus FAQ, notices and page content.
7. **Collaborative evaluation:**
   - after blind scores are in, evaluators on the same entry see each other's scores, discuss in an internal thread, and record an agreed consensus note and score before the panel
   - **committee observer role** (internal and external members): read-only access to an Instance's progress, with real-time status updates through SSE or polling (at most 15 seconds)
8. **Real-time:** dashboards and the notification bell update live, through SSE or short polling.

### Phase 9: Seeds and demo (about half a day)
- **Flagship Instance: "CEDA Innovation Management Portal Hackathon 2026"**:
  - the exact timeline and stages above
  - the official 100-point rubric from section 2, with a 10% public vote
  - all eligibility, team, submission, guard and faithfulness rules
  - prizes and FAQ
  - the 10 registered teams as sample entries, with varied check results (some pass, a warning for a missing README, a fail for a wrong file type)
- **"CEDA Youth Innovation Ideas Call 2026"**: the existing ideas flow, migrated.
- One Instance each for the two partners, structured differently (for example a single pitch day with a public vote), to show the engine is programmable.
- Demo logins on `/login` for innovator, evaluator, panel, admin, super, partner, committee observer and consultant, all with `CedaDemo2026!`.
- Update the "View as" or quick-login panel, and the `/judges` page with a 5-minute guided tour of Instances.

### Phase 10: Quality and release
- Extend the Playwright smoke tests:
  - every role's sidebar links
  - create, simulate and publish an Instance
  - pre-flight blocking a bad upload
  - OTP via the demo inbox
  - chat out of hours
- Run Lighthouse on mobile for `/` and `/instances/[slug]`. Keep scores at 90 or above.
- Update the README with how to run it and the tools used, a short **user manual** in `docs/user-manual.md` (one section per role), and `hackathon.md`.
- When the PR is green and the strategy lead has approved it in `INBOX.md`, merge to `main`, run migrations on Neon, reseed (demo data only), and run an App Hosting rollout. Then confirm `/api/health` and every demo login on the live URL.

## Priorities if time runs short
1. Phases 1–4 and the flagship seed.
2. Phase 5.
3. Phase 8, items 1–4.
4. Everything else.

Reach 90% before Wednesday 23:00 CAT.

## Don'ts
- Don't break the live site. Only roll out after the strategy lead's approval in `INBOX.md`.
- Don't commit secrets. Don't add paid services. Don't use cursive fonts.
- Don't require login for public pages or the judges' tour.
