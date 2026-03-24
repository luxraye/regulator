import { PrismaClient, Role, Scale, DataType, InstanceStatus, ComplaintStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

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
          { key: "financial_statements", label: "Audited Financial Statements", extensions: [".pdf", ".xlsx"], maxSizeMB: 50 },
          { key: "transaction_logs", label: "Mobile Money Transaction Logs", extensions: [".csv", ".json"], maxSizeMB: 100 },
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
          { key: "performance_logs", label: "Network Performance Logs", extensions: [".csv"], maxSizeMB: 50 },
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
          { key: "complaint_register", label: "Complaint Register", extensions: [".csv", ".xlsx"], maxSizeMB: 20 },
        ],
      },
    },
  });

  console.log("Templates seeded.");

  // Sample Instances
  const crypto = require("crypto");

  await prisma.instance.upsert({
    where: { id: "inst-mascom-a1" },
    update: {},
    create: {
      id: "inst-mascom-a1",
      templateId: templateA1.id,
      licenseeId: mascom.id,
      assignedById: admin.id,
      status: InstanceStatus.PENDING,
      deadline: new Date("2026-04-30"),
      encryptionKey: crypto.randomBytes(32).toString("hex"),
    },
  });

  await prisma.instance.upsert({
    where: { id: "inst-orange-a1" },
    update: {},
    create: {
      id: "inst-orange-a1",
      templateId: templateA1.id,
      licenseeId: orange.id,
      assignedById: admin.id,
      status: InstanceStatus.SUBMITTED,
      deadline: new Date("2026-04-15"),
      encryptionKey: crypto.randomBytes(32).toString("hex"),
      submittedAt: new Date("2026-03-20"),
    },
  });

  await prisma.instance.upsert({
    where: { id: "inst-btc-b2" },
    update: {},
    create: {
      id: "inst-btc-b2",
      templateId: templateB2.id,
      licenseeId: btc.id,
      assignedById: admin.id,
      status: InstanceStatus.APPROVED,
      deadline: new Date("2026-03-31"),
      encryptionKey: crypto.randomBytes(32).toString("hex"),
      submittedAt: new Date("2026-03-15"),
      reviewedAt: new Date("2026-03-18"),
      reviewedById: admin.id,
      reviewNotes: "All metrics within acceptable range. Approved.",
    },
  });

  await prisma.instance.upsert({
    where: { id: "inst-mascom-c3" },
    update: {},
    create: {
      id: "inst-mascom-c3",
      templateId: templateC3.id,
      licenseeId: mascom.id,
      assignedById: admin.id,
      status: InstanceStatus.FLAGGED,
      deadline: new Date("2026-03-25"),
      encryptionKey: crypto.randomBytes(32).toString("hex"),
      submittedAt: new Date("2026-03-19"),
      reviewedAt: new Date("2026-03-21"),
      reviewedById: admin.id,
      reviewNotes: "Resolution time exceeds regulatory threshold. Please provide corrective action plan.",
    },
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
