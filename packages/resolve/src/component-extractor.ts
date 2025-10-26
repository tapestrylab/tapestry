/**
 * Component extraction integration with @tapestrylab/extract
 */

import {
  extractMetadata,
  extractComponent as extractSingleComponent,
  type ExtractConfig,
  type ComponentMetadata,
} from "@tapestrylab/extract";

/**
 * Extract component metadata from source files
 *
 * @example
 * const components = await extractComponents({ root: './src' });
 *
 * @example
 * const components = await extractComponents({
 *   root: './src',
 *   include: ['**\/*.tsx'],
 *   errorHandling: 'throw'
 * });
 */
export async function extractComponents(
  config: Partial<ExtractConfig>
): Promise<ComponentMetadata[]> {
  return extractMetadata(config);
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
