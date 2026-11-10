import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/comms/adapter";
import { audit } from "@/lib/audit";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/support/tickets?ref=...
 * Looks up a support ticket by reference code.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get("ref");

    if (!ref) {
      return NextResponse.json({ error: "Reference code required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { referenceCode: ref.trim().toUpperCase() },
      select: {
        id: true,
        referenceCode: true,
        name: true,
        email: true,
        severity: true,
        category: true,
        subject: true,
        status: true,
        resolutionNotes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("GET /api/support/tickets error:", error);
    return NextResponse.json({ error: "Failed to look up ticket" }, { status: 500 });
  }
}

/**
 * POST /api/support/tickets
 * Submits a new support or hosting fault ticket with severity classification.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, severity, category, subject, description } = body;

    if (!name || !email || !subject || !description) {
      return NextResponse.json({ error: "Name, email, subject, and description are required" }, { status: 400 });
    }

    const assignedSeverity = (severity as "P1" | "P2" | "P3") || "P3";
    const refCode = `CEDA-SUP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        referenceCode: refCode,
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        severity: assignedSeverity,
        category: category || "General Inquiries",
        subject: String(subject).trim(),
        description: String(description).trim(),
        status: "OPEN",
      },
    });

    await audit("system", "CREATE_SUPPORT_TICKET", {
      metadata: {
        referenceCode: refCode,
        severity: assignedSeverity,
        category: ticket.category,
        email: ticket.email,
      },
    });

    // Dispatch confirmation email to applicant & demo inbox
    await sendEmail({
      to: ticket.email,
      subject: `Support Ticket Received [${refCode}]: ${ticket.subject}`,
      text: `Dumelang ${ticket.name},\n\nYour support ticket has been received by CEDA Technical Operations.\n\nTicket Reference: ${refCode}\nSeverity Level: ${assignedSeverity}\nCategory: ${ticket.category}\n\nOur service level commitment for ${assignedSeverity} tickets is:\n- Response: ${assignedSeverity === "P1" ? "Within 2 hours" : assignedSeverity === "P2" ? "Within 4 hours" : "Within 24 hours"}\n- Resolution: ${assignedSeverity === "P1" ? "Within 8 hours" : assignedSeverity === "P2" ? "Within 24 hours" : "Within 3 working days"}\n\nYou can track resolution progress at /support?ref=${refCode}.\n\nCEDA Innovation Portal Operations`,
      metadata: {
        purpose: "SUPPORT_TICKET_CONFIRMATION",
        referenceCode: refCode,
        actionUrl: `/support?ref=${refCode}`,
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error("POST /api/support/tickets error:", error);
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}
