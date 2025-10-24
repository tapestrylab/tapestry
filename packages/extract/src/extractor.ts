import {
  ExtractConfig,
  ExtractResult,
  ExtractedMetadata,
  ExtractError,
  ExtractorPlugin,
} from "./types.js";
import { scanFiles, readFile, getRelativePath } from "./scanner.js";
import { createReactExtractor } from "./extractors/react/index.js";

// Default built-in extractors
const DEFAULT_EXTRACTORS = [createReactExtractor()];

/**
 * Extract metadata from a single file using registered extractors
 */
async function extractFile(
  filePath: string,
  content: string,
  extractors: ExtractorPlugin[]
): Promise<ExtractedMetadata[]> {
  const extractor = extractors.find((e) => e.test(filePath));

  if (!extractor) {
    return [];
  }

  return extractor.extract(filePath, content);
}

/**
 * Main extraction function
 */
export async function extract(
  config: ExtractConfig,
  customExtractors: ExtractorPlugin[] = []
): Promise<ExtractResult> {
  const startTime = Date.now();
  const metadata: ExtractedMetadata[] = [];
  const errors: ExtractError[] = [];

  // Merge custom extractors with defaults (custom take precedence)
  const extractors = [...customExtractors, ...DEFAULT_EXTRACTORS];

  // Scan files
  const files = await scanFiles(config);
  let filesProcessed = 0;

  // Process each file
  for (const filePath of files) {
    try {
      const content = await readFile(filePath);
      const extracted = await extractFile(filePath, content, extractors);
      metadata.push(...extracted);
      filesProcessed++;
    } catch (error) {
      errors.push({
        filePath: getRelativePath(filePath, config.root),
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Calculate stats
  const duration = Date.now() - startTime;
  const componentsFound = metadata.filter((m) => m.type === "component").length;

  return {
    metadata,
    errors,
    stats: {
      filesScanned: files.length,
      filesProcessed,
      componentsFound,
      duration,
    },
  };
}
