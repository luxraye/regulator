import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const PUBLIC_PAGE_FILES = [
  "src/app/page.tsx",
  "src/app/instances/page.tsx",
  "src/app/instances/[slug]/page.tsx",
  "src/app/judges/page.tsx",
  "src/app/status/page.tsx",
  "src/app/support/page.tsx",
  "src/app/funded/page.tsx",
  "src/app/community/page.tsx",
];

const BANNED_PUBLIC_JARGON = [
  "programmable competition engine",
  "cryptographic rules fingerprint",
  "mathematically sealed, cryptographic verification",
  "reproducible leaderboard",
  "hash-chained audit log",
  "faithfulness report",
  "magic bytes",
  "zip-slip",
  "osv database",
];

describe("Phase 12 Plain-Language Word Swaps (Acceptance Rule)", () => {
  PUBLIC_PAGE_FILES.forEach((relPath) => {
    it(`ensures ${relPath} contains no developer jargon outside technical panels`, () => {
      const fullPath = path.resolve(process.cwd(), relPath);
      if (!fs.existsSync(fullPath)) return;

      let content = fs.readFileSync(fullPath, "utf8");

      // Strip out <ForTechnicalJudges>...</ForTechnicalJudges> blocks
      content = content.replace(/<ForTechnicalJudges[\s\S]*?<\/ForTechnicalJudges>/g, "");
      // Strip out technical prop strings in <InfoTip technical="..." />
      content = content.replace(/technical=["'][^"']*["']/g, "");

      const lowerContent = content.toLowerCase();

      for (const phrase of BANNED_PUBLIC_JARGON) {
        const index = lowerContent.indexOf(phrase.toLowerCase());
        if (index !== -1) {
          const snippet = content.substring(Math.max(0, index - 40), Math.min(content.length, index + 60));
          assert.fail(
            `Found banned jargon "${phrase}" in public page ${relPath} outside technical panel!\nSnippet: "...${snippet}..."`
          );
        }
      }
    });
  });
});
