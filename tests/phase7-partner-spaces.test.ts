import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Phase 7 — Partner Spaces & Scoping Logic", () => {
  it("defaults brand colors to CEDA theme when partner colors are unset", () => {
    const CEDA_PRIMARY = "#3a2a24";
    const CEDA_SECONDARY = "#d94914";

    const partnerA = { name: "New Partner", primaryColor: null, secondaryColor: null };
    const effectivePrimary = partnerA.primaryColor || CEDA_PRIMARY;
    const effectiveSecondary = partnerA.secondaryColor || CEDA_SECONDARY;

    assert.equal(effectivePrimary, CEDA_PRIMARY);
    assert.equal(effectiveSecondary, CEDA_SECONDARY);

    const partnerBDIH = { name: "BDIH", primaryColor: "#004b87", secondaryColor: "#00a3e0" };
    assert.equal(partnerBDIH.primaryColor || CEDA_PRIMARY, "#004b87");
    assert.equal(partnerBDIH.secondaryColor || CEDA_SECONDARY, "#00a3e0");
  });

  it("enforces multi-tenant isolation where PARTNER_ADMIN only queries own partnerId", () => {
    interface QueryFilter {
      partnerId?: string;
    }

    function buildInstanceQuery(userRole: string, userPartnerId?: string): QueryFilter {
      const where: QueryFilter = {};
      if (userRole === "PARTNER_ADMIN" && userPartnerId) {
        where.partnerId = userPartnerId;
      }
      return where;
    }

    // Superadmin has unconstrained view across all partners
    const superadminQuery = buildInstanceQuery("SUPERADMIN", "partner_ceda");
    assert.equal(superadminQuery.partnerId, undefined, "Superadmin sees all instances");

    // BDIH admin strictly scoped to BDIH partnerId
    const bdihAdminQuery = buildInstanceQuery("PARTNER_ADMIN", "partner_bdih");
    assert.equal(bdihAdminQuery.partnerId, "partner_bdih");

    // BTC admin strictly scoped to BTC partnerId
    const btcAdminQuery = buildInstanceQuery("PARTNER_ADMIN", "partner_btc");
    assert.equal(btcAdminQuery.partnerId, "partner_btc");
  });

  it("blocks PARTNER_ADMIN from mutating or publishing an instance owned by another partner", () => {
    function authorizeInstanceMutation(
      userRole: string,
      userPartnerId: string,
      instancePartnerId: string
    ): boolean {
      if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
        return true;
      }
      if (userRole === "PARTNER_ADMIN") {
        return userPartnerId === instancePartnerId;
      }
      return false;
    }

    // BDIH admin accessing BDIH instance -> Allowed
    assert.equal(authorizeInstanceMutation("PARTNER_ADMIN", "partner_bdih", "partner_bdih"), true);

    // BDIH admin attempting to mutate BTC instance -> Denied
    assert.equal(authorizeInstanceMutation("PARTNER_ADMIN", "partner_bdih", "partner_btc"), false);

    // BDIH admin attempting to mutate CEDA flagship instance -> Denied
    assert.equal(authorizeInstanceMutation("PARTNER_ADMIN", "partner_bdih", "partner_ceda"), false);

    // Superadmin accessing any partner instance -> Allowed
    assert.equal(authorizeInstanceMutation("SUPERADMIN", "partner_ceda", "partner_bdih"), true);
  });

  it("binds cloned instances created by PARTNER_ADMIN to caller's partnerId", () => {
    function resolveClonedPartnerId(
      userRole: string,
      userPartnerId: string,
      sourceInstancePartnerId: string
    ): string {
      if (userRole === "PARTNER_ADMIN" && userPartnerId) {
        return userPartnerId;
      }
      return sourceInstancePartnerId;
    }

    // When BDIH admin clones a CEDA flagship blueprint, the target clone belongs to BDIH
    const targetPartner = resolveClonedPartnerId("PARTNER_ADMIN", "partner_bdih", "partner_ceda");
    assert.equal(targetPartner, "partner_bdih");

    // When superadmin clones, the source partner is retained
    const superadminTarget = resolveClonedPartnerId("SUPERADMIN", "partner_ceda", "partner_btc");
    assert.equal(superadminTarget, "partner_btc");
  });
});
