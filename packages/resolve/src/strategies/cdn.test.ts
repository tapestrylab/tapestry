import { describe, it, expect, vi, beforeEach } from "vitest";
import { cdn } from "./cdn.js";

// Mock fetch for testing
global.fetch = vi.fn();

describe("cdn strategy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("URL generation", () => {
    it("should generate esm.sh URLs by default", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      const result = await strategy.resolve("react");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("https://esm.sh/react");
      expect(result?.source).toBe("cdn");
    });

    it("should generate jsdelivr URLs when specified", async () => {
      const strategy = cdn({
        provider: "jsdelivr",
        verifyAvailability: false,
      });

      const result = await strategy.resolve("react");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("https://cdn.jsdelivr.net/npm/react");
    });

    it("should generate unpkg URLs when specified", async () => {
      const strategy = cdn({
        provider: "unpkg",
        verifyAvailability: false,
      });

      const result = await strategy.resolve("react");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("https://unpkg.com/react");
    });

    it("should use custom URL template when provided", async () => {
      const strategy = cdn({
        customTemplate: (pkg, ver) =>
          `https://custom-cdn.com/${pkg}${ver ? `@${ver}` : ""}`,
        verifyAvailability: false,
      });

      const result = await strategy.resolve("react");
      expect(result).not.toBeNull();
      expect(result?.path).toBe("https://custom-cdn.com/react");
    });
  });

  describe("version handling", () => {
    it("should include version from versionMap", async () => {
      const strategy = cdn({
        versionMap: { react: "18.3.1" },
        verifyAvailability: false,
      });

      const result = await strategy.resolve("react");
      expect(result?.path).toBe("https://esm.sh/react@18.3.1");
    });

    it("should not include version if not in versionMap", async () => {
      const strategy = cdn({
        versionMap: { react: "18.3.1" },
        verifyAvailability: false,
      });

      const result = await strategy.resolve("vue");
      expect(result?.path).toBe("https://esm.sh/vue");
    });
  });

  describe("scoped packages", () => {
    it("should handle scoped package names", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      const result = await strategy.resolve("@radix-ui/react-popover");
      expect(result?.path).toBe("https://esm.sh/@radix-ui/react-popover");
    });

    it("should handle scoped packages with subpaths", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      const result = await strategy.resolve(
        "@radix-ui/react-popover/dist/index.js"
      );
      expect(result?.path).toBe(
        "https://esm.sh/@radix-ui/react-popover/dist/index.js"
      );
    });

    it("should handle scoped packages with versions", async () => {
      const strategy = cdn({
        versionMap: { "@radix-ui/react-popover": "1.0.0" },
        verifyAvailability: false,
      });

      const result = await strategy.resolve("@radix-ui/react-popover");
      expect(result?.path).toBe(
        "https://esm.sh/@radix-ui/react-popover@1.0.0"
      );
    });
  });

  describe("subpath handling", () => {
    it("should handle package subpaths", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      const result = await strategy.resolve("lodash/debounce");
      expect(result?.path).toBe("https://esm.sh/lodash/debounce");
    });

    it("should handle deep subpaths", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      const result = await strategy.resolve("package/nested/deep/path.js");
      expect(result?.path).toBe("https://esm.sh/package/nested/deep/path.js");
    });
  });

  describe("non-bare specifiers", () => {
    it("should return null for relative imports", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      expect(await strategy.resolve("./Button")).toBeNull();
      expect(await strategy.resolve("../components/Button")).toBeNull();
    });

    it("should return null for absolute paths", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      expect(await strategy.resolve("/usr/local/lib")).toBeNull();
    });

    it("should return null for URLs", async () => {
      const strategy = cdn({
        verifyAvailability: false,
      });

      expect(await strategy.resolve("https://example.com/module.js")).toBeNull();
    });
  });

  describe("availability checking", () => {
    it("should verify availability when enabled", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({ ok: true });

      const strategy = cdn({
        verifyAvailability: true,
      });

      const result = await strategy.resolve("react");
      expect(result).not.toBeNull();
      expect(mockFetch).toHaveBeenCalledWith("https://esm.sh/react", {
        method: "HEAD",
        signal: expect.any(AbortSignal),
      });
    });

    it("should return null when package is not available", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({ ok: false });

      const strategy = cdn({
        verifyAvailability: true,
      });

      const result = await strategy.resolve("non-existent-package");
      expect(result).toBeNull();
    });

    it("should return null on network errors", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const strategy = cdn({
        verifyAvailability: true,
      });

      const result = await strategy.resolve("react");
      expect(result).toBeNull();
    });

    it("should timeout after specified duration", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockImplementationOnce(
        (_url: string, options: any) =>
          new Promise((resolve, reject) => {
            // Simulate abort signal handling
            options.signal.addEventListener('abort', () => {
              reject(new Error('Aborted'));
            });
            // Simulate long-running request
            setTimeout(() => resolve({ ok: true }), 10000);
          })
      );

      const strategy = cdn({
        verifyAvailability: true,
        timeout: 100,
      });

      const result = await strategy.resolve("react");
      // Should return null due to timeout
      expect(result).toBeNull();
    });
  });
});
