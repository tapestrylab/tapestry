import {
  ExtractConfig,
  ExtractResult,
  ExtractedMetadata,
  ExtractError,
  ExtractorPlugin,
  ExtractionError,
} from "./types.js";
import { scanFiles, readFile, getRelativePath } from "./scanner.js";
import { createReactExtractor } from "./extractors/react/index.js";
import { createExtractionCache } from "./cache.js";

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
  const extractor = extractors.find((e) => e.test && e.test(filePath));

  if (!extractor || !extractor.extract) {
    return [];
  }

  return extractor.extract(filePath, content);
}

/**
 * Main extraction function with lifecycle hooks and error handling
 */
export async function extract(
  config: ExtractConfig,
  customExtractors: ExtractorPlugin[] = []
): Promise<ExtractResult> {
  const startTime = Date.now();
  let metadata: ExtractedMetadata[] = [];
  const errors: ExtractError[] = [];

  // Merge custom extractors with defaults (custom take precedence)
  const extractors = [...customExtractors, ...DEFAULT_EXTRACTORS];

  // Initialize cache if enabled
  const cache = config.cache ? createExtractionCache() : null;

  // Run beforeScan hooks
  for (const extractor of extractors) {
    if (extractor.beforeScan) {
      await extractor.beforeScan(config);
    }
  }

  // Scan files
  let files = await scanFiles(config);

  // Run afterScan hooks (can filter/modify file list)
  for (const extractor of extractors) {
    if (extractor.afterScan) {
      files = await extractor.afterScan(files);
    }
  }

  let filesProcessed = 0;

  // Process each file
  for (const filePath of files) {
    try {
      // Check cache first
      const cached = await cache?.get(filePath);
      if (cached) {
        metadata.push(...cached);
        filesProcessed++;
        continue;
      }

      // Extract
      const content = await readFile(filePath);
      let extracted = await extractFile(filePath, content, extractors);

      // Run afterExtract hooks on each extracted item
      for (const extractor of extractors) {
        if (extractor.afterExtract) {
          extracted = await Promise.all(
            extracted.map((item) => extractor.afterExtract!(item))
          );
        }
      }

      // Cache the results
      if (cache) {
        await cache.set(filePath, extracted);
      }

      metadata.push(...extracted);
      filesProcessed++;
    } catch (error) {
      const extractError: ExtractError = {
        filePath: getRelativePath(filePath, config.root),
        message: error instanceof Error ? error.message : String(error),
      };

      if (config.errorHandling === 'throw') {
        throw new ExtractionError('Extraction failed', [extractError]);
      } else if (config.errorHandling === 'collect') {
        errors.push(extractError);
      }
      // 'ignore' = do nothing
    }
  }

  // Run afterAll hooks
  for (const extractor of extractors) {
    if (extractor.afterAll) {
      metadata = await extractor.afterAll(metadata, config);
    }
  }

  // If we have errors and errorHandling is throw, throw now
  if (config.errorHandling === 'throw' && errors.length > 0) {
    throw new ExtractionError('Extraction completed with errors', errors);
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
