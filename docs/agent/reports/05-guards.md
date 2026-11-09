# Phase 5: Pre-emptive Security, Compliance Guards & Participant Pre-flight Report

**Date:** 2026-11-10  
**Branch:** `feat/instances-engine`  
**Phase:** 5 — Pre-emptive security and compliance checks, plus participant pre-flight  
**Status:** Completed & Tested (Quality gates green: 34/34 unit tests pass, `tsc --noEmit` 0 errors, `next lint` 0 errors/0 warnings, Next.js production build 49/49 routes compiled successfully, Playwright link-matrix smoke test passed).

---

## 1. Objectives Achieved

1. **Binary Magic Bytes & MIME Sniffing (`src/lib/guards/magic-bytes.ts`):**
   - Validates file content headers against strict binary magic signatures:
     - PDF: `%PDF-`
     - PNG: `\x89PNG\r\n\x1a\n`
     - JPEG: `\xFF\xD8\xFF`
     - ZIP & OOXML (.zip, .xlsx, .pptx, .docx): `PK\x03\x04`
     - CSV & Plain Text: UTF-8/ASCII without null bytes (`\x00`).
   - Rejects extension spoofing (e.g. executables renamed to `.pdf` or binary dumps uploaded as `.csv`).

2. **In-Memory Archive Safety & Zip-Slip Protection (`src/lib/guards/archive.ts`):**
   - Parses local file headers of ZIP archives directly in memory without disk extraction.
   - **Zip-Slip Traversal**: Detects and rejects path traversal sequences (`..`, leading `/` or `\`, or drive letters `C:`).
   - **Zip-Bomb / Explosion Protection**: Flags archives exceeding allowable compression ratios (e.g. > 50x) or total uncompressed byte limits.
   - **Archive File Limits**: Enforces file count caps (default: 250 files) and identifies nested archives (`.zip` inside `.zip`).
   - Supports targeted in-memory file extraction (`extractFileFromArchive`) for subsequent scanning.

3. **PDF Page Count Inspection (`src/lib/guards/pdf.ts`):**
   - Parses PDF trailer catalog `/Pages /Count` dictionaries and page tokens without requiring heavyweight native external binaries.
   - Enforces page count ceilings (e.g. maximum 10 pages for proposals).

4. **Malware & EICAR Signature Scanner (`src/lib/guards/malware.ts`):**
   - Designed scanner adapter interface `MalwareScanner`:
     - **`MockSignatureScanner`**: Default engine detecting standardized EICAR test string (`X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`) and suspicious reverse shell scripts (`bash -i >& /dev/tcp/`, `rm -rf /`, `nc -e /bin/sh`).
     - **`ClamAVScanner`**: Production TCP daemon integration (`INSTREAM` socket protocol) when `CLAMAV_HOST` is configured, with automatic fallback to signature scanning.

5. **Source Code Credential & Secret Scanning (`src/lib/guards/secrets.ts`):**
   - Scans submitted source archives and code files for exposed credentials:
     - AWS Access Keys (`AKIA...`)
     - GitHub Personal Access Tokens (`ghp_...`, `github_pat_...`)
     - Asymmetric Private Keys (`-----BEGIN RSA/EC/PGP PRIVATE KEY-----`)
     - Slack API tokens and database URIs with plain passwords.
   - Masks sensitive tokens in diagnostics (`AKIA****************`).

6. **Open Source Dependency Vulnerability Check (`src/lib/guards/dependencies.ts`):**
   - Inspects `package.json` and `requirements.txt` from uploaded code archives.
   - Queries the Open Source Vulnerabilities (OSV) API (`https://api.osv.dev/v1/query`) with network timeouts.
   - Flags known CVEs and provides advisory warnings without blocking if offline.

7. **Live HTTPS Application & Repository Validation (`src/lib/guards/links.ts`):**
   - Validates live URLs:
     - Enforces `https:` scheme (rejects insecure `http:`).
     - Prohibits internal or local addresses (`localhost`, `127.0.0.1`, private IP blocks).
     - Verifies certificate and reachability; detects stealthy redirects to third-party domains.
   - Validates repository links:
     - Restricts to authorized source control providers (GitHub, GitLab, Bitbucket).
     - Confirms public accessibility (flags 404 Not Found).

8. **Cross-Entry Plagiarism & Duplicate Detection (`src/lib/guards/duplicate.ts`):**
   - Queries database for existing `EntryFile` records matching the uploaded SHA-256 hash across distinct entries in the same competition instance.

9. **Statutory Compliance & Faithfulness Evaluation (`src/lib/guards/faithfulness.ts`):**
   - Evaluates citizen eligibility predicates using deterministic AST rules engine.
   - Enforces questionnaire completeness: every required field must be answered or explicitly marked "N/A" (where permitted).
   - Validates conflict of interest declarations and Botswana Data Protection Act 2024 consents.

10. **Sealed Faithfulness Report & Receipts (`src/lib/guards/report.ts` & `src/lib/jwt-sign.ts`):**
    - Builds canonicalized, sorted summary of all check outcomes and computes deterministic SHA-256 `faithfulnessHash`.
    - Binds `faithfulnessHash` directly into the signed submission JWT receipt (`submissionJwt`).
    - Distinguishes between hard fails (blocks submission) and advisory warnings (passed to human screeners).

11. **Participant Pre-Flight Experience (`src/components/dashboard/preflight-checklist.tsx`, `runner-client.tsx`, `/verify`):**
    - Embedded interactive Pre-Flight Guard Checklist in Step 2 ("Review & submit") of the innovator workflow.
    - Submit button dynamically locks on hard failures with clear remediation instructions.
    - Added dedicated `/api/instances/[id]/preflight` endpoint.
    - Updated public verification portal (`/verify`) with `PublicReceiptVerifier` allowing verification of signed submission receipts and sealed Faithfulness Reports.

---

## 2. Quality Gates & Verification

- **Guards Unit Test Suite:** `yarn tsx --test tests/guards.test.ts` completed with **23/23 tests passing**.
- **Instance Engine Unit Tests:** `yarn tsx --test tests/instance-engine.test.ts` completed with **11/11 tests passing**.
- **TypeScript Typecheck:** `yarn typecheck` (`tsc --noEmit`) completed with **0 errors**.
- **ESLint:** `yarn lint` (`next lint`) completed with **0 errors, 0 warnings**.
- **Production Build:** `yarn build` completed with **49/49 static and dynamic routes compiled successfully**.
- **Playwright Smoke Test:** `npx playwright test -g "role × link matrix"` passed cleanly.
