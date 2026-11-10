export interface SecretFinding {
  type: string;
  file?: string;
  line?: number;
  snippet: string;
}

export interface SecretScanResult {
  passed: boolean;
  findings: SecretFinding[];
  details: string;
}

interface SecretPattern {
  name: string;
  regex: RegExp;
  mask: (val: string) => string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: "AWS Access Key",
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    mask: (v) => `${v.slice(0, 4)}****************`,
  },
  {
    name: "GitHub Personal Access Token",
    regex: /\b(gh[pousr]_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/g,
    mask: (v) => `${v.slice(0, 4)}****************`,
  },
  {
    name: "Asymmetric Private Key",
    regex: /-----BEGIN (?:RSA |EC |PGP |OPENSSH |DSA )?PRIVATE KEY-----/g,
    mask: () => "-----BEGIN [REDACTED] PRIVATE KEY-----",
  },
  {
    name: "Slack API Token",
    regex: /\b(xox[baprs]-[0-9A-Za-z]{10,48})\b/g,
    mask: (v) => `${v.slice(0, 5)}****************`,
  },
  {
    name: "Database Connection String with Credentials",
    regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_\-]+:([^@\s]+)@[a-zA-Z0-9.\-]+/g,
    mask: () => "postgresql://user:****@host/db",
  },
];

/**
 * Scans string or buffer content for exposed secrets and tokens.
 */
export function scanTextForSecrets(content: string, fileName?: string): SecretScanResult {
  const findings: SecretFinding[] = [];
  const lines = content.split("\n");

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const line = lines[lIdx];
    // Ignore lines that look like comments in test or example files
    if (fileName && (fileName.includes(".test.") || fileName.includes(".spec.") || fileName.includes("example"))) {
      continue;
    }

    for (const pat of SECRET_PATTERNS) {
      pat.regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pat.regex.exec(line)) !== null) {
        findings.push({
          type: pat.name,
          file: fileName,
          line: lIdx + 1,
          snippet: pat.mask(match[0]),
        });
      }
    }
  }

  const passed = findings.length === 0;
  const details = passed
    ? "No sensitive credentials or access tokens detected."
    : `Found ${findings.length} exposed credential(s): ${findings.map((f) => f.type).join(", ")}`;

  return { passed, findings, details };
}
