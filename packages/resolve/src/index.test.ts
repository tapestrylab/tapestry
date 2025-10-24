import { describe, it, expect, vi } from "vitest";
import { createResolver, strategies, Resolver } from "./index.js";

describe("createResolver", () => {
  it("should create a Resolver instance", () => {
    const resolver = createResolver();
    expect(resolver).toBeInstanceOf(Resolver);
  });

  it("should accept configuration", () => {
    const resolver = createResolver({
      strategies: [strategies.local()],
      cache: false,
    });
    expect(resolver).toBeInstanceOf(Resolver);
    expect(resolver.getStrategies()).toHaveLength(1);
  });
});

describe("strategies export", () => {
  it("should export all strategies", () => {
    expect(strategies).toHaveProperty("local");
    expect(strategies).toHaveProperty("cdn");
    expect(strategies).toHaveProperty("remote");
  });

  it("should have callable strategy factories", () => {
    expect(typeof strategies.local).toBe("function");
    expect(typeof strategies.cdn).toBe("function");
    expect(typeof strategies.remote).toBe("function");
  });
});

describe("integration tests", () => {
  it("should resolve with multiple strategies in sequence", async () => {
    // Mock fetch for CDN strategy
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const resolver = createResolver({
      strategies: [
        strategies.local({ root: "/fake", checkExists: false }),
        strategies.cdn({ verifyAvailability: false }),
      ],
    });

    // Relative path should be handled by local strategy
    const local = await resolver.resolve("./Button");
    expect(local?.source).toBe("local");

    // Bare specifier should fall through to CDN strategy
    const cdn = await resolver.resolve("react");
    expect(cdn?.source).toBe("cdn");
    expect(cdn?.path).toContain("esm.sh");
  });

  it("should try CDN when local resolution fails", async () => {
    const resolver = createResolver({
      strategies: [
        strategies.local({ root: "/fake", checkExists: true }), // Will fail
        strategies.cdn({ verifyAvailability: false }),
      ],
    });

    const result = await resolver.resolve("react");
    expect(result?.source).toBe("cdn");
  });

  it("should respect strategy order", async () => {
    const resolver = createResolver({
      strategies: [
        strategies.local({
          root: "/fake",
          checkExists: false,
          alias: { react: "vendor/react" },
        }),
        strategies.cdn({ verifyAvailability: false }),
      ],
    });

    // "react" matches the alias, so local strategy should win
    const result = await resolver.resolve("react");
    expect(result?.source).toBe("local");
    expect(result?.path).toContain("vendor/react");
  });

  it("should handle resolver without strategies gracefully", async () => {
    const resolver = createResolver({
      strategies: [],
    });

    const result = await resolver.resolve("anything");
    expect(result).toBeNull();
  });
});

describe("playground use case", () => {
  it("should simulate playground resolution flow", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    // Simulate playground environment with uploaded components and CDN fallback
    const resolver = createResolver({
      strategies: [
        // First try local components (uploaded by user)
        strategies.local({
          root: "/playground/uploads",
          checkExists: false,
          alias: {
            "@ui": "components/ui",
            "@core": "components/core",
          },
        }),
        // Fall back to CDN for npm packages
        strategies.cdn({
          provider: "esm.sh",
          verifyAvailability: false,
          versionMap: {
            react: "18.3.1",
            "react-dom": "18.3.1",
          },
        }),
      ],
    });

    // User's component
    const userComponent = await resolver.resolve("@ui/Button");
    expect(userComponent?.source).toBe("local");
    expect(userComponent?.path).toContain("components/ui/Button");

    // External dependency
    const external = await resolver.resolve("@radix-ui/react-popover");
    expect(external?.source).toBe("cdn");
    expect(external?.path).toContain("esm.sh/@radix-ui/react-popover");

    // React with pinned version
    const react = await resolver.resolve("react");
    expect(react?.source).toBe("cdn");
    expect(react?.path).toBe("https://esm.sh/react@18.3.1");
  });

  it("should batch resolve multiple imports", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const resolver = createResolver({
      strategies: [
        strategies.local({
          root: "/playground",
          checkExists: false,
          alias: { "@ui": "components" },
        }),
        strategies.cdn({ verifyAvailability: false }),
      ],
    });

    const results = await resolver.resolveMany([
      "@ui/Button",
      "@ui/Input",
      "react",
      "lodash/debounce",
    ]);

    expect(results.size).toBe(4);
    expect(results.get("@ui/Button")?.source).toBe("local");
    expect(results.get("react")?.source).toBe("cdn");
    expect(results.get("lodash/debounce")?.source).toBe("cdn");
  });
});
