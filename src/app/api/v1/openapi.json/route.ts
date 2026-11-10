import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "CEDA Innovation Management Portal API",
      version: "1.0.0",
      description:
        "Partner API for creating, programming, verifying, and monitoring CEDA innovation challenges, participant dossiers, and evaluations.",
      contact: {
        name: "CEDA Developer Platform",
        email: "api@ceda.co.bw",
        url: "https://ceda.co.bw",
      },
    },
    servers: [
      {
        url: "https://ceda-portal--neon-bw-3x0x.us-east4.hosted.app",
        description: "Production Server",
      },
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API_KEY",
          description: "Use your Partner API Key prefixed with ceda_live_.",
        },
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "Alternative header for Partner API Key authentication.",
        },
      },
      schemas: {
        Instance: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "PUBLISHED", "LIVE", "CLOSED", "ARCHIVED"] },
            rulesHash: { type: "string", description: "Deterministic SHA-256 fingerprint over ruleset" },
            opensAt: { type: "string", format: "date-time" },
            closesAt: { type: "string", format: "date-time" },
          },
        },
        Entry: {
          type: "object",
          properties: {
            id: { type: "string" },
            referenceCode: { type: "string" },
            title: { type: "string" },
            status: { type: "string" },
            score: { type: "number" },
            rank: { type: "integer" },
            dataHash: { type: "string" },
            submissionJwt: { type: "string" },
          },
        },
        WebhookPayload: {
          type: "object",
          properties: {
            id: { type: "string" },
            event: { type: "string", enum: ["stage.changed", "decision.recorded", "instance.published"] },
            partnerId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
    paths: {
      "/api/v1/instances": {
        get: {
          summary: "List partner instances",
          description: "Returns all competition instances managed by the authenticated Partner.",
          responses: {
            "200": {
              description: "List of instances",
            },
            "401": { description: "Invalid or missing API key" },
          },
        },
        post: {
          summary: "Create instance",
          description: "Creates a new competition instance in DRAFT status.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    blueprintKey: { type: "string", example: "flagship-hackathon" },
                    customDefinition: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Instance created successfully" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
          },
        },
      },
      "/api/v1/instances/{id}/clone": {
        post: {
          summary: "Clone instance",
          description: "Creates a fresh editable draft copy of an existing competition instance.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "201": { description: "Instance cloned" },
            "404": { description: "Instance not found" },
          },
        },
      },
      "/api/v1/instances/{id}/entries": {
        get: {
          summary: "List entries for instance",
          description: "Returns all innovator entries lodged inside the specified instance.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "List of entries" },
            "404": { description: "Instance not found" },
          },
        },
      },
      "/api/v1/entries/{id}": {
        get: {
          summary: "Retrieve entry details",
          description: "Returns detailed submission, files, and guard check results for an entry.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Entry details and faithfulness reports" },
            "404": { description: "Entry not found" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec);
}
