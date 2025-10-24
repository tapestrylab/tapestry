import { describe, it, expect, beforeEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { local } from "./local.js";

const TEST_DIR = join(process.cwd(), "test-fixtures");

describe("local strategy", () => {
  beforeEach(() => {
    // Clean up test directory
    try {
      rmSync(TEST_DIR, { recursive: true, force: true });
    } catch {}

    // Create test directory structure
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, "components"), { recursive: true });
    mkdirSync(join(TEST_DIR, "ui"), { recursive: true });

    // Create test files
    writeFileSync(join(TEST_DIR, "components", "Button.tsx"), "");
    writeFileSync(join(TEST_DIR, "components", "Input.ts"), "");
    writeFileSync(join(TEST_DIR, "ui", "Card.jsx"), "");
    writeFileSync(join(TEST_DIR, "ui", "index.js"), "");
  });

  describe("alias resolution", () => {
    it("should resolve alias mappings", async () => {
      const strategy = local({
        root: TEST_DIR,
        alias: {
          "@components": "components",
        },
      });

      const result = await strategy.resolve("@components/Button");
      expect(result).not.toBeNull();
      expect(result?.source).toBe("local");
      expect(result?.path).toContain("Button.tsx");
    });

    it("should handle nested alias paths", async () => {
      const strategy = local({
        root: TEST_DIR,
        alias: {
          "@ui": "ui",
        },
      });

      const result = await strategy.resolve("@ui/Card");
      expect(result).not.toBeNull();
      expect(result?.path).toContain("Card.jsx");
    });

    it("should return null for unmatched aliases", async () => {
      const strategy = local({
        root: TEST_DIR,
        alias: {
          "@components": "components",
        },
      });

      const result = await strategy.resolve("@unmatched/Module");
      expect(result).toBeNull();
    });
  });

  describe("relative path resolution", () => {
    it("should resolve relative imports", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const result = await strategy.resolve("./components/Button", {
        importer: join(TEST_DIR, "index.ts"),
      });

      expect(result).not.toBeNull();
      expect(result?.path).toContain("Button.tsx");
    });

    it("should resolve parent directory imports", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const result = await strategy.resolve("../ui/Card", {
        importer: join(TEST_DIR, "components", "Button.tsx"),
      });

      expect(result).not.toBeNull();
      expect(result?.path).toContain("Card.jsx");
    });
  });

  describe("extension resolution", () => {
    it("should try multiple extensions", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      // .tsx file
      const tsx = await strategy.resolve("./components/Button");
      expect(tsx?.path).toContain(".tsx");

      // .ts file
      const ts = await strategy.resolve("./components/Input");
      expect(ts?.path).toContain(".ts");

      // .jsx file
      const jsx = await strategy.resolve("./ui/Card");
      expect(jsx?.path).toContain(".jsx");

      // .js file
      const js = await strategy.resolve("./ui/index");
      expect(js?.path).toContain(".js");
    });

    it("should respect custom extensions", async () => {
      const strategy = local({
        root: TEST_DIR,
        extensions: [".jsx", ".js"],
      });

      // Should find .jsx
      const jsx = await strategy.resolve("./ui/Card");
      expect(jsx).not.toBeNull();

      // Should not find .tsx (not in extensions list)
      const tsx = await strategy.resolve("./components/Button");
      expect(tsx).toBeNull();
    });
  });

  describe("absolute path resolution", () => {
    it("should resolve absolute paths", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const absolutePath = join(TEST_DIR, "components", "Button");
      const result = await strategy.resolve(absolutePath);

      expect(result).not.toBeNull();
      expect(result?.path).toContain("Button.tsx");
    });
  });

  describe("index file resolution", () => {
    it("should resolve directory to index file", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const result = await strategy.resolve("./ui");
      expect(result).not.toBeNull();
      expect(result?.path).toContain("index.js");
    });
  });

  describe("non-existent files", () => {
    it("should return null for non-existent files", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const result = await strategy.resolve("./non-existent");
      expect(result).toBeNull();
    });
  });

  describe("browser mode (checkExists: false)", () => {
    it("should not check file existence when checkExists is false", async () => {
      const strategy = local({
        root: TEST_DIR,
        checkExists: false,
      });

      // Should "resolve" even if file doesn't exist
      const result = await strategy.resolve("./non-existent");
      expect(result).not.toBeNull();
      expect(result?.path).toContain("non-existent");
    });
  });

  describe("bare module specifiers", () => {
    it("should return null for bare module specifiers", async () => {
      const strategy = local({
        root: TEST_DIR,
      });

      const result = await strategy.resolve("react");
      expect(result).toBeNull();
    });
  });
});
