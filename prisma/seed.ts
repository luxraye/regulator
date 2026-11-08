import { PrismaClient, Role, Scale, DataType, InstanceStatus, ComplaintStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { signSubmission } from "../src/lib/jwt-sign";
import { canonicalFields } from "../src/lib/instance-schema";
import { sha256 } from "../src/lib/hash";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 12);

  // Users
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@bocra.org.bw" },
    update: {},
    create: {
      email: "super@bocra.org.bw",
      name: "Kgosi Mothibi",
      passwordHash,
      role: Role.SUPERADMIN,
      organizationName: "BOCRA",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@bocra.org.bw" },
    update: {},
    create: {
      email: "admin@bocra.org.bw",
      name: "Naledi Phiri",
      passwordHash,
      role: Role.ADMIN,
      organizationName: "BOCRA",
    },
  });

  const mascom = await prisma.user.upsert({
    where: { email: "mascom@licensee.co.bw" },
    update: {},
    create: {
      email: "mascom@licensee.co.bw",
      name: "Thabo Masire",
      passwordHash,
      role: Role.LICENSEE,
      organizationName: "Mascom Wireless",
      licenseNumber: "LIC-TEL-001",
    },
  });

  const orange = await prisma.user.upsert({
    where: { email: "orange@licensee.co.bw" },
    update: {},
    create: {
      email: "orange@licensee.co.bw",
      name: "Mpho Kgosidintsi",
      passwordHash,
      role: Role.LICENSEE,
      organizationName: "Orange Botswana",
      licenseNumber: "LIC-TEL-002",
    },
  });

  const btc = await prisma.user.upsert({
    where: { email: "btc@licensee.co.bw" },
    update: {},
    create: {
      email: "btc@licensee.co.bw",
      name: "Lesego Mogwe",
      passwordHash,
      role: Role.LICENSEE,
      organizationName: "Botswana Telecommunications Corporation",
      licenseNumber: "LIC-TEL-003",
    },
  });

  const citizen = await prisma.user.upsert({
    where: { email: "citizen@demo.co.bw" },
    update: {},
    create: {
      email: "citizen@demo.co.bw",
      name: "Kagiso Moagi",
      passwordHash,
      role: Role.PUBLIC,
    },
  });

  console.log("Users seeded.");

  // Templates
  const templateA1 = await prisma.template.upsert({
    where: { code: "A1_2026" },
    update: {},
    create: {
      code: "A1_2026",
      name: "Financial Audit - Major Telecom",
      description: "High-security financial compliance audit for public telecommunications operators handling mobile money services.",
      scale: Scale.SCALE_1,
      dataType: DataType.TYPE_A,
      createdById: superAdmin.id,
      schema: {
        fields: [
          {
            key: "revenue_total",
            label: "Total Revenue (BWP)",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "mobile_money_transactions",
            label: "Mobile Money Transaction Count",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "mobile_money_volume",
            label: "Mobile Money Volume (BWP)",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "compliance_notes",
            label: "Compliance Notes",
            type: "textarea",
            required: false,
          },
        ],
        required_files: [
          { key: "financial_statements", label: "Audited Financial Statements", extensions: [".pdf", ".xlsx"], maxSizeMB: 4 },
          { key: "transaction_logs", label: "Mobile Money Transaction Logs", extensions: [".csv", ".json"], maxSizeMB: 4 },
        ],
      },
    },
  });

  const templateB2 = await prisma.template.upsert({
    where: { code: "B2_2026" },
    update: {},
    create: {
      code: "B2_2026",
      name: "Spectrum Usage Report - ISP",
      description: "Technical compliance report for medium-scale ISPs covering radio spectrum allocation and usage metrics.",
      scale: Scale.SCALE_2,
      dataType: DataType.TYPE_B,
      createdById: superAdmin.id,
      schema: {
        fields: [
          {
            key: "spectrum_band",
            label: "Spectrum Band (MHz)",
            type: "text",
            required: true,
          },
          {
            key: "coverage_percentage",
            label: "Coverage Percentage",
            type: "number",
            required: true,
            validation: { min: 0, max: 100 },
          },
          {
            key: "uptime_percentage",
            label: "Network Uptime (%)",
            type: "number",
            required: true,
            validation: { min: 0, max: 100 },
          },
          {
            key: "qos_score",
            label: "Quality of Service Score",
            type: "number",
            required: true,
            validation: { min: 0, max: 100 },
          },
        ],
        required_files: [
          { key: "performance_logs", label: "Network Performance Logs", extensions: [".csv"], maxSizeMB: 4 },
        ],
      },
    },
  });

  const templateC3 = await prisma.template.upsert({
    where: { code: "C3_2026" },
    update: {},
    create: {
      code: "C3_2026",
      name: "Consumer Complaints Summary - VANS",
      description: "Light reporting template for small Value-Added Network Services covering consumer complaint handling.",
      scale: Scale.SCALE_3,
      dataType: DataType.TYPE_C,
      createdById: superAdmin.id,
      schema: {
        fields: [
          {
            key: "complaints_received",
            label: "Total Complaints Received",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "complaints_resolved",
            label: "Complaints Resolved",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "avg_resolution_days",
            label: "Average Resolution Time (Days)",
            type: "number",
            required: true,
            validation: { min: 0 },
          },
          {
            key: "summary",
            label: "Summary of Common Issues",
            type: "textarea",
            required: true,
          },
        ],
        required_files: [
          { key: "complaint_register", label: "Complaint Register", extensions: [".csv", ".xlsx"], maxSizeMB: 4 },
        ],
      },
    },
  });

  const extraTemplates = [
    {
      code: "D1_2026",
      name: "Infrastructure Census - Major Telecom",
      description: "Annual count of towers, fibre and sites, used for national coverage planning and infrastructure sharing.",
      scale: Scale.SCALE_1,
      dataType: DataType.TYPE_D,
      schema: {
        fields: [
          { key: "reporting_year", label: "Reporting Year", type: "text", required: true, hint: "2026", validation: { pattern: "^20\\d{2}$" } },
          { key: "tower_count", label: "Towers in Service", type: "number", required: true, validation: { min: 0 } },
          { key: "shared_towers", label: "Towers Shared with Other Operators", type: "number", required: true, validation: { min: 0 } },
          { key: "fibre_km", label: "Fibre Route Length (km)", type: "number", required: true, validation: { min: 0 } },
          { key: "coverage_percentage", label: "Population Coverage (%)", type: "number", required: true, validation: { min: 0, max: 100 } },
          { key: "rural_sites_added", label: "New Rural Sites This Year", type: "number", required: false, validation: { min: 0 } },
        ],
        required_files: [{ key: "site_register", label: "Site Register (GPS)", extensions: [".csv", ".xlsx"], maxSizeMB: 4 }],
      },
    },
    {
      code: "E2_2026",
      name: "Cybersecurity & Data Protection Return",
      description: "Security posture and incident reporting for large operators under the Cybercrime and Data Protection Acts.",
      scale: Scale.SCALE_2,
      dataType: DataType.TYPE_E,
      schema: {
        fields: [
          { key: "security_incidents", label: "Reportable Security Incidents", type: "number", required: true, validation: { min: 0 } },
          { key: "data_breaches", label: "Personal Data Breaches", type: "number", required: true, validation: { min: 0 } },
          { key: "iso27001_status", label: "ISO 27001 Status", type: "select", required: true, options: ["Certified", "In progress", "Not started"] },
          { key: "last_pen_test", label: "Date of Last Penetration Test", type: "date", required: true },
          { key: "dpo_name", label: "Data Protection Officer", type: "text", required: true },
        ],
        required_files: [
          { key: "incident_log", label: "Incident Log", extensions: [".csv", ".pdf"], maxSizeMB: 4 },
          { key: "pen_test_summary", label: "Penetration Test Summary", extensions: [".pdf"], maxSizeMB: 4, optional: true },
        ],
      },
    },
    {
      code: "F4_2026",
      name: "Licence Conditions & Governance - Courier",
      description: "Short governance return for small courier and postal licensees.",
      scale: Scale.SCALE_4,
      dataType: DataType.TYPE_F,
      schema: {
        fields: [
          { key: "licence_number", label: "Licence Number", type: "text", required: true },
          { key: "employees", label: "Employees in Botswana", type: "number", required: true, validation: { min: 0 } },
          { key: "citizen_ownership", label: "Citizen Ownership (%)", type: "number", required: true, validation: { min: 0, max: 100 } },
          { key: "branches", label: "Branches / Drop-off Points", type: "number", required: true, validation: { min: 0 } },
        ],
        required_files: [{ key: "tax_clearance", label: "BURS Tax Clearance Certificate", extensions: [".pdf"], maxSizeMB: 4 }],
      },
    },
  ];

  for (const t of extraTemplates) {
    await prisma.template.upsert({
      where: { code: t.code },
      update: {},
      create: { ...t, createdById: superAdmin.id },
    });
  }

  console.log("Templates seeded.");

  // ===== Sample instances =====
  // Recreated on every seed so dates stay relative to today and receipts are valid.
  const day = 86_400_000;
  const ago = (d: number) => new Date(Date.now() - d * day);
  const ahead = (d: number) => new Date(Date.now() + d * day);

  const demoIds = ["inst-mascom-a1", "inst-orange-a1", "inst-btc-b2", "inst-mascom-c3", "inst-btc-a1", "inst-orange-b2"];
  await prisma.auditLog.deleteMany({ where: { instanceId: { in: demoIds } } });
  await prisma.instance.deleteMany({ where: { id: { in: demoIds } } });

  type Demo = {
    id: string;
    template: { id: string; code: string; name: string };
    licensee: { id: string; organizationName: string | null };
    status: InstanceStatus;
    deadline: Date;
    createdAt: Date;
    fields?: Record<string, string>;
    files?: { key: string; name: string; type: string; body: string }[];
    submittedAt?: Date;
    review?: { status: InstanceStatus; at: Date; notes: string };
  };

  const demos: Demo[] = [
    { id: "inst-mascom-a1", template: templateA1, licensee: mascom, status: InstanceStatus.PENDING, deadline: ahead(21), createdAt: ago(5) },
    {
      id: "inst-btc-a1", template: templateA1, licensee: btc, status: InstanceStatus.IN_PROGRESS, deadline: ahead(4), createdAt: ago(12),
      fields: { revenue_total: "1240000000", mobile_money_transactions: "3880000" },
    },
    {
      id: "inst-orange-a1", template: templateA1, licensee: orange, status: InstanceStatus.SUBMITTED, deadline: ahead(10), createdAt: ago(20), submittedAt: ago(1),
      fields: { revenue_total: "2105000000", mobile_money_transactions: "9120000", mobile_money_volume: "4380000000", compliance_notes: "Orange Money float fully backed by trust account at Stanbic. Q3 agent audit attached in the transaction logs." },
      files: [
        { key: "financial_statements", name: "orange-fy2026-statements.xlsx", type: "text/csv", body: "line_item,amount_bwp\nService revenue,1980000000\nOther revenue,125000000\nOperating costs,1460000000\n" },
        { key: "transaction_logs", name: "orange-money-q3.csv", type: "text/csv", body: "month,transactions,volume_bwp\nJul,3010000,1440000000\nAug,3050000,1462000000\nSep,3060000,1478000000\n" },
      ],
    },
    {
      id: "inst-btc-b2", template: templateB2, licensee: btc, status: InstanceStatus.APPROVED, deadline: ago(30), createdAt: ago(60), submittedAt: ago(35),
      fields: { spectrum_band: "2600", coverage_percentage: "87", uptime_percentage: "99.4", qos_score: "84" },
      files: [{ key: "performance_logs", name: "btc-network-perf.csv", type: "text/csv", body: "week,uptime,latency_ms\n1,99.5,38\n2,99.2,41\n3,99.6,37\n4,99.3,40\n" }],
      review: { status: InstanceStatus.APPROVED, at: ago(33), notes: "All metrics within acceptable range. Approved." },
    },
    {
      id: "inst-orange-b2", template: templateB2, licensee: orange, status: InstanceStatus.SUBMITTED, deadline: ago(2), createdAt: ago(40), submittedAt: ago(0.2),
      fields: { spectrum_band: "1800", coverage_percentage: "91", uptime_percentage: "96.1", qos_score: "71" },
      files: [{ key: "performance_logs", name: "orange-network-perf.csv", type: "text/csv", body: "week,uptime,latency_ms\n1,97.0,52\n2,95.4,61\n3,96.2,55\n4,95.8,58\n" }],
    },
    {
      id: "inst-mascom-c3", template: templateC3, licensee: mascom, status: InstanceStatus.FLAGGED, deadline: ahead(7), createdAt: ago(25), submittedAt: ago(9),
      fields: { complaints_received: "412", complaints_resolved: "305", avg_resolution_days: "38", summary: "Most complaints relate to unsolicited data bundle subscriptions after USSD time-outs and to delayed porting." },
      files: [{ key: "complaint_register", name: "mascom-complaints-q3.csv", type: "text/csv", body: "ref,category,opened,closed\nMSC-1,Billing,2026-07-02,2026-08-20\nMSC-2,Porting,2026-07-05,\n" }],
      review: { status: InstanceStatus.FLAGGED, at: ago(6), notes: "Resolution time of 38 days exceeds the 30-day regulatory threshold. Please attach a corrective action plan in the summary and resubmit." },
    },
  ];

  for (const d of demos) {
    const fileRows = (d.files ?? []).map((f) => {
      const content = Buffer.from(f.body);
      const hash = sha256(content);
      return { fileKey: f.key, fileName: f.name, fileExtension: f.name.slice(f.name.lastIndexOf(".")), mimeType: f.type, fileSize: content.length, clientHash: hash, serverHash: hash, content, uploadedAt: d.submittedAt ?? d.createdAt };
    });
    const fieldRows = Object.entries(d.fields ?? {}).map(([fieldKey, fieldValue]) => ({ fieldKey, fieldValue }));

    let submissionJwt: string | undefined;
    let dataHash: string | undefined;
    if (d.submittedAt) {
      dataHash = sha256(canonicalFields(d.fields ?? {}));
      submissionJwt = signSubmission({
        instanceId: d.id,
        templateCode: d.template.code,
        licenseeId: d.licensee.id,
        licenseeOrg: d.licensee.organizationName,
        submittedAt: d.submittedAt.toISOString(),
        submissionNumber: 1,
        dataHash,
        fieldCount: fieldRows.length,
        fileHashes: fileRows.map((f) => ({ fileKey: f.fileKey, fileName: f.fileName, hash: f.serverHash })),
      });
    }

    await prisma.instance.create({
      data: {
        id: d.id,
        templateId: d.template.id,
        licenseeId: d.licensee.id,
        assignedById: admin.id,
        status: d.status,
        deadline: d.deadline,
        createdAt: d.createdAt,
        encryptionKey: crypto.randomBytes(32).toString("hex"),
        submittedAt: d.submittedAt,
        submissionJwt,
        dataHash,
        submissionCount: d.submittedAt ? 1 : 0,
        reviewedAt: d.review?.at,
        reviewedById: d.review ? admin.id : undefined,
        reviewNotes: d.review?.notes,
        fields: { create: fieldRows },
        files: { create: fileRows },
      },
    });

    const log = [{ actorId: admin.id, action: "INSTANCE_PROVISIONED", createdAt: d.createdAt, metadata: { templateCode: d.template.code, licenseeOrg: d.licensee.organizationName } }];
    if (d.submittedAt) log.push({ actorId: d.licensee.id, action: "INSTANCE_SUBMITTED", createdAt: d.submittedAt, metadata: { dataHash, fileCount: fileRows.length } } as never);
    if (d.review) log.push({ actorId: admin.id, action: `INSTANCE_${d.review.status}`, createdAt: d.review.at, metadata: { reviewNotes: d.review.notes } } as never);
    await prisma.auditLog.createMany({ data: log.map((l) => ({ ...l, instanceId: d.id })) });
  }

  // Unread notifications so the bell has something to show.
  await prisma.notification.deleteMany({ where: { userId: { in: [admin.id, superAdmin.id, mascom.id, citizen.id] } } });
  await prisma.notification.createMany({
    data: [
      ...[admin.id, superAdmin.id].map((userId) => ({ userId, title: "New submission received", body: "Orange Botswana submitted Spectrum Usage Report - ISP (B2_2026).", link: "/dashboard/admin/instances/inst-orange-b2", createdAt: ago(0.2) })),
      { userId: mascom.id, title: "C3_2026 sent back for changes", body: "Resolution time of 38 days exceeds the 30-day regulatory threshold.", link: "/dashboard/licensee/instance-runner/inst-mascom-c3", createdAt: ago(6) },
      { userId: mascom.id, title: "New compliance instance assigned", body: "Financial Audit - Major Telecom (A1_2026) has been issued to Mascom Wireless.", link: "/dashboard/licensee/instance-runner/inst-mascom-a1", createdAt: ago(5) },
      { userId: citizen.id, title: "Complaint BOCRA-B2E1-44FA: Under review", body: "BOCRA engineering has requested tower maintenance logs from Orange.", link: "/dashboard/citizen/complaints", createdAt: ago(3) },
    ],
  });

  console.log("Sample instances seeded.");

  // ===== Citizen Demo Data for Kagiso Moagi =====

  // Complaints at different stages
  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-7A3F-01DC" },
    update: {},
    create: {
      trackingCode: "BOCRA-7A3F-01DC",
      userId: citizen.id,
      isAnonymous: false,
      name: "Kagiso Moagi",
      email: "citizen@demo.co.bw",
      phone: "+267 72 345 678",
      provider: "Mascom Wireless",
      category: "Billing / Charges",
      description: "I was charged P89.95 for a data bundle I did not subscribe to. The charge appeared on 12 March after a USSD session that timed out. I contacted Mascom customer care twice (ref: MSC-44821) but was told the charge is valid. I believe this is an error.",
      status: ComplaintStatus.RESOLVED,
      adminNotes: "Investigated with Mascom. Confirmed the USSD session triggered an accidental subscription. Mascom has issued a full refund of P89.95 to the complainant's account. Case resolved.",
      createdAt: new Date("2026-01-18"),
    },
  });

  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-B2E1-44FA" },
    update: {},
    create: {
      trackingCode: "BOCRA-B2E1-44FA",
      userId: citizen.id,
      isAnonymous: false,
      name: "Kagiso Moagi",
      email: "citizen@demo.co.bw",
      provider: "Orange Botswana",
      category: "Network Coverage",
      description: "There has been no Orange network coverage in Mogoditshane Extension 8 for the past three weeks. Multiple neighbours have the same issue. We rely on mobile data for work and this is severely affecting us. Reported to Orange on 3 Feb (ticket OB-2026-11093) with no resolution.",
      status: ComplaintStatus.UNDER_REVIEW,
      adminNotes: "BOCRA engineering team has requested tower maintenance logs from Orange for the Mogoditshane area. Site visit scheduled for 28 March.",
      createdAt: new Date("2026-02-10"),
    },
  });

  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-C9D4-88BE" },
    update: {},
    create: {
      trackingCode: "BOCRA-C9D4-88BE",
      userId: citizen.id,
      isAnonymous: false,
      name: "Kagiso Moagi",
      email: "citizen@demo.co.bw",
      phone: "+267 72 345 678",
      provider: "BTC (Botswana Telecommunications Corporation)",
      category: "Service Quality",
      description: "My BTC fibre connection has been dropping every evening between 18:00 and 22:00 for the past month. Speed tests show 2 Mbps instead of the 50 Mbps I pay for. BTC technician visited once but the problem persists.",
      status: ComplaintStatus.OPEN,
      createdAt: new Date("2026-03-15"),
    },
  });

  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-E5A7-22CD" },
    update: {},
    create: {
      trackingCode: "BOCRA-E5A7-22CD",
      userId: citizen.id,
      isAnonymous: false,
      name: "Kagiso Moagi",
      email: "citizen@demo.co.bw",
      provider: "Mascom Wireless",
      category: "Spam / Unsolicited Communication",
      description: "I receive 3-5 promotional SMS messages daily from Mascom despite opting out multiple times via their STOP service. The messages advertise betting platforms and loan services. I have screenshots with timestamps.",
      status: ComplaintStatus.OPEN,
      createdAt: new Date("2026-03-20"),
    },
  });

  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-11F3-66AB" },
    update: {},
    create: {
      trackingCode: "BOCRA-11F3-66AB",
      userId: citizen.id,
      isAnonymous: true,
      provider: "Orange Botswana",
      category: "Privacy / Data",
      description: "I suspect Orange is sharing my personal data with third-party marketing companies. I started receiving targeted calls from insurance and loan companies the week after activating my Orange SIM. I never consented to any data sharing.",
      status: ComplaintStatus.CLOSED,
      adminNotes: "Investigation completed. Orange confirmed a data processing agreement with a third-party partner that did not meet BOCRA's data protection guidelines. Orange has been issued a formal warning and ordered to terminate the agreement. No further action required from complainant.",
      createdAt: new Date("2025-11-05"),
    },
  });

  // One anonymous complaint not linked to the citizen account
  await prisma.complaint.upsert({
    where: { trackingCode: "BOCRA-AA00-ANON" },
    update: {},
    create: {
      trackingCode: "BOCRA-AA00-ANON",
      isAnonymous: true,
      provider: "Liquid Telecom Botswana",
      category: "Contract Disputes",
      description: "Liquid Telecom is refusing to release my business from a 3-year contract despite a clause that allows early termination with 90 days notice. We gave notice in December 2025 and they are still billing us.",
      status: ComplaintStatus.UNDER_REVIEW,
      createdAt: new Date("2026-03-01"),
    },
  });

  console.log("Complaints seeded.");

  // Bookmarks
  const bookmarks = [
    {
      userId: citizen.id,
      title: "CRA Act (Communications Regulatory Authority Act)",
      url: "https://www.bocra.org.bw/cra-act",
      category: "Legislation",
    },
    {
      userId: citizen.id,
      title: "BOCRA Annual Report 2024/25",
      url: "https://www.bocra.org.bw/annual-reports",
      category: "Reports",
    },
    {
      userId: citizen.id,
      title: "Tariff Information - Mobile Services",
      url: "https://www.bocra.org.bw/tariffs",
      category: "Consumer Info",
    },
    {
      userId: citizen.id,
      title: "How to File a Complaint",
      url: "https://www.bocra.org.bw/complaints",
      category: "Consumer Info",
    },
    {
      userId: citizen.id,
      title: "Cybercrime and Computer Related Crimes Act",
      url: "https://www.bocra.org.bw/cybercrime-act",
      category: "Legislation",
    },
    {
      userId: citizen.id,
      title: "Consumer Education Programme",
      url: "https://www.bocra.org.bw/consumer-education",
      category: "Resources",
    },
    {
      userId: citizen.id,
      title: "License Verification Portal",
      url: "https://licenseverification.bocra.org.bw",
      category: "Tools",
    },
  ];

  for (const bm of bookmarks) {
    await prisma.bookmark.upsert({
      where: { userId_url: { userId: bm.userId, url: bm.url } },
      update: {},
      create: bm,
    });
  }

  console.log("Bookmarks seeded.");

  // Starred Events
  const events = [
    {
      userId: citizen.id,
      title: "BOCRA Public Consultation: 5G Spectrum Allocation",
      date: new Date("2026-04-15"),
      url: "https://www.bocra.org.bw/consultation-papers",
      notes: "Deadline for written submissions. Want to comment on rural coverage obligations.",
    },
    {
      userId: citizen.id,
      title: "World Telecommunication Day",
      date: new Date("2026-05-17"),
      url: "https://www.bocra.org.bw/events",
      notes: "BOCRA usually hosts a public event at GICC. Check closer to the date.",
    },
    {
      userId: citizen.id,
      title: "BOCRA Consumer Rights Awareness Week",
      date: new Date("2026-06-02"),
      url: "https://www.bocra.org.bw/consumer-education",
      notes: "Free workshops at Riverwalk Mall. Register early.",
    },
    {
      userId: citizen.id,
      title: "Quarterly Tariff Review Results",
      date: new Date("2026-04-01"),
      url: "https://www.bocra.org.bw/tariffs",
      notes: "Check if mobile data prices were adjusted.",
    },
    {
      userId: citizen.id,
      title: "BOCRA Board Meeting (Public Session)",
      date: new Date("2026-03-28"),
      url: "https://www.bocra.org.bw/board-members",
      notes: "Agenda includes discussion on postal service reforms.",
    },
    {
      userId: citizen.id,
      title: "Submission Deadline: Comments on Draft Broadcasting Regulations",
      date: new Date("2026-04-30"),
      url: "https://www.bocra.org.bw/broadcasting-regulations",
      notes: "Covers local content quotas for radio stations. Important for community media.",
    },
  ];

  for (const evt of events) {
    const existing = await prisma.starredEvent.findFirst({
      where: { userId: evt.userId, title: evt.title },
    });
    if (!existing) {
      await prisma.starredEvent.create({ data: evt });
    }
  }

  console.log("Starred events seeded.");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
