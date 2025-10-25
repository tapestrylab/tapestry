/**
 * Wrapper around @tapestrylab/extract for component metadata extraction
 */

import {
  extract,
  extractComponent as extractSingleComponent,
} from '@tapestrylab/extract';
import type { ExtractConfig, ComponentMetadata } from '@tapestrylab/extract';

/**
 * Extract component metadata from source files
 *
 * This is a convenience wrapper around @tapestrylab/extract that
 * returns ComponentMetadata[] directly for template usage.
 *
 * @example
 * // Simple usage with defaults
 * const components = await extractComponents({ root: './src' });
 *
 * @example
 * // With custom options
 * const components = await extractComponents({
 *   root: './src',
 *   include: ['**\/*.tsx']
 * });
 */
export async function extractComponents(
  config: Partial<ExtractConfig>
): Promise<ComponentMetadata[]> {
  try {
    const result = await extract(config);

    if (result.errors && result.errors.length > 0) {
      console.warn(
        `Extraction completed with ${result.errors.length} error(s):`
      );
      result.errors.forEach((error) => {
        console.warn(`  ${error.filePath}: ${error.message}`);
      });
    }

    return result.metadata as ComponentMetadata[];
  } catch (error) {
    throw new Error(
      `Failed to extract components: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Extract a single component from a file
 *
 * @example
 * const component = await extractComponent('./src/components/Button.tsx');
 */
export async function extractComponent(
  filePath: string
): Promise<ComponentMetadata | null> {
  return extractSingleComponent(filePath);
}
