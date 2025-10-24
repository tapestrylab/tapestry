/**
 * React Extractor Plugin
 * Entry point for the React component metadata extractor
 */

import { parseSync } from "oxc-parser";
import type { ExtractorPlugin } from "../../types.js";
import { extractComponents } from "./extraction/components.js";

export function createReactExtractor(): ExtractorPlugin {
  return {
    name: "react-extractor",
    test: (filePath: string) => /\.(tsx|jsx|ts|js)$/.test(filePath),
    extract: async (filePath: string, content: string) => {
      try {
        const result = parseSync(filePath, content, {
          sourceType: "module",
        });

        if (result.errors?.length > 0) {
          const errorMessages = result.errors
            .map((e) => `${e.message || e}`)
            .join("; ");
          throw new Error(`Parse errors: ${errorMessages}`);
        }

        return extractComponents(result.program, filePath, content);
      } catch (error) {
        throw new Error(
          `Failed to parse ${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    },
  };
}
