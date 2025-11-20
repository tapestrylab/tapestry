/**
 * Tests for browser-compatible core API
 */

import { describe, it, expect } from "vitest";
import { createReactExtractor, ExtractionError } from "./core.js";

describe("core API", () => {
  describe("createReactExtractor", () => {
    it("should create a React extractor", () => {
      const extractor = createReactExtractor();
      expect(extractor).toBeDefined();
      expect(extractor.name).toBe("react-extractor");
      expect(extractor.test).toBeDefined();
      expect(extractor.extract).toBeDefined();
    });

    it("should extract metadata from React component code", async () => {
      const extractor = createReactExtractor();
      const code = `
        export function Button({ label, onClick }: { label: string; onClick?: () => void }) {
          return <button onClick={onClick}>{label}</button>;
        }
      `;

      const metadata = await extractor.extract!("Button.tsx", code);

      expect(metadata).toHaveLength(1);
      expect(metadata[0].name).toBe("Button");
      expect(metadata[0].exportType).toBe("named");
      expect(metadata[0].props).toHaveLength(2);

      const labelProp = metadata[0].props.find((p) => p.name === "label");
      expect(labelProp).toBeDefined();
      expect(labelProp!.type).toBe("string");
      expect(labelProp!.required).toBe(true);

      const onClickProp = metadata[0].props.find((p) => p.name === "onClick");
      expect(onClickProp).toBeDefined();
      expect(onClickProp!.type).toBe("() => void");
      expect(onClickProp!.required).toBe(false);
    });

    it("should work with in-memory code (no file system needed)", async () => {
      const extractor = createReactExtractor();

      // Simulate code from a database, API, or user input
      const sourceCode = `
        export function HelloWorld() {
          return <div>Hello World</div>;
        }
      `;

      const metadata = await extractor.extract!(
        "virtual-file.tsx",
        sourceCode
      );

      expect(metadata).toHaveLength(1);
      expect(metadata[0].name).toBe("HelloWorld");
      expect(metadata[0].exportType).toBe("named");
    });

    it("should handle extraction errors", async () => {
      const extractor = createReactExtractor();

      // Invalid TypeScript syntax
      const invalidCode = `
        export default function Button({
          // Intentionally broken syntax
      `;

      await expect(
        extractor.extract!("Button.tsx", invalidCode)
      ).rejects.toThrow();
    });
  });

  describe("ExtractionError", () => {
    it("should export ExtractionError class", () => {
      const error = new ExtractionError("Test error", [
        {
          filePath: "test.tsx",
          message: "Test message",
        },
      ]);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("ExtractionError");
      expect(error.message).toBe("Test error");
      expect(error.errors).toHaveLength(1);
      expect(error.errors[0].filePath).toBe("test.tsx");
    });
  });
});
