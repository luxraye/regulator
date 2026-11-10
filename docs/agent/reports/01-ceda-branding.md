# Phase 1 Report: CEDA Branding

**Phase:** 1 - CEDA branding  
**Branch:** `feat/instances-engine`  
**Status:** Complete  
**Date:** 2026-11-09  

---

## 1. What was done

1. **Unified Theme Architecture (`src/theme/ceda.ts`):**
   - Created a single source of truth for all brand values, colours, metadata, sunrise bands, and CSS variable maps.
   - Defined tokens:
     - `ink`: `#3a2a24`
     - `brown`: `#604038`
     - `orange`: `#d94914`
     - `red`: `#a02010`
     - `amber`: `#f8a018`
     - `yellow`: `#f8c808`
     - `green`: `#2f9e57`
     - `sand`: `#faf6f2`
     - Sunrise gradient stops: red `#a02010` -> orange `#f06020` -> amber `#f8a018` -> yellow `#f8c808`.
   - Wired `tailwind.config.ts` to directly consume `CEDA_PALETTE` from `src/theme/ceda.ts`.
   - Updated `src/app/globals.css` with matching CSS variables for background, primary, secondary, muted, accent, sidebar, and chart series.

2. **Typography & Layout Fonts (`src/app/layout.tsx`):**
   - Configured Google Font `Poppins` (`latin`, weights 300, 400, 500, 600, 700) matching `ceda.co.bw`.
   - Applied `font-sans` with Poppins variable root.
   - Set viewport `themeColor` to `#3a2a24`.
   - Updated metadata description with CEDA's motto: "Finance · Develop · Sustain".

3. **CEDA Sunrise Logo & Mark (`src/components/brand/logo.tsx`):**
   - Replaced old 3-bar icon with the official CEDA sunrise mark (rising sun with nested bands in red/orange/amber/yellow).
   - Styled brand text with Poppins font weight and tracking for light and dark tones.

4. **App Icons & Manifest:**
   - Updated `public/icons/icon-192.svg` and `public/icons/icon-512.svg` with CEDA sunrise SVG graphics and `#3a2a24` canvas.
   - Updated `public/manifest.json` with theme color `#3a2a24` and CEDA branding.

5. **Color Migration Across the Platform:**
   - Systematically replaced `ceda-navy` -> `ceda-ink` / `ceda-brown`.
   - Replaced `ceda-blue` -> `ceda-orange` (brand primary action) or `ceda-amber`.
   - Replaced `ceda-light` -> `ceda-sand` (`#faf6f2`).
   - Updated all public pages (`/`, `/about`, `/calls`, `/calls/[code]`, `/eligibility`, `/funded`, `/login`, `/privacy`, `/register`, `/track`, `/ussd-demo`, `/verify`).
   - Updated all dashboard layouts and role views (`admin`, `evaluator`, `innovator`, `panel`, `reports`, `superadmin`).
   - Replaced the blue backdrop with a warm CEDA ink/amber backdrop in `src/components/home/blue-backdrop.tsx`.
   - Preserved all judging demo flows, QR verification code generator, flip phone mockup, and funded certificates.

6. **Owner Directive Update Handled:**
   - Received strategy lead instruction: dropped repository commit-window check entirely. It will not be included in definition schemas, guards, simulation, seeds, or documentation.

---

## 2. Technical Verification

- **TypeScript (`npx tsc --noEmit`):** Clean (0 errors).
- **ESLint (`yarn lint`):** Clean (0 errors, 0 warnings).
- **Next.js Production Build (`yarn build`):** Clean build. All 43 static/dynamic routes compiled and generated successfully.

---

## 3. What's Next

- Proceeding directly to **Phase 2: Data model**:
  - Rename Prisma `Instance` to `Entry`.
  - Refactor `Template` into per-Instance tracks/forms.
  - Introduce `Partner`, `Blueprint`, `Instance`, `InstanceRole`, `Team`, `TeamMember`, `CheckResult`, `InstanceVersion`, and dynamic `MatrixDimension` / `MatrixDimensionValue`.
  - Migrate existing calls and entries under "CEDA Youth Innovation Ideas Call 2026".
