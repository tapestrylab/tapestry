/**
 * High-level API for component resolution
 * Combines extraction and relationship resolution
 */

import type { ExtractConfig } from "@tapestrylab/extract";
import type { EnrichedComponentData } from "./types.js";
import { extractComponent, extractComponents } from "./component-extractor.js";
import { resolveRelationships, resolveRelationshipsForAll } from "./relationship-resolver.js";

export interface ResolveOptions {
  /**
   * Include relationship data (usageSites, dependencies, dependents)
   */
  includeRelationships?: boolean;

  /**
   * Project root for relationship resolution
   */
  projectRoot?: string;

  /**
   * Extract configuration options
   */
  extractConfig?: Partial<ExtractConfig>;
}

/**
 * Resolve a single component with optional relationship data
 *
 * @example
 * // Just extraction
 * const component = await resolveComponent('./src/Button.tsx');
 *
 * @example
 * // With relationships
 * const component = await resolveComponent('./src/Button.tsx', {
 *   includeRelationships: true,
 *   projectRoot: './src'
 * });
 */
export async function resolveComponent(
  filePath: string,
  options?: ResolveOptions
): Promise<EnrichedComponentData | null> {
  // Extract component metadata
  const metadata = await extractComponent(filePath);
  if (!metadata) {
    return null;
  }

  // Optionally add relationship data
  if (options?.includeRelationships) {
    const projectRoot = options.projectRoot || process.cwd();
    return resolveRelationships(metadata, projectRoot);
  }

  return metadata as EnrichedComponentData;
}

/**
 * Resolve multiple components with optional relationship data
 *
 * @example
 * // Just extraction
 * const components = await resolveComponents({ root: './src' });
 *
 * @example
 * // With relationships
 * const components = await resolveComponents({
 *   root: './src',
 *   includeRelationships: true
 * });
 *
 * @example
 * // With custom extract config
 * const components = await resolveComponents({
 *   root: './src',
 *   includeRelationships: true,
 *   extractConfig: {
 *     include: ['**\/*.tsx'],
 *     errorHandling: 'throw'
 *   }
 * });
 */
export async function resolveComponents(
  options: ResolveOptions & { root: string }
): Promise<EnrichedComponentData[]> {
  // Extract component metadata
  const components = await extractComponents({
    root: options.root,
    ...options.extractConfig,
  });

  // Optionally add relationship data
  if (options.includeRelationships) {
    const projectRoot = options.projectRoot || options.root;
    return resolveRelationshipsForAll(components, projectRoot);
  }

  return components as EnrichedComponentData[];
}
