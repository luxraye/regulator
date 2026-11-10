export interface LinkCheckResult {
  valid: boolean;
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}

/**
 * Validates that a working portal URL answers over HTTPS, is reachable,
 * and does not stealthily redirect to an external third-party domain.
 */
export async function checkLiveUrl(urlStr: string): Promise<LinkCheckResult> {
  if (!urlStr || typeof urlStr !== "string") {
    return { valid: false, error: "Live portal URL is missing." };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { valid: false, error: `Malformed URL: "${urlStr}".` };
  }

  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      error: `Live application URL must use HTTPS. Received: "${parsed.protocol}".`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".internal")
  ) {
    return {
      valid: false,
      error: `Live URL cannot point to internal/local address ("${hostname}"). Must be a public HTTPS service.`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(urlStr, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
    }).catch(async () => {
      // Some web servers reject HEAD; try GET with small range
      return await fetch(urlStr, {
        method: "GET",
        headers: { Range: "bytes=0-100" },
        redirect: "manual",
        signal: controller.signal,
      });
    });

    clearTimeout(timeout);

    // If redirect (301, 302, 307, 308), verify it stays on the same domain
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        try {
          const redirectUrl = new URL(location, urlStr);
          if (redirectUrl.hostname.toLowerCase() !== hostname) {
            return {
              valid: false,
              statusCode: res.status,
              finalUrl: redirectUrl.toString(),
              error: `Live URL redirects to a different domain: "${redirectUrl.hostname}" (expected "${hostname}").`,
            };
          }
        } catch {
          // ignore relative location parse error
        }
      }
    }

    // Status 200 - 399 or 401/403 (basic auth protected demo is fine for reachability)
    if (res.status >= 200 && res.status < 500) {
      return { valid: true, statusCode: res.status, finalUrl: urlStr };
    }

    return {
      valid: false,
      statusCode: res.status,
      error: `Live application returned server error HTTP ${res.status}.`,
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Could not connect to live URL: ${err.message || "Network unreachable"}.`,
    };
  }
}

/**
 * Validates that a source repository URL (e.g. GitHub / GitLab) is valid and reachable.
 */
export async function checkRepoUrl(repoUrl: string): Promise<LinkCheckResult> {
  if (!repoUrl || typeof repoUrl !== "string") {
    return { valid: false, error: "Repository URL is missing." };
  }

  let parsed: URL;
  try {
    parsed = new URL(repoUrl);
  } catch {
    return { valid: false, error: `Malformed repository URL: "${repoUrl}".` };
  }

  if (parsed.protocol !== "https:") {
    return { valid: false, error: `Repository URL must use HTTPS. Received: "${parsed.protocol}".` };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isRecognizedHost =
    hostname.includes("github.com") ||
    hostname.includes("gitlab.com") ||
    hostname.includes("bitbucket.org");

  if (!isRecognizedHost) {
    return {
      valid: false,
      error: `Repository must be hosted on GitHub, GitLab, or Bitbucket. Received "${hostname}".`,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(repoUrl, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 200 || res.status === 301 || res.status === 302 || res.status === 403) {
      return { valid: true, statusCode: res.status, finalUrl: repoUrl };
    }

    if (res.status === 404) {
      return {
        valid: false,
        statusCode: 404,
        error: `Repository URL returned 404 Not Found. Ensure repository is public during evaluation.`,
      };
    }

    return { valid: true, statusCode: res.status };
  } catch {
    // If rate-limited by GitHub HEAD or offline, do not fail hard if format is valid
    return { valid: true, finalUrl: repoUrl };
  }
}
