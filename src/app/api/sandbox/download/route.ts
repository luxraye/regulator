import { NextResponse } from "next/server";

const SANDBOX_TEMPLATE = {
  _meta: {
    type: "BOCRA Instance Sandbox Template",
    version: "1.0",
    description:
      "This is a downloadable sandbox Instance template. Use it to understand the Instance structure, test internally, or explore the Playground in your licensee dashboard.",
    classification: {
      scale: "SCALE_3 (Small operator - for testing)",
      dataType: "TYPE_F (Sandbox/Testing)",
      code: "F3_SANDBOX",
    },
  },
  fields: [
    {
      key: "company_name",
      label: "Company Name",
      type: "text",
      required: true,
    },
    {
      key: "reporting_period",
      label: "Reporting Period",
      type: "text",
      required: true,
      validation: { pattern: "^Q[1-4] \\d{4}$" },
      hint: "Format: Q1 2026",
    },
    {
      key: "total_customers",
      label: "Total Active Customers",
      type: "number",
      required: true,
      validation: { min: 0 },
    },
    {
      key: "revenue_bwp",
      label: "Quarterly Revenue (BWP)",
      type: "number",
      required: true,
      validation: { min: 0 },
    },
    {
      key: "complaints_received",
      label: "Complaints Received",
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
      label: "Avg. Resolution Time (Days)",
      type: "number",
      required: true,
      validation: { min: 0, max: 365 },
    },
    {
      key: "network_uptime",
      label: "Network Uptime (%)",
      type: "number",
      required: false,
      validation: { min: 0, max: 100 },
    },
    {
      key: "notes",
      label: "Additional Notes",
      type: "textarea",
      required: false,
    },
  ],
  required_files: [
    {
      key: "sample_report",
      label: "Sample Quarterly Report",
      extensions: [".pdf", ".xlsx", ".csv"],
      maxSizeMB: 10,
    },
    {
      key: "customer_data",
      label: "Customer Summary Data",
      extensions: [".csv", ".json"],
      maxSizeMB: 5,
    },
  ],
  _instructions: {
    "1_read": "Review the fields and required_files to understand what BOCRA expects.",
    "2_test": "Log in to the Licensee Portal and open the Instance Playground to simulate a submission.",
    "3_validate": "The Playground validates data against the rules above -- try entering invalid values to see how it works.",
    "4_submit": "Playground submissions are sandboxed and do not affect your real compliance record.",
  },
};

export async function GET() {
  const json = JSON.stringify(SANDBOX_TEMPLATE, null, 2);
  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="BOCRA_Instance_Sandbox_F3.json"',
    },
  });
}
