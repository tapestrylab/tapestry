import { loadConfig, normalizeExtractConfig } from "./config";
import { extract as extractor } from "./extractor";
import { ExtractConfig, ComponentMetadata } from "./types";
import path from "node:path";

export { loadConfig, normalizeExtractConfig } from "./config";
export * from "./types";

/**
 * Extract components from source files
 *
 * @example
 * // Simple usage with defaults
 * const result = await extract({ root: './src' });
 *
 * @example
 * // With custom options
 * const result = await extract({
 *   root: './src',
 *   include: ['**\/*.tsx'],
 *   exclude: ['**\/*.test.*']
 * });
 */
export async function extract(config?: Partial<ExtractConfig>) {
  const fullConfig = await loadConfig(undefined, config);
  return extractor(fullConfig);
}

/**
 * Extract a single component from a file
 *
 * @param filePath - Absolute path to the file
 * @param options - Optional extraction options
 * @returns The extracted component metadata, or null if none found
 *
 * @example
 * const component = await extractComponent('./src/components/Button.tsx');
 */
export async function extractComponent(
  filePath: string,
  options?: { plugins?: string[] }
): Promise<ComponentMetadata | null> {
  const result = await extract({
    root: path.dirname(filePath),
    include: [path.basename(filePath)],
    plugins: options?.plugins,
  });

  return (result.metadata[0] as ComponentMetadata) || null;
}

/**
 * Extract all components matching a glob pattern
 *
 * @param pattern - Glob pattern to match files
 * @param options - Optional extraction options
 * @returns Array of extracted component metadata
 *
 * @example
 * // Extract all TypeScript React components
 * const components = await extractFromPattern('**\/*.tsx', {
 *   root: './src'
 * });
 *
 * @example
 * // Extract specific component
 * const [button] = await extractFromPattern('Button.tsx', {
 *   root: './src/components'
 * });
 */
export async function extractFromPattern(
  pattern: string,
  options?: Partial<ExtractConfig>
): Promise<ComponentMetadata[]> {
  const result = await extract({
    root: options?.root || process.cwd(),
    include: [pattern],
    ...options,
  });

  return result.metadata as ComponentMetadata[];
}

/**
 * Extract components from a directory
 *
 * @param directory - Directory path
 * @param options - Optional extraction options
 * @returns Array of extracted component metadata
 *
 * @example
 * // Extract from directory (non-recursive)
 * const components = await extractFromDirectory('./src/components');
 *
 * @example
 * // Extract recursively
 * const components = await extractFromDirectory('./src/components', {
 *   recursive: true
 * });
 */
export async function extractFromDirectory(
  directory: string,
  options?: { recursive?: boolean; plugins?: string[] }
): Promise<ComponentMetadata[]> {
  const pattern = options?.recursive ? '**/*' : '*';

  const result = await extract({
    root: directory,
    include: [pattern],
    plugins: options?.plugins,
  });

  return result.metadata as ComponentMetadata[];
}
