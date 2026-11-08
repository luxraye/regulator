import { test, expect, type Page } from "@playwright/test";

const PASSWORD = process.env.DEMO_PASSWORD ?? "CedaDemo2026!";

const ROLES = [
  { role: "Innovator", email: "innovator@demo.ceda.bw", home: "/dashboard/innovator" },
  { role: "Evaluator", email: "evaluator@demo.ceda.bw", home: "/dashboard/evaluator" },
  { role: "Adjudicator", email: "panel@demo.ceda.bw", home: "/dashboard/panel" },
  { role: "Admin", email: "admin@demo.ceda.bw", home: "/dashboard/admin" },
  { role: "Super admin", email: "super@demo.ceda.bw", home: "/dashboard/admin" },
];

const PUBLIC_PAGES = ["/", "/calls", "/eligibility", "/track", "/funded", "/community", "/community/safe-practices", "/privacy", "/about", "/login", "/register"];

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
});

for (const r of ROLES) {
  test(`${r.role}: signs in and every menu link opens`, async ({ page }) => {
    const errors = watchErrors(page);
    await signIn(page, r.email);
    await expect(page).toHaveURL(new RegExp(r.home));

    const links = page.locator("aside nav a");
    await expect(links.first()).toBeVisible();
    const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const res = await page.goto(href);
      expect(res?.status(), href).toBeLessThan(400);
      // Dashboard pages keep the menu; links like the community forum open the public site.
      if (href.startsWith("/dashboard")) await expect(page.locator("aside nav a").first(), `menu on ${href}`).toBeVisible();
      else await expect(page.locator("h1").first()).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}

test("people can't open another role's pages", async ({ page }) => {
  await signIn(page, "innovator@demo.ceda.bw");
  await page.goto("/dashboard/admin");
  await expect(page).not.toHaveURL(/\/dashboard\/admin/);
});
