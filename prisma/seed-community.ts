/**
 * Demo content for the community forum and the Safe Practices board.
 * Everything here is fictional. Dates are relative to today.
 */
import type { PrismaClient } from "@prisma/client";

const HOUR = 3_600_000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR);

type Users = Record<string, { id: string }>;

export async function seedCommunity(prisma: PrismaClient, users: Users) {
  const u = (k: string) => users[k].id;

  const threads: { by: string; h: number; category: string; title: string; body: string; pinned?: boolean; replies: [string, number, string][] }[] = [
    {
      by: "tebogo", h: 240, category: "general", pinned: true,
      title: "Welcome to the innovator community: read this first",
      body: "Dumelang! This is the place to ask questions, share what worked and find people to build with.\n\nThree rules:\n1. Be kind and specific.\n2. Never post Omang numbers, bank details or someone else's contact details.\n3. Don't post your full technical design or source code. Describe the problem and the approach, not the secret sauce. See the Safe Practices board for why.\n\nCEDA staff read the forum and answer questions about calls, but a forum reply is not an official decision on your application.",
      replies: [["onalenna", 230, "Thank you, this is helpful. Is there a way to see past winners' pitch decks?"], ["tebogo", 228, "Not their decks, because those belong to the founders. We'll post summaries of what strong submissions had in common on the Safe Practices board."]],
    },
    {
      by: "thato", h: 30, category: "funding",
      title: "How detailed should the budget be for the Digital call?",
      body: "I'm applying to the Digital Innovation call for a USSD bookkeeping tool. The form asks for a budget breakdown. Do evaluators want line items (servers, salaries, marketing) or just the big categories? I don't want to overdo it, but I also don't want it to look thin.",
      replies: [
        ["kabelo", 27, "Line items, but grouped. I did 5 groups (people, tech, marketing, equipment, working capital) with 2–4 lines each. My feedback last round said the budget was 'clear and credible', which counted under feasibility."],
        ["masego", 20, "Evaluator here (speaking generally, not about any application). What makes a budget credible is showing how you got each number, e.g. '2 developers × P9,000 × 6 months'. A round P500,000 with no workings loses marks."],
        ["thato", 18, "That's exactly what I needed. Re-doing it with the workings now."],
      ],
    },
    {
      by: "naledi", h: 52, category: "pitching",
      title: "Got 'changes requested' on my application. What did you change?",
      body: "My mokoro tourism idea came back asking for a budget breakdown and a letter of intent from a lodge. Has anyone been through a revision? How long did it take, and did it count against you?",
      replies: [
        ["lorato", 49, "I had a revision last year. It doesn't count against you. It means they're interested but need proof. I got a one-page letter from a client on their letterhead and resubmitted within a week."],
        ["mpho", 45, "Tip: answer every point they raise in the message thread, even the small ones. My first resubmission missed one item and it bounced back again."],
        ["naledi", 40, "Thanks both! Two lodges in Maun said yes to a letter. Uploading this week."],
      ],
    },
    {
      by: "boitumelo", h: 75, category: "building",
      title: "Solar pump supplier in Botswana with decent after-sales support?",
      body: "We're piloting solar irrigation pumps in Kgalagadi. Importing from South Africa is fine, but after-sales support is a pain when something breaks 600 km from Gaborone. Has anyone found a local supplier or technician network that actually answers the phone?",
      replies: [
        ["onalenna", 70, "Not pumps, but for our livestock tags we trained two local technicians ourselves and paid them a small retainer. Cheaper than waiting for a supplier, and evaluators liked the local jobs angle."],
        ["boitumelo", 66, "Smart. That fits our call's focus on jobs too. Thank you."],
      ],
    },
    {
      by: "tumelo", h: 12, category: "cofounders",
      title: "Looking for a co-founder with an education background (Central District)",
      body: "Thuto Labs builds offline revision lessons for BGCSE learners on cheap Android phones. I'm the developer. I'm looking for a co-founder who has taught, or knows the syllabus well, to own content and school partnerships. Based in Serowe or Palapye ideally. Happy to talk equity.",
      replies: [["lorato", 9, "My cousin teaches maths in Palapye and has been writing revision notes for years. I'll ask if she's open to a chat. Start a direct conversation off-forum and keep contact details private!"]],
    },
    {
      by: "kabelo", h: 100, category: "markets",
      title: "How did you get your first 10 paying customers?",
      body: "Spaza Ledger is free for now, and I'm struggling to get shop owners to pay P50/month. For those who got past the first customers: what worked in Botswana? Door to door, radio, WhatsApp groups?",
      replies: [
        ["mpho", 96, "Door to door, every time. Then ask the happy ones to bring one neighbour. WhatsApp groups only worked after people had met me."],
        ["thato", 90, "We gave 2 months free and then asked. About a third converted. The ones who didn't told us why, which was worth it on its own."],
        ["gofaone", 80, "General tip from the digital side: price against what it saves them. If you save a shop owner 3 hours a week, P50 is easy to justify. Say that number out loud in your pitch."],
      ],
    },
    {
      by: "onalenna", h: 6, category: "pitching",
      title: "Is it OK to show a live demo in the pitch, or is a video safer?",
      body: "I'm shortlisted for the panel. Our livestock tag app needs network to sync. Do I risk a live demo or record a video?",
      replies: [["naledi", 4, "Record the video as a backup and try the live demo. If the network fails, say so calmly and switch. Panels care more that it works in the field than in the room."]],
    },
  ];

  for (const t of threads) {
    const thread = await prisma.forumThread.create({
      data: { title: t.title, body: t.body, category: t.category, pinned: !!t.pinned, authorId: u(t.by), createdAt: ago(t.h), updatedAt: ago(t.replies.length ? Math.min(...t.replies.map((r) => r[1])) : t.h) },
    });
    for (const [by, h, body] of t.replies) {
      await prisma.forumReply.create({ data: { threadId: thread.id, authorId: u(by), body, createdAt: ago(h) } });
    }
  }

  const notices: { by: string; h: number; category: string; title: string; summary: string; dos: string[]; donts: string[]; pinned?: boolean }[] = [
    {
      by: "tebogo", h: 300, category: "ip", pinned: true,
      title: "Protect your idea before you share it widely",
      summary: "An idea on its own is hard to protect. What you can protect is your brand, your code and designs, and inventions that are new. In Botswana, patents, trademarks and industrial designs are registered with CIPA. If you plan to patent an invention, file before you publish or pitch it in public, because public disclosure can stop it counting as new.",
      dos: ["Search CIPA's register before you settle on a business name or logo", "Keep dated records of your design work (commits, sketches, emails to yourself)", "Talk to a registered IP agent before a public launch if you have a real invention"],
      donts: ["Posting full technical designs, source code or formulas in forums or on social media", "Assuming an NDA protects you from everyone: it only binds the people who sign it"],
    },
    {
      by: "tebogo", h: 280, category: "scams", pinned: true,
      title: "Nobody can sell you a place in a CEDA call",
      summary: "This portal never asks for a fee to apply, to be scored or to be shortlisted, and evaluators and staff will never ask you for money or gifts. If anyone offers to 'fast-track' your application for a fee, it is a scam. Report it to CEDA and do not pay.",
      dos: ["Apply only through this portal or official CEDA offices", "Check that messages about your application also appear in your portal inbox", "Report suspicious calls or WhatsApp messages to CEDA"],
      donts: ["Paying 'processing' or 'consultant' fees to strangers who promise approval", "Sharing your login, OTP or Omang copy with anyone who contacts you first"],
    },
    {
      by: "tebogo", h: 200, category: "pitching",
      title: "Five things that cost marks in a pitch",
      summary: "From panel feedback across past rounds, these are the most common reasons good ideas score lower than they should.",
      dos: ["State your ask clearly: how much, for what, over how long", "Show evidence from real customers, even a small pilot", "Name your competitors and say why you're different"],
      donts: ["Market size from a global report with no Botswana number", "Reading your slides word for word", "Saying 'we have no competition'"],
    },
    {
      by: "tebogo", h: 150, category: "pitching",
      title: "What to share in a pitch, and what to keep back",
      summary: "Panels need to understand how your solution works, not the exact recipe. Explain the problem, the approach and the results. Keep source code, supplier pricing and detailed formulas for due diligence, under an agreement, after you're shortlisted.",
      dos: ["Describe what your product does and the result it delivers", "Show a demo or screenshots instead of the code"],
      donts: ["Handing out your full deck with financial models at public events", "Sharing supplier contracts or pricing in a pitch"],
    },
    {
      by: "super", h: 180, category: "contracts",
      title: "Put co-founder agreements in writing early",
      summary: "Most co-founder disputes come from things nobody wrote down: who owns what, who does what, and what happens if someone leaves. A short shareholders' agreement now is far cheaper than a fight later, and CEDA checks youth shareholding at screening.",
      dos: ["Agree shares, roles and time commitment in writing before you apply", "Use vesting, so shares are earned over time", "Make sure the company, not a person, owns the code, brand and domain"],
      donts: ["Splitting shares equally by default without discussing roles", "Letting a freelancer keep ownership of the code they wrote for you"],
    },
    {
      by: "super", h: 120, category: "data",
      title: "Collecting customer data? The Data Protection Act applies to you",
      summary: "If your product stores names, phone numbers, locations or health information, Botswana's Data Protection Act, 2024 applies. Ask for consent, collect only what you need, and keep it secure. Evaluators look for this in digital ideas.",
      dos: ["Write a one-page privacy notice in plain language", "Collect the minimum data you need, and delete it when you're done", "Use strong passwords and two-factor sign-in on admin accounts"],
      donts: ["Collecting Omang numbers 'just in case'", "Sharing customer lists with partners without consent"],
    },
    {
      by: "tebogo", h: 60, category: "ip",
      title: "Choosing a name? Check it's free first",
      summary: "Before you print anything, check that your business name and logo aren't already registered or in use in your sector. Rebranding after launch is expensive, and a clash can lead to a legal letter.",
      dos: ["Search CIPA's company and trademark records", "Check that the domain and social media handles are free too"],
      donts: ["Copying a well-known brand's look 'for inspiration'"],
    },
    {
      by: "tebogo", h: 24, category: "scams",
      title: "Be careful with 'investors' who want fees up front",
      summary: "Real investors make money when you do. Someone who asks for a due-diligence fee, a 'registration' fee or a deposit before investing is very likely running a scam.",
      dos: ["Ask for references from founders they have funded", "Have a lawyer read any term sheet before you sign"],
      donts: ["Paying anything to receive an investment"],
    },
  ];

  for (const n of notices) {
    await prisma.notice.create({
      data: { title: n.title, summary: n.summary, dos: n.dos.join("\n"), donts: n.donts.join("\n"), category: n.category, pinned: !!n.pinned, authorId: u(n.by), createdAt: ago(n.h) },
    });
  }
  console.log(`Community seeded: ${threads.length} discussions, ${notices.length} safe-practice notices.`);
}
