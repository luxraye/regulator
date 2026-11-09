import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export const { GET } = handlers;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.pathname.endsWith("/callback/credentials")) {
    const ip = getClientIp(req);
    let emailKey = "";
    try {
      const cloned = req.clone();
      const ct = cloned.headers.get("content-type") ?? "";
      if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
        const form = await cloned.formData();
        emailKey = String(form.get("email") ?? "").toLowerCase().trim();
      } else if (ct.includes("application/json")) {
        const json = await cloned.json();
        emailKey = String(json?.email ?? "").toLowerCase().trim();
      }
    } catch {
      // ignore body parse errors here and fall back to IP-level check
    }
    const perAccountLimit = checkRateLimit(`signin:${ip}:${emailKey || "anon"}`, 10, 60_000);
    if (perAccountLimit) return perAccountLimit;
    const perIpLimit = checkRateLimit(`signin-ip:${ip}`, 60, 60_000);
    if (perIpLimit) return perIpLimit;
  }
  return handlers.POST(req);
}
