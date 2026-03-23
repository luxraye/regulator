import { PrismaClient, Role, Scale, DataType, InstanceStatus } from "@prisma/client";
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
