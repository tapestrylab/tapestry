import type { ResolverStrategy } from "../types.js";
import { isBareModuleSpecifier } from "../utils/normalizePath.js";

export type CDNProvider = "esm.sh" | "jsdelivr" | "unpkg";

export interface CDNStrategyConfig {
  /** CDN provider to use (default: 'esm.sh') */
  provider?: CDNProvider;
  /** Map of package names to specific versions */
  versionMap?: Record<string, string>;
  /** Whether to verify availability with HEAD request (default: true) */
  verifyAvailability?: boolean;
  /** Custom CDN URL template (overrides provider) */
  customTemplate?: (packageName: string, version?: string) => string;
  /** Timeout for HEAD requests in milliseconds (default: 5000) */
  timeout?: number;
}

/**
 * CDN resolution strategy for npm packages
 * Resolves bare module specifiers to CDN URLs
 */
export function cdn(config: CDNStrategyConfig = {}): ResolverStrategy {
  const provider = config.provider ?? "esm.sh";
  const versionMap = config.versionMap ?? {};
  const verifyAvailability = config.verifyAvailability ?? true;
  const timeout = config.timeout ?? 5000;

  const getUrl = config.customTemplate ?? createDefaultUrlGetter(provider);

  return {
    name: "cdn",
    async resolve(id: string) {
      // Only handle bare module specifiers
      if (!isBareModuleSpecifier(id)) {
        return null;
      }

      // Parse package name and subpath
      const { packageName, subpath } = parsePackageSpecifier(id);

      // Get version if specified
      const version = versionMap[packageName];

      // Build URL
      const baseUrl = getUrl(packageName, version);
      const url = subpath ? `${baseUrl}${subpath}` : baseUrl;

      // Verify availability if requested
      if (verifyAvailability) {
        const isAvailable = await checkUrlAvailability(url, timeout);
        if (!isAvailable) {
          return null;
        }
      }

      return { id, path: url, source: "cdn" };
    },
  };
}

/**
 * Create a default URL getter for a given CDN provider
 */
function createDefaultUrlGetter(
  provider: CDNProvider
): (packageName: string, version?: string) => string {
  switch (provider) {
    case "esm.sh":
      return (pkg, ver) => `https://esm.sh/${pkg}${ver ? `@${ver}` : ""}`;
    case "jsdelivr":
      return (pkg, ver) =>
        `https://cdn.jsdelivr.net/npm/${pkg}${ver ? `@${ver}` : ""}`;
    case "unpkg":
      return (pkg, ver) => `https://unpkg.com/${pkg}${ver ? `@${ver}` : ""}`;
    default:
      return (pkg, ver) => `https://esm.sh/${pkg}${ver ? `@${ver}` : ""}`;
  }
}

/**
 * Parse a package specifier into package name and subpath
 * Examples:
 * - "react" -> { packageName: "react", subpath: "" }
 * - "@radix-ui/react-popover" -> { packageName: "@radix-ui/react-popover", subpath: "" }
 * - "lodash/debounce" -> { packageName: "lodash", subpath: "/debounce" }
 * - "@radix-ui/react-popover/dist/index.js" -> { packageName: "@radix-ui/react-popover", subpath: "/dist/index.js" }
 */
function parsePackageSpecifier(id: string): {
  packageName: string;
  subpath: string;
} {
  // Handle scoped packages (e.g., @radix-ui/react-popover)
  if (id.startsWith("@")) {
    const parts = id.split("/");
    if (parts.length >= 2) {
      const packageName = `${parts[0]}/${parts[1]}`;
      const subpath = parts.length > 2 ? `/${parts.slice(2).join("/")}` : "";
      return { packageName, subpath };
    }
  }

  // Handle regular packages
  const firstSlash = id.indexOf("/");
  if (firstSlash === -1) {
    return { packageName: id, subpath: "" };
  }

  const packageName = id.slice(0, firstSlash);
  const subpath = id.slice(firstSlash);
  return { packageName, subpath };
}

/**
 * Check if a URL is available using a HEAD request
 */
async function checkUrlAvailability(
  url: string,
  timeoutMs: number
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Network error or timeout
    return false;
  }
}
