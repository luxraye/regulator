/**
 * Demo data for the CEDA Innovation Portal.
 * Everything here is fictional. Running the seed wipes the demo database and rebuilds it,
 * with dates relative to today so deadlines and timelines always look current.
 */
import { PrismaClient, Role, Scale, DataType, InstanceStatus, CallStatus, Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { signSubmission } from "../src/lib/jwt-sign";
import { canonicalFields, type InstanceSchema } from "../src/lib/instance-schema";
import { sha256 } from "../src/lib/hash";
import { weightedTotal } from "../src/lib/scoring";

const prisma = new PrismaClient();
export const DEMO_PASSWORD = "CedaDemo2026!";

const DAY = 86_400_000;
const ago = (d: number) => new Date(Date.now() - d * DAY);
const ahead = (d: number) => new Date(Date.now() + d * DAY);

// Deterministic pseudo-random numbers so every seed looks the same.
let rngState = 42;
const rand = () => ((rngState = (rngState * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
const between = (a: number, b: number) => Math.round(a + rand() * (b - a));

// ---------- Calls ----------

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

// ---------- Demo stories ----------

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
    title: "Sefofu: recycled-glass tiles made in Lobatse",
    status: InstanceStatus.AWARDED,
    submittedDaysAgo: 60,
    answers: {
      problem: "Botswana imports nearly all its floor and wall tiles while bottle glass goes to landfill.",
      solution: "Crush and fuse collected bottles into decorative tiles in a small kiln in Lobatse.",
      novelty: "Uses local waste glass as the main raw material; no clay import needed.",
      customers: "Hardware chains, interior designers and government housing projects.",
      team: "Naledi plus a ceramics graduate and a former brewery logistics manager.",
      district: "South-East",
      funding_requested: "350000",
      jobs_12m: "14",
      impact: "Import substitution, recycling and factory jobs for young people.",
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
      { evaluator: "keabetswe", pending: true },
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
    answers: { problem: "Village meetings are announced by word of mouth and many young people miss them." },
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

async function main() {
  console.log("Resetting demo data…");
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

  async function addUser(key: string, data: Omit<Prisma.UserCreateInput, "passwordHash">) {
    const u = await prisma.user.create({ data: { ...data, passwordHash }, select: { id: true, name: true, organizationName: true, role: true } });
    users[key] = u;
    return u;
  }

  // Staff
  await addUser("super", { email: "super@demo.ceda.bw", name: "Kgosi Mothibi", role: Role.SUPERADMIN, organizationName: "CEDA" });
  await addUser("tebogo", { email: "admin@demo.ceda.bw", name: "Tebogo Ramasedi", role: Role.ADMIN, organizationName: "CEDA", expertise: "Youth programmes" });
  await addUser("keabetswe", { email: "evaluator@demo.ceda.bw", name: "Dr Keabetswe Ntshole", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Agriculture, energy and rural enterprise" });
  await addUser("gofaone", { email: "gofaone.eval@demo.ceda.bw", name: "Gofaone Phiri", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Digital and fintech" });
  await addUser("masego", { email: "masego.eval@demo.ceda.bw", name: "Masego Lekgowe", role: Role.EVALUATOR, organizationName: "CEDA", expertise: "Finance and manufacturing" });
  await addUser("dineo", { email: "panel@demo.ceda.bw", name: "Mma Dineo Seabo", role: Role.ADJUDICATOR, organizationName: "CEDA", expertise: "Investment committee chair" });
  await addUser("onkemetse", { email: "panel2@demo.ceda.bw", name: "Onkemetse Gabaake", role: Role.ADJUDICATOR, organizationName: "CEDA", expertise: "Venture capital" });

  // Named innovators
  const innov = (key: string, email: string, name: string, org: string, district: string, gender: string, age: number) =>
    addUser(key, {
      email,
      name,
      role: Role.INNOVATOR,
      organizationName: org,
      licenseNumber: `BW000${between(1000000, 9999999)}`,
      omang: String(between(100000000, 999999999)),
      dateOfBirth: new Date(Date.now() - (age * 365.25 + between(10, 300)) * DAY),
      phone: `+267 7${between(1000000, 9999999)}`,
      district,
      gender,
      youthShareholding: between(60, 100),
      consentAt: ago(between(30, 90)),
    });
  await innov("naledi", "innovator@demo.ceda.bw", "Naledi Molefe", "Molefe Ventures (Pty) Ltd", "Maun", "Female", 27);
  await innov("kabelo", "kabelo@demo.ceda.bw", "Kabelo Dintwe", "Spaza Ledger (Pty) Ltd", "Gaborone", "Male", 29);
  await innov("boitumelo", "boitumelo@demo.ceda.bw", "Boitumelo Tau", "Pula Pumps (Pty) Ltd", "Kgalagadi", "Female", 31);
  await innov("onalenna", "onalenna@demo.ceda.bw", "Onalenna Kgari", "Kgomo Tech (Pty) Ltd", "North-East", "Female", 24);
  await innov("tumelo", "tumelo@demo.ceda.bw", "Tumelo Ramotswa", "Thuto Labs (Pty) Ltd", "Central", "Male", 26);
  await innov("lorato", "lorato@demo.ceda.bw", "Lorato Sebina", "Sebina Joinery (Pty) Ltd", "Gaborone", "Female", 33);
  await innov("mpho", "mpho@demo.ceda.bw", "Mpho Kebonang", "Morula Gold (Pty) Ltd", "Francistown", "Male", 30);
  await innov("thato", "thato@demo.ceda.bw", "Thato Mosweu", "Kgotla Digital (Pty) Ltd", "Kweneng", "Male", 22);
  console.log("Users seeded.");

  // Calls
  const calls: Record<string, { id: string; code: string; name: string; schema: InstanceSchema; closesAt: Date }> = {};
  for (const c of CALLS) {
    const schema = callSchema([...c.extra] as InstanceSchema["fields"]);
    const created = await prisma.template.create({
      data: {
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
      },
    });
    calls[c.code] = { id: created.id, code: c.code, name: c.name, schema, closesAt: c.closes };
  }
  console.log("Calls seeded.");

  // Ideas
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

  async function createIdea(story: Story) {
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
    await prisma.instance.create({
      data: {
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
        submissionCount: submittedAt ? 1 : 0,
        reviewNotes: story.decision?.notes,
        reviewedById: decisionBy?.id,
        reviewedAt: story.decision ? ago(story.decision.daysAgo) : undefined,
        awardAmount: story.decision?.award,
        fields: { create: fieldRows },
        files: { create: fileRows },
      },
    });

    const log: Prisma.AuditLogCreateManyInput[] = [
      { actorId: innovator.id, action: "IDEA_STARTED", instanceId: id, createdAt, metadata: { callCode: call.code, referenceCode } },
    ];
    if (submittedAt) log.push({ actorId: innovator.id, action: "IDEA_SUBMITTED", instanceId: id, createdAt: submittedAt, metadata: { dataHash } });

    for (const [i, e] of Array.from((story.evaluations ?? []).entries())) {
      const evaluator = users[e.evaluator];
      const assignedAt = new Date((submittedAt ?? createdAt).getTime() + DAY);
      const scores = e.scores ? Object.fromEntries(CRITERIA.map((c, j) => [c.key, e.scores![j]])) : undefined;
      const total = scores ? weightedTotal(CRITERIA, scores) : null;
      const submittedEval = e.pending ? null : new Date(assignedAt.getTime() + (2 + i) * DAY);
      await prisma.evaluation.create({
        data: {
          instanceId: id,
          evaluatorId: evaluator.id,
          assignedById: users.tebogo.id,
          assignedAt,
          dueAt: new Date(assignedAt.getTime() + 7 * DAY),
          conflict: e.pending ? null : e.conflict ?? false,
          scores: scores ?? undefined,
          total,
          feedback: e.feedback,
          privateNote: e.privateNote,
          submittedAt: submittedEval,
        },
      });
      if (i === 0) log.push({ actorId: users.tebogo.id, action: "EVALUATORS_ASSIGNED", instanceId: id, createdAt: assignedAt, metadata: { evaluators: story.evaluations!.map((x) => users[x.evaluator].name) } });
      if (submittedEval) log.push({ actorId: evaluator.id, action: "EVALUATION_SUBMITTED", instanceId: id, createdAt: submittedEval, metadata: { total } });
    }
    if (story.decision) {
      log.push({ actorId: decisionBy!.id, action: `IDEA_${story.status}`, instanceId: id, createdAt: ago(story.decision.daysAgo), metadata: { notes: story.decision.notes, ...(story.decision.award ? { awardAmount: story.decision.award } : {}) } });
    }
    for (const m of story.messages ?? []) {
      await prisma.message.create({ data: { instanceId: id, authorId: users[m.from].id, body: m.body, internal: !!m.internal, createdAt: ago(m.daysAgo) } });
    }
    await prisma.auditLog.createMany({ data: log });
    return { id, referenceCode };
  }

  const created: Record<string, { id: string; referenceCode: string }> = {};
  for (const s of STORIES) created[`${s.innovator}:${s.call}`] = await createIdea(s);

  // A wider field of applicants so rankings and reports have something to show.
  const openCalls = ["AGRI_2026", "DIGI_2026", "GREEN_2026", "CREATE_2026", "SOCIAL_2026"];
  const statusMix: InstanceStatus[] = [
    InstanceStatus.SUBMITTED, InstanceStatus.SUBMITTED, InstanceStatus.UNDER_REVIEW, InstanceStatus.UNDER_REVIEW,
    InstanceStatus.SHORTLISTED, InstanceStatus.SHORTLISTED, InstanceStatus.SHORTLISTED, InstanceStatus.FLAGGED, InstanceStatus.DRAFT,
  ];
  for (let i = 0; i < 34; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    const district = pick(DISTRICTS);
    const key = `gen${i}`;
    await innov(key, `${first}.${last}.${i}@example.bw`.toLowerCase(), `${first} ${last}`, `${last} ${pick(["Innovations", "Holdings", "Labs", "Agro", "Solutions"])} (Pty) Ltd`, district, rand() < 0.52 ? "Female" : "Male", between(19, 35));
    const call = i < 10 ? "MAKE_2026" : pick(openCalls);
    const status = call === "MAKE_2026" ? pick([InstanceStatus.REJECTED, InstanceStatus.REJECTED, InstanceStatus.APPROVED, InstanceStatus.REJECTED, InstanceStatus.AWARDED]) : pick(statusMix);
    const idea = pick(IDEAS);
    const evaluated = ([InstanceStatus.UNDER_REVIEW, InstanceStatus.SHORTLISTED, InstanceStatus.APPROVED, InstanceStatus.AWARDED, InstanceStatus.REJECTED] as InstanceStatus[]).includes(status);
    const base = between(2, 4);
    const evs = evaluated
      ? evaluatorKeys
          .slice(0, 2 + (rand() < 0.3 ? 1 : 0))
          .map((ev, j) => ({
            evaluator: ev,
            pending: status === InstanceStatus.UNDER_REVIEW && j === 1,
            scores: CRITERIA.map(() => Math.min(5, Math.max(1, base + between(-1, 1)))),
            feedback: "Clear problem statement. Strengthen the evidence that customers will pay and show how the funds will be used.",
          }))
      : undefined;
    const decided = ([InstanceStatus.APPROVED, InstanceStatus.AWARDED, InstanceStatus.REJECTED, InstanceStatus.FLAGGED] as InstanceStatus[]).includes(status);
    await createIdea({
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
  console.log("Ideas, evaluations and decisions seeded.");

  // Notifications so each demo account has something in the bell.
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

  console.log(`Seed complete. Demo password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
