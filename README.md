# CEDA Innovation Portal

**One place where young Batswana enter CEDA's competitions, see exactly how they'll be judged, and follow their idea from application to award.**

**Live site:** https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app

Built by Local Grow (Pty) Ltd for the CEDA Innovation Management Portal Hackathon 2026. All people, companies and ideas on the site are **demo data**.

---

## See it in 3 minutes

1. **Open the [Judges' tour](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/judges).** It walks you through every main screen, with one-click sign-in for each role.
2. **Watch an idea's journey at [/journey](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/journey).** One demo idea goes through all 16 steps, from eligibility check to verified certificate. Each step has an "Open this screen" button.
3. **Explore freely.** Use the four menus at the top (Compete, Showcase, Learn, Partners), the Explore hub on the home page, or press **Ctrl/⌘ + K** to search for any page. Click the small **ⓘ** buttons for a one-line explanation of anything.

## Demo sign-ins

All demo accounts use the password **`CedaDemo2026!`**. You can also sign in with one click from the [login page](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/login).

| Role | Email | What you can try |
|---|---|---|
| Innovator (applicant) | `innovator@demo.ceda.bw` | Apply, run the submission check, track an application, read feedback |
| Evaluator | `evaluator@demo.ceda.bw` | Declare conflicts, score applications without seeing names |
| Adjudication panel | `panel@demo.ceda.bw` | Review the ranking, shortlist, make award decisions |
| CEDA programme admin | `admin@demo.ceda.bw` | Build and publish a competition, manage content, see reports |
| Super admin | `super@demo.ceda.bw` | Users and roles, platform settings, activity record |
| Partner admin (demo) | `bdih.admin@demo.ceda.bw` / `btc.admin@demo.ceda.bw` | Run competitions in a partner's own space |
| CEDA consultant | `consultant@demo.ceda.bw` | Answer live chat, see chat reports |
| Committee observer | `observer@demo.ceda.bw` | Watch a competition's progress, read only |

Emails and text messages (verification links, one-time codes, password resets) are shown at [/demo-inbox](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/demo-inbox), so every sign-up and sign-in flow works without a real inbox or phone.

## What the portal does

**For young innovators:**
- check eligibility in 30 seconds
- apply with a guided form that won't let you miss a required answer
- see problems with your files before you submit
- get a signed receipt
- track your application at every stage
- get feedback on every scoring criterion
- receive free alerts by email, SMS or in the portal
- chat with a CEDA consultant (09:00–16:00, working days)

**For evaluators and the panel:**
- a personal queue with due dates
- a conflict-of-interest declaration before each application opens
- **blind scoring** (no names, ID numbers or company names)
- a flag when evaluators disagree a lot, a space to agree a joint score, and a fair ranking anyone can re-check

**For CEDA staff and partners:**
- build a new competition **without a developer**: dates, who can enter, the application form, how it's judged
- try it out with sample applications before publishing
- watch it run from one page
- manage forms, guides, FAQs and notices
- see reports on participation, scores and timelines

## The big idea: Instances

Every competition on the portal is an **Instance**: one competition with its own dates, entry rules, application form and scoring. CEDA staff set it up in the **Instance Studio** in four simple steps (or with full control in Advanced mode).

When an Instance is published, its rules are **locked with a "rules seal"**. If anyone changes the rules later, everyone can see it: the change needs a written reason, participants are notified, and the change is recorded. Applicants, judges and the public can check that the rules they see are the ones that were published.

This means CEDA (and partners such as innovation hubs) can run any kind of competition the same fair, transparent way: a hackathon, an ideas call or a pitch day.

## Fair, safe and private

| What | How it helps |
|---|---|
| **Locked rules** | Rules can't be changed quietly once a competition opens |
| **Submission check** | Files are checked before they're accepted: wrong file types, hidden programs, oversized or unsafe archives, exposed passwords in code, and proposals over the page limit |
| **Signed receipts and certificates** | Anyone can confirm a receipt or award is genuine at [/verify](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/verify) |
| **Blind scoring** | Evaluators judge the idea, not who submitted it |
| **Tamper-proof activity record** | Every important action is recorded, and any edit to past records is detected |
| **Role-based access** | Each role only sees what it needs; partners only see their own space |
| **Data Protection Act 2024** | Consent is recorded, people can download their data, and data is kept only as long as needed |

<details>
<summary><strong>For technical judges</strong></summary>

- **Rules seal:** the Instance definition (11 sections) is canonicalised (sorted keys) and hashed with SHA-256 to give its `rulesHash`. Edits after publishing create a new `InstanceVersion` with a diff and a reason.
- **Eligibility:** a small JSON rule language (`all` / `any` / `not` plus comparison operators), evaluated on the server.
- **Submission check:**
  - file type from magic bytes, so PE/MZ executables are blocked whatever the extension
  - zip-bomb ratio and zip-slip path checks
  - SHA-256 hash checked in the browser and on the server
  - PDF page limit
  - secret scanning in source archives
  - results stored per entry
- **Receipts and certificates:** HMAC-signed; checked at `/verify`.
- **Activity record:** the audit log is hash-chained (`prevHash` → `hash`), and the chain is verified from the super-admin audit page.
- **Ranking:** computed from stored scores and the rubric, so it can be reproduced.
- **API:** partner-scoped API v1 with hashed keys and HMAC-signed webhooks. Docs are at `/api/v1/docs`.
- **Stack:** Next.js (App Router), TypeScript, Prisma, PostgreSQL (Neon), Auth.js, Tailwind CSS, Playwright.

</details>

## Hosting

- **App:** Google Cloud Firebase App Hosting, region `us-east4`
- **Database:** Neon PostgreSQL, AWS `us-east-1`
- **Cost:** the live [status page](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/status) shows the estimated monthly cost (about P734 / $54), live health and uptime. Support turnaround times are on [/support](https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app/support).

## Run it on your computer

You need Node.js 20 or newer, Yarn 1 and a PostgreSQL database.

```bash
yarn
cp .env.example .env    # set DATABASE_URL, DIRECT_URL, AUTH_SECRET and JWT_SECRET
yarn db:push            # create the tables
yarn db:seed            # load the demo data
yarn dev                # open http://localhost:3000
```

**Checks:**

```bash
yarn typecheck
yarn lint
npx tsx --test tests/*.test.ts   # unit tests
yarn build
npx playwright test              # end-to-end tests for every role
```

## Where things are

| Folder | What's inside |
|---|---|
| `src/app/(public)` | Public pages: home, competitions, eligibility, tracking, journey, verify, support |
| `src/app/dashboard` | Signed-in dashboards for each role |
| `src/lib/instance-engine` | The Instances engine: definition, rules, sealing, ranking |
| `prisma/` | Database schema and demo data |
| `tests/` | Unit tests and end-to-end tests |
| `docs/user-manual.md` | Step-by-step guide for every role |

## More

- **User manual:** [docs/user-manual.md](docs/user-manual.md)
- **Hackathon submission notes:** [hackathon.md](hackathon.md)
