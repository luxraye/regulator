import { test, expect, type Page } from "@playwright/test";
import { navFor, isActive } from "../../src/lib/nav";

const PASSWORD = process.env.DEMO_PASSWORD ?? "CedaDemo2026!";

const ROLES = [
  {
    role: "Innovator",
    code: "INNOVATOR",
    email: "innovator@demo.ceda.bw",
    name: "Naledi Molefe",
    roleLabel: "Innovator",
    home: "/dashboard/innovator",
  },
  {
    role: "Evaluator",
    code: "EVALUATOR",
    email: "evaluator@demo.ceda.bw",
    name: "Dr Keabetswe Ntshole",
    roleLabel: "Evaluator",
    home: "/dashboard/evaluator",
  },
  {
    role: "Adjudicator",
    code: "ADJUDICATOR",
    email: "panel@demo.ceda.bw",
    name: "Mma Dineo Seabo",
    roleLabel: "Adjudicator",
    home: "/dashboard/panel",
  },
  {
    role: "Admin",
    code: "ADMIN",
    email: "admin@demo.ceda.bw",
    name: "Tebogo Ramasedi",
    roleLabel: "Programme admin",
    home: "/dashboard/admin",
  },
  {
    role: "Super admin",
    code: "SUPERADMIN",
    email: "super@demo.ceda.bw",
    name: "Kgosi Mothibi",
    roleLabel: "Super admin",
    home: "/dashboard/admin",
  },
];

const PAGE_ROLE_RULES: [prefix: string, roles: string[]][] = [
  ["/dashboard/instances", ["ADMIN", "SUPERADMIN"]],
  ["/dashboard/superadmin", ["SUPERADMIN"]],
  ["/dashboard/admin", ["ADMIN", "SUPERADMIN"]],
  ["/dashboard/panel", ["ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
  ["/dashboard/reports", ["ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
  ["/dashboard/evaluator", ["EVALUATOR"]],
  ["/dashboard/innovator", ["INNOVATOR"]],
  ["/dashboard/calls", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
  ["/dashboard/funded", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
  ["/dashboard/community", ["INNOVATOR", "EVALUATOR", "ADJUDICATOR", "ADMIN", "SUPERADMIN"]],
];

const PUBLIC_PAGES = [
  "/",
  "/instances",
  "/calls",
  "/eligibility",
  "/track",
  "/funded",
  "/community",
  "/community/safe-practices",
  "/privacy",
  "/about",
  "/login",
  "/register",
];

/** Fails the test on uncaught page errors, which is what a crashed React tree looks like. */
function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard\//, { timeout: 30_000 });
}

test.describe("public site", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(path);
      expect(res?.status(), path).toBeLessThan(400);
      await expect(page.locator("h1").first()).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("a funded innovator's certificate checks out", async ({ page }) => {
    await page.goto("/funded");
    await page.getByRole("link", { name: "Verified" }).first().click();
    await expect(page.getByRole("heading", { name: "This certificate is genuine" })).toBeVisible();
  });

  test("a tampered certificate code is rejected", async ({ page }) => {
    await page.goto("/funded");
    const href = await page.getByRole("link", { name: "Verified" }).first().getAttribute("href");
    await page.goto(href!.replace(/[0-9A-F]{4}$/, "0000"));
    await expect(page.getByRole("heading", { name: /can.t confirm/ })).toBeVisible();
  });

  test("health check reports the database is up", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).database).toBe("up");
  });

  test("security headers, hero photo credit, login judge copy, and how-to-judge guide are present", async ({ page, request }) => {
    const res = await request.get("/");
    const headers = res.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["permissions-policy"]).toContain("camera=()");

    await page.goto("/");
    await expect(page.getByText(/Deo photographer/i)).toBeVisible();

    await page.goto("/login");
    await expect(page.getByText(/Judges: pick any role below to explore\. Password for all:/i)).toBeVisible();

    await page.goto("/about#how-to-judge");
    await expect(page.getByRole("heading", { name: "How to judge this portal" })).toBeVisible();
  });

  test("360px mobile layout: flip-phone card, mobile bottom nav, and certificate fit cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const acceptCookies = page.getByRole("button", { name: "Accept" });
    if (await acceptCookies.isVisible()) await acceptCookies.click();

    const flipBtn = page.getByRole("button", { name: /Flip for the QR code/i });
    await expect(flipBtn).toBeVisible();
    await flipBtn.click();
    await expect(page.getByRole("button", { name: /Back to the mobile screen/i })).toBeVisible();

    await signIn(page, "innovator@demo.ceda.bw");
    const bottomNav = page.locator("nav.fixed.bottom-0");
    await expect(bottomNav).toBeVisible();

    await page.goto("/dashboard/innovator/instances");
    const certHref = await page.getByRole("link", { name: /Award certificate/i }).first().getAttribute("href");
    expect(certHref).toBeTruthy();
    await page.goto(certHref!);
    await expect(page.getByText(/Certificate of award/i)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
});

for (const r of ROLES) {
  test(`${r.role}: signs in, keeps role stability across every sidebar link, and highlights one active item`, async ({ page }) => {
    const errors = watchErrors(page);
    await signIn(page, r.email);
    await expect(page).toHaveURL(new RegExp(r.home));

    const sidebar = page.locator("aside").first();
    const links = sidebar.locator("nav a");
    await expect(links.first()).toBeVisible();
    const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    const expectedCount = hrefs.length;
    expect(expectedCount).toBeGreaterThan(0);

    await expect(sidebar).toContainText(r.name);
    await expect(sidebar).toContainText(r.roleLabel);

    for (const href of hrefs) {
      await sidebar.locator(`nav a[href="${href}"]`).click();
      await page.waitForURL((u) => u.pathname === href, { timeout: 30_000 });

      // Never lands on /login
      expect(new URL(page.url()).pathname, `${r.role} clicking ${href}`).not.toBe("/login");
      expect(new URL(page.url()).pathname, `${r.role} clicking ${href}`).toBe(href);

      // Sidebar footer still shows the same name and role label
      await expect(sidebar, `${r.role} name on ${href}`).toContainText(r.name);
      await expect(sidebar, `${r.role} role label on ${href}`).toContainText(r.roleLabel);

      // Number of sidebar links is unchanged on every /dashboard page
      if (href.startsWith("/dashboard")) {
        await expect(links, `${r.role} link count on ${href}`).toHaveCount(expectedCount);
        // Exactly one sidebar item is highlighted
        await expect(sidebar.locator('nav a[aria-current="page"]'), `${r.role} active highlight on ${href}`).toHaveCount(1);
      }
      await expect(page.locator("h1").first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("role × link matrix: no role's menu contains a link it is redirected away from, and highlight rules are unambiguous", async () => {
  for (const r of ROLES) {
    const menu = navFor(r.code);
    expect(menu.length).toBeGreaterThan(0);
    for (const item of menu) {
      const rule = PAGE_ROLE_RULES.find(([prefix]) => item.href.startsWith(prefix));
      expect(rule, `rule covering ${item.href} for ${r.code}`).toBeDefined();
      expect(rule![1], `${r.code} must be allowed on ${item.href}`).toContain(r.code);

      // Exactly one menu item is active when visiting item.href
      const activeItems = menu.filter((other) => isActive(item.href, other.href));
      expect(activeItems.map((x) => x.href), `active items on ${item.href} for ${r.code}`).toEqual([item.href]);
    }
  }
});

const PROBES: { role: string; email: string; forbidden: string[]; allowed: string }[] = [
  {
    role: "Innovator",
    email: "innovator@demo.ceda.bw",
    allowed: "/dashboard/innovator",
    forbidden: ["/dashboard/admin", "/dashboard/panel", "/dashboard/evaluator", "/dashboard/superadmin/users"],
  },
  {
    role: "Evaluator",
    email: "evaluator@demo.ceda.bw",
    allowed: "/dashboard/evaluator",
    forbidden: ["/dashboard/admin", "/dashboard/panel", "/dashboard/innovator", "/dashboard/superadmin/users"],
  },
  {
    role: "Adjudicator",
    email: "panel@demo.ceda.bw",
    allowed: "/dashboard/panel",
    forbidden: ["/dashboard/admin", "/dashboard/evaluator", "/dashboard/innovator", "/dashboard/superadmin/users"],
  },
  {
    role: "Admin",
    email: "admin@demo.ceda.bw",
    allowed: "/dashboard/admin",
    forbidden: ["/dashboard/evaluator", "/dashboard/innovator", "/dashboard/superadmin/users"],
  },
];

for (const p of PROBES) {
  test(`role × route enforcement: ${p.role} is redirected away from pages it does not own`, async ({ page }) => {
    await signIn(page, p.email);
    for (const bad of p.forbidden) {
      await page.goto(bad);
      await expect(page, `${p.email} should be redirected from ${bad}`).toHaveURL(new RegExp(p.allowed));
      await expect(page).not.toHaveURL(/\/login/);
    }
  });
}

test("sign out returns to the home page with no 404 or login loop", async ({ page }) => {
  await signIn(page, "innovator@demo.ceda.bw");
  await page.locator("aside button", { hasText: "Sign out" }).click();
  await page.waitForURL((u) => u.pathname === "/", { timeout: 30_000 });
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.locator("h1").first()).toBeVisible();
});
