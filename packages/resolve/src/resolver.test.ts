import { describe, it, expect, beforeEach } from "vitest";
import { createResolver } from "./resolver.js";
import type { ResolverStrategy, ResolvedEntry } from "./types.js";

// Mock strategy that always resolves
const mockSuccessStrategy: ResolverStrategy = {
  name: "mock-success",
  async resolve(id: string) {
    return { id, path: `/mock/${id}`, source: "local" as const };
  },
};

// Mock strategy that always fails
const mockFailStrategy: ResolverStrategy = {
  name: "mock-fail",
  async resolve() {
    return null;
  },
};

// Mock strategy that throws errors
const mockErrorStrategy: ResolverStrategy = {
  name: "mock-error",
  async resolve() {
    throw new Error("Mock error");
  },
};

describe("createResolver", () => {
  describe("factory function", () => {
    it("should create resolver with default config", () => {
      const resolver = createResolver();
      expect(resolver.getStrategies()).toEqual([]);
    });

    it("should create resolver with strategies", () => {
      const resolver = createResolver({
        strategies: [mockSuccessStrategy],
      });
      expect(resolver.getStrategies()).toHaveLength(1);
      expect(resolver.getStrategies()[0].name).toBe("mock-success");
    });

    it("should create resolver with cache disabled", () => {
      const resolver = createResolver({ cache: false });
      expect(resolver.getCacheSize()).toBe(0);
    });
  });

  describe("resolve", () => {
    it("should resolve using the first successful strategy", async () => {
      const resolver = createResolver({
        strategies: [mockFailStrategy, mockSuccessStrategy],
      });

      const result = await resolver.resolve("test-module");
      expect(result).toEqual({
        id: "test-module",
        path: "/mock/test-module",
        source: "local",
      });
    });

    it("should return null if all strategies fail", async () => {
      const resolver = createResolver({
        strategies: [mockFailStrategy],
      });

      const result = await resolver.resolve("test-module");
      expect(result).toBeNull();
    });

    it("should cache successful resolutions", async () => {
      let callCount = 0;
      const countingStrategy: ResolverStrategy = {
        name: "counting",
        async resolve(id: string) {
          callCount++;
          return { id, path: `/counted/${id}`, source: "local" };
        },
      };

      const resolver = createResolver({
        strategies: [countingStrategy],
      });

      await resolver.resolve("test");
      await resolver.resolve("test");
      await resolver.resolve("test");

      expect(callCount).toBe(1); // Only called once due to caching
    });

    it("should cache failed resolutions", async () => {
      let callCount = 0;
      const countingFailStrategy: ResolverStrategy = {
        name: "counting-fail",
        async resolve() {
          callCount++;
          return null;
        },
      };

      const resolver = createResolver({
        strategies: [countingFailStrategy],
      });

      await resolver.resolve("test");
      await resolver.resolve("test");

      expect(callCount).toBe(1); // Only called once due to caching
    });

    it("should not cache when cache is disabled", async () => {
      let callCount = 0;
      const countingStrategy: ResolverStrategy = {
        name: "counting",
        async resolve(id: string) {
          callCount++;
          return { id, path: `/counted/${id}`, source: "local" };
        },
      };

      const resolver = createResolver({
        strategies: [countingStrategy],
        cache: false,
      });

      await resolver.resolve("test");
      await resolver.resolve("test");

      expect(callCount).toBe(2); // Called twice without caching
    });

    it("should handle errors gracefully and continue to next strategy", async () => {
      const resolver = createResolver({
        strategies: [mockErrorStrategy, mockSuccessStrategy],
      });

      const result = await resolver.resolve("test-module");
      expect(result).toEqual({
        id: "test-module",
        path: "/mock/test-module",
        source: "local",
      });
    });

    it("should merge context with constructor context", async () => {
      let receivedContext: any = null;
      const contextCapturingStrategy: ResolverStrategy = {
        name: "context-capture",
        async resolve(id: string, context) {
          receivedContext = context;
          return { id, path: "/test", source: "local" };
        },
      };

      const resolver = createResolver({
        strategies: [contextCapturingStrategy],
        context: { root: "/base" },
      });

      await resolver.resolve("test", { importer: "/test.ts" });

      expect(receivedContext).toEqual({
        root: "/base",
        importer: "/test.ts",
      });
    });
  });

  describe("resolveMany", () => {
    it("should resolve multiple identifiers in parallel", async () => {
      const resolver = createResolver({
        strategies: [mockSuccessStrategy],
      });

      const results = await resolver.resolveMany(["module-a", "module-b"]);

      expect(results.size).toBe(2);
      expect(results.get("module-a")).toEqual({
        id: "module-a",
        path: "/mock/module-a",
        source: "local",
      });
      expect(results.get("module-b")).toEqual({
        id: "module-b",
        path: "/mock/module-b",
        source: "local",
      });
    });

    it("should handle mixed success and failure", async () => {
      const selectiveStrategy: ResolverStrategy = {
        name: "selective",
        async resolve(id: string) {
          if (id === "success") {
            return { id, path: "/success", source: "local" };
          }
          return null;
        },
      };

      const resolver = createResolver({
        strategies: [selectiveStrategy],
      });

      const results = await resolver.resolveMany(["success", "fail"]);

      expect(results.get("success")).toBeTruthy();
      expect(results.get("fail")).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("should clear all cached entries", async () => {
      const resolver = createResolver({
        strategies: [mockSuccessStrategy],
      });

      await resolver.resolve("test1");
      await resolver.resolve("test2");
      expect(resolver.getCacheSize()).toBe(2);

      resolver.clearCache();
      expect(resolver.getCacheSize()).toBe(0);
    });
  });

  describe("addStrategy", () => {
    it("should add strategy to the end by default", () => {
      const resolver = createResolver({
        strategies: [mockFailStrategy],
      });

      resolver.addStrategy(mockSuccessStrategy);

      const strategies = resolver.getStrategies();
      expect(strategies).toHaveLength(2);
      expect(strategies[1].name).toBe("mock-success");
    });

    it("should prepend strategy when prepend=true", () => {
      const resolver = createResolver({
        strategies: [mockFailStrategy],
      });

      resolver.addStrategy(mockSuccessStrategy, true);

      const strategies = resolver.getStrategies();
      expect(strategies).toHaveLength(2);
      expect(strategies[0].name).toBe("mock-success");
    });
  });
});
