/**
 * Demo data for the CEDA Innovation Portal.
 * Everything here is fictional. Running the seed wipes the demo database and rebuilds it,
 * with dates relative to today so deadlines and timelines always look current.
 */
import { PrismaClient, Role, Scale, DataType, InstanceStatus, CallStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { signSubmission } from "./jwt-sign";
import { canonicalFields, type InstanceSchema } from "./instance-schema";
import { sha256 } from "./hash";
import { weightedTotal } from "./scoring";

export const DEMO_PASSWORD = "CedaDemo2026!";

const DAY = 86_400_000;
const HOUR = 3_600_000;

const CRITERIA = [
  { key: "innovation", label: "Innovation & originality", weight: 25, guide: "Is this new for Botswana? Does it solve the problem in a better way?" },
  { key: "market", label: "Market potential", weight: 20, guide: "Real customers, willingness to pay, room to grow beyond the first market." },
  { key: "feasibility", label: "Feasibility & team", weight: 20, guide: "Can this team build and run it with the money asked for?" },
  { key: "impact", label: "Impact & jobs", weight: 20, guide: "Citizen jobs, inclusion, rural reach, environmental benefit." },
  { key: "alignment", label: "Fit with CEDA priorities", weight: 15, guide: "Economic diversification, digital advancement, sustainable development." },
];

function callSchema(extra: InstanceSchema["fields"] = []): InstanceSchema {
  return {
    fields: [
      { key: "problem", label: "What problem are you solving?", type: "textarea", required: true, hint: "Who has this problem and how do you know?" },
      { key: "solution", label: "Your solution", type: "textarea", required: true },
      { key: "novelty", label: "What makes it new or better?", type: "textarea", required: true },
      { key: "customers", label: "Who will pay for it?", type: "textarea", required: true },
      { key: "team", label: "Your team and their skills", type: "textarea", required: true },
      ...extra,
      { key: "district", label: "Main district of operation", type: "select", required: true, options: ["Gaborone", "Francistown", "Maun", "Kgalagadi", "Kweneng", "Central", "North-East", "South-East", "Chobe", "Ghanzi"] },
      { key: "funding_requested", label: "Funding requested (Pula)", type: "number", required: true, validation: { min: 0, max: 500000 } },
      { key: "jobs_12m", label: "Citizen jobs created in 12 months", type: "number", required: true, validation: { min: 0, max: 500 } },
      { key: "impact", label: "How does this support Botswana's development goals?", type: "textarea", required: true },
    ],
    required_files: [
      { key: "pitch_deck", label: "Pitch deck", extensions: [".pdf", ".pptx"], maxSizeMB: 4 },
      { key: "cipa_certificate", label: "CIPA registration certificate", extensions: [".pdf", ".jpg", ".png"], maxSizeMB: 4 },
      { key: "budget", label: "Budget breakdown", extensions: [".xlsx", ".csv", ".pdf"], maxSizeMB: 4, optional: true },
    ],
    criteria: CRITERIA,
  };
}

interface Story {
  innovator: string;
  call: string;
  title: string;
  status: InstanceStatus;
  answers: Record<string, string>;
  submittedDaysAgo?: number;
  evaluations?: { evaluator: string; scores?: number[]; conflict?: boolean; feedback?: string; privateNote?: string; pending?: boolean }[];
  decision?: { by: string; notes: string; daysAgo: number; award?: number };
  messages?: { from: string; body: string; internal?: boolean; daysAgo: number }[];
  resubmitted?: boolean;
}

const STORIES: Story[] = [
  {
    innovator: "naledi",
    call: "CREATE_2026",
    title: "Mokoro Stories: guided audio tours of the Okavango",
    status: InstanceStatus.FLAGGED,
    submittedDaysAgo: 9,
    answers: {
      problem: "Visitors to Maun spend little in local communities because tours are booked and guided from abroad. Polers earn a flat daily fee.",
      solution: "A Setswana and English audio-guide app recorded with local polers and elders, sold per trip, with 40% of each sale paid to the poler's community trust.",
      novelty: "First tour product in the Delta where community guides own the content and earn per listen.",
      customers: "Lodges (bulk licences), self-drive tourists, and schools on field trips.",
      team: "Naledi (product, tourism diploma), Kabo (audio engineer), two polers from Boro as co-founders.",
      district: "Maun",
      funding_requested: "180000",
      jobs_12m: "9",
      revenue_12m: "64000",
      impact: "Moves tourism spend into villages, keeps oral history alive and creates content jobs for young people outside Gaborone.",
    },
    evaluations: [
      { evaluator: "keabetswe", scores: [4, 3, 3, 5, 4], feedback: "Strong community model. The revenue projection assumes 60% of lodges sign up in year one; show signed letters of intent." },
    ],
    decision: { by: "tebogo", daysAgo: 4, notes: "Promising idea. Please upload a budget breakdown showing how the P180,000 will be spent, and at least one letter of intent from a lodge. Then resubmit." },
    messages: [
      { from: "tebogo", body: "Hi Naledi, could you also confirm whether the polers are shareholders in the company?", daysAgo: 4 },
      { from: "naledi", body: "Yes, two polers each hold 10%. I'll add the share register with the budget.", daysAgo: 3 },
      { from: "tebogo", body: "Evaluator rated impact highly. If the LOI comes through this could go straight to panel.", internal: true, daysAgo: 3 },
    ],
  },
  {
    innovator: "naledi",
    call: "MAKE_2026",
    title: "Sefofu: recycled-glass tiles made in Maun",
    status: InstanceStatus.AWARDED,
    submittedDaysAgo: 60,
    answers: {
      problem: "Botswana imports nearly all its floor and wall tiles while bottle glass from tourism lodges goes to landfill.",
      solution: "Crush and fuse collected bottles into decorative tiles in a small kiln in Maun.",
      novelty: "Uses local waste glass as the main raw material; no clay import needed.",
      customers: "Safari lodges, hardware chains, interior designers and housing projects.",
      team: "Naledi plus a ceramics graduate and a former lodge logistics manager.",
      district: "Maun",
      funding_requested: "350000",
      jobs_12m: "14",
      impact: "Import substitution, recycling and factory jobs for young people in Maun.",
    },
    evaluations: [
      { evaluator: "keabetswe", scores: [5, 4, 4, 4, 5], feedback: "Clear import-substitution case and a credible pilot kiln." },
      { evaluator: "masego", scores: [4, 4, 4, 5, 5], feedback: "Good unit economics; secure a long-term glass supply agreement." },
    ],
    decision: { by: "dineo", daysAgo: 30, award: 320000, notes: "Awarded P320,000 asset finance for the kiln and crusher. Disbursement in two tranches after the supply agreement is signed." },
  },
  {
    innovator: "kabelo",
    call: "DIGI_2026",
    title: "Spaza Ledger: buy-now-pay-later for tuck shops",
    status: InstanceStatus.SHORTLISTED,
    submittedDaysAgo: 14,
    answers: {
      problem: "Tuck shops lose stock credit because suppliers can't see their sales history.",
      solution: "A USSD and WhatsApp ledger that builds a sales record and lets wholesalers offer 14-day stock credit.",
      novelty: "Works on any phone; credit scoring from daily sales instead of bank statements.",
      customers: "Wholesalers pay per active shop; shops use it free.",
      team: "Kabelo (software engineer, ex-bank), Lesedi (field sales, 80 shops signed).",
      district: "Gaborone",
      funding_requested: "240000",
      jobs_12m: "11",
      users_today: "83",
      impact: "Brings informal traders into formal credit and the digital economy.",
    },
    evaluations: [
      { evaluator: "gofaone", scores: [5, 5, 4, 4, 5], feedback: "Excellent traction for this stage. Show default rates from the pilot." },
      { evaluator: "masego", scores: [3, 3, 2, 3, 3], feedback: "Credit risk sits with wholesalers; the model needs a regulator view from NBFIRA.", privateNote: "I worry this is a lending business without a licence." },
      { evaluator: "keabetswe", scores: [4, 4, 3, 4, 4], feedback: "Good fit with digital inclusion goals." },
    ],
  },
  {
    innovator: "boitumelo",
    call: "GREEN_2026",
    title: "Pula Pumps: solar borehole pumps on a pay-as-you-go plan",
    status: InstanceStatus.UNDER_REVIEW,
    submittedDaysAgo: 6,
    answers: {
      problem: "Diesel borehole pumps in Kgalagadi cost farmers over P2,000 a month in fuel and break down often.",
      solution: "Solar pump kits paid off monthly by mobile money, with remote monitoring and a local technician network.",
      novelty: "Pay-as-you-go finance with remote shut-off and a technician paid per fix.",
      customers: "Cattle post owners and syndicates in Kgalagadi and Ghanzi.",
      team: "Boitumelo (electrical engineer), Tshepo (agribusiness).",
      district: "Kgalagadi",
      funding_requested: "95000",
      jobs_12m: "6",
      impact: "Cuts diesel use, saves water and keeps rural cattle farming viable.",
    },
    evaluations: [
      { evaluator: "gofaone", scores: [4, 4, 4, 5, 5], feedback: "Strong rural impact. Detail the technician training plan." },
      {
        evaluator: "keabetswe",
        pending: true,
        conflict: false,
        scores: [4, 4, 4, 5, 4],
        feedback: "Strong rural impact and clear pay-as-you-go unit economics. Include a 12-month maintenance schedule for the Kgalagadi technician network.",
      },
    ],
  },
  {
    innovator: "onalenna",
    call: "AGRI_2026",
    title: "Kgomo Tag: low-cost GPS tags against cattle theft",
    status: InstanceStatus.SUBMITTED,
    submittedDaysAgo: 1,
    answers: {
      problem: "Cattle theft and straying cost farmers in the North-East heavily, and BAITS tags don't give live location.",
      solution: "Solar ear tags that report location twice a day over LoRa to a village gateway, with SMS alerts.",
      novelty: "Tags under P150 each and gateways shared by a whole village.",
      customers: "Farmers' associations and insurers.",
      team: "Onalenna (IoT developer), Gape (vet student).",
      district: "North-East",
      funding_requested: "140000",
      jobs_12m: "5",
      value_chain: "Livestock",
      impact: "Protects rural livelihoods and supports beef export traceability.",
    },
  },
  {
    innovator: "tumelo",
    call: "SOCIAL_2026",
    title: "Thuto Offline: exam revision on a USB stick for rural schools",
    status: InstanceStatus.SUBMITTED,
    submittedDaysAgo: 2,
    answers: {
      problem: "Rural BGCSE candidates have little data to use online revision tools.",
      solution: "A low-cost offline revision library on USB and SD cards, updated monthly through school visits.",
      novelty: "Works with no data at all; tracks progress offline and syncs when a teacher's phone connects.",
      customers: "Schools and parents, sponsored by local businesses.",
      team: "Tumelo (teacher), Refilwe (developer).",
      district: "Central",
      funding_requested: "80000",
      jobs_12m: "4",
      impact: "Closes the rural learning gap and creates content jobs for young teachers.",
    },
  },
  {
    innovator: "lorato",
    call: "MAKE_2026",
    title: "Kitchen cabinets from Mopane offcuts",
    status: InstanceStatus.REJECTED,
    submittedDaysAgo: 58,
    answers: {
      problem: "Furniture makers import board while hardwood offcuts are burned.",
      solution: "Laminate offcuts into boards for cabinets.",
      novelty: "Uses waste wood.",
      customers: "Builders in Gaborone.",
      team: "Lorato and one carpenter.",
      district: "Gaborone",
      funding_requested: "400000",
      jobs_12m: "3",
      impact: "Some import substitution.",
    },
    evaluations: [
      { evaluator: "masego", scores: [3, 2, 2, 2, 3], feedback: "Harvesting permits for Mopane are unclear and the budget is mostly equipment with no sales plan." },
      { evaluator: "keabetswe", scores: [3, 2, 3, 2, 2], feedback: "Good instinct on waste. Needs a supply and permit plan." },
    ],
    decision: { by: "dineo", daysAgo: 31, notes: "Not selected this round: supply permits and a sales plan are missing. You're welcome to reapply in Round 2 with these addressed." },
  },
  {
    innovator: "mpho",
    call: "MAKE_2026",
    title: "Morula oil cold-press for cosmetics",
    status: InstanceStatus.APPROVED,
    submittedDaysAgo: 59,
    answers: {
      problem: "Morula kernels are sold raw to foreign processors at a fraction of the oil's value.",
      solution: "A cold-press unit in Francistown buying kernels from women's groups and selling oil to cosmetic brands.",
      novelty: "Traceable, community-sourced oil with a fair-price guarantee.",
      customers: "Regional cosmetic brands and local soap makers.",
      team: "Mpho (chemistry graduate), three collector groups.",
      district: "Francistown",
      funding_requested: "210000",
      jobs_12m: "18",
      impact: "Adds value locally and pays rural women collectors more.",
    },
    evaluations: [
      { evaluator: "masego", scores: [4, 4, 3, 5, 4], feedback: "Good social model. Confirm buyer volumes." },
      { evaluator: "gofaone", scores: [4, 3, 4, 5, 4], feedback: "Clear value-addition story." },
    ],
    decision: { by: "dineo", daysAgo: 30, notes: "Approved for the incubation programme. Funding decision after a 3-month buyer pilot." },
  },
  {
    innovator: "thato",
    call: "DIGI_2026",
    title: "Kgotla Connect: digital notices for village councils",
    status: InstanceStatus.DRAFT,
    answers: {
      problem: "Village meetings are announced by word of mouth and many young people miss them.",
      district: "Kweneng",
    },
  },
];

const FIRST = ["Amogelang", "Bontle", "Dineo", "Goitseone", "Kagiso", "Katlego", "Lesego", "Masego", "Neo", "Oarabile", "Omphile", "Phenyo", "Refilwe", "Tshiamo", "Tumisang", "Wame"];
const LAST = ["Mosweu", "Kgosietsile", "Ramotswa", "Sebina", "Dintwe", "Mothibi", "Kebonang", "Tau", "Moremi", "Pheko", "Gaolathe", "Mmolawa"];
const IDEAS = [
  "Mobile soil testing for smallholders", "Biogas from abattoir waste", "Setswana coding bootcamp app", "Cold chain lockers for vegetable vendors",
  "Drone mapping for land boards", "Leather goods from game hides", "Water-saving drip kits", "Telemedicine kiosk for clinics",
  "Sorghum snack bars", "E-hailing for rural taxis", "Recycled plastic paving", "Mental health chat line for students",
  "Hydroponic fodder units", "Craft marketplace for weavers", "Solar dryers for mopane worms", "Job-matching platform for artisans",
];
const DISTRICTS = ["Gaborone", "Francistown", "Maun", "Kgalagadi", "Kweneng", "Central", "North-East", "South-East", "Chobe", "Ghanzi"];

export async function seedDemoData(prisma: PrismaClient) {
  const now = Date.now();
  const ago = (d: number) => new Date(now - d * DAY);
  const ahead = (d: number) => new Date(now + d * DAY);
  const hoursAgo = (h: number) => new Date(now - h * HOUR);

  let rngState = 42;
  const rand = () => ((rngState = (rngState * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
  const between = (a: number, b: number) => Math.round(a + rand() * (b - a));

  await prisma.forumReply.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.message.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.instanceFile.deleteMany();
  await prisma.instanceField.deleteMany();
  await prisma.instance.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users: Record<string, { id: string; name: string; organizationName: string | null; role: Role }> = {};
  const userRows: Prisma.UserCreateManyInput[] = [];

  function queueUser(key: string, data: Omit<Prisma.UserCreateManyInput, "passwordHash">) {
    const id = crypto.randomUUID();
    const row: Prisma.UserCreateManyInput = { id, ...data, passwordHash };
    userRows.push(row);
    users[key] = { id, name: data.name, organizationName: data.organizationName ?? null, role: data.role ?? Role.INNOVATOR };
    return users[key];
  }

  // Staff
  queueUser("super", { email: "super@demo.ceda.bw", name: "Kgosi Mothibi", role: Role.SUPERADMIN, organizationName: "CEDA" });
  queueUser("tebogo", { email: "admin@demo.ceda.bw", name: "Tebogo Ramasedi", role: Role.ADMIN, organizationName: "CEDA", expertise: "Youth programmes" });
  queueUser("keabetswe", { email: "evaluator@demo.ceda.bw", name: "Dr Keabetswe Ntshole", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Agriculture, energy and rural enterprise" });
  queueUser("gofaone", { email: "gofaone.eval@demo.ceda.bw", name: "Gofaone Phiri", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Digital and fintech" });
  queueUser("masego", { email: "masego.eval@demo.ceda.bw", name: "Masego Lekgowe", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Finance and manufacturing" });
  queueUser("dineo", { email: "panel@demo.ceda.bw", name: "Mma Dineo Seabo", role: Role.ADJUDICATOR, organizationName: "CEDA", expertise: "Investment committee chair" });
  queueUser("onkemetse", { email: "panel2@demo.ceda.bw", name: "Onkemetse Gabaake", role: Role.ADJUDICATOR, organizationName: "CEDA", expertise: "Venture capital" });

  const innov = (key: string, email: string, name: string, org: string, district: string, gender: string, age: number) =>
    queueUser(key, {
      email,
      name,
      role: Role.INNOVATOR,
      organizationName: org,
      licenseNumber: `BW000${between(1000000, 9999999)}`,
      omang: String(between(100000000, 999999999)),
      dateOfBirth: new Date(now - (age * 365.25 + between(10, 300)) * DAY),
      phone: `+267 7${between(1000000, 9999999)}`,
      district,
      gender,
      youthShareholding: between(60, 100),
      consentAt: ago(between(30, 90)),
    });

  innov("naledi", "innovator@demo.ceda.bw", "Naledi Molefe", "Molefe Ventures (Pty) Ltd", "Maun", "Female", 27);
  innov("kabelo", "kabelo@demo.ceda.bw", "Kabelo Dintwe", "Spaza Ledger (Pty) Ltd", "Gaborone", "Male", 29);
  innov("boitumelo", "boitumelo@demo.ceda.bw", "Boitumelo Tau", "Pula Pumps (Pty) Ltd", "Kgalagadi", "Female", 31);
  innov("onalenna", "onalenna@demo.ceda.bw", "Onalenna Kgari", "Kgomo Tech (Pty) Ltd", "North-East", "Female", 24);
  innov("tumelo", "tumelo@demo.ceda.bw", "Tumelo Ramotswa", "Thuto Labs (Pty) Ltd", "Central", "Male", 26);
  innov("lorato", "lorato@demo.ceda.bw", "Lorato Sebina", "Sebina Joinery (Pty) Ltd", "Gaborone", "Female", 33);
  innov("mpho", "mpho@demo.ceda.bw", "Mpho Kebonang", "Morula Gold (Pty) Ltd", "Francistown", "Male", 30);
  innov("thato", "thato@demo.ceda.bw", "Thato Mosweu", "Kgotla Digital (Pty) Ltd", "Kweneng", "Male", 22);

  const CALLS = [
    {
      code: "AGRI_2026",
      name: "Youth Agri-Innovation Challenge 2026",
      description: "Ideas that raise yields, cut post-harvest losses or add value to Botswana's livestock and crops, especially in rural districts.",
      dataType: DataType.TYPE_A,
      scale: Scale.SCALE_2,
      funding: "Up to P150,000 grant, 6 months of mentorship and market linkages",
      closes: ahead(26),
      extra: [{ key: "value_chain", label: "Value chain", type: "select", required: true, options: ["Livestock", "Horticulture", "Grains", "Agro-processing", "Inputs & services"] }],
    },
    {
      code: "DIGI_2026",
      name: "Digital Botswana Youth Challenge",
      description: "Software and digital services that bring more citizens and small businesses into the digital economy.",
      dataType: DataType.TYPE_B,
      scale: Scale.SCALE_3,
      funding: "Up to P250,000 blended finance and incubation",
      closes: ahead(19),
      extra: [{ key: "users_today", label: "Active users or pilot customers today", type: "number", required: true, validation: { min: 0 } }],
    },
    {
      code: "GREEN_2026",
      name: "Green Energy & Water Innovation Call",
      description: "Clean energy, water saving and climate adaptation ideas at idea or prototype stage.",
      dataType: DataType.TYPE_E,
      scale: Scale.SCALE_1,
      funding: "Up to P100,000 seed grant and technical support",
      closes: ahead(33),
      extra: [],
    },
    {
      code: "CREATE_2026",
      name: "Creative & Tourism Ventures Call",
      description: "Early-revenue ventures in tourism, crafts, fashion, music and film that can grow exports and rural tourism.",
      dataType: DataType.TYPE_D,
      scale: Scale.SCALE_4,
      funding: "Up to P300,000 term loan at a youth rate, plus a market-access grant",
      closes: ahead(12),
      extra: [{ key: "revenue_12m", label: "Revenue in the last 12 months (Pula)", type: "number", required: true, validation: { min: 0 } }],
    },
    {
      code: "SOCIAL_2026",
      name: "Health & Education Innovation Call",
      description: "Prototypes that improve access to health care, learning or skills for young people and rural communities.",
      dataType: DataType.TYPE_F,
      scale: Scale.SCALE_2,
      funding: "Up to P120,000 grant and a pilot partner",
      closes: ahead(40),
      extra: [],
    },
    {
      code: "MAKE_2026",
      name: "Local Manufacturing Challenge (Round 1)",
      description: "Pilot-stage manufacturing that replaces imports. Round 1 has closed; results are published.",
      dataType: DataType.TYPE_C,
      scale: Scale.SCALE_3,
      funding: "Up to P400,000 asset finance",
      closes: ago(45),
      status: CallStatus.CLOSED,
      extra: [],
    },
  ] as const;

  const calls: Record<string, { id: string; code: string; name: string; schema: InstanceSchema; closesAt: Date }> = {};
  const templateCreates = CALLS.map((c) => {
    const id = crypto.randomUUID();
    const schema = callSchema([...c.extra] as InstanceSchema["fields"]);
    calls[c.code] = { id, code: c.code, name: c.name, schema, closesAt: c.closes };
    return {
      id,
      code: c.code,
      name: c.name,
      description: c.description,
      dataType: c.dataType,
      scale: c.scale,
      schema: schema as unknown as Prisma.InputJsonValue,
      fundingSummary: c.funding,
      opensAt: "status" in c ? ago(110) : ago(20),
      closesAt: c.closes,
      status: "status" in c ? c.status : CallStatus.OPEN,
      reviewersPerIdea: 2,
      createdById: users.tebogo.id,
      createdAt: ago(25),
    };
  });

  const evaluatorKeys = ["keabetswe", "gofaone", "masego"];
  let refCounter = 0;
  const refFor = () => {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    refCounter++;
    let n = refCounter * 7919 + 104729;
    let s = "";
    for (let i = 0; i < 4; i++) {
      s = alphabet[n % alphabet.length] + s;
      n = Math.floor(n / alphabet.length);
    }
    return `CEDA-26-${s}`;
  };

  // Generate the 34 synthetic stories synchronously first so RNG order is 100% deterministic
  const allStories: Story[] = [...STORIES];
  const openCalls = ["AGRI_2026", "DIGI_2026", "GREEN_2026", "CREATE_2026", "SOCIAL_2026"];
  const statusMix: InstanceStatus[] = [
    InstanceStatus.SUBMITTED, InstanceStatus.SUBMITTED, InstanceStatus.UNDER_REVIEW, InstanceStatus.UNDER_REVIEW, InstanceStatus.UNDER_REVIEW,
    InstanceStatus.SHORTLISTED, InstanceStatus.SHORTLISTED, InstanceStatus.FLAGGED, InstanceStatus.DRAFT,
  ];
  let underReviewCount = 0;
  for (let i = 0; i < 34; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const district = pick(DISTRICTS);
    const key = `gen${i}`;
    innov(key, `${first}.${last}.${i}@example.bw`.toLowerCase(), `${first} ${last}`, `${last} ${pick(["Innovations", "Holdings", "Labs", "Agro", "Solutions"])} (Pty) Ltd`, district, rand() < 0.52 ? "Female" : "Male", between(19, 35));
    const call = i < 10 ? "MAKE_2026" : pick(openCalls);
    const status = call === "MAKE_2026" ? pick([InstanceStatus.REJECTED, InstanceStatus.REJECTED, InstanceStatus.APPROVED, InstanceStatus.REJECTED, InstanceStatus.AWARDED]) : pick(statusMix);
    const idea = pick(IDEAS);
    const evaluated = ([InstanceStatus.UNDER_REVIEW, InstanceStatus.SHORTLISTED, InstanceStatus.APPROVED, InstanceStatus.AWARDED, InstanceStatus.REJECTED] as InstanceStatus[]).includes(status);
    const base = between(2, 4);
    const isUnderReview = status === InstanceStatus.UNDER_REVIEW;
    if (isUnderReview) underReviewCount++;
    // For UNDER_REVIEW ideas, always include keabetswe (j === 0) as pending so the demo evaluator has a rich queue to score.
    // For already-decided ideas, rotate evaluator pairs so keabetswe has ~12 past evaluations instead of 25.
    const pair = isUnderReview
      ? evaluatorKeys.slice(0, 2 + (rand() < 0.3 ? 1 : 0))
      : i % 2 === 0
        ? evaluatorKeys.slice(0, 2 + (rand() < 0.3 ? 1 : 0))
        : (rand() < 0.3 ? ["gofaone", "masego", "keabetswe"] : ["gofaone", "masego"]);
    const evs = evaluated
      ? pair.map((ev, j) => {
          const isPending = isUnderReview && j === 0;
          const preClearedConflict = isPending && underReviewCount % 2 === 1;
          return {
            evaluator: ev,
            pending: isPending,
            conflict: isPending ? (preClearedConflict ? false : undefined) : false,
            scores: isPending && !preClearedConflict
              ? undefined
              : CRITERIA.map(() => Math.min(5, Math.max(1, base + between(-1, 1)))),
            feedback: isPending && !preClearedConflict
              ? undefined
              : "Clear problem statement. Strengthen the evidence that customers will pay and show how the funds will be used.",
          };
        })
      : undefined;
    const decided = ([InstanceStatus.APPROVED, InstanceStatus.AWARDED, InstanceStatus.REJECTED, InstanceStatus.FLAGGED] as InstanceStatus[]).includes(status);
    allStories.push({
      innovator: key,
      call,
      title: idea,
      status,
      submittedDaysAgo: status === InstanceStatus.DRAFT ? undefined : call === "MAKE_2026" ? between(50, 70) : between(1, 18),
      answers: {
        problem: `Young people and small businesses in ${district} face this problem every day, and current options are expensive or far away.`,
        solution: `${idea}, run by a youth-owned company with a pilot in ${district}.`,
        novelty: "Locally designed for Botswana conditions at a lower price than imported alternatives.",
        customers: "Households, small businesses and local authorities.",
        team: "Two co-founders with technical and business backgrounds.",
        district,
        funding_requested: String(between(40, 450) * 1000),
        jobs_12m: String(between(2, 25)),
        impact: "Creates jobs for young citizens and supports economic diversification.",
        ...(call === "AGRI_2026" ? { value_chain: pick(["Livestock", "Horticulture", "Grains", "Agro-processing"]) } : {}),
        ...(call === "DIGI_2026" ? { users_today: String(between(0, 400)) } : {}),
        ...(call === "CREATE_2026" ? { revenue_12m: String(between(10, 300) * 1000) } : {}),
      },
      evaluations: evs,
      resubmitted: evaluated && i % 4 === 1,
      decision: decided
        ? {
            by: status === InstanceStatus.FLAGGED ? "tebogo" : "dineo",
            daysAgo: call === "MAKE_2026" ? 30 : between(1, 5),
            notes: status === InstanceStatus.REJECTED ? "Not selected this round. The panel's main concern was the route to paying customers." : status === InstanceStatus.FLAGGED ? "Please add a budget breakdown and resubmit." : "Approved by the panel.",
            award: status === InstanceStatus.AWARDED ? between(8, 30) * 10000 : undefined,
          }
        : undefined,
    });
  }

  await prisma.user.createMany({ data: userRows });
  await Promise.all(templateCreates.map((data) => prisma.template.create({ data })));

  const created: Record<string, { id: string; referenceCode: string }> = {};
  const allAuditLogs: Prisma.AuditLogCreateManyInput[] = [];
  const allMessages: Prisma.MessageCreateManyInput[] = [];
  const allEvaluations: Prisma.EvaluationCreateManyInput[] = [];
  const instanceCreates: Prisma.InstanceUncheckedCreateInput[] = [];

  for (const story of allStories) {
    const call = calls[story.call];
    const innovator = users[story.innovator];
    const submittedAt = story.submittedDaysAgo !== undefined ? ago(story.submittedDaysAgo) : undefined;
    const createdAt = submittedAt ? new Date(submittedAt.getTime() - 3 * DAY) : ago(2);
    const referenceCode = refFor();

    const answers = { ...story.answers };
    const fieldRows = Object.entries(answers).map(([fieldKey, fieldValue]) => ({ fieldKey, fieldValue }));
    const fileSpecs =
      story.status === InstanceStatus.DRAFT
        ? []
        : [
            { key: "pitch_deck", name: `${referenceCode.toLowerCase()}-pitch.pdf`, type: "application/pdf", body: `%PDF-1.4\n% Pitch deck: ${story.title}\n` },
            { key: "cipa_certificate", name: "cipa-certificate.pdf", type: "application/pdf", body: `%PDF-1.4\n% CIPA certificate for ${innovator.organizationName}\n` },
          ];
    const fileRows = fileSpecs.map((f) => {
      const content = Buffer.from(f.body);
      const hash = sha256(content);
      return { fileKey: f.key, fileName: f.name, fileExtension: ".pdf", mimeType: f.type, fileSize: content.length, clientHash: hash, serverHash: hash, content, uploadedAt: submittedAt ?? createdAt };
    });

    const id = crypto.randomUUID();
    let submissionJwt: string | undefined;
    let dataHash: string | undefined;
    if (submittedAt) {
      dataHash = sha256(canonicalFields(answers));
      submissionJwt = signSubmission({
        instanceId: id,
        referenceCode,
        title: story.title,
        templateCode: call.code,
        innovatorId: innovator.id,
        innovatorOrg: innovator.organizationName,
        submittedAt: submittedAt.toISOString(),
        submissionNumber: 1,
        dataHash,
        fieldCount: fieldRows.length,
        fileHashes: fileRows.map((f) => ({ fileKey: f.fileKey, fileName: f.fileName, hash: f.serverHash })),
      });
    }

    const decisionBy = story.decision ? users[story.decision.by] : null;
    instanceCreates.push({
      id,
      referenceCode,
      title: story.title,
      templateId: call.id,
      innovatorId: innovator.id,
      status: story.status,
      deadline: call.closesAt,
      createdAt,
      encryptionKey: crypto.randomBytes(32).toString("hex"),
      submittedAt,
      submissionJwt,
      dataHash,
      submissionCount: submittedAt ? (story.resubmitted ? 2 : 1) : 0,
      reviewNotes: story.decision?.notes,
      reviewedById: decisionBy?.id,
      reviewedAt: story.decision ? ago(story.decision.daysAgo) : undefined,
      awardAmount: story.decision?.award,
      fields: { create: fieldRows },
      files: { create: fileRows },
    });

    allAuditLogs.push({ actorId: innovator.id, action: "IDEA_STARTED", instanceId: id, createdAt, metadata: { callCode: call.code, referenceCode } });
    if (submittedAt && story.resubmitted) {
      const first = new Date(submittedAt.getTime() - 5 * DAY);
      allAuditLogs.push({ actorId: innovator.id, action: "IDEA_SUBMITTED", instanceId: id, createdAt: first, metadata: { submissionNumber: 1 } });
      allAuditLogs.push({ actorId: users.tebogo.id, action: "IDEA_FLAGGED", instanceId: id, createdAt: new Date(first.getTime() + 2 * DAY), metadata: { notes: "Please add a budget breakdown." } });
      allAuditLogs.push({ actorId: innovator.id, action: "IDEA_RESUBMITTED", instanceId: id, createdAt: submittedAt, metadata: { dataHash, submissionNumber: 2 } });
    } else if (submittedAt) {
      allAuditLogs.push({ actorId: innovator.id, action: "IDEA_SUBMITTED", instanceId: id, createdAt: submittedAt, metadata: { dataHash } });
    }

    let lastScore: Date | null = null;
    for (const [i, e] of Array.from((story.evaluations ?? []).entries())) {
      const evaluator = users[e.evaluator];
      const sub = (submittedAt ?? createdAt).getTime();
      const assignedAt = new Date(Math.min(sub + DAY, now - 6 * 3600_000, Math.max(sub, now - 6 * 3600_000)));
      const scores = e.scores ? Object.fromEntries(CRITERIA.map((c, j) => [c.key, e.scores![j]])) : undefined;
      const total = scores ? weightedTotal(CRITERIA, scores) : null;
      const submittedEval = e.pending ? null : new Date(Math.min(assignedAt.getTime() + (2 + i) * DAY, now - (3 - i) * 3600_000));
      allEvaluations.push({
        instanceId: id,
        evaluatorId: evaluator.id,
        assignedById: users.tebogo.id,
        assignedAt,
        dueAt: new Date(assignedAt.getTime() + 7 * DAY),
        conflict: e.conflict !== undefined ? e.conflict : e.pending ? null : false,
        scores: scores ?? undefined,
        total,
        feedback: e.feedback,
        privateNote: e.privateNote,
        submittedAt: submittedEval,
      });
      if (i === 0) allAuditLogs.push({ actorId: users.tebogo.id, action: "EVALUATORS_ASSIGNED", instanceId: id, createdAt: assignedAt, metadata: { evaluators: story.evaluations!.map((x) => users[x.evaluator].name) } });
      if (submittedEval) allAuditLogs.push({ actorId: evaluator.id, action: "EVALUATION_SUBMITTED", instanceId: id, createdAt: submittedEval, metadata: { total } });
      if (submittedEval && (!lastScore || submittedEval > lastScore)) lastScore = submittedEval;
    }

    const pastReview = ["SHORTLISTED", "APPROVED", "AWARDED", "REJECTED"].includes(story.status);
    if (pastReview && lastScore) {
      allAuditLogs.push({ actorId: users.tebogo.id, action: "IDEA_SHORTLISTED", instanceId: id, createdAt: lastScore, metadata: { reason: "all evaluations in" } });
    }
    if (story.decision) {
      allAuditLogs.push({ actorId: decisionBy!.id, action: `IDEA_${story.status}`, instanceId: id, createdAt: ago(story.decision.daysAgo), metadata: { notes: story.decision.notes, ...(story.decision.award ? { awardAmount: story.decision.award } : {}) } });
    }
    for (const m of story.messages ?? []) {
      allMessages.push({ instanceId: id, authorId: users[m.from].id, body: m.body, internal: !!m.internal, createdAt: ago(m.daysAgo) });
    }
    created[`${story.innovator}:${story.call}`] = { id, referenceCode };
  }

  // Batch create instances in chunks of 10
  for (let i = 0; i < instanceCreates.length; i += 10) {
    await Promise.all(instanceCreates.slice(i, i + 10).map((data) => prisma.instance.create({ data })));
  }
  if (allEvaluations.length) await prisma.evaluation.createMany({ data: allEvaluations });
  if (allMessages.length) await prisma.message.createMany({ data: allMessages });
  if (allAuditLogs.length) await prisma.auditLog.createMany({ data: allAuditLogs });

  const n = (user: string, title: string, body: string, link: string, daysAgo: number, read = false) => ({ userId: users[user].id, title, body, link, createdAt: ago(daysAgo), read });
  const nal = created["naledi:CREATE_2026"];
  const pump = created["boitumelo:GREEN_2026"];
  const spaza = created["kabelo:DIGI_2026"];
  const kgomo = created["onalenna:AGRI_2026"];
  await prisma.notification.createMany({
    data: [
      n("naledi", `${nal.referenceCode} needs changes`, "Please upload a budget breakdown and a letter of intent from a lodge, then resubmit.", `/dashboard/innovator/instance-runner/${nal.id}`, 4),
      n("naledi", `CEDA asked about ${nal.referenceCode}`, "Could you also confirm whether the polers are shareholders?", `/dashboard/innovator/instance-runner/${nal.id}`, 4),
      n("naledi", "Award confirmed", "Sefofu was awarded P320,000 asset finance.", "/dashboard/innovator/instances", 30, true),
      n("keabetswe", "New idea to evaluate", `Green Energy & Water Innovation Call: "Pula Pumps". Due in 3 days.`, "/dashboard/evaluator", 3),
      n("dineo", "Idea ready for the panel", `All scores are in for ${spaza.referenceCode} "Spaza Ledger". Evaluators disagree.`, `/dashboard/panel/${spaza.id}`, 2),
      n("tebogo", "New idea submitted", `${kgomo.referenceCode} "Kgomo Tag" was submitted to the Youth Agri-Innovation Challenge.`, `/dashboard/admin/instances/${kgomo.id}`, 1),
      n("tebogo", `Reply on ${nal.referenceCode}`, "Yes, two polers each hold 10%. I'll add the share register with the budget.", `/dashboard/admin/instances/${nal.id}`, 3),
      n("super", "Evaluation in progress", `${pump.referenceCode} has one of two scorecards in.`, `/dashboard/admin/instances/${pump.id}`, 2),
    ],
  });

  const awardedIds = (await prisma.instance.findMany({ where: { status: InstanceStatus.AWARDED }, orderBy: { referenceCode: "asc" }, select: { id: true } })).map((i) => i.id);
  await prisma.instance.updateMany({ where: { id: { in: awardedIds.slice(0, -1) } }, data: { showcase: true } });

  // Community discussions & safe-practice notices
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

  await Promise.all(
    threads.map((t) =>
      prisma.forumThread.create({
        data: {
          title: t.title,
          body: t.body,
          category: t.category,
          pinned: !!t.pinned,
          authorId: u(t.by),
          createdAt: hoursAgo(t.h),
          updatedAt: hoursAgo(t.replies.length ? Math.min(...t.replies.map((r) => r[1])) : t.h),
          replies: {
            create: t.replies.map(([by, h, body]) => ({
              authorId: u(by),
              body,
              createdAt: hoursAgo(h),
            })),
          },
        },
      }),
    ),
  );

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

  await prisma.notice.createMany({
    data: notices.map((n) => ({
      title: n.title,
      summary: n.summary,
      dos: n.dos.join("\n"),
      donts: n.donts.join("\n"),
      category: n.category,
      pinned: !!n.pinned,
      authorId: u(n.by),
      createdAt: hoursAgo(n.h),
    })),
  });

  return { users: userRows.length, instances: instanceCreates.length, threads: threads.length };
}
